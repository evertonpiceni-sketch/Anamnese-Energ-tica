import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Clock3, Headphones, Pause, Play, RotateCcw } from 'lucide-react';
import { PersonalizedAudioPlan } from '../audio/audioCatalog';
import { createPrivateAudioPlaybackUrl } from '../services/audioBackend';

const PRACTICE_LOG_KEY = 'anamnese-integrativa-practice-logs-v1';

export interface AudioPracticeLog {
  id: string;
  audioId: string;
  titulo: string;
  iniciadoEm: string;
  concluidoEm?: string;
  percepcaoAntes?: number;
  percepcaoDepois?: number;
  observacao?: string;
  status: 'iniciado' | 'concluido';
}

interface ProgrammedAudioCardProps {
  audio: PersonalizedAudioPlan;
  userId?: string;
}

export function ProgrammedAudioCard({ audio, userId }: ProgrammedAudioCardProps) {
  const elementRef = useRef<HTMLAudioElement | null>(null);
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [observation, setObservation] = useState('');
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [remoteAudioUrl, setRemoteAudioUrl] = useState<string | null>(null);
  const [remoteDurationSeconds, setRemoteDurationSeconds] = useState<number | null>(null);

  const playbackUrl = audio.arquivoUrl || remoteAudioUrl;
  const available = !!playbackUrl;

  const durationLabel = useMemo(() => {
    if (audio.duracaoMinutos) return `${audio.duracaoMinutos} min`;
    if (remoteDurationSeconds !== null) return `${Math.max(1, Math.round(remoteDurationSeconds / 60))} min`;
    return 'Duração definida quando o arquivo for cadastrado';
  }, [audio.duracaoMinutos, remoteDurationSeconds]);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    if (!audio.arquivoUrl) {
      createPrivateAudioPlaybackUrl(audio.id)
        .then(result => {
          if (!active || !result) return;
          setRemoteAudioUrl(result.url);
          setRemoteDurationSeconds(result.carePlan.durationSeconds);
        })
        .catch(() => {
          setRemoteAudioUrl(null);
          setRemoteDurationSeconds(null);
        });
    }

    return () => {
      active = false;
      objectUrl = null;
    };
  }, [audio.id, audio.arquivoUrl]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setCompleted(true);
    };

    element.addEventListener('play', onPlay);
    element.addEventListener('pause', onPause);
    element.addEventListener('ended', onEnded);

    return () => {
      element.removeEventListener('play', onPlay);
      element.removeEventListener('pause', onPause);
      element.removeEventListener('ended', onEnded);
    };
  }, [available]);

  function loadLogs(): AudioPracticeLog[] {
    try {
      const raw = localStorage.getItem(PRACTICE_LOG_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveLog(log: AudioPracticeLog) {
    const logs = loadLogs();
    const index = logs.findIndex(item => item.id === log.id);
    if (index >= 0) logs[index] = log;
    else logs.push(log);
    localStorage.setItem(PRACTICE_LOG_KEY, JSON.stringify(logs));
  }

  function ensurePractice(): string {
    if (practiceId) return practiceId;

    const id = `PRACTICE-${Date.now()}`;
    setPracticeId(id);
    saveLog({
      id,
      audioId: audio.id,
      titulo: audio.titulo,
      iniciadoEm: new Date().toISOString(),
      percepcaoAntes: before ?? undefined,
      status: 'iniciado',
      ...(userId ? { userId } : {}),
    } as AudioPracticeLog & { userId?: string });
    return id;
  }

  async function togglePlayback() {
    if (!available || !elementRef.current) return;

    const id = ensurePractice();

    if (elementRef.current.paused) {
      if (before !== null) {
        const logs = loadLogs();
        const current = logs.find(item => item.id === id);
        if (current) saveLog({ ...current, percepcaoAntes: before });
      }
      await elementRef.current.play();
    } else {
      elementRef.current.pause();
    }
  }

  function restart() {
    if (!elementRef.current) return;
    elementRef.current.currentTime = 0;
    elementRef.current.pause();
    setPlaying(false);
    setCompleted(false);
  }

  function finishPractice() {
    const id = ensurePractice();
    const logs = loadLogs();
    const current = logs.find(item => item.id === id);

    saveLog({
      ...(current || {
        id,
        audioId: audio.id,
        titulo: audio.titulo,
        iniciadoEm: new Date().toISOString(),
      }),
      concluidoEm: new Date().toISOString(),
      percepcaoAntes: before ?? undefined,
      percepcaoDepois: after ?? undefined,
      observacao: observation.trim() || undefined,
      status: 'concluido',
    });

    setCompleted(true);
  }

  return (
    <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 shadow-lg shadow-[#173f2d]/8 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e4ecde] text-[#28533d]">
          <Headphones className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a18443]">Áudio exclusivo da sua sessão</div>
          <h3 className="mt-1 font-serif text-2xl text-[#173c2c]">{audio.titulo}</h3>
          <p className="mt-1 text-sm leading-6 text-[#667268]">{audio.subtitulo}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-[#edf2e8] p-4 text-sm leading-6 text-[#466052]">
        {audio.intencao}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-[#7b817b]">
        <Clock3 className="h-4 w-4 text-[#a18443]" />
        {durationLabel}
      </div>

      {!available ? (
        <div className="mt-6 rounded-2xl border border-[#dfcf9d] bg-[#fff6df] p-5">
          <div className="font-semibold text-[#6f5d31]">Sua sessão exclusiva está sendo preparada.</div>
          <p className="mt-2 text-sm leading-6 text-[#7b6b46]">
            Este áudio será gerado exclusivamente a partir da sua anamnese e da composição desta sessão. Quando o terapeuta anexar o arquivo no ADM, ele ficará disponível aqui somente para este plano.
          </p>
        </div>
      ) : (
        <>
          <audio ref={elementRef} src={playbackUrl || undefined} preload="metadata" />

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-[#365441]">Antes de ouvir, como você percebe seu estado agora?</p>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBefore(value)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    before === value
                      ? 'border-[#b89546] bg-[#173f2d] text-white'
                      : 'border-[#d9cfba] bg-white/70 text-[#667268] hover:border-[#c2a65f]'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              disabled={before === null}
              className="inline-flex items-center gap-2 rounded-full bg-[#173f2d] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? 'Pausar' : 'Ouvir agora'}
            </button>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-full border border-[#cdbc91] bg-white/60 px-5 py-3 font-semibold text-[#53675b]"
            >
              <RotateCcw className="h-4 w-4" /> Reiniciar
            </button>
          </div>

          {(completed || !playing) && practiceId && (
            <div className="mt-7 border-t border-[#e0d5bb] pt-6">
              <p className="mb-2 text-sm font-semibold text-[#365441]">E agora, como você se percebe?</p>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAfter(value)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      after === value
                        ? 'border-[#b89546] bg-[#173f2d] text-white'
                        : 'border-[#d9cfba] bg-white/70 text-[#667268] hover:border-[#c2a65f]'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={observation}
                onChange={e => setObservation(e.target.value)}
                className="user-input mt-4 resize-none"
                placeholder="Se quiser, conte o que percebeu depois da prática."
              />
              <button
                type="button"
                disabled={after === null}
                onClick={finishPractice}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#173f2d] px-5 py-3 font-semibold text-white disabled:opacity-40"
              >
                <CheckCircle2 className="h-4 w-4" /> Registrar esta prática
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function getAudioPracticeLogs(): AudioPracticeLog[] {
  try {
    const raw = localStorage.getItem(PRACTICE_LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
