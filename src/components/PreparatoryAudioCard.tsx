import { useEffect, useRef, useState } from 'react';
import { Check, Headphones, Pause, Play } from 'lucide-react';
import { createPreparatoryPlaybackUrl, PreparatoryAudioAsset } from '../services/preparatoryAudioBackend';

export function PreparatoryAudioCard() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [asset, setAsset] = useState<PreparatoryAudioAsset | null>(null);
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

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
        setMessage(error instanceof Error ? error.message : 'Não foi possível carregar o áudio preparativo agora.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function toggle() {
    const el = audioRef.current;
    if (!el || !url || !accepted) return;
    if (el.paused) {
      await el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  if (loading) return <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6"><div className="text-sm text-[#677268]">Preparando seu áudio de acolhimento...</div></section>;
  if (!asset || !url) return <section className="rounded-[2rem] border border-[#dfcf9d] bg-[#fff6df] p-5 text-sm leading-6 text-[#715f36]">{message || 'O áudio preparativo ainda não está disponível.'}</section>;

  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-[#d5c18b] bg-[linear-gradient(145deg,#fffaf0_0%,#f7f0df_58%,#eaf0e6_100%)] p-6 shadow-xl shadow-[#173f2d]/10 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#c7a451]/20" />
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="rounded-full border border-[#cdb879] bg-white/70 p-3 text-[#28533d]"><Headphones className="h-5 w-5" /></div>
          <div>
            <div className="text-xs font-semibold tracking-[0.16em] text-[#9a7838]">ENQUANTO SEU ÁUDIO É PREPARADO</div>
            <h2 className="mt-2 font-serif text-2xl text-[#173c2c]">{asset.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#637168]">{asset.subtitle || 'Um cuidado de transição para acompanhar você até a liberação do seu áudio individual.'}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-[#dfcfaa] bg-white/65 p-5 sm:p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7838]">Antes de iniciar</div>
          <p className="mt-3 text-sm leading-6 text-[#52665b]">Diga em voz alta, <strong>3 vezes</strong>, utilizando seu nome completo:</p>
          <p className="mt-4 font-serif text-lg italic leading-8 text-[#274c39]">“Eu, [NOME COMPLETO], aceito receber agora o tratamento de cura Reiki a distância, conforme programado e sintonizado neste áudio por Everton Rodrigo Piceni.”</p>
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#edf2e8] p-4 text-sm leading-6 text-[#52665b]"><Headphones className="mt-0.5 h-4 w-4 shrink-0 text-[#9a7838]" /><span>Depois de repetir a frase três vezes, coloque os fones de ouvido e inicie o áudio.</span></div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm font-medium text-[#365441]">
            <input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-[#173f2d]" />
            <span>Repeti a frase 3 vezes e estou com os fones de ouvido.</span>
          </label>
        </div>

        <audio ref={audioRef} src={url} preload="metadata" controls={false} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
        <div className="mt-5 flex items-center gap-3">
          <button type="button" disabled={!accepted} onClick={() => void toggle()} className="inline-flex items-center gap-2 rounded-full bg-[#173f2d] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#22533d] disabled:cursor-not-allowed disabled:opacity-40">
            {playing ? <Pause className="h-4 w-4" /> : accepted ? <Play className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            {playing ? 'Pausar' : 'Iniciar áudio'}
          </button>
        </div>
        <p className="mt-4 text-xs leading-5 text-[#858b85]">Este áudio permanece como apoio de espera até a liberação do material individual e não substitui a composição personalizada.</p>
      </div>
    </section>
  );
}
