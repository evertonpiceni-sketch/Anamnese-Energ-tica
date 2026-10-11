import { buildAutomaticCare } from '../care/automaticCare';
import { buildEnergyProgrammingScript } from '../care/energyProgrammingScript';
import { proposeDailyEnergySchedule, validateDailyEnergySchedule } from '../care/dailyEnergySchedule';
import { getAdminEntitlementForIntake } from '../services/entitlementBackend';
import { canAccessFullReport } from '../commercial/entitlements';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AudioLines,
  CheckCircle2,
  Flower2,
  Gem,
  Layers3,
  Leaf,
  Mail,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { AnamneseInput } from '../types';
import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { criarPlanoAudioPersonalizado } from '../audio/audioCatalog';
import {
  AROMATHERAPY_CATALOG,
  ETHERIC_CRYSTAL_CATALOG,
  FLORAL_CATALOG,
} from '../care/complementaryCatalogs';
import { buildCareComposition } from '../care/careComposer';
import { SOLFEGGIO_CATALOG } from '../care/solfeggioCatalog';
import { BIBLIOTECA_MESTRA } from '../data/bibliotecaMestra';
import { AdminAudioUpload } from './AdminAudioUpload';
import { AudioGenerationAdminPanel } from './AudioGenerationAdminPanel';
import { requestResultEmail, requestFullReportEmail } from '../services/resultEmail';
import { buildFullReportNarrative } from '../result/fullReportNarrative';
import { publishFullReport, loadFullReportForAdmin, validateFullReportSource } from '../services/fullReportBackend';
import {
  loadCareCompositionReview,
  ManualCareComposition,
  persistApprovedCarePlan,
  saveCareCompositionReview,
} from '../services/compositionBackend';

interface CareComposerAdminViewProps {
  anamnese: AnamneseInput;
  analise: AnaliseCompletaResultado | null;
  backendUserId?: string;
  backendIntakeId?: string;
  friendlyResult?: {
    headline: string;
    intro: string;
    priorities: string[];
    intention: string;
    closing: string;
  };
}

type ReviewStatus = 'draft' | 'approved';

