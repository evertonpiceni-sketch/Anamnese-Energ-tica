import { Clock3, FileAudio, Headphones, Link2Off } from 'lucide-react';
import { PROGRAMMED_AUDIO_CATALOG } from '../audio/audioCatalog';

export function AudioLibraryView() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-100">Biblioteca de Áudios Programados</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-400">
              O motor já consegue escolher o áudio mais coerente com os eixos predominantes. Um item só é reproduzido para o usuário quando tiver arquivo oficial e status ATIVO.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PROGRAMMED_AUDIO_CATALOG.map(audio => {
          const active = audio.status === 'ATIVO' && !!audio.arquivoUrl;

          return (
            <article key={audio.id} className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                    {audio.eixos.join(' • ')}
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-stone-100">{audio.titulo}</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-400">{audio.subtitulo}</p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    active
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                  }`}
                >
                  {active ? 'ATIVO' : 'AGUARDANDO ARQUIVO'}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-stone-950/60 p-4 text-xs leading-5 text-stone-400">
                {audio.intencao}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  {audio.duracaoMinutos ? `${audio.duracaoMinutos} min` : 'duração pendente'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {audio.arquivoUrl ? <FileAudio className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
                  {audio.arquivoUrl || 'nenhum arquivo vinculado'}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
