import { Sparkles, BookOpen, FileText, Activity, ShieldCheck, PlusCircle, Headphones, Layers3 } from 'lucide-react';

interface NavbarProps {
  viewAtiva: 'anamnese' | 'resultado_pessoa' | 'relatorio_everton' | 'biblioteca' | 'audios' | 'complementares' | 'reavaliacao' | 'casos';
  onMudarView: (view: 'anamnese' | 'resultado_pessoa' | 'relatorio_everton' | 'biblioteca' | 'audios' | 'complementares' | 'reavaliacao' | 'casos') => void;
  temAnalisePronta: boolean;
  onLimparAnamnese?: () => void;
}

export function Navbar({ viewAtiva, onMudarView, temAnalisePronta, onLimparAnamnese }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onMudarView('anamnese')}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base sm:text-lg tracking-tight text-stone-100">
                  Anamnese Integrativa
                </span>
                <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Reintegração da Vida
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Motor de Cruzamento com a Biblioteca-Mestra
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {onLimparAnamnese && (
              <button
                id="nav-btn-nova-anamnese"
                onClick={onLimparAnamnese}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition-colors flex items-center gap-1.5 mr-1"
                title="Criar nova anamnese limpa sem dados prévios"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nova Anamnese</span>
              </button>
            )}

            <button
              id="nav-btn-anamnese"
              onClick={() => onMudarView('anamnese')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                viewAtiva === 'anamnese'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Questionário</span>
            </button>

            <button
              id="nav-btn-casos"
              onClick={() => onMudarView('casos')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                viewAtiva === 'casos'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Casos de Teste</span>
              <span className="sm:hidden">Casos</span>
            </button>

            {temAnalisePronta && (
              <>
                <button
                  id="nav-btn-pessoa"
                  onClick={() => onMudarView('resultado_pessoa')}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    viewAtiva === 'resultado_pessoa'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Resultado da Pessoa</span>
                  <span className="sm:hidden">Pessoa</span>
                </button>

                <button
                  id="nav-btn-everton"
                  onClick={() => onMudarView('relatorio_everton')}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    viewAtiva === 'relatorio_everton'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">Relatório Técnico</span>
                  <span className="sm:hidden">Everton</span>
                </button>
              </>
            )}

            <button
              id="nav-btn-biblioteca"
              onClick={() => onMudarView('biblioteca')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                viewAtiva === 'biblioteca'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Biblioteca-Mestra</span>
              <span className="md:hidden">Biblioteca</span>
            </button>

            <button
              id="nav-btn-audios"
              onClick={() => onMudarView('audios')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                viewAtiva === 'audios'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden lg:inline">Áudios</span>
            </button>

            <button
              id="nav-btn-complementares"
              onClick={() => onMudarView('complementares')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                viewAtiva === 'complementares'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Layers3 className="w-4 h-4" />
              <span className="hidden xl:inline">Complementares</span>
            </button>

            <button
              id="nav-btn-reavaliacao"
              onClick={() => onMudarView('reavaliacao')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                viewAtiva === 'reavaliacao'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden lg:inline">Reavaliação</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
