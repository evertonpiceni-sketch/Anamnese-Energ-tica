import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, History } from 'lucide-react';
import { AudioPracticeLog, getAudioPracticeLogs } from './ProgrammedAudioCard';

export function PracticeHistory() {
  const [logs, setLogs] = useState<AudioPracticeLog[]>([]);

  useEffect(() => {
    setLogs(getAudioPracticeLogs().slice().reverse());
  }, []);

  if (!logs.length) {
    return (
      <div className="rounded-2xl border border-[#e0d5bb] bg-white/55 p-4 text-sm leading-6 text-[#6f786f]">
        Seu histórico de práticas aparecerá aqui depois que um áudio oficial estiver disponível e for utilizado.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[#e0d5bb] bg-white/55 p-5">
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-[#a18443]" />
        <h3 className="font-semibold text-[#365441]">Suas práticas recentes</h3>
      </div>

      <div className="space-y-3">
        {logs.slice(0, 5).map(log => (
          <div key={log.id} className="rounded-xl border border-[#e6ddca] bg-[#fffaf0] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium text-[#365441]">{log.titulo}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#7b817b]">
                  <Clock3 className="h-3.5 w-3.5" />
                  {new Date(log.iniciadoEm).toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57715f]">
                <CheckCircle2 className="h-4 w-4" />
                {log.status === 'concluido' ? 'Concluída' : 'Iniciada'}
              </div>
            </div>

            {(log.percepcaoAntes !== undefined || log.percepcaoDepois !== undefined) && (
              <div className="mt-3 text-xs text-[#6b746d]">
                Percepção registrada: antes {log.percepcaoAntes ?? '—'} • depois {log.percepcaoDepois ?? '—'}
              </div>
            )}

            {log.observacao && (
              <p className="mt-2 text-sm leading-6 text-[#677268]">{log.observacao}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
