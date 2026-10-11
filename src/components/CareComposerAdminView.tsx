import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AudioLines,
  CheckCircle2,
  ChevronDown,
  Flower2,
  Gem,
  Leaf,
  Mail,
  PlusCircle,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { buildAutomaticCare } from '../care/automaticCare';
import { buildEnergyProgrammingScript } from '../care/energyProgrammingScript';
import { proposeDailyEnergySchedule, validateDailyEnergySchedule } from '../care/dailyEnergySchedule';
import { getAdminEntitlementForIntake } from '../services/entitlementBackend';
import { canAccessFullReport } from '../commercial/entitlements';
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

function defaultManualComposition(analise: AnaliseCompletaResultado): ManualCareComposition {
  const axes = analise.relatorioEverton.eixosOrdenados;
  const base = BIBLIOTECA_MESTRA.find(item => item.nome === analise.relatorioEverton.sistemaBase.nome);
  const main = BIBLIOTECA_MESTRA.find(item => item.nome === analise.relatorioEverton.sistemaPrincipal.nome);
  const complementIds = analise.relatorioEverton.sistemasComplementares
    .map(system => BIBLIOTECA_MESTRA.find(item => item.nome === system.nome)?.id)
    .filter((id): id is string => Boolean(id));

  const scoreResource = (resourceAxes: string[]) =>
    axes.slice(0, 5).reduce((score, axis, index) => {
      if (!resourceAxes.includes(axis.eixoId)) return score;
      return score + axis.percentual * Math.max(1, 5 - index);
    }, 0);

  const rankedSolfeggio = SOLFEGGIO_CATALOG
    .filter(item => item.status === 'ATIVO')
    .map(item => ({ item, score: scoreResource(item.eixos) }))
    .sort((a, b) => b.score - a.score)[0]?.item;

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
    audioIntention: 'Acolher a prioridade atual indicada nesta anamnese, respeitando o ritmo e a composição individual desta pessoa.',
    scriptLines: analise.relatorioEverton.composicaoFinalSequencia.map(
      etapa => `${etapa.fase}: ${etapa.sistemaOuTecnica}${etapa.recursoEspecifico ? ` — ${etapa.recursoEspecifico}` : ''}`
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
  const [manual, setManual] = useState<ManualCareComposition | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('draft');
  const [reviewMessage, setReviewMessage] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [journeyError, setJourneyError] = useState('');
  const [showSystemPicker, setShowSystemPicker] = useState(false);

  const motorDefault = useMemo(() => (analise ? defaultManualComposition(analise) : null), [analise]);

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

    if (backendIntakeId) {
      Promise.all([loadCareCompositionReview(backendIntakeId), getAdminEntitlementForIntake(backendIntakeId)])
        .then(([review, entitlement]) => {
          if (!active) return;
          setJourneyDays(entitlement?.days || null);
          const loaded = review?.manualComposition || motorDefault;
          const needsProposal = Boolean(entitlement && loaded.dailyEnergySchedule === undefined);
          const proposed = needsProposal && entitlement
            ? buildAutomaticCare(anamnese, entitlement.days).report.dailyEnergySchedule
            : undefined;
          setManual(needsProposal
            ? {
                ...loaded,
                dailyEnergySchedule: proposed,
                ...(!review
                  ? { scriptLines: buildEnergyProgrammingScript(anamnese.nomePessoa || 'Interagente', proposed || []).flatMap(day => day.lines) }
                  : {}),
              }
            : loaded);
          setAdminNotes(review?.adminNotes || '');
          setReviewStatus(!needsProposal && review?.status === 'approved' ? 'approved' : 'draft');
          if (needsProposal) setReviewMessage('O motor já preparou o percurso. Você só precisa interferir se sua leitura pedir algum ajuste.');
        })
        .catch(() => {
          if (active) setReviewMessage('Não foi possível carregar a revisão anterior. Reabra esta anamnese antes de aprovar.');
        });
    }

    return () => { active = false; };
  }, [analise, motorDefault, backendIntakeId, anamnese]);

  if (!analise || !manual) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h1 className="text-xl font-bold text-stone-100">Cuidado da pessoa</h1>
          <p className="mt-2 text-sm leading-6 text-stone-400">Conclua uma anamnese para preparar o cuidado.</p>
        </div>
      </div>
    );
  }

  const axes = analise.relatorioEverton.eixosOrdenados;
  const selectableSystems = BIBLIOTECA_MESTRA.filter(item => item.status !== 'NAO_UTILIZAR' && item.catalogacaoTecnica !== 'PENDENTE');
  const motorComplementIds = motorDefault?.complementSystemIds || [];
  const baseSystem = BIBLIOTECA_MESTRA.find(item => item.id === manual.baseSystemId) || null;
  const mainSystem = BIBLIOTECA_MESTRA.find(item => item.id === manual.mainSystemId) || null;
  const complementSystems = manual.complementSystemIds
    .map(id => BIBLIOTECA_MESTRA.find(item => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const perceptionSystems = complementSystems.filter(item => !motorComplementIds.includes(item.id));

  const selectedSolfeggio = SOLFEGGIO_CATALOG.find(item => item.id === manual.solfeggioId) || null;
  const selectedFlorals = manual.floralIds.map(id => FLORAL_CATALOG.find(item => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const selectedAromatherapy = manual.aromatherapyIds.map(id => AROMATHERAPY_CATALOG.find(item => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const selectedCrystals = manual.crystalIds.map(id => ETHERIC_CRYSTAL_CATALOG.find(item => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item));

  const selectedSystemsForResources = [baseSystem, mainSystem, ...complementSystems].filter((item): item is NonNullable<typeof item> => Boolean(item));
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
    { florals: selectedFlorals, aromatherapy: selectedAromatherapy, ethericCrystals: selectedCrystals },
    selectedSolfeggio
  );

  const engineSnapshot = {
    baseSystem: analise.relatorioEverton.sistemaBase.nome,
    mainSystem: analise.relatorioEverton.sistemaPrincipal.nome,
    complementSystems: analise.relatorioEverton.sistemasComplementares.map(item => item.nome),
    axes: analise.relatorioEverton.eixosOrdenados,
    sequence: analise.relatorioEverton.composicaoFinalSequencia,
  };

  const markDraft = (next: ManualCareComposition) => {
    setManual(next);
    setReviewStatus('draft');
    setReviewMessage('Há um ajuste seu ainda não aprovado.');
  };

  const toggleArrayValue = (key: 'complementSystemIds' | 'floralIds' | 'aromatherapyIds' | 'crystalIds', value: string) => {
    const current = manual[key];
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    markDraft({ ...manual, [key]: next });
  };

  async function persistReview(approve: boolean) {
    if (!backendUserId || !backendIntakeId) {
      setReviewMessage('Modo de teste: abra uma anamnese real para salvar ou aprovar.');
      return;
    }

    setSavingReview(true);
    setReviewMessage('');
    try {
      const confirmed = await getAdminEntitlementForIntake(backendIntakeId);
      setJourneyDays(confirmed?.days || null);
      if (approve && !confirmed) throw new Error('Confirme o plano antes de aprovar o percurso.');
      if (approve && confirmed) {
        const error = validateDailyEnergySchedule(manual.dailyEnergySchedule || [], confirmed.days, overriddenResources.energias);
        if (error) throw new Error(error);
      }

      const fullReport = approve
        ? buildFullReportNarrative({ intake: anamnese, analysis: analise, composition, journeyDays: confirmed?.days, dailyEnergySchedule: manual.dailyEnergySchedule })
        : null;
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
          solfeggio: selectedSolfeggio ? { hz: selectedSolfeggio.hz, chakraProjeto: selectedSolfeggio.chakraProjeto, intencaoProjeto: selectedSolfeggio.intencaoProjeto } : null,
          florals: selectedFlorals.map(item => ({ id: item.id, nome: item.nome, descricao: item.descricao })),
          aromatherapy: selectedAromatherapy.map(item => ({ id: item.id, nome: item.nome, descricao: item.descricao, formaUsoPermitida: item.formaUsoPermitida || null })),
          ethericCrystals: selectedCrystals.map(item => ({ id: item.id, nome: item.nome, descricao: item.descricao })),
          userResult: friendlyResult,
        });
        await publishFullReport({ intakeId: backendIntakeId, userId: backendUserId, report: fullReport! });
      }

      setReviewStatus(saved.status === 'approved' ? 'approved' : 'draft');
      setReviewMessage(approve ? 'Cuidado aprovado e publicado para este percurso.' : 'Rascunho salvo.');
    } catch (error) {
      setReviewMessage(error instanceof Error ? `Não foi possível salvar: ${error.message}` : 'Não foi possível salvar a composição.');
    } finally {
      setSavingReview(false);
    }
  }

  async function sendResult() {
    if (!backendUserId || !backendIntakeId || !friendlyResult) {
      setEmailMessage('Abra uma anamnese real para enviar o resultado.');
      return;
    }
    setEmailSending(true);
    setEmailMessage('');
    try {
      const publication = await loadFullReportForAdmin(backendIntakeId);
      const entitlement = await getAdminEntitlementForIntake(backendIntakeId);
      if (canAccessFullReport(entitlement) && !publication) throw new Error('Aprove a composição antes de enviar o relatório completo.');
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
      setEmailMessage(error instanceof Error ? `Não foi possível preparar o envio: ${error.message}` : 'Não foi possível preparar o envio por e-mail.');
    } finally {
      setEmailSending(false);
    }
  }

  function restoreMotor() {
    if (!motorDefault) return;
    setManual(motorDefault);
    setAdminNotes('');
    setReviewStatus('draft');
    setReviewMessage('Sugestão original restaurada.');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-6">
      <section className="rounded-2xl border border-stone-800 bg-stone-900 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-300"><Sparkles className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.16em]">Cuidado da pessoa</span></div>
            <h1 className="mt-2 text-2xl font-semibold text-stone-100">{anamnese.nomePessoa || 'Interagente'}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">O motor organiza a base. Você só precisa olhar, sentir e interferir quando sua percepção indicar algo que realmente faça sentido.</p>
          </div>
          <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${reviewStatus === 'approved' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
            {reviewStatus === 'approved' ? 'APROVADO' : 'EM REVISÃO'}
          </span>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-stone-100">1. O que apareceu nesta leitura</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {axes.slice(0, 3).map((axis, index) => (
            <div key={axis.eixoId} className="rounded-xl border border-stone-800 bg-stone-950/50 p-4">
              <div className="text-[11px] uppercase tracking-wider text-stone-500">Prioridade {index + 1}</div>
              <div className="mt-1 font-medium text-stone-100">{axis.nome}</div>
              <div className="mt-2 text-sm font-semibold text-amber-300">{axis.percentual}%</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-100">2. Sistemas e recursos sugeridos</h2>
            <p className="mt-1 text-sm leading-6 text-stone-400">Aqui aparece somente o que está sendo usado neste cuidado — não a Biblioteca inteira.</p>
          </div>
          <button type="button" onClick={restoreMotor} className="inline-flex w-fit items-center gap-2 rounded-lg border border-stone-700 px-3 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800"><RotateCcw className="h-4 w-4" />Restaurar motor</button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <SelectedSystem label="Base" name={baseSystem?.nome || 'Não definido'} />
          <SelectedSystem label="Principal" name={mainSystem?.nome || 'Não definido'} />
          {complementSystems.filter(item => motorComplementIds.includes(item.id)).map(item => <SelectedSystem key={item.id} label="Complementar sugerido" name={item.nome} />)}
          {perceptionSystems.map(item => (
            <SelectedSystem key={item.id} label="Incluído por percepção" name={item.nome} onRemove={() => toggleArrayValue('complementSystemIds', item.id)} />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {selectedSolfeggio && <ResourceChip icon={<AudioLines className="h-4 w-4" />} label={`${selectedSolfeggio.hz} Hz`} />}
          {selectedFlorals.map(item => <ResourceChip key={item.id} icon={<Flower2 className="h-4 w-4" />} label={item.nome} />)}
          {selectedAromatherapy.map(item => <ResourceChip key={item.id} icon={<Leaf className="h-4 w-4" />} label={item.nome} />)}
          {selectedCrystals.map(item => <ResourceChip key={item.id} icon={<Gem className="h-4 w-4" />} label={item.nome} />)}
        </div>

        <button type="button" onClick={() => setShowSystemPicker(value => !value)} className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/15">
          <PlusCircle className="h-4 w-4" />Adicionar sistema por percepção espiritual
        </button>

        {showSystemPicker && (
          <div className="mt-4 rounded-2xl border border-stone-700 bg-stone-950/50 p-4">
            <p className="text-sm leading-6 text-stone-400">Use somente quando sua percepção pedir algo além do que o motor sugeriu. A inclusão fica registrada como ajuste seu.</p>
            <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {selectableSystems
                .filter(system => system.id !== manual.baseSystemId && system.id !== manual.mainSystemId)
                .map(system => (
                  <label key={system.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-800 bg-stone-900 p-3">
                    <input type="checkbox" checked={manual.complementSystemIds.includes(system.id)} onChange={() => toggleArrayValue('complementSystemIds', system.id)} className="mt-1 h-4 w-4 accent-amber-500" />
                    <span><span className="block text-sm font-medium text-stone-200">{system.nome}</span><span className="mt-1 block text-xs text-stone-500">{system.catalogacaoTecnica || 'Documentado'}</span></span>
                  </label>
                ))}
            </div>
          </div>
        )}

        <details className="mt-5 rounded-xl border border-stone-800 bg-stone-950/40 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-stone-300">Ajustar recursos complementares</summary>
          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            <CompactSelector title="Florais" items={FLORAL_CATALOG.filter(item => item.status === 'ATIVO').map(item => ({ id: item.id, name: item.nome }))} selected={manual.floralIds} onToggle={id => toggleArrayValue('floralIds', id)} />
            <CompactSelector title="Aromaterapia" items={AROMATHERAPY_CATALOG.filter(item => item.status === 'ATIVO').map(item => ({ id: item.id, name: item.nome }))} selected={manual.aromatherapyIds} onToggle={id => toggleArrayValue('aromatherapyIds', id)} />
            <CompactSelector title="Cristais" items={ETHERIC_CRYSTAL_CATALOG.filter(item => item.status === 'ATIVO').map(item => ({ id: item.id, name: item.nome }))} selected={manual.crystalIds} onToggle={id => toggleArrayValue('crystalIds', id)} />
          </div>
        </details>
      </section>

      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-stone-100">3. Minha percepção</h2>
        <p className="mt-1 text-sm leading-6 text-stone-400">Anote somente o que você percebeu e que precisa acompanhar este caso.</p>
        <textarea rows={4} value={adminNotes} onChange={event => { setAdminNotes(event.target.value); setReviewStatus('draft'); setReviewMessage('Sua observação foi alterada.'); }} className="mt-4 w-full rounded-xl border border-stone-700 bg-stone-950 p-4 text-sm leading-6 text-stone-200 outline-none focus:border-amber-500/60" placeholder="Ex.: incluir determinado sistema, cuidado especial, percepção para o áudio..." />
      </section>

      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-100">4. Percurso {journeyDays ? `de ${journeyDays} dias` : ''}</h2>
            <p className="mt-1 text-sm leading-6 text-stone-400">Veja o essencial. Abra um dia apenas quando quiser alterar a programação.</p>
          </div>
          <button type="button" disabled={!journeyDays} onClick={() => {
            if (!journeyDays) return;
            try {
              setJourneyError('');
              markDraft({ ...manual, dailyEnergySchedule: proposeDailyEnergySchedule({ days: journeyDays, systems: selectedSystemsForResources, axes, highSensitivity: ['alta', 'muito_alta'].includes(anamnese.sensibilidadeEnergetica || '') }) });
            } catch (error) {
              setJourneyError(error instanceof Error ? error.message : 'Não foi possível gerar a proposta.');
            }
          }} className="w-fit rounded-xl border border-stone-700 px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800 disabled:opacity-40">Refazer proposta automática</button>
        </div>
        {journeyError && <p className="mt-3 text-sm text-amber-300">{journeyError}</p>}
        <div className="mt-5 space-y-3">
          {(manual.dailyEnergySchedule || []).map((entry, index) => (
            <details key={entry.day} className="group rounded-xl border border-stone-800 bg-stone-950/50 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div><div className="font-semibold text-amber-200">Dia {entry.day} — {entry.intention}</div><div className="mt-1 text-sm text-stone-400">{entry.energyNames.join(' + ') || 'Sem energia definida'}</div></div>
                <ChevronDown className="h-4 w-4 shrink-0 text-stone-500 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 border-t border-stone-800 pt-4">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {overriddenResources.energias.map(name => (
                    <label key={name} className="flex items-start gap-2 text-sm text-stone-200"><input type="checkbox" checked={entry.energyNames.includes(name)} onChange={() => {
                      const energyNames = entry.energyNames.includes(name) ? entry.energyNames.filter(item => item !== name) : [...entry.energyNames, name];
                      markDraft({ ...manual, dailyEnergySchedule: manual.dailyEnergySchedule!.map((item, i) => i === index ? { ...item, energyNames } : item) });
                    }} />{name}</label>
                  ))}
                </div>
                <label className="mt-4 block text-sm text-stone-300">Intenção do dia<input value={entry.intention} onChange={event => markDraft({ ...manual, dailyEnergySchedule: manual.dailyEnergySchedule!.map((item, i) => i === index ? { ...item, intention: event.target.value } : item) })} className="mt-2 w-full rounded-lg border border-stone-700 bg-stone-950 p-3 text-stone-100" /></label>
              </div>
            </details>
          ))}
          {!manual.dailyEnergySchedule?.length && <div className="rounded-xl border border-dashed border-stone-700 p-5 text-sm text-stone-500">Aguardando confirmação do plano para montar os dias.</div>}
        </div>
      </section>

      <details className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-5 sm:p-6">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-stone-300">Ver detalhes técnicos e áudio</summary>
        <div className="mt-5 space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <TechnicalRow title="Sistema-base" value={baseSystem?.nome || 'Não definido'} />
            <TechnicalRow title="Sistema principal" value={mainSystem?.nome || 'Não definido'} />
            <TechnicalRow title="Solfeggio" value={selectedSolfeggio ? `${selectedSolfeggio.hz} Hz • ${selectedSolfeggio.chakraProjeto}` : 'Não utilizado'} />
            <TechnicalRow title="Assinatura interna" value={audio.assinaturaComposicao} />
          </div>
          <label className="block"><span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Intenção do áudio</span><textarea rows={3} value={manual.audioIntention} onChange={event => markDraft({ ...manual, audioIntention: event.target.value })} className="mt-2 w-full rounded-xl border border-stone-700 bg-stone-950 p-4 text-sm text-stone-200" /></label>
          <label className="block"><span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Roteiro técnico</span><textarea rows={8} value={manual.scriptLines.join('\n')} onChange={event => markDraft({ ...manual, scriptLines: event.target.value.split('\n').map(line => line.trim()).filter(Boolean) })} className="mt-2 w-full rounded-xl border border-stone-700 bg-stone-950 p-4 font-mono text-sm text-stone-200" /></label>

          {composition.audio && backendUserId && backendIntakeId && reviewStatus === 'approved' && (
            <>
              <AudioGenerationAdminPanel audioPlanId={composition.audio.id} firstName={anamnese.nomePessoa.trim().split(/\s+/)[0] || 'Interagente'} intention={composition.audio.intencao} solfeggioHz={composition.solfeggio?.hz || null} />
              <AdminAudioUpload audio={composition.audio} nomePessoa={anamnese.nomePessoa || 'Interagente'} />
            </>
          )}
        </div>
      </details>

      {(reviewMessage || emailMessage) && (
        <div className="mt-5 space-y-2">
          {reviewMessage && <div className="rounded-xl border border-stone-700 bg-stone-900 p-4 text-sm text-stone-300">{reviewMessage}</div>}
          {emailMessage && <div className="rounded-xl border border-stone-700 bg-stone-900 p-4 text-sm text-stone-300">{emailMessage}</div>}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-700 bg-stone-950/95 px-4 py-3 shadow-[0_-16px_40px_rgba(0,0,0,.35)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="hidden text-xs text-stone-500 sm:block">{reviewStatus === 'approved' ? 'Composição aprovada' : 'Revise e finalize quando estiver pronto'}</div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" disabled={savingReview} onClick={() => void persistReview(false)} className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm font-bold text-stone-200 disabled:opacity-50"><Save className="h-4 w-4" />Salvar</button>
            <button type="button" disabled={savingReview} onClick={() => void persistReview(true)} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-bold text-stone-950 disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />Aprovar</button>
            <button type="button" disabled={emailSending || !backendUserId || !backendIntakeId || !friendlyResult} onClick={() => void sendResult()} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-950 disabled:opacity-40"><Mail className="h-4 w-4" />{emailSending ? 'Enviando...' : 'Enviar resultado'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedSystem({ label, name, onRemove }: { label: string; name: string; onRemove?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-stone-800 bg-stone-950/50 p-4">
      <div><div className="text-[11px] uppercase tracking-wider text-stone-500">{label}</div><div className="mt-1 font-medium text-stone-100">{name}</div></div>
      {onRemove && <button type="button" onClick={onRemove} className="text-xs text-stone-500 underline underline-offset-4 hover:text-stone-300">retirar</button>}
    </div>
  );
}

function ResourceChip({ icon, label }: { icon: ReactNode; label: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-950/60 px-3 py-2 text-xs text-stone-300"><span className="text-amber-400">{icon}</span>{label}</span>;
}

function CompactSelector({ title, items, selected, onToggle }: { title: string; items: Array<{ id: string; name: string }>; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-stone-200">{title}</h3>
      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
        {items.map(item => <label key={item.id} className="flex cursor-pointer items-start gap-2 rounded-lg border border-stone-800 p-2.5 text-sm text-stone-300"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} className="mt-1 accent-amber-500" />{item.name}</label>)}
      </div>
    </div>
  );
}

function TechnicalRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-800 bg-stone-950/50 p-4">
      <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /><div className="min-w-0"><div className="text-[11px] uppercase tracking-wider text-stone-500">{title}</div><div className="mt-1 break-words text-sm text-stone-200">{value}</div></div></div>
    </div>
  );
}
