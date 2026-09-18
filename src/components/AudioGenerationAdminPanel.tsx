import { useEffect, useState } from 'react';
import { CheckCircle2, FileText, Save, Sparkles } from 'lucide-react';
import {
  AudioGenerationJob,
  ensureAudioGenerationJob,
  saveAudioScript,
} from '../services/audioGenerationBackend';

interface AudioGenerationAdminPanelProps {
  audioPlanId: string;
  firstName: string;
  intention: string;
  solfeggioHz?: number | null;
}

const STATUS_LABELS: Record<string, string> = {
  script_draft: 'ROTEIRO EM RASCUNHO',
  awaiting_script_approval: 'AGUARDANDO APROVAÇÃO DO ROTEIRO',
  script_approved: 'ROTEIRO APROVADO',
  awaiting_voice_provider: 'AGUARDANDO PROVEDOR DE VOZ',
  generating_voice: 'GERANDO VOZ',
  narration_ready: 'NARRAÇÃO PRONTA',
  awaiting_mix: 'AGUARDANDO MIXAGEM',
  mix_ready: 'MIXAGEM PRONTA',
  awaiting_final_review: 'AGUARDANDO REVISÃO FINAL',
  ready_to_publish: 'PRONTO PARA PUBLICAR',
  published: 'PUBLICADO',
  failed: 'FALHA',
  cancelled: 'CANCELADO',
};

export function AudioGenerationAdminPanel({
  audioPlanId,
  firstName,
  intention,
  solfeggioHz,
}: AudioGenerationAdminPanelProps) {
  const [job, setJob] = useState<AudioGenerationJob | null>(null);
  const [script, setScript] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setJob(null);
    setMessage('');

    ensureAudioGenerationJob({
      audioPlanId,
      firstName,
      intention,
      solfeggioHz,
    })
      .then(result => {
        if (!active) return;
        setJob(result);
        setScript(result.spokenScript);
        setNotes(result.adminNotes);
      })
      .catch(error => {
        if (!active) return;
        setMessage(
          error instanceof Error
            ? `Não foi possível abrir a geração: ${error.message}`
            : 'Não foi possível abrir a geração do áudio.'
        );
      });

    return () => {
      active = false;
    };
  }, [audioPlanId, firstName, intention, solfeggioHz]);

  async function persist(approve: boolean) {
    if (!job) return;

    if (!script.trim()) {
      setMessage('O roteiro falado não pode ficar vazio.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const saved = await saveAudioScript({
        jobId: job.id,
        spokenScript: script.trim(),
        adminNotes: notes.trim(),
        approve,
      });

      setJob(saved);
      setScript(saved.spokenScript);
      setNotes(saved.adminNotes);
      setMessage(
        approve
          ? 'Roteiro aprovado. A próxima etapa é gerar a voz quando o provedor estiver configurado.'
          : 'Roteiro salvo como nova versão.'
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Não foi possível salvar: ${error.message}`
          : 'Não foi possível salvar o roteiro.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (!job) {
    return (
      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="text-sm text-stone-400">
          Preparando a fila de geração do áudio exclusivo...
        </div>
        {message && <div className="mt-3 text-sm text-rose-300">{message}</div>}
      </section>
    );
  }

  const scriptApproved = Boolean(job.scriptApprovedAt);

  return (
    <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 text-violet-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-100">Geração do áudio exclusivo</h2>
            <p className="mt-1 text-sm leading-6 text-stone-400">
              O roteiro falado é separado da composição técnica. Nomes internos de sistemas não precisam ser narrados.
            </p>
          </div>
        </div>

        <span className="self-start rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-[10px] font-bold text-violet-200">
          {STATUS_LABELS[job.status] || job.status.toUpperCase()}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_260px]">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <FileText className="h-4 w-4" /> Roteiro falado
          </span>
          <textarea
            rows={16}
            value={script}
            onChange={event => {
              setScript(event.target.value);
              if (scriptApproved) {
                setMessage('O roteiro foi alterado depois da aprovação. Salve e aprove novamente.');
              }
            }}
            className="w-full rounded-xl border border-stone-700 bg-stone-950 p-4 text-sm leading-7 text-stone-200 outline-none focus:border-violet-500/60"
          />
        </label>

        <div className="space-y-4">
          <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4">
            <div className="text-xs uppercase tracking-wider text-stone-500">Voz</div>
            <div className="mt-2 text-sm font-medium text-stone-200">
              {job.voiceProvider || 'Ainda não configurada'}
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              O provedor e a voz serão configurados sem alterar o roteiro nem a composição aprovada.
            </p>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4">
            <div className="text-xs uppercase tracking-wider text-stone-500">Solfeggio</div>
            <div className="mt-2 text-sm font-medium text-stone-200">
              {job.solfeggioHz ? `${job.solfeggioHz} Hz` : 'Sem frequência definida'}
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              A presença do Solfeggio no plano não significa que uma faixa sonora real já foi mixada.
            </p>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4">
            <div className="text-xs uppercase tracking-wider text-stone-500">Duração</div>
            <div className="mt-2 text-sm font-medium text-stone-200">Não fixada</div>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              A anamnese não herda automaticamente a duração de 29:57 da jornada de 21 dias.
            </p>
          </div>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">
          Observações para geração
        </span>
        <textarea
          rows={4}
          value={notes}
          onChange={event => setNotes(event.target.value)}
          className="w-full rounded-xl border border-stone-700 bg-stone-950 p-4 text-sm leading-6 text-stone-200 outline-none focus:border-violet-500/60"
          placeholder="Ritmo da voz, pausas, tom, observações de pronúncia, silêncio, mixagem..."
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void persist(false)}
          className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-800 px-5 py-3 text-sm font-bold text-stone-200 hover:bg-stone-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Salvar roteiro
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => void persist(true)}
          className="inline-flex items-center gap-2 rounded-full bg-violet-400 px-5 py-3 text-sm font-bold text-stone-950 hover:bg-violet-300 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          Aprovar roteiro falado
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-stone-700 bg-stone-950/60 p-4 text-sm leading-6 text-stone-300">
          {message}
        </div>
      )}

      {job.status === 'awaiting_voice_provider' && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-amber-200">
          O roteiro está aprovado. A geração automática da voz ficará disponível quando configurarmos um provedor de voz no backend. Até lá, o áudio final pode continuar sendo produzido externamente e anexado abaixo.
        </div>
      )}
    </section>
  );
}
