import { Flower2, Gem, Leaf, ShieldCheck } from 'lucide-react';
import {
  AROMATHERAPY_CATALOG,
  ETHERIC_CRYSTAL_CATALOG,
  FLORAL_CATALOG,
} from '../care/complementaryCatalogs';

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <h3 className="font-semibold text-stone-100">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-stone-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function ComplementaryLibrariesView() {
  const total = FLORAL_CATALOG.length + AROMATHERAPY_CATALOG.length + ETHERIC_CRYSTAL_CATALOG.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <h1 className="text-xl font-bold text-stone-100">Bibliotecas Complementares</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">
          Florais, aromaterapia e cristais etéricos só entram na composição automática quando houver cadastro documental suficiente e status ATIVO.
        </p>
        <div className="mt-4 text-xs text-stone-500">{total} recursos cadastrados atualmente.</div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section>
          <div className="mb-3 flex items-center gap-2 text-stone-200">
            <Flower2 className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold">Florais</h2>
          </div>
          {FLORAL_CATALOG.length === 0 ? (
            <EmptyState
              title="Nenhum floral validado ainda"
              description="A biblioteca está pronta para receber nome, sistema de origem, indicação cadastrada, eixos, forma de uso, restrições e fonte documental."
            />
          ) : (
            <div className="space-y-3">
              {FLORAL_CATALOG.map(item => (
                <article key={item.id} className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                  <div className="font-semibold text-stone-100">{item.nome}</div>
                  <div className="mt-1 text-xs text-stone-500">{item.sistemaOrigem}</div>
                  <p className="mt-3 text-sm leading-6 text-stone-400">{item.descricao}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2 text-stone-200">
            <Leaf className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold">Aromaterapia</h2>
          </div>
          {AROMATHERAPY_CATALOG.length === 0 ? (
            <EmptyState
              title="Nenhum recurso de aromaterapia validado ainda"
              description="A biblioteca está pronta para receber somente opções com forma de uso permitida, restrições e fonte documental cadastradas."
            />
          ) : (
            <div className="space-y-3">
              {AROMATHERAPY_CATALOG.map(item => (
                <article key={item.id} className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                  <div className="font-semibold text-stone-100">{item.nome}</div>
                  <p className="mt-3 text-sm leading-6 text-stone-400">{item.descricao}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2 text-stone-200">
            <Gem className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold">Cristais etéricos</h2>
          </div>
          {ETHERIC_CRYSTAL_CATALOG.length === 0 ? (
            <EmptyState
              title="Nenhum cristal etérico validado ainda"
              description="A biblioteca está pronta para receber cristal, sistema de origem, eixo, centro relacionado, aplicação, restrições e fonte documental."
            />
          ) : (
            <div className="space-y-3">
              {ETHERIC_CRYSTAL_CATALOG.map(item => (
                <article key={item.id} className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                  <div className="font-semibold text-stone-100">{item.nome}</div>
                  <div className="mt-1 text-xs text-stone-500">{item.sistemaOrigem}</div>
                  <p className="mt-3 text-sm leading-6 text-stone-400">{item.descricao}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
