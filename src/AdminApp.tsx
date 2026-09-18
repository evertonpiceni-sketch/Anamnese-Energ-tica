import { useState } from 'react';
import { AnamneseInput, SistemaBiblioteca } from './types';
import { BIBLIOTECA_MESTRA_INICIAL } from './data/bibliotecaMestra';
import { CASOS_DE_TESTE, CasoTeste } from './data/sampleCases';
import { AnaliseCompletaResultado, executarAnaliseIntegrativa } from './engine/analysisEngine';
import { Navbar } from './components/Navbar';
import { AnamneseForm } from './components/AnamneseForm';
import { ResultadoPessoaView } from './components/ResultadoPessoaView';
import { RelatorioEvertonView } from './components/RelatorioEvertonView';
import { BibliotecaMestraView } from './components/BibliotecaMestraView';
import { ReavaliacaoView } from './components/ReavaliacaoView';
import { AudioLibraryView } from './components/AudioLibraryView';
import { ComplementaryLibrariesView } from './components/ComplementaryLibrariesView';
import { CasosTesteView } from './components/CasosTesteView';
import { Sparkles, ShieldCheck, Heart, BookOpen, Activity, Play, RotateCcw } from 'lucide-react';

type ViewMode = 'anamnese' | 'resultado_pessoa' | 'relatorio_everton' | 'biblioteca' | 'audios' | 'complementares' | 'reavaliacao' | 'casos';

export const ANAMNESE_LIMPA: AnamneseInput = {
  id: '',
  data: new Date().toISOString().split('T')[0],
  nomePessoa: '',
  idade: '',
  contato: '',
  historicoEnergetico: '',
  intencaoDeclarada: '',
  respostasObjetivas: {},
  relatoLivreNecessidade: '',
  relatoLivreDesafios: '',
  relatoLivrePreservado: '',
  regioesCorporaisPercebidas: [],
  preferenciasAtendimento: '',
  sensibilidadeEnergetica: 'moderada',
};

const SUBMISSIONS_KEY = 'anamnese-integrativa-submissions-v1';

function carregarUltimaAnamneseConcluida(): { dados: AnamneseInput; analise: AnaliseCompletaResultado | null } | null {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) return null;
    const lista = JSON.parse(raw);
    if (!Array.isArray(lista) || lista.length === 0) return null;
    const ultima = lista[lista.length - 1];
    const {
      resultadoPessoa: _resultadoPessoa,
      analiseTecnica,
      enviadoEm: _enviadoEm,
      status: _status,
      ...dados
    } = ultima;
    return {
      dados: dados as AnamneseInput,
      analise: (analiseTecnica as AnaliseCompletaResultado) || null,
    };
  } catch {
    return null;
  }
}

