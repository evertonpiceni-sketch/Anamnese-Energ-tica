import React from 'react';
import { CASOS_DE_TESTE, CasoTeste } from '../data/sampleCases';
import { Play, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface CasosTesteViewProps {
  onCarregarCaso: (caso: CasoTeste) => void;
}

export function CasosTesteView({ onCarregarCaso }: CasosTesteViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-800 pb-6">
        <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Validação do Motor de Decisão & Regras Clínicas</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-100 mt-1">
          Casos Clínicos de Teste Predefinidos
        </h1>
        <p className="text-xs text-stone-400 mt-1 max-w-2xl">
          Quatro cenários desenhados para auditar se o motor cruza todos os cursos com precisão, respeita a causa estruturante (e não apenas o sintoma superficial) e aplica a regra de estabilização.
        </p>
      </div>

      {/* Grid de Casos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CASOS_DE_TESTE.map((caso) => (
          <div
            key={caso.id}
            className="bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all group shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-stone-800 text-amber-400 border border-stone-700">
                  {caso.id.toUpperCase()}
                </span>
                <span className="text-xs text-stone-400">
                  {caso.dados.nomePessoa} ({caso.dados.idade})
                </span>
              </div>

              <h2 className="text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                {caso.titulo}
              </h2>

              <p className="text-xs text-stone-300 leading-relaxed">
                {caso.descricaoCaso}
              </p>

              <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 text-xs space-y-1">
                <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-400/90 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Resultado Esperado na Auditoria:</span>
                </div>
                <p className="text-[11px] text-stone-300 font-mono">
                  {caso.distincaoClinica}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                id={`btn-load-test-${caso.id}`}
                onClick={() => onCarregarCaso(caso)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-800 group-hover:bg-amber-500 text-stone-300 group-hover:text-stone-950 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Carregar e Analisar este Caso</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
