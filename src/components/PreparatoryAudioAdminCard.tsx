import { ChangeEvent, useEffect, useState } from 'react';
import { CheckCircle2, UploadCloud } from 'lucide-react';
import {
  getAudioDuration,
  getPreparatoryAudioAsset,
  PreparatoryAudioAsset,
  uploadPreparatoryAudio,
} from '../services/preparatoryAudioBackend';

export function PreparatoryAudioAdminCard() {
  const [asset, setAsset] = useState<PreparatoryAudioAsset | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPreparatoryAudioAsset()
      .then(setAsset)
      .catch(error =>
        setMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o áudio preparativo.'
        )
      );
  }, []);

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setBusy(true);
    setMessage('');

    try {
      const duration = await getAudioDuration(file);
      const saved = await uploadPreparatoryAudio({
        file,
        durationSeconds: duration,
      });
      setAsset(saved);
      setMessage('Áudio preparativo publicado. Ele já pode ser reproduzido pelos usuários.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível publicar o áudio preparativo.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            ÁUDIO PREPARATIVO FIXO
          </div>
          <h2 className="mt-2 text-lg font-bold text-stone-100">
            Preparação para a imersão
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">
            Este é o único áudio reutilizável do fluxo. Ele é igual para todos, serve apenas como
            preparação enquanto o material exclusivo é produzido e não oferece download na área
            do usuário.
          </p>
        </div>

        <div
          className={`self-start rounded-full border px-3 py-2 text-[10px] font-bold ${
            asset?.status === 'published'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          }`}
        >
          {asset?.status === 'published' ? 'PUBLICADO' : 'AGUARDANDO ARQUIVO'}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-stone-300 md:grid-cols-2">
        <div className="rounded-xl bg-stone-950/60 p-4">
          <strong className="text-stone-100">Sustentação:</strong> Golden Light Source + Original Reiki Platinum
        </div>
        <div className="rounded-xl bg-stone-950/60 p-4">
          <strong className="text-stone-100">Sistema principal:</strong> Soul Shakti
        </div>
        <div className="rounded-xl bg-stone-950/60 p-4 md:col-span-2">
          <strong className="text-stone-100">Sequência:</strong> Body Purification → Soul Healing → Mind Empowerment → Spiritual Alignment → Integração
        </div>
      </div>

      <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-stone-950 hover:bg-amber-300">
        <UploadCloud className="h-4 w-4" />
        {busy ? 'Publicando...' : asset?.status === 'published' ? 'Substituir áudio preparativo' : 'Publicar áudio preparativo'}
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          disabled={busy}
          onChange={event => void onFile(event)}
        />
      </label>

      {asset?.status === 'published' && (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Arquivo fixo ativo no protocolo. Download desabilitado na experiência USER.
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-xl border border-stone-700 bg-stone-950/60 p-4 text-sm leading-6 text-stone-300">
          {message}
        </div>
      )}
    </section>
  );
}
