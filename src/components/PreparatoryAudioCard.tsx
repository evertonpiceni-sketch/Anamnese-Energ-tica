import { useEffect, useRef, useState } from 'react';
import { Headphones, Pause, Play } from 'lucide-react';
import {
  createPreparatoryPlaybackUrl,
  PreparatoryAudioAsset,
} from '../services/preparatoryAudioBackend';

export function PreparatoryAudioCard() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [asset, setAsset] = useState<PreparatoryAudioAsset | null>(null);
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    createPreparatoryPlaybackUrl()
      .then(result => {
        if (!active) return;
        if (!result) {
          setMessage('O áudio preparativo ainda não foi publicado.');
          return;
        }
        setAsset(result.asset);
        setUrl(result.url);
      })
      .catch(error => {
        if (!active) return;
        setMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o áudio preparativo agora.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function toggle() {
    const el = audioRef.current;
    if (!el || !url) return;

    if (el.paused) {
      await el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6">
        <div className="text-sm text-[#677268]">Preparando seu áudio de acolhimento...</div>
      </section>
    );
  }

  if (!asset || !url) {
    return (
      <section className="rounded-[2rem] border border-[#dfcf9d] bg-[#fff6df] p-5 text-sm leading-6 text-[#715f36]">
        {message || 'O áudio preparativo ainda não está disponível.'}
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 shadow-lg shadow-[#173f2d]/8 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[#e9efe4] p-3 text-[#28533d]">
          <Headphones className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-[0.14em] text-[#a18443]">
            ÁUDIO PREPARATIVO
          </div>
          <h2 className="mt-2 font-serif text-2xl text-[#173c2c]">{asset.title}</h2>
          {asset.subtitle && (
            <p className="mt-2 text-sm leading-6 text-[#637168]">{asset.subtitle}</p>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#e0d5bb] bg-white/60 p-4">
        <p className="text-sm leading-6 text-[#5d6c63]">
          Este é um áudio fixo de preparação do protocolo, disponível enquanto o seu material
          exclusivo está sendo preparado. Ele não substitui a composição individual criada a
          partir da sua anamnese.
        </p>
      </div>

      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        controls={false}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void toggle()}
          className="inline-flex items-center gap-2 rounded-full bg-[#173f2d] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#22533d]"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? 'Pausar' : 'Ouvir áudio preparativo'}
        </button>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#858b85]">
        Disponível apenas para reprodução dentro do aplicativo.
      </p>
    </section>
  );
}