function uniq(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function defaultManualComposition(
  analise: AnaliseCompletaResultado
): ManualCareComposition {
  const axes = analise.relatorioEverton.eixosOrdenados;

  const base = BIBLIOTECA_MESTRA.find(
    item => item.nome === analise.relatorioEverton.sistemaBase.nome
  );
  const main = BIBLIOTECA_MESTRA.find(
    item => item.nome === analise.relatorioEverton.sistemaPrincipal.nome
  );

  const complementIds = analise.relatorioEverton.sistemasComplementares
    .map(system => BIBLIOTECA_MESTRA.find(item => item.nome === system.nome)?.id)
    .filter((id): id is string => Boolean(id));

  const rankedSolfeggio = SOLFEGGIO_CATALOG
    .filter(item => item.status === 'ATIVO')
    .map(item => ({
      item,
      score: axes.slice(0, 5).reduce((total, axis, index) => {
        if (!item.eixos.includes(axis.eixoId)) return total;
        return total + axis.percentual * Math.max(1, 5 - index);
      }, 0),
    }))
    .sort((a, b) => b.score - a.score)[0]?.item;

  const scoreResource = (resourceAxes: string[]) =>
    axes.slice(0, 5).reduce((score, axis, index) => {
      if (!resourceAxes.includes(axis.eixoId)) return score;
      return score + axis.percentual * Math.max(1, 5 - index);
    }, 0);

  const florals = FLORAL_CATALOG
    .filter(item => item.status === 'ATIVO')
    .map(item => ({ item, score: scoreResource(item.eixos) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(x => x.item.id);

  const aromatherapy = AROMATHERAPY_CATALOG
    .filter(item => item.status === 'ATIVO' && item.formaUsoPermitida)
    .map(item => ({ item, score: scoreResource(item.eixos) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 1)
    .map(x => x.item.id);

  const crystals = ETHERIC_CRYSTAL_CATALOG
    .filter(item => item.status === 'ATIVO')
    .map(item => ({ item, score: scoreResource(item.eixos) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.item.id);

  return {
    baseSystemId: base?.id || '',
    mainSystemId: main?.id || '',
    complementSystemIds: complementIds,
    solfeggioId: rankedSolfeggio?.id || null,
    floralIds: florals,
    aromatherapyIds: aromatherapy,
    crystalIds: crystals,
    audioIntention: `Acolher a prioridade atual indicada nesta anamnese, respeitando o ritmo e a composição individual desta pessoa.`,
    scriptLines: analise.relatorioEverton.composicaoFinalSequencia.map(
      etapa =>
        `${etapa.fase}: ${etapa.sistemaOuTecnica}${
          etapa.recursoEspecifico ? ` — ${etapa.recursoEspecifico}` : ''
        }`
    ),
  };
}

export function CareComposerAdminView({
  anamnese,
  analise,
  backendUserId,
  backendIntakeId,
  friendlyResult,
}: CareComposerAdminViewProps) {
  const [journeyDays, setJourneyDays] = useState<7 | 21 | null>(null);
  const [journeyError, setJourneyError] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [manual, setManual] = useState<ManualCareComposition | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('draft');
  const [reviewMessage, setReviewMessage] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  const motorDefault = useMemo(
    () => (analise ? defaultManualComposition(analise) : null),
    [analise]
  );

  useEffect(() => {
    if (!analise || !motorDefault) {
      setManual(null);
      return;
    }

    let active = true;
    setManual(motorDefault);
    setReviewStatus('draft');
    setAdminNotes('');
    setReviewMessage('');

    setJourneyDays(null);
    setJourneyError('');
    if (backendIntakeId) {
      Promise.all([loadCareCompositionReview(backendIntakeId), getAdminEntitlementForIntake(backendIntakeId)])
        .then(([review, entitlement]) => {
          if (!active) return;
          setJourneyDays(entitlement?.days || null);
          const loaded = review?.manualComposition || motorDefault;
          const needsProposal = entitlement && loaded.dailyEnergySchedule === undefined;
          const proposed = needsProposal ? buildAutomaticCare(anamnese, entitlement.days).report.dailyEnergySchedule : undefined;
          setManual(needsProposal ? { ...loaded, dailyEnergySchedule: proposed,
            ...(!review ? { scriptLines: buildEnergyProgrammingScript(anamnese.nomePessoa || 'Interagente', proposed || []).flatMap(day => day.lines) } : {}),
          } : loaded);
          setAdminNotes(review?.adminNotes || '');
          setReviewStatus(!needsProposal && review?.status === 'approved' ? 'approved' : 'draft');
          if (needsProposal) setReviewMessage('O motor preparou a proposta para cada dia. O percurso automático já fica disponível ao usuário; os ajustes abaixo são opcionais.');
        })
        .catch(() => {
          if (active) {
            setReviewMessage(
              'Não foi possível carregar a revisão e confirmar o plano. Reabra esta anamnese antes de aprovar.'
            );
          }
        });
    }

    return () => {
      active = false;
    };
  }, [analise, motorDefault, backendIntakeId, anamnese]);

  const automaticCare = useMemo(() => {
    if (!journeyDays) return null;
    try { return buildAutomaticCare(anamnese, journeyDays); } catch { return null; }
  }, [anamnese, journeyDays]);
  const programmingScript = automaticCare ? buildEnergyProgrammingScript(anamnese.nomePessoa || 'Interagente', automaticCare.report.dailyEnergySchedule || []) : [];

  if (!analise || !manual) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h1 className="text-xl font-bold text-stone-100">Compositor de Cuidado</h1>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            Conclua uma anamnese para gerar uma composição técnica.
          </p>
        </div>
      </div>
    );
  }

  const axes = analise.relatorioEverton.eixosOrdenados;
  const selectableSystems = BIBLIOTECA_MESTRA.filter(
    item =>
      item.status !== 'NAO_UTILIZAR' &&
      item.catalogacaoTecnica !== 'PENDENTE'
  );

  const baseSystem =
    BIBLIOTECA_MESTRA.find(item => item.id === manual.baseSystemId) || null;
  const mainSystem =
    BIBLIOTECA_MESTRA.find(item => item.id === manual.mainSystemId) || null;
  const complementSystems = manual.complementSystemIds
    .map(id => BIBLIOTECA_MESTRA.find(item => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const selectedSolfeggio =
    SOLFEGGIO_CATALOG.find(item => item.id === manual.solfeggioId) || null;
  const selectedFlorals = manual.floralIds
    .map(id => FLORAL_CATALOG.find(item => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const selectedAromatherapy = manual.aromatherapyIds
    .map(id => AROMATHERAPY_CATALOG.find(item => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const selectedCrystals = manual.crystalIds
    .map(id => ETHERIC_CRYSTAL_CATALOG.find(item => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const selectedSystemsForResources = [
    baseSystem,
    mainSystem,
    ...complementSystems,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  const overriddenResources = {
    simbolos: uniq(selectedSystemsForResources.flatMap(item => item.simbolos)),
    energias: uniq(selectedSystemsForResources.flatMap(item => item.energias)),
    frequencias: uniq(selectedSystemsForResources.flatMap(item => item.frequencias)),
    cristais: uniq(selectedSystemsForResources.flatMap(item => item.cristais)),
    chakras: uniq(selectedSystemsForResources.flatMap(item => item.chakras)),
  };

  const audio = criarPlanoAudioPersonalizado({
    userId: backendUserId || anamnese.id,
    anamneseId: backendIntakeId || anamnese.id,
    nomePessoa: anamnese.nomePessoa,
    eixos: axes,
    relatorio: analise.relatorioEverton,
    solfeggio: selectedSolfeggio,
    override: {
      sistemaBase: baseSystem?.nome,
      sistemaPrincipal: mainSystem?.nome,
      sistemasComplementares: complementSystems.map(item => item.nome),
      recursosEnergeticos: overriddenResources,
      intencao: manual.audioIntention,
      roteiroBase: manual.scriptLines,
      assinaturaExtras: [
        ...(manual.dailyEnergySchedule || []).map(entry => `dia:${entry.day}:${entry.energyNames.join('|')}:${entry.intention}`),
        ...manual.floralIds.map(id => `floral:${id}`),
        ...manual.aromatherapyIds.map(id => `aroma:${id}`),
        ...manual.crystalIds.map(id => `cristal:${id}`),
      ],
    },
  });

  const composition = buildCareComposition(
    audio,
    {
      florals: selectedFlorals,
      aromatherapy: selectedAromatherapy,
      ethericCrystals: selectedCrystals,
    },
    selectedSolfeggio
  );

  const engineSnapshot = {
    baseSystem: analise.relatorioEverton.sistemaBase.nome,
    mainSystem: analise.relatorioEverton.sistemaPrincipal.nome,
    complementSystems: analise.relatorioEverton.sistemasComplementares.map(
      item => item.nome
    ),
    axes: analise.relatorioEverton.eixosOrdenados,
    sequence: analise.relatorioEverton.composicaoFinalSequencia,
  };

  function markDraft(next: ManualCareComposition) {
    setManual(next);
    setReviewStatus('draft');
    setReviewMessage('Alteração manual ainda não aprovada.');
  }

  function toggleArrayValue(
    key:
      | 'complementSystemIds'
      | 'floralIds'
      | 'aromatherapyIds'
      | 'crystalIds',
    value: string
  ) {
    const current = manual[key];
    const next = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    markDraft({ ...manual, [key]: next });
  }

  async function persistReview(approve: boolean) {
    if (!backendUserId || !backendIntakeId) {
      setReviewMessage(
        'Modo de teste: é necessário vínculo real com usuário e anamnese para salvar a revisão.'
      );
      return;
    }

    setSavingReview(true);
    setReviewMessage('');

    try {
      const confirmed = await getAdminEntitlementForIntake(backendIntakeId);
      setJourneyDays(confirmed?.days || null);
      if (approve && !confirmed) throw new Error('Confirme o plano antes de aprovar a programação diária.');
      if (approve && confirmed) {
        const error = validateDailyEnergySchedule(manual.dailyEnergySchedule || [], confirmed.days, overriddenResources.energias);
        if (error) throw new Error(error);
      }
      const fullReport = approve ? buildFullReportNarrative({
        intake: anamnese, analysis: analise, composition,
        journeyDays: confirmed?.days, dailyEnergySchedule: manual.dailyEnergySchedule,
      }) : null;
      if (fullReport) await validateFullReportSource(backendIntakeId, fullReport);
      const saved = await saveCareCompositionReview({
        intakeId: backendIntakeId,
        userId: backendUserId,
        engineSnapshot,
        manualComposition: manual,
        adminNotes,
        approve,
      });

      if (approve) {
        await persistApprovedCarePlan({
          intakeId: backendIntakeId,
          userId: backendUserId,
          audioPlanId: audio.id,
          audioTitle: audio.titulo,
          compositionSignature: audio.assinaturaComposicao,
          baseSystem: baseSystem?.nome || '',
          mainSystem: mainSystem?.nome || '',
          complementarySystems: complementSystems.map(item => item.nome),
          internalResources: audio.recursosEnergeticos,
          scriptLines: manual.scriptLines,
          adminNotes,
          solfeggio: selectedSolfeggio
            ? {
                hz: selectedSolfeggio.hz,
                chakraProjeto: selectedSolfeggio.chakraProjeto,
                intencaoProjeto: selectedSolfeggio.intencaoProjeto,
              }
            : null,
          florals: selectedFlorals.map(item => ({
            id: item.id,
            nome: item.nome,
            descricao: item.descricao,
          })),
          aromatherapy: selectedAromatherapy.map(item => ({
            id: item.id,
            nome: item.nome,
            descricao: item.descricao,
            formaUsoPermitida: item.formaUsoPermitida || null,
          })),
          ethericCrystals: selectedCrystals.map(item => ({
            id: item.id,
            nome: item.nome,
            descricao: item.descricao,
          })),
          userResult: friendlyResult,
        });

        await publishFullReport({
          intakeId: backendIntakeId,
          userId: backendUserId,
          report: fullReport!,
        });
      }

      setReviewStatus(saved.status === 'approved' ? 'approved' : 'draft');
      setReviewMessage(
        approve
          ? 'Composição aprovada. O relatório completo foi preparado no backend e só será visível quando o entitlement permitir. O upload do áudio está liberado.'
          : 'Rascunho salvo no backend.'
      );
    } catch (error) {
      setReviewMessage(
        error instanceof Error
          ? `Não foi possível salvar: ${error.message}`
          : 'Não foi possível salvar a composição.'
      );
    } finally {
      setSavingReview(false);
    }
  }

  function restoreMotor() {
    if (!motorDefault) return;
    setManual(motorDefault);
    setAdminNotes('');
    setReviewStatus('draft');
    setReviewMessage('Sugestão original do motor restaurada. Revise antes de aprovar.');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {automaticCare && <section className="mb-6 rounded-2xl border border-emerald-700 bg-stone-900 p-6 text-stone-200">
        <h2 className="text-xl font-semibold text-emerald-200">Percurso automático entregue ao usuário — {journeyDays} dias</h2>
        <p className="mt-2 text-sm text-stone-400">Composição gerada a partir desta anamnese. O roteiro prepara a programação; não registra uma sessão como executada.</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">{programmingScript.map(day => <article key={day.day} className="rounded-xl border border-stone-700 p-5">
          <h3 className="font-semibold text-amber-200">Dia {day.day} — {day.intention}</h3>
          <p className="mt-2">{day.energyNames.join(' + ')}</p>
          <p className="mt-3 text-sm leading-6 text-stone-400">{day.reason}</p>
          <h4 className="mt-4 font-semibold">Roteiro de programação energética</h4>
          <textarea aria-label={`Roteiro energético do dia ${day.day}`} readOnly value={day.lines.join('\n')} rows={10} className="mt-2 w-full rounded-lg bg-stone-950 p-3 text-sm leading-6"/>
        </article>)}</div>
      </section>}
      <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400">
              <Layers3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-100">Compositor de Cuidado</h1>
              <p className="mt-1 text-sm text-stone-400">
                {anamnese.nomePessoa || 'Interagente'} • {backendIntakeId || anamnese.id}
              </p>
              <p className="mt-2 text-xs leading-5 text-stone-500">
                O percurso individual é entregue automaticamente. Aqui você acompanha a programação e pode fazer ajustes opcionais.
              </p>
            </div>
          </div>

          <div
            className={`rounded-full border px-4 py-2 text-xs font-bold ${
              reviewStatus === 'approved'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
            }`}
          >
            {reviewStatus === 'approved' ? 'COMPOSIÇÃO APROVADA' : 'RASCUNHO / EM REVISÃO'}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
            Sugestão original do motor
          </h2>
          <div className="mt-4 space-y-3">
            <ReadOnlyLine label="Sistema-base" value={analise.relatorioEverton.sistemaBase.nome} />
            <ReadOnlyLine label="Sistema principal" value={analise.relatorioEverton.sistemaPrincipal.nome} />
            <ReadOnlyLine
              label="Complementares"
              value={
                analise.relatorioEverton.sistemasComplementares.map(item => item.nome).join(', ') ||
                'Nenhum'
              }
            />
          </div>

          <div className="mt-5 space-y-3">
            {axes.slice(0, 5).map((axis, index) => (
              <div key={axis.eixoId} className="rounded-xl bg-stone-950/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-stone-500">#{index + 1}</div>
                    <div className="font-medium text-stone-100">{axis.nome}</div>
                  </div>
                  <div className="text-sm font-bold text-amber-300">{axis.percentual}%</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
                Decisão do ADM
              </h2>
              <p className="mt-2 text-xs leading-5 text-stone-500">
                Alterações ficam registradas separadamente da sugestão original.
              </p>
            </div>
            <button
              type="button"
              onClick={restoreMotor}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-700 px-3 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800"
            >
              <RotateCcw className="h-4 w-4" /> Restaurar motor
            </button>
          </div>

          <div className="mt-5 space-y-5">
            <SelectField
              label="Sistema-base"
              value={manual.baseSystemId}
              onChange={value => markDraft({ ...manual, baseSystemId: value })}
              options={selectableSystems.map(item => ({
                value: item.id,
                label: `${item.nome} • ${item.catalogacaoTecnica || 'SEM STATUS'}`,
              }))}
            />

            <SelectField
              label="Sistema principal"
              value={manual.mainSystemId}
              onChange={value => markDraft({ ...manual, mainSystemId: value })}
              options={selectableSystems.map(item => ({
                value: item.id,
                label: `${item.nome} • ${item.catalogacaoTecnica || 'SEM STATUS'}`,
              }))}
            />

            <SelectField
              label="Solfeggio da sessão"
              value={manual.solfeggioId || ''}
              onChange={value =>
                markDraft({ ...manual, solfeggioId: value || null })
              }
              options={[
                { value: '', label: 'Sem Solfeggio' },
                ...SOLFEGGIO_CATALOG.filter(item => item.status === 'ATIVO').map(item => ({
                  value: item.id,
                  label: `${item.hz} Hz • ${item.chakraProjeto}`,
                })),
              ]}
            />
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <h2 className="text-lg font-semibold text-stone-100">Programação diária — {journeyDays ? `${journeyDays} dias` : 'aguardando plano confirmado'}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-400">O motor propõe usando apenas as energias documentadas dos sistemas selecionados. Revise cada dia antes de aprovar. A programação será entregue junto ao relatório, na tela e no PDF.</p>
        {journeyError && <p role="alert" className="mt-3 text-amber-300">{journeyError}</p>}
        <button type="button" disabled={!journeyDays} onClick={() => {
          if (!journeyDays) return;
          markDraft({ ...manual, dailyEnergySchedule: proposeDailyEnergySchedule({ days: journeyDays, systems: selectedSystemsForResources, axes, highSensitivity: ['alta', 'muito_alta'].includes(anamnese.sensibilidadeEnergetica || '') }) });
        }} className="mt-4 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-stone-950 disabled:opacity-40">Gerar proposta diária do motor</button>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">{(manual.dailyEnergySchedule || []).map((entry, index) => <fieldset key={entry.day} className="rounded-xl border border-stone-700 p-4">
          <legend className="px-2 font-semibold text-amber-300">Dia {entry.day}</legend>
          <div className="space-y-2">{overriddenResources.energias.map(name => <label key={name} className="flex items-start gap-2 text-sm text-stone-200"><input type="checkbox" checked={entry.energyNames.includes(name)} onChange={() => {
            const energyNames = entry.energyNames.includes(name) ? entry.energyNames.filter(item => item !== name) : [...entry.energyNames, name];
            markDraft({ ...manual, dailyEnergySchedule: manual.dailyEnergySchedule!.map((item, i) => i === index ? { ...item, energyNames } : item) });
          }}/>{name}</label>)}</div>
          <label className="mt-4 block text-sm text-stone-300">Intenção do dia<input value={entry.intention} onChange={event => markDraft({ ...manual, dailyEnergySchedule: manual.dailyEnergySchedule!.map((item, i) => i === index ? { ...item, intention: event.target.value } : item) })} className="mt-2 w-full rounded-lg border border-stone-700 bg-stone-950 p-3 text-stone-100"/></label>
        </fieldset>)}</div>
      </section>

      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
          Sistemas complementares
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {selectableSystems.map(system => (
            <CheckOption
              key={system.id}
              checked={manual.complementSystemIds.includes(system.id)}
              label={system.nome}
              detail={system.catalogacaoTecnica || 'SEM STATUS'}
              onChange={() => toggleArrayValue('complementSystemIds', system.id)}
            />
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <ResourceSelector
          icon={<Flower2 className="h-5 w-5" />}
          title="Florais"
          items={FLORAL_CATALOG.filter(item => item.status === 'ATIVO').map(item => ({
            id: item.id,
            name: item.nome,
            detail: item.sistemaOrigem,
          }))}
          selected={manual.floralIds}
          onToggle={id => toggleArrayValue('floralIds', id)}
        />

        <ResourceSelector
          icon={<Leaf className="h-5 w-5" />}
          title="Aromaterapia"
          items={AROMATHERAPY_CATALOG.filter(item => item.status === 'ATIVO').map(item => ({
            id: item.id,
            name: item.nome,
            detail: item.formaUsoPermitida || '',
          }))}
          selected={manual.aromatherapyIds}
          onToggle={id => toggleArrayValue('aromatherapyIds', id)}
        />

        <ResourceSelector
          icon={<Gem className="h-5 w-5" />}
          title="Cristais etéricos"
          items={ETHERIC_CRYSTAL_CATALOG.filter(item => item.status === 'ATIVO').map(item => ({
            id: item.id,
            name: item.nome,
            detail: item.sistemaOrigem,
          }))}
          selected={manual.crystalIds}
          onToggle={id => toggleArrayValue('crystalIds', id)}
        />
      </div>

      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
          Áudio exclusivo — intenção e roteiro
        </h2>

        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">
            Intenção da sessão
          </span>
          <textarea
            rows={3}
            value={manual.audioIntention}
            onChange={event =>
              markDraft({ ...manual, audioIntention: event.target.value })
            }
            className="w-full rounded-xl border border-stone-700 bg-stone-950 p-4 text-sm leading-6 text-stone-200 outline-none focus:border-amber-500/60"
          />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">
            Roteiro técnico da composição — uma etapa por linha
          </span>
          <textarea
            rows={10}
            value={manual.scriptLines.join('\n')}
            onChange={event =>
              markDraft({
                ...manual,
                scriptLines: event.target.value
                  .split('\n')
                  .map(line => line.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-xl border border-stone-700 bg-stone-950 p-4 font-mono text-sm leading-6 text-stone-200 outline-none focus:border-amber-500/60"
          />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">
            Observações do Everton
          </span>
          <textarea
            rows={4}
            value={adminNotes}
            onChange={event => {
              setAdminNotes(event.target.value);
              setReviewStatus('draft');
              setReviewMessage('Observação alterada. Salve ou aprove novamente.');
            }}
            className="w-full rounded-xl border border-stone-700 bg-stone-950 p-4 text-sm leading-6 text-stone-200 outline-none focus:border-amber-500/60"
            placeholder="Motivo dos ajustes, cuidados para esta pessoa, observações para geração do áudio..."
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={savingReview}
            onClick={() => void persistReview(false)}
            className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-800 px-5 py-3 text-sm font-bold text-stone-200 hover:bg-stone-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Salvar rascunho
          </button>

          <button
            type="button"
            disabled={savingReview}
            onClick={() => void persistReview(true)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-stone-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Aprovar composição
          </button>
        </div>

        {reviewMessage && (
          <div className="mt-4 rounded-xl border border-stone-700 bg-stone-950/60 p-4 text-sm text-stone-300">
            {reviewMessage}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
          Composição final atual
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ResourceRow
            icon={<AudioLines className="h-5 w-5" />}
            title="Plano de áudio"
            value={composition.audio?.titulo || 'Não gerado'}
            status={reviewStatus === 'approved' ? 'APROVADO' : 'RASCUNHO'}
          />
          <ResourceRow
            icon={<AudioLines className="h-5 w-5" />}
            title="Solfeggio"
            value={
              composition.solfeggio
                ? `${composition.solfeggio.hz} Hz • ${composition.solfeggio.chakraProjeto}`
                : 'Sem Solfeggio'
            }
            status={composition.solfeggio ? 'SELECIONADO' : 'NÃO UTILIZADO'}
          />
          <ResourceRow
            icon={<Flower2 className="h-5 w-5" />}
            title="Florais"
            value={selectedFlorals.map(item => item.nome).join(', ') || 'Nenhum'}
            status={selectedFlorals.length ? 'SELECIONADO' : 'NÃO UTILIZADO'}
          />
          <ResourceRow
            icon={<Leaf className="h-5 w-5" />}
            title="Aromaterapia"
            value={selectedAromatherapy.map(item => item.nome).join(', ') || 'Nenhuma'}
            status={selectedAromatherapy.length ? 'SELECIONADO' : 'NÃO UTILIZADO'}
          />
          <ResourceRow
            icon={<Gem className="h-5 w-5" />}
            title="Cristais"
            value={selectedCrystals.map(item => item.nome).join(', ') || 'Nenhum'}
            status={selectedCrystals.length ? 'SELECIONADO' : 'NÃO UTILIZADO'}
          />
          <ResourceRow
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Assinatura da composição"
            value={audio.assinaturaComposicao}
            status="INTERNA"
          />
        </div>
      </section>

      {composition.audio && backendUserId && backendIntakeId && reviewStatus === 'approved' && (
        <AudioGenerationAdminPanel
          audioPlanId={composition.audio.id}
          firstName={anamnese.nomePessoa.trim().split(/\s+/)[0] || 'Interagente'}
          intention={composition.audio.intencao}
          solfeggioHz={composition.solfeggio?.hz || null}
        />
      )}

      {composition.audio && backendUserId && backendIntakeId && reviewStatus === 'approved' ? (
        <AdminAudioUpload
          audio={composition.audio}
          nomePessoa={anamnese.nomePessoa || 'Interagente'}
        />
      ) : composition.audio ? (
        <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="font-semibold text-stone-100">Publicação do áudio</h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            {backendUserId && backendIntakeId
              ? 'Aprove a composição acima para liberar o upload do áudio exclusivo.'
              : 'Esta composição está em modo de teste/local. O upload só é liberado com usuário e anamnese reais do backend.'}
          </p>
        </section>
      ) : null}

      {backendUserId && backendIntakeId && friendlyResult && (
        <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-stone-100">Enviar resultado por e-mail</h2>
              <p className="mt-1 text-sm leading-6 text-stone-400">
                Envia somente o PDF acolhedor da pessoa. O relatório técnico permanece reservado ao ADM.
              </p>
            </div>
            <button
              type="button"
              disabled={emailSending}
              onClick={async () => {
                if (emailSending) return;
                setEmailSending(true);
                setEmailMessage('');
                try {
                  const publication = await loadFullReportForAdmin(backendIntakeId);
                  const entitlement = await getAdminEntitlementForIntake(backendIntakeId);
                  if (canAccessFullReport(entitlement) && !publication) throw new Error('Publique a versão aprovada do relatório completo antes de enviar.');
                  const response = canAccessFullReport(entitlement) && publication
                    ? await requestFullReportEmail({ userId: backendUserId, intakeId: backendIntakeId, requestedBy: 'admin', report: publication.report })
                    : await requestResultEmail({
                    userId: backendUserId,
                    intakeId: backendIntakeId,
                    requestedBy: 'admin',
                    pdfData: {
                      nome: anamnese.nomePessoa,
                      data: anamnese.data,
                      headline: friendlyResult.headline,
                      intro: friendlyResult.intro,
                      priorities: friendlyResult.priorities,
                      intention: friendlyResult.intention,
                      closing: friendlyResult.closing,
                      composition,
                    },
                  });
                  setEmailMessage(response.message);
                } catch (error) {
                  setEmailMessage(
                    error instanceof Error
                      ? `Não foi possível preparar o envio: ${error.message}`
                      : 'Não foi possível preparar o envio por e-mail.'
                  );
                } finally {
                  setEmailSending(false);
                }
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              {emailSending ? 'Preparando envio...' : 'Enviar resultado'}
            </button>
          </div>
          {emailMessage && (
            <div className="mt-4 rounded-xl border border-stone-700 bg-stone-950/60 p-4 text-sm text-stone-300">
              {emailMessage}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-200 outline-none focus:border-amber-500/60"
      >
        {options.map(option => (
          <option key={option.value || 'none'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckOption({
  checked,
  label,
  detail,
  onChange,
}: {
  checked: boolean;
  label: string;
  detail?: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-800 bg-stone-950/60 p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-amber-500"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-stone-200">{label}</span>
        {detail && <span className="mt-1 block text-xs text-stone-500">{detail}</span>}
      </span>
    </label>
  );
}

function ResourceSelector({
  icon,
  title,
  items,
  selected,
  onToggle,
}: {
  icon: ReactNode;
  title: string;
  items: Array<{ id: string; name: string; detail?: string }>;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
      <div className="flex items-center gap-2 text-stone-200">
        <span className="text-amber-400">{icon}</span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">
        {items.map(item => (
          <CheckOption
            key={item.id}
            checked={selected.includes(item.id)}
            label={item.name}
            detail={item.detail}
            onChange={() => onToggle(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ReadOnlyLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4">
      <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-stone-200">{value}</div>
    </div>
  );
}

function ResourceRow({
  icon,
  title,
  value,
  status,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="mt-0.5 text-amber-400">{icon}</div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-stone-500">{title}</div>
            <div className="mt-1 break-words text-sm font-medium text-stone-200">{value}</div>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-stone-700 bg-stone-800 px-2.5 py-1 text-[10px] font-semibold text-stone-300">
          {status}
        </span>
      </div>
    </div>
  );
}