export default function AdminApp() {
  const ultimaConcluida = carregarUltimaAnamneseConcluida();

  // O ADM abre a última anamnese concluída quando houver uma no dispositivo.
  const [viewAtiva, setViewAtiva] = useState<ViewMode>(
    ultimaConcluida?.analise ? 'relatorio_everton' : 'anamnese'
  );
  const [biblioteca, setBiblioteca] = useState<SistemaBiblioteca[]>(BIBLIOTECA_MESTRA_INICIAL);

  const [anamneseAtual, setAnamneseAtual] = useState<AnamneseInput>(() =>
    ultimaConcluida?.dados || {
      ...ANAMNESE_LIMPA,
      id: `ANAM-${Date.now().toString().slice(-6)}`,
    }
  );

  const [resultadoAnalise, setResultadoAnalise] = useState<AnaliseCompletaResultado | null>(
    ultimaConcluida?.analise || null
  );

  const handleSubmeterAnamnese = (dados: AnamneseInput) => {
    setAnamneseAtual(dados);
    const analise = executarAnaliseIntegrativa(dados, biblioteca);
    setResultadoAnalise(analise);
    setViewAtiva('resultado_pessoa');
  };

  const handleCarregarCasoTeste = (caso: CasoTeste) => {
    setAnamneseAtual(caso.dados);
    const analise = executarAnaliseIntegrativa(caso.dados, biblioteca);
    setResultadoAnalise(analise);
    setViewAtiva('relatorio_everton');
  };

  const handleLimparAnamnese = () => {
    const novaLimpa: AnamneseInput = {
      ...ANAMNESE_LIMPA,
      id: `ANAM-${Date.now().toString().slice(-6)}`,
      data: new Date().toISOString().split('T')[0],
    };
    setAnamneseAtual(novaLimpa);
    setResultadoAnalise(null);
    setViewAtiva('anamnese');
  };

  const handleAtualizarBiblioteca = (novosSistemas: SistemaBiblioteca[]) => {
    setBiblioteca(novosSistemas);
    // Se já tiver uma análise, reprocessa com a nova biblioteca
    if (anamneseAtual) {
      const analise = executarAnaliseIntegrativa(anamneseAtual, novosSistemas);
      setResultadoAnalise(analise);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar
        viewAtiva={viewAtiva}
        onMudarView={setViewAtiva}
        temAnalisePronta={!!resultadoAnalise}
        onLimparAnamnese={handleLimparAnamnese}
      />

      {/* Quick context banner */}
      <div className="bg-stone-900/60 border-b border-stone-800/80 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <span
              className={`w-2 h-2 rounded-full ${
                resultadoAnalise ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-medium">
              {resultadoAnalise ? 'Análise Integrativa Processada' : 'Questionário Limpo (Sem Resultado Prévio)'}
            </span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400">
              {anamneseAtual.nomePessoa ? (
                <>
                  Interagente:{' '}
                  <strong className="text-stone-200 font-semibold">{anamneseAtual.nomePessoa}</strong>
                </>
              ) : (
                <span className="text-stone-400 italic">Novo Formulário em Branco</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="btn-banner-limpar"
              onClick={handleLimparAnamnese}
              className="px-2.5 py-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-all flex items-center gap-1.5 text-xs border border-stone-700/60"
              title="Limpar formulário e começar novo questionário"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Nova Anamnese em Branco</span>
            </button>

            {resultadoAnalise && (
              <>
                <button
                  id="btn-quick-pessoa"
                  onClick={() => setViewAtiva('resultado_pessoa')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    viewAtiva === 'resultado_pessoa'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Ver Saída da Pessoa</span>
                </button>

                <button
                  id="btn-quick-everton"
                  onClick={() => setViewAtiva('relatorio_everton')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    viewAtiva === 'relatorio_everton'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ver Relatório do Everton</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Router */}
      <main className="flex-1 pb-16">
        {viewAtiva === 'casos' && (
          <CasosTesteView onCarregarCaso={handleCarregarCasoTeste} />
        )}

        {viewAtiva === 'anamnese' && (
          <AnamneseForm
            initialData={anamneseAtual}
            onSubmit={handleSubmeterAnamnese}
            onCarregarCaso={handleCarregarCasoTeste}
            onLimparFormulario={handleLimparAnamnese}
          />
        )}

        {viewAtiva === 'resultado_pessoa' && (
          resultadoAnalise ? (
            <ResultadoPessoaView
              resultado={resultadoAnalise.resultadoPessoa}
              nomePessoa={anamneseAtual.nomePessoa || 'Interagente'}
              onVoltar={() => setViewAtiva('anamnese')}
              onVerRelatorioEverton={() => setViewAtiva('relatorio_everton')}
            />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="p-8 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
                <Heart className="w-12 h-12 text-amber-400 mx-auto opacity-70" />
                <h2 className="text-xl font-bold text-stone-100">Nenhum Resultado Gerado Ainda</h2>
                <p className="text-sm text-stone-400">
                  O questionário está limpo. Preencha as respostas e clique em &quot;Cruzar com a Biblioteca-Mestra&quot; para produzir o Resultado da Pessoa.
                </p>
                <button
                  onClick={() => setViewAtiva('anamnese')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all"
                >
                  Ir para o Questionário de Anamnese
                </button>
              </div>
            </div>
          )
        )}

        {viewAtiva === 'relatorio_everton' && (
          resultadoAnalise ? (
            <RelatorioEvertonView
              relatorio={resultadoAnalise.relatorioEverton}
              jsonExport={resultadoAnalise.jsonExport}
              onVoltar={() => setViewAtiva('anamnese')}
              onIrReavaliacao={() => setViewAtiva('reavaliacao')}
            />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="p-8 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
                <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto opacity-70" />
                <h2 className="text-xl font-bold text-stone-100">Nenhum Relatório Técnico Disponível</h2>
                <p className="text-sm text-stone-400">
                  O questionário está limpo. Preencha a anamnese e processe para visualizar os eixos predominantes, árvore causal e convergências da Biblioteca-Mestra.
                </p>
                <button
                  onClick={() => setViewAtiva('anamnese')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all"
                >
                  Ir para o Questionário de Anamnese
                </button>
              </div>
            </div>
          )
        )}

        {viewAtiva === 'biblioteca' && (
          <BibliotecaMestraView
            sistemas={biblioteca}
            onAtualizarSistemas={handleAtualizarBiblioteca}
          />
        )}

        {viewAtiva === 'audios' && (
          <AudioLibraryView />
        )}

        {viewAtiva === 'complementares' && (
          <ComplementaryLibrariesView />
        )}

        {viewAtiva === 'reavaliacao' && (
          <ReavaliacaoView
            nomePessoaPadrao={anamneseAtual.nomePessoa}
            anamneseIdPadrao={anamneseAtual.id}
            onVoltarParaAnamnese={() => setViewAtiva('anamnese')}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-6 text-center text-xs text-stone-500 space-y-1">
        <p>
          Anamnese Integrativa — Reintegração da Vida • Motor de Cruzamento com Biblioteca-Mestra
        </p>
        <p className="text-[11px] text-stone-600">
          Princípio Central: Pessoa → Necessidade → Eixos → Origem → Sistemas Compatíveis → Recursos Específicos → Composição → Sequência → Reavaliação
        </p>
      </footer>
    </div>
  );
}
