import { useEffect, useState } from 'react';
import { CheckCircle2, FileAudio, Trash2, UploadCloud } from 'lucide-react';
import { PersonalizedAudioPlan } from '../audio/audioCatalog';
import {
  getAudioFileDuration,
  getCarePlanByAudioPlanId,
  removePersonalizedAudioRemote,
  RemotePersonalizedAudio,
  uploadPersonalizedAudio,
} from '../services/audioBackend';
import { markAudioGenerationPublished } from '../services/audioGenerationBackend';

interface AdminAudioUploadProps {
  audio: PersonalizedAudioPlan;
  nomePessoa: string;
}

export function AdminAudioUpload({ audio, nomePessoa }: AdminAudioUploadProps) {
  const [stored, setStored] = useState<RemotePersonalizedAudio | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getCarePlanByAudioPlanId(audio.id)
      .then(record => {
        if (active) setStored(record);
      })
      .catch(() => {
        if (active) setMessage('Não foi possível verificar o áudio publicado.');
      });

    return () => {
      active = false;
    };
  }, [audio.id]);

  async function handleFile(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setMessage('Selecione um arquivo de áudio válido.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const duration = await getAudioFileDuration(file);
      const record = await uploadPersonalizedAudio({
        audio,
        file,
        durationSeconds: duration,
      });

      await markAudioGenerationPublished({
        audioPlanId: audio.id,
        finalStoragePath: record.storagePath,
      });

      setStored(record);
      setMessage('Áudio publicado com segurança para esta anamnese.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Não foi possível publicar o áudio: ${error.message}`
          : 'Não foi possível publicar o áudio.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!stored) return;

    setBusy(true);
    setMessage('');

    try {
      await removePersonalizedAudioRemote(audio.id);
      setStored(null);
      setMessage('Áudio removido deste plano.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Não foi possível remover o áudio: ${error.message}`
          : 'Não foi possível remover o áudio.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-stone-100">Anexar áudio exclusivo</h2>
          <p className="mt-1 text-sm leading-6 text-stone-400">
            Este arquivo ficará vinculado somente a{' '}
            <strong className="text-stone-200">{nomePessoa || 'este usuário'}</strong>, à anamnese{' '}
            <strong className="text-stone-200">{audio.anamneseId}</strong> e ao plano{' '}
            <strong className="break-all text-stone-200">{audio.id}</strong>.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-stone-700 bg-stone-950/50 p-5">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
          <FileAudio className="h-8 w-8 text-amber-400" />
          <span className="font-medium text-stone-200">
            {stored ? 'Substituir o áudio desta sessão' : 'Selecionar MP3, WAV ou outro áudio'}
          </span>
          <span className="text-xs text-stone-500">
            O arquivo será enviado ao Storage privado e liberado somente para o usuário desta sessão.
          </span>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            disabled={busy}
            onChange={event => handleFile(event.target.files?.[0] || null)}
          />
        </label>
      </div>

      {stored && (
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div className="min-w-0">
                <div className="font-medium text-stone-100">Áudio publicado</div>
                <div className="mt-1 break-all text-xs text-stone-500">
                  {stored.storagePath}
                </div>
                {stored.durationSeconds !== null && (
                  <div className="mt-1 text-xs text-stone-500">
                    duração aproximada: {Math.round(stored.durationSeconds / 60)} min
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={remove}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </button>
          </div>
        </div>
      )}

      {message && <div className="mt-4 text-sm text-stone-400">{message}</div>}

      <p className="mt-4 text-xs leading-5 text-stone-500">
        O arquivo não fica público. O player do usuário recebe uma URL temporária assinada e somente a conta
        vinculada ao plano pode solicitar acesso ao áudio.
      </p>
    </section>
  );
}
