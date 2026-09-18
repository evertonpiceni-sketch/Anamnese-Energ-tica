import React, { useState } from 'react';
import { EstruturaJsonExport, RelatorioTecnicoEverton } from '../types';
import {
  ShieldCheck,
  ArrowLeft,
  Copy,
  Check,
  Printer,
  FileCode,
  Activity,
  Layers,
  AlertCircle,
  Clock,
  Sparkles,
  Link,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RelatorioEvertonViewProps {
  relatorio: RelatorioTecnicoEverton;
  jsonExport: EstruturaJsonExport;
  onVoltar: () => void;
  onIrReavaliacao: () => void;
}

export function RelatorioEvertonView({
  relatorio,
  jsonExport,
  onVoltar,
  onIrReavaliacao,
}: RelatorioEvertonViewProps) {
  const [copiadoJson, setCopiadoJson] = useState(false);
  const [copiadoTexto, setCopiadoTexto] = useState(false);
  const [mostrarJsonCompleto, setMostrarJsonCompleto] = useState(false);

  const copiarJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonExport, null, 2));
    setCopiadoJson(true);
    setTimeout(() => setCopiadoJson(false), 2000);
  };

  const copiarTextoTecnico = () => {
    const texto = `RELATÓRIO TÉCNICO DO EVERTON — ANAMNESE INTEGRATIVA
Interagente: ${relatorio.dadosAnalise.nome} | Data: ${relatorio.dadosAnalise.data} | ID: ${relatorio.dadosAnalise.idInterno}

EIXO ESTRUTURANTE:
${relatorio.eixoEstruturante}

RELAÇÕES FUNCIONAIS ENCONTRADAS:
${relatorio.relacoesEncontradas.map((r) => `• ${r}`).join('\n')}

EIXOS DA ANAMNESE (ORDEM DE RELEVÂNCIA):
${relatorio.eixosOrdenados.map((e) => `• ${e.nome}: ${e.percentual}% (${e.nivel})`).join('\n')}

SISTEMA-BASE (SUSTENTAÇÃO):
• ${relatorio.sistemaBase.nome}
Justificativa: ${relatorio.sistemaBase.justificativa}
Origem Doc: ${relatorio.sistemaBase.origemDoc}

SISTEMA PRINCIPAL:
• ${relatorio.sistemaPrincipal.nome}
Curso Origem: ${relatorio.sistemaPrincipal.cursoOrigem}
Recursos Específicos: ${relatorio.sistemaPrincipal.recursoEspecifico}
Compatibilidade: ${relatorio.sistemaPrincipal.compatibilidade}%
Justificativa: ${relatorio.sistemaPrincipal.justificativa}
Origem Doc: ${relatorio.sistemaPrincipal.origemDoc}

SISTEMAS COMPLEMENTARES:
${relatorio.sistemasComplementares.map((c) => `• ${c.nome} (${c.cursoOrigem}) — Recursos: ${c.recursoEspecifico} | Origem: ${c.origemDoc}`).join('\n')}

SISTEMAS CONSIDERADOS E NÃO PRIORIZADOS:
${relatorio.sistemasNaoUtilizados.map((s) => `• ${s.nome} (Compatibilidade ${s.compatibilidade}%): ${s.porQueNaoFoiPriorizado} [Reconsiderar: ${s.quandoPoderaSerReconsiderado}]`).join('\n')}

SEQUÊNCIA TERAPÊUTICA:
${relatorio.composicaoFinalSequencia.map((et) => `${et.ordem}. [${et.fase}] ${et.sistemaOuTecnica} (${et.recursoEspecifico || ''}) — ${et.objetivo}`).join('\n')}
`;
    navigator.clipboard.writeText(texto);
    setCopiadoTexto(true);
    setTimeout(() => setCopiadoTexto(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <button
          onClick={onVoltar}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Anamnese</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Relatório</span>
          </button>

          <button
            onClick={copiarTextoTecnico}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors flex items-center gap-1.5"
          >
            {copiadoTexto ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiadoTexto ? 'Texto Copiado!' : 'Copiar Relatório'}</span>
          </button>

          <button
            onClick={copiarJson}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1.5"
          >
            {copiadoJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiadoJson ? 'JSON Copiado!' : 'Exportar JSON (Regra 21)'}</span>
          </button>

          <button
            onClick={onIrReavaliacao}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Iniciar Reavaliação Pós-Sessão</span>
          </button>
        </div>
      </div>

      {/* Relatório Técnico Body */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-8 text-stone-200 shadow-xl">
        {/* Header do Relatório */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Saída 2 — Relatório Técnico do Everton</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-100 mt-1">
              Prontuário de Cruzamento & Auditoria Clínica
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Rastreabilidade completa de cursos, recursos específicos, regras de estabilização e descarte auditado.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 text-xs space-y-1 sm:text-right">
            <div>
              <span className="text-stone-400">Interagente: </span>
              <span className="font-semibold text-stone-100">{relatorio.dadosAnalise.nome}</span>
            </div>
            <div>
              <span className="text-stone-400">Data: </span>
              <span className="font-mono text-stone-300">{relatorio.dadosAnalise.data}</span>
            </div>
            <div>
              <span className="text-stone-400">ID Interno: </span>
              <span className="font-mono text-indigo-300 font-semibold">{relatorio.dadosAnalise.idInterno}</span>
            </div>
          </div>
        </div>

        {/* 1. EIXO ESTRUTURANTE E RELAÇÕES FUNCIONAIS ENCONTRADAS */}
        <section className="space-y-4">
          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
            <div className="text-xs uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Eixo Estruturante Identificado (Regra 8)</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-stone-100">
              {relatorio.eixoEstruturante}
            </div>

            <div className="border-t border-indigo-500/20 pt-3">
              <span className="text-xs font-semibold text-stone-300 block mb-1.5">
                Cadeias de Causalidade Funcional Detectadas (Regras 7 e 26):
              </span>
              <div className="space-y-2">
                {relatorio.analiseContextualAvancada?.cadeiasCausais && relatorio.analiseContextualAvancada.cadeiasCausais.length > 0 ? (
                  relatorio.analiseContextualAvancada.cadeiasCausais.map((cadeia, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-900/90 border border-indigo-500/30 text-xs space-y-2"
                    >
                      <div className="font-mono text-indigo-300 font-bold flex items-center gap-2">
                        <span className="text-indigo-400">➔</span>
                        <span>{cadeia.expressaoFormatada}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-stone-800">
                        <div className="p-2 rounded bg-stone-950/60 border border-stone-800/80">
                          <span className="text-stone-500 block uppercase text-[9px] font-bold">Origem Raiz</span>
                          <span className="text-amber-400 font-semibold">{cadeia.origemRaiz}</span>
                        </div>
                        <div className="p-2 rounded bg-stone-950/60 border border-stone-800/80">
                          <span className="text-stone-500 block uppercase text-[9px] font-bold">Mecanismo Interno</span>
                          <span className="text-stone-300">{cadeia.mecanismoIntermediario}</span>
                        </div>
                        <div className="p-2 rounded bg-stone-950/60 border border-stone-800/80">
                          <span className="text-stone-500 block uppercase text-[9px] font-bold">Sintoma Declarado</span>
                          <span className="text-stone-400">{cadeia.sintomaVisivel}</span>
                        </div>
                      </div>
                      <p className="text-stone-300 text-[11px] leading-relaxed italic bg-indigo-950/30 p-2 rounded border border-indigo-900/40">
                        "{cadeia.justificativaClinica}"
                      </p>
                      <div className="text-[10px] text-teal-400 font-medium">
                        Diretriz Energética: {cadeia.diretrizComposicao}
                      </div>
                    </div>
                  ))
                ) : (
                  relatorio.relacoesEncontradas.map((rel, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-mono px-3 py-1.5 rounded-lg bg-stone-900 border border-indigo-500/20 text-indigo-300 flex items-center gap-2"
                    >
                      <span className="text-indigo-400 font-bold">➔</span>
                      <span>{rel}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Clusters Qualitativos & Convergências */}
            {relatorio.analiseContextualAvancada && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-indigo-500/20 text-xs">
                {relatorio.analiseContextualAvancada.clustersQualitativos.length > 0 && (
                  <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                      Clusters Semânticos (Respostas Abertas)
                    </span>
                    <div className="space-y-1">
                      {relatorio.analiseContextualAvancada.clustersQualitativos.map((cl, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-300 font-medium">{cl.nomeCluster}</span>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold font-mono">
                            +{cl.pesoQualitativoAtribuido}% peso
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {relatorio.analiseContextualAvancada.convergenciasBiblioteca.length > 0 && (
                  <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block">
                      Convergências com a Biblioteca-Mestra
                    </span>
                    <div className="space-y-1">
                      {relatorio.analiseContextualAvancada.convergenciasBiblioteca.map((conv, i) => (
                        <div key={i} className="text-[11px] text-stone-300">
                          <span className="text-teal-300 font-semibold">{conv.recursoSugerido}</span>
                          <span className="text-stone-500"> ({conv.cursoOrigem}) ➔ "{conv.expressaoRelatada}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 2. EIXOS DA ANAMNESE EM ORDEM DE RELEVÂNCIA */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-300">
            Eixos da Anamnese (Ordem Decrescente de Relevância)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {relatorio.eixosOrdenados.map((eixo) => {
              const corBarra =
                eixo.percentual >= 75
                  ? 'bg-rose-500'
                  : eixo.percentual >= 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

              return (
                <div
                  key={eixo.eixoId}
                  className="p-3 rounded-xl bg-stone-800/50 border border-stone-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-200 truncate" title={eixo.nome}>
                      {eixo.nome}
                    </span>
                    <span className="font-bold text-stone-100 ml-1">{eixo.percentual}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div className={`h-full ${corBarra}`} style={{ width: `${eixo.percentual}%` }} />
                  </div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                    {eixo.nivel.replace('_', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. RESPOSTAS DETERMINANTES E ANÁLISE DO RELATO LIVRE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Respostas Determinantes */}
          <section className="p-5 rounded-2xl bg-stone-800/30 border border-stone-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Respostas Determinantes no Questionário</span>
            </h3>
            <div className="space-y-2 text-xs">
              {relatorio.respostasDeterminantes.length > 0 ? (
                relatorio.respostasDeterminantes.map((resp, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-1">
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="font-medium">"{resp.pergunta}"</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                        Nível {resp.respostaNivel}/4
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Eixos alimentados: <span className="text-stone-300">{resp.eixosAfetados}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-stone-400 italic">Nenhuma resposta isolada com intensidade extrema.</p>
              )}
            </div>
          </section>

          {/* Análise Qualitativa do Relato Livre */}
          <section className="p-5 rounded-2xl bg-stone-800/30 border border-stone-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Análise do Relato Livre (Regra 9)</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-stone-400">Palavras Recorrentes: </span>
                <span className="text-stone-200 font-medium">
                  {relatorio.analiseRelatoLivre.palavrasRecorrentes.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-stone-400">Emoções Espontâneas: </span>
                <span className="text-stone-200 font-medium">
                  {relatorio.analiseRelatoLivre.emocoesMencionadas.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-stone-400">Fatores Preservados: </span>
                <span className="text-emerald-400 font-medium">
                  {relatorio.analiseRelatoLivre.fatoresPreservados}
                </span>
              </div>
              <div>
                <span className="text-stone-400">Intenção Declarada: </span>
                <span className="text-amber-300 font-serif italic">
                  "{relatorio.analiseRelatoLivre.intencaoDeclarada}"
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* 4. PERCEPÇÃO CORPORAL & CHAKRAS */}
        <section className="p-4 rounded-xl bg-stone-800/40 border border-stone-800 space-y-1.5 text-xs">
          <div className="font-semibold text-stone-200 uppercase tracking-wider text-[11px]">
            Percepção Corporal Relatada & Centros Sutis (Regra 10)
          </div>
          <p className="text-stone-300 leading-relaxed">{relatorio.regioesCorporais.leituraEnergetica}</p>
        </section>

        {/* 5. COMPOSIÇÃO DOS SISTEMAS: BASE, PRINCIPAL, COMPLEMENTARES */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-300">
            Composição Terapêutica & Rastreabilidade Documental (Regra 23)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sistema-Base */}
            <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700 space-y-2 text-xs">
              <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                Sistema-Base (Sustentação)
              </div>
              <div className="font-bold text-sm text-stone-100">{relatorio.sistemaBase.nome}</div>
              <p className="text-stone-300">{relatorio.sistemaBase.justificativa}</p>
              <div className="border-t border-stone-700/60 pt-2 text-[11px] text-stone-400 flex items-start gap-1">
                <Link className="w-3 h-3 text-stone-500 shrink-0 mt-0.5" />
                <span className="font-mono truncate">{relatorio.sistemaBase.origemDoc}</span>
              </div>
            </div>

            {/* Sistema Principal */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2 text-xs md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Sistema Principal (Foco Clínico com Recursos Internos)
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                  Compatibilidade: {relatorio.sistemaPrincipal.compatibilidade}%
                </span>
              </div>
              <div className="font-bold text-base text-stone-100">
                {relatorio.sistemaPrincipal.nome} —{' '}
                <span className="text-amber-300">{relatorio.sistemaPrincipal.recursoEspecifico}</span>
              </div>
              <p className="text-stone-300">{relatorio.sistemaPrincipal.justificativa}</p>
              <div className="border-t border-amber-500/20 pt-2 text-[11px] text-stone-400 flex items-start gap-1">
                <Link className="w-3 h-3 text-amber-400/60 shrink-0 mt-0.5" />
                <span className="font-mono">
                  Curso: {relatorio.sistemaPrincipal.cursoOrigem} | Fonte: {relatorio.sistemaPrincipal.origemDoc}
                </span>
              </div>
            </div>
          </div>

          {/* Sistemas Complementares */}
          {relatorio.sistemasComplementares.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-300">Sistemas Complementares:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatorio.sistemasComplementares.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800 space-y-1.5 text-xs"
                  >
                    <div className="font-semibold text-stone-200">
                      {comp.nome} — <span className="text-indigo-300">{comp.recursoEspecifico}</span>
                    </div>
                    <p className="text-stone-400">{comp.funcao}</p>
                    <div className="text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-800">
                      Doc: {comp.origemDoc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 6. RECURSOS INTERNOS CONSOLIDADOS */}
        <section className="p-5 rounded-2xl bg-stone-800/40 border border-stone-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
            Recursos Internos Ativados na Sessão (Regra 12)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <span className="text-stone-400 block text-[11px] mb-1">Símbolos Ativos</span>
              <div className="space-y-1">
                {relatorio.recursosInternos.simbolos.map((s) => (
                  <div key={s} className="px-2 py-1 rounded bg-stone-800 text-stone-200 font-medium">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-stone-400 block text-[11px] mb-1">Energias / Frequências</span>
              <div className="space-y-1">
                {relatorio.recursosInternos.energias.slice(0, 3).map((e) => (
                  <div key={e} className="px-2 py-1 rounded bg-stone-800 text-stone-300">
                    {e}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-stone-400 block text-[11px] mb-1">Comandos Sutis</span>
              <div className="space-y-1">
                {relatorio.recursosInternos.comandos.slice(0, 3).map((c) => (
                  <div key={c} className="px-2 py-1 rounded bg-stone-800 text-stone-300">
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-stone-400 block text-[11px] mb-1">Cristais de Ancoragem</span>
              <div className="space-y-1">
                {relatorio.recursosInternos.cristais.slice(0, 3).map((cr) => (
                  <div key={cr} className="px-2 py-1 rounded bg-stone-800 text-amber-300/80">
                    {cr}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-stone-400 block text-[11px] mb-1">Centros / Chakras</span>
              <div className="space-y-1">
                {relatorio.recursosInternos.chakras.slice(0, 3).map((ch) => (
                  <div key={ch} className="px-2 py-1 rounded bg-stone-800 text-stone-300">
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. SISTEMAS CONSIDERADOS E NÃO UTILIZADOS (Regra 17) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <span>Sistemas Considerados pelo Motor e Não Priorizados (Regra 17)</span>
            </h3>
            <span className="text-[11px] text-stone-400">
              {relatorio.sistemasNaoUtilizados.length} sistemas auditados
            </span>
          </div>

          <div className="divide-y divide-stone-800 border border-stone-800 rounded-2xl overflow-hidden bg-stone-800/20 text-xs">
            {relatorio.sistemasNaoUtilizados.map((sis, idx) => (
              <div key={idx} className="p-3.5 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-stone-200">{sis.nome}</span>
                  <span className="text-stone-400 font-mono text-[11px]">
                    Compatibilidade: {sis.compatibilidade}%
                  </span>
                </div>
                <div className="text-stone-400">
                  <span className="text-stone-500">Por que pontuou:</span> {sis.porQuePontuou}
                </div>
                <div className="text-stone-300">
                  <span className="text-rose-400/80 font-medium">Por que não priorizado:</span>{' '}
                  {sis.porQueNaoFoiPriorizado}
                </div>
                <div className="text-amber-300/90 text-[11px]">
                  <span className="text-stone-400">Quando reconsiderar:</span>{' '}
                  {sis.quandoPoderaSerReconsiderado}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. SEQUÊNCIA TERAPÊUTICO-ENERGÉTICA PASSO A PASSO (Regra 14) */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Sequência Terapêutico-Energética Sugerida (Regra 14)</span>
          </h3>

          <div className="space-y-2 text-xs">
            {relatorio.composicaoFinalSequencia.map((etapa) => (
              <div
                key={etapa.ordem}
                className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    {etapa.ordem}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-100 text-sm">{etapa.fase}</span>
                      <span className="text-stone-400">— {etapa.sistemaOuTecnica}</span>
                      {etapa.recursoEspecifico && (
                        <span className="text-amber-300/80">({etapa.recursoEspecifico})</span>
                      )}
                    </div>
                    <p className="text-stone-300 mt-0.5">{etapa.objetivo}</p>
                    <p className="text-stone-400 text-[11px] mt-0.5">
                      <span className="text-stone-400">Sinais a observar:</span> {etapa.sinaisObservar}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right text-stone-400 font-mono text-[11px]">
                  {etapa.duracaoMinutos ? `~${etapa.duracaoMinutos} min` : ''}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. OBSERVAÇÕES & VARIÁVEIS A REAVALIAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-stone-800/30 border border-stone-800 space-y-2 text-xs">
            <span className="font-bold text-stone-200 uppercase tracking-wider text-[11px]">
              O Que Observar Durante a Prática
            </span>
            <ul className="list-disc list-inside space-y-1 text-stone-300">
              {relatorio.oqueObservarPratica.map((obs, i) => (
                <li key={i}>{obs}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-stone-800/30 border border-stone-800 space-y-2 text-xs">
            <span className="font-bold text-stone-200 uppercase tracking-wider text-[11px]">
              Variáveis Obrigatórias de Reavaliação Pós-Sessão (Regra 24)
            </span>
            <ul className="list-disc list-inside space-y-1 text-stone-300">
              {relatorio.oqueReavaliar.map((rev, i) => (
                <li key={i}>{rev}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 10. VISUALIZADOR DO FORMATO ESTRUTURADO JSON (Regra 21) */}
        <section className="border-t border-stone-800 pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMostrarJsonCompleto(!mostrarJsonCompleto)}
              className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors"
            >
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Formato Estruturado JSON do Sistema (Regra 21)</span>
              {mostrarJsonCompleto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button
              onClick={copiarJson}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-mono"
            >
              {copiadoJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiadoJson ? 'JSON Copiado!' : 'Copiar JSON'}</span>
            </button>
          </div>

          {mostrarJsonCompleto && (
            <pre className="p-4 rounded-2xl bg-black/60 border border-stone-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto max-h-96">
              {JSON.stringify(jsonExport, null, 2)}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}
