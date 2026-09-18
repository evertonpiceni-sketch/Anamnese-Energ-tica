import { useState } from 'react';
import { AudioLines, Flower2, Gem, Layers3, Leaf, Mail, ShieldCheck } from 'lucide-react';
import { AnamneseInput } from '../types';
import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { criarPlanoAudioPersonalizado } from '../audio/audioCatalog';
import { selectComplementaryCare } from '../care/complementaryCatalogs';
import { buildCareComposition } from '../care/careComposer';
import { selectSolfeggioFrequency } from '../care/solfeggioCatalog';
import { AdminAudioUpload } from './AdminAudioUpload';
import { requestResultEmail } from '../services/resultEmail';

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

export function CareComposerAdminView({ anamnese, analise, backendUserId, backendIntakeId, friendlyResult }: CareComposerAdminViewProps) {
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  if (!analise) {
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
  const complementary = selectComplementaryCare(axes);
  const solfeggio = selectSolfeggioFrequency(axes);
  const audio = criarPlanoAudioPersonalizado({
    userId: backendUserId || anamnese.id,
    anamneseId: backendIntakeId || anamnese.id,
    nomePessoa: anamnese.nomePessoa,
    eixos: axes,
    relatorio: analise.relatorioEverton,
    solfeggio,
  });
  const composition = buildCareComposition(audio, complementary, solfeggio);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400">
            <Layers3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-100">Compositor de Cuidado</h1>
            <p className="mt-1 text-sm text-stone-400">
              {anamnese.nomePessoa || 'Interagente'} • {anamnese.id}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
            Prioridades do motor
          </h2>
          <div className="mt-4 space-y-3">
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
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
            Composição atual
          </h2>

          <div className="mt-4 space-y-3">
            <ResourceRow
              icon={<AudioLines className="h-5 w-5" />}
              title="Áudio exclusivo"
              value={composition.audio?.titulo || 'Plano de áudio não gerado'}
              status={composition.audio?.status || 'SEM SELEÇÃO'}
            />

            <ResourceRow
              icon={<AudioLines className="h-5 w-5" />}
              title="Solfeggio"
              value={
                composition.solfeggio
                  ? `${composition.solfeggio.hz} Hz • ${composition.solfeggio.chakraProjeto}`
                  : 'Nenhuma frequência selecionada'
              }
              status={composition.solfeggio ? 'SELECIONADO' : 'SEM SELEÇÃO'}
            />

            <ResourceRow
              icon={<Flower2 className="h-5 w-5" />}
              title="Florais"
              value={
                composition.floral.length
                  ? composition.floral.map(item => item.nome).join(', ')
                  : 'Nenhum recurso ATIVO cadastrado'
              }
              status={composition.floral.length ? 'SELECIONADO' : 'AGUARDANDO CATÁLOGO'}
            />

            <ResourceRow
              icon={<Leaf className="h-5 w-5" />}
              title="Aromaterapia"
              value={
                composition.aromatherapy.length
                  ? composition.aromatherapy.map(item => item.nome).join(', ')
                  : 'Nenhum recurso ATIVO cadastrado'
              }
              status={composition.aromatherapy.length ? 'SELECIONADO' : 'AGUARDANDO CATÁLOGO'}
            />

            <ResourceRow
              icon={<Gem className="h-5 w-5" />}
              title="Cristais etéricos"
              value={
                composition.ethericCrystals.length
                  ? composition.ethericCrystals.map(item => item.nome).join(', ')
                  : 'Nenhum recurso ATIVO cadastrado'
              }
              status={composition.ethericCrystals.length ? 'SELECIONADO' : 'AGUARDANDO CATÁLOGO'}
            />
          </div>
        </section>
      </div>

      {composition.audio && (
        <AdminAudioUpload
          audio={composition.audio}
          nomePessoa={anamnese.nomePessoa || 'Interagente'}
        />
      )}

      {backendUserId && backendIntakeId && friendlyResult && (
        <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-stone-100">Enviar resultado por e-mail</h2>
              <p className="mt-1 text-sm leading-6 text-stone-400">
                Gera o PDF acolhedor desta anamnese, guarda no espaço privado do usuário e solicita o envio para o e-mail da conta.
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
                  const response = await requestResultEmail({
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

      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <h2 className="font-semibold text-stone-100">Regra de proteção da composição</h2>
            <p className="mt-1 text-sm leading-6 text-stone-400">
              O motor só seleciona florais, aromaterapia e cristais etéricos com status ATIVO. Recursos pendentes,
              parciais ou sem forma de uso validada não aparecem no resultado do usuário.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResourceRow({
  icon,
  title,
  value,
  status,
}: {
  icon: React.ReactNode;
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
            <div className="mt-1 text-sm font-medium text-stone-200">{value}</div>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-stone-700 bg-stone-800 px-2.5 py-1 text-[10px] font-semibold text-stone-300">
          {status}
        </span>
      </div>
    </div>
  );
}
