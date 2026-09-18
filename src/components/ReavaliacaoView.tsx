import React, { useState } from 'react';
import { RegistroReavaliacao } from '../types';
import { processarReavaliacao, VARIAVEIS_REAVALIACAO_PADRAO } from '../engine/reevaluationEngine';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

interface ReavaliacaoViewProps {
  nomePessoaPadrao?: string;
  anamneseIdPadrao?: string;
  onVoltarParaAnamnese?: () => void;
}

export function ReavaliacaoView({
  nomePessoaPadrao = 'Interagente em Acompanhamento',
  anamneseIdPadrao = 'ANAM-ATUAL',
  onVoltarParaAnamnese,
}: ReavaliacaoViewProps) {
  const [nomePessoa, setNomePessoa] = useState(nomePessoaPadrao);
  const [anamneseId, setAnamneseId] = useState(anamneseIdPadrao);

  // Inicializa com as 9 variáveis padrão com valores comparativos (0 a 10)
  const [valores, setValores] = useState<
    { nome: string; antes: number; depois: number; observacao?: string }[]
  >(() =>
    VARIAVEIS_REAVALIACAO_PADRAO.map((nome) => ({
      nome,
      antes: 3,
      depois: 7,
      observacao: '',
    }))
  );

  const [resultadoReavaliacao, setResultadoReavaliacao] = useState<RegistroReavaliacao | null>(null);

  const handleMudarValor = (index: number, campo: 'antes' | 'depois', val: number) => {
    setValores((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [campo]: Math.max(0, Math.min(10, val)) };
      return copy;
    });
  };

  const handleMudarObs = (index: number, obs: string) => {
    setValores((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], observacao: obs };
      return copy;
    });
  };

  const handleCalcular = () => {
    const res = processarReavaliacao(nomePessoa, anamneseId, valores);
    setResultadoReavaliacao(res);
  };

  const getClassificacaoEstilo = (classif: string) => {
    switch (classif) {
      case 'AMPLIAR':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          card: 'border-emerald-500/30 bg-emerald-950/20',
          icon: Sparkles,
        };
      case 'MANTER':
        return {
          badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          card: 'border-teal-500/30 bg-teal-950/20',
          icon: CheckCircle2,
        };
      case 'AJUSTAR':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          card: 'border-amber-500/30 bg-amber-950/20',
          icon: RefreshCw,
        };
      case 'REDUZIR':
      case 'REAVALIAR ANTES DE NOVA APLICAÇÃO':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          card: 'border-rose-500/30 bg-rose-950/20',
          icon: ShieldAlert,
        };
      default:
        return {
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          card: 'border-indigo-500/30 bg-indigo-950/20',
          icon: ArrowUpRight,
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-semibold">
            <Activity className="w-4 h-4" />
            <span>Reavaliação Pós-Sessão & Monitoramento (Regra 24)</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-100 mt-1">
            Matriz Comparativa de Variáveis Clínicas
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Compara percepções antes e após a prática (0 a 10) para classificar conduta futura: MANTER, AJUSTAR, REDUZIR, AMPLIAR, TROCAR PRIORIDADE ou REAVALIAR.
          </p>
        </div>

        {onVoltarParaAnamnese && (
          <button
            onClick={onVoltarParaAnamnese}
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            ← Voltar para Anamnese
          </button>
        )}
      </div>

      {/* Dados do Atendimento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-900 border border-stone-800 text-xs">
        <div>
          <label className="block text-stone-400 font-medium mb-1">Interagente</label>
          <input
            type="text"
            value={nomePessoa}
            onChange={(e) => setNomePessoa(e.target.value)}
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-stone-400 font-medium mb-1">ID da Sessão / Anamnese</label>
          <input
            type="text"
            value={anamneseId}
            onChange={(e) => setAnamneseId(e.target.value)}
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Tabela de Variáveis (Regra 24) */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs font-semibold text-stone-400 uppercase tracking-wider">
          <span>Variável Subjetiva Avaliada</span>
          <div className="flex items-center gap-6 sm:gap-12 pr-2">
            <span>Antes (0-10)</span>
            <span>Depois (0-10)</span>
            <span className="hidden sm:inline">Variação</span>
          </div>
        </div>

        <div className="divide-y divide-stone-800">
          {valores.map((item, idx) => {
            const diff = item.depois - item.antes;
            const diffColor =
              diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-stone-400';

            return (
              <div key={item.nome} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-stone-200">{item.nome}</span>
                  <input
                    type="text"
                    placeholder="Observação subjetiva breve..."
                    value={item.observacao || ''}
                    onChange={(e) => handleMudarObs(idx, e.target.value)}
                    className="w-full sm:w-64 px-2 py-1 bg-stone-800/80 border border-stone-700/60 rounded-lg text-[11px] text-stone-300 placeholder-stone-500 focus:outline-none focus:border-amber-500/70"
                  />
                </div>

                <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center">
                  {/* Slider Antes */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={item.antes}
                      onChange={(e) => handleMudarValor(idx, 'antes', parseInt(e.target.value) || 0)}
                      className="w-12 px-2 py-1 bg-stone-800 border border-stone-700 rounded-lg text-center font-bold text-stone-200"
                    />
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-stone-600" />

                  {/* Slider Depois */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={item.depois}
                      onChange={(e) => handleMudarValor(idx, 'depois', parseInt(e.target.value) || 0)}
                      className="w-12 px-2 py-1 bg-stone-800 border border-stone-700 rounded-lg text-center font-bold text-stone-200"
                    />
                  </div>

                  {/* Delta */}
                  <div className={`w-10 text-right font-bold text-xs ${diffColor}`}>
                    {diff > 0 ? `+${diff}` : diff}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={handleCalcular}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>Processar Classificação da Reavaliação</span>
          </button>
        </div>
      </div>

      {/* Resultado da Reavaliação */}
      {resultadoReavaliacao && (
        <div
          className={`p-6 rounded-3xl border space-y-4 shadow-xl text-stone-200 ${
            getClassificacaoEstilo(resultadoReavaliacao.classificacao).card
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
            <div>
              <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                Protocolo: {resultadoReavaliacao.id} • Data: {resultadoReavaliacao.data}
              </span>
              <h3 className="text-xl font-bold text-stone-100 mt-0.5">
                Veredito Clínico de Conduta
              </h3>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                getClassificacaoEstilo(resultadoReavaliacao.classificacao).badge
              }`}
            >
              {resultadoReavaliacao.classificacao}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-bold text-stone-300 uppercase tracking-wider block mb-1">
                Justificativa Clínica Integrativa:
              </span>
              <p className="text-stone-200 leading-relaxed">
                {resultadoReavaliacao.justificativaClinica}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-800/60">
              <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Próxima Ação Sugerida:
              </span>
              <p className="text-stone-200 font-medium">
                {resultadoReavaliacao.proximaAcaoSugerida}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
