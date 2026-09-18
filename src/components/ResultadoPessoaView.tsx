import React, { useState } from 'react';
import { ResultadoPessoa } from '../types';
import { Sparkles, Heart, Copy, Check, Printer, ArrowLeft, Gem, Wind, Moon, Sun } from 'lucide-react';

interface ResultadoPessoaViewProps {
  resultado: ResultadoPessoa;
  nomePessoa: string;
  onVoltar: () => void;
  onVerRelatorioEverton: () => void;
}

export function ResultadoPessoaView({
  resultado,
  nomePessoa,
  onVoltar,
  onVerRelatorioEverton,
}: ResultadoPessoaViewProps) {
  const [copiado, setCopiado] = useState(false);

  const copiarTextoCompleto = () => {
    const textoFormatado = `ANAMNESE INTEGRATIVA — REINTEGRAÇÃO DA VIDA
Resultado da Pessoa: ${nomePessoa}

SEU MOMENTO
${resultado.seuMomento}

O QUE PARECE ESTAR PEDINDO CUIDADO
${resultado.oQueParecePedirCuidado}

SUA PROPOSTA ENERGÉTICA
• Sistema Principal: ${resultado.propostaEnergetica.principal}
${resultado.propostaEnergetica.complementar1 ? `• Apoio Complementar: ${resultado.propostaEnergetica.complementar1}` : ''}
${resultado.propostaEnergetica.complementar2 ? `• Apoio Secundário: ${resultado.propostaEnergetica.complementar2}` : ''}
• Sustentação Base: ${resultado.propostaEnergetica.base}

POR QUE ESTA COMPOSIÇÃO FOI ESCOLHIDA
${resultado.porQueEstaComposicao}

INTENÇÃO DA PRÁTICA
"${resultado.intencaoDaPratica}"

APOIOS SUGERIDOS
• Cristais: ${resultado.apoiosSugeridos.cristais.join(', ')}
• Respiração: ${resultado.apoiosSugeridos.respiracao}
• Meditação / Pausa: ${resultado.apoiosSugeridos.meditacao}
• Prática Complementar: ${resultado.apoiosSugeridos.praticaComplementar}

MENSAGEM FINAL
${resultado.mensagemFinal}
`;
    navigator.clipboard.writeText(textoFormatado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-800">
        <button
          onClick={onVoltar}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Anamnese</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700 transition-colors flex items-center gap-1.5"
            title="Imprimir ou Salvar PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            onClick={copiarTextoCompleto}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1.5"
          >
            {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiado ? 'Copiado!' : 'Copiar Texto da Pessoa'}</span>
          </button>

          <button
            onClick={onVerRelatorioEverton}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 transition-colors"
          >
            Ver Relatório do Everton
          </button>
        </div>
      </div>

      {/* Cartão de Apresentação da Pessoa */}
      <article className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl text-stone-200">
        {/* Header Acolhedor */}
        <div className="border-b border-stone-800/80 pb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium tracking-wide">
            <Heart className="w-3.5 h-3.5" />
            <span>Resultado da Pessoa — Cuidado Individualizado</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-100 tracking-tight">
            Sua Síntese de Reintegração
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
            Preparada especialmente para {nomePessoa || 'você'}, com base nas suas percepções e necessidades deste momento.
          </p>
        </div>

        {/* 1. SEU MOMENTO */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-base sm:text-lg">
            <Sun className="w-5 h-5" />
            <h2>Seu Momento</h2>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-stone-300">
            {resultado.seuMomento}
          </p>
        </section>

        {/* 2. O QUE PARECE ESTAR PEDINDO CUIDADO */}
        <section className="space-y-3 p-5 rounded-2xl bg-stone-800/40 border border-stone-800">
          <div className="flex items-center gap-2 text-stone-200 font-semibold text-sm sm:text-base">
            <Heart className="w-4 h-4 text-rose-400" />
            <h2>O Que Parece Estar Pedindo Cuidado</h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-stone-300">
            {resultado.oQueParecePedirCuidado}
          </p>
        </section>

        {/* 3. SUA PROPOSTA ENERGÉTICA */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-base sm:text-lg">
            <Sparkles className="w-5 h-5" />
            <h2>Sua Proposta Energética</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Principal */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
              <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                Foco Principal
              </div>
              <div className="text-sm sm:text-base font-semibold text-stone-100">
                {resultado.propostaEnergetica.principal}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Atuação acolhedora direcionada à necessidade que mais pede atenção agora.
              </p>
            </div>

            {/* Base */}
            <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Sustentação Base
              </div>
              <div className="text-sm sm:text-base font-semibold text-stone-100">
                {resultado.propostaEnergetica.base}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Ancoragem neutra e estável para manter a energia nutrida do início ao fim.
              </p>
            </div>

            {/* Complementares se existirem */}
            {resultado.propostaEnergetica.complementar1 && (
              <div className="p-4 rounded-xl bg-stone-800/40 border border-stone-750 sm:col-span-2">
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  Apoio Complementar
                </div>
                <div className="text-sm font-semibold text-stone-200">
                  {resultado.propostaEnergetica.complementar1}
                </div>
                {resultado.propostaEnergetica.complementar2 && (
                  <div className="text-xs text-stone-400 mt-1">
                    Composição harmonizada com {resultado.propostaEnergetica.complementar2}.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 4. POR QUE ESTA COMPOSIÇÃO FOI ESCOLHIDA */}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-stone-200">
            Por que esta composição foi escolhida
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-stone-300">
            {resultado.porQueEstaComposicao}
          </p>
        </section>

        {/* 5. INTENÇÃO DA PRÁTICA (Destaque visual sereno) */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-center space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold">
            Intenção da Prática
          </span>
          <p className="text-base sm:text-lg italic font-serif text-stone-100 leading-relaxed px-4">
            "{resultado.intencaoDaPratica}"
          </p>
        </section>

        {/* 6. APOIOS SUGERIDOS */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-stone-200 font-semibold text-sm sm:text-base">
            <Moon className="w-4 h-4 text-amber-400" />
            <h2>Apoios Sugeridos para o Dia a Dia</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-200">
                <Gem className="w-3.5 h-3.5 text-amber-400" />
                <span>Cristais Recomendados</span>
              </div>
              <p className="text-xs text-stone-300">
                {resultado.apoiosSugeridos.cristais.join(', ') || 'Quartzo Cristal Transparente ou Quartzo Rosa'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-200">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                <span>Exercício de Respiração</span>
              </div>
              <p className="text-xs text-stone-300">
                {resultado.apoiosSugeridos.respiracao}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-200">
                <Moon className="w-3.5 h-3.5 text-purple-400" />
                <span>Pausa & Meditação</span>
              </div>
              <p className="text-xs text-stone-300">
                {resultado.apoiosSugeridos.meditacao}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Prática Complementar</span>
              </div>
              <p className="text-xs text-stone-300">
                {resultado.apoiosSugeridos.praticaComplementar}
              </p>
            </div>
          </div>
        </section>

        {/* 7. MENSAGEM FINAL */}
        <section className="border-t border-stone-800 pt-6 text-center">
          <p className="text-xs sm:text-sm text-stone-400 italic max-w-lg mx-auto leading-relaxed">
            {resultado.mensagemFinal}
          </p>
        </section>
      </article>
    </div>
  );
}
