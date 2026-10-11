import { Sparkles, BookOpen, FileText, Activity, ShieldCheck, PlusCircle, SlidersHorizontal } from 'lucide-react';

interface NavbarProps {
  viewAtiva: 'anamnese' | 'resultado_pessoa' | 'relatorio_everton' | 'biblioteca' | 'audios' | 'complementares' | 'compositor' | 'reavaliacao' | 'casos';
  onMudarView: (view: 'anamnese' | 'resultado_pessoa' | 'relatorio_everton' | 'biblioteca' | 'audios' | 'complementares' | 'compositor' | 'reavaliacao' | 'casos') => void;
  temAnalisePronta: boolean;
  onLimparAnamnese?: () => void;
}

export function Navbar({ viewAtiva, onMudarView, temAnalisePronta, onLimparAnamnese }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-900/95 text-stone-100 shadow-md backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center gap-3 py-2">
          <button
            type="button"
            className="group flex min-w-0 items-center gap-3 text-left"
            onClick={() => onMudarView('anamnese')}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="hidden min-w-0 xl:block">
              <div className="truncate text-base font-semibold tracking-tight text-stone-100">Anamnese Integrativa</div>
              <p className="truncate text-xs text-stone-400">ADM • Reintegração da Vida</p>
            </div>
          </button>

          <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {onLimparAnamnese && (
              <button
                id="nav-btn-nova-anamnese"
                onClick={onLimparAnamnese}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/20 px-2.5 py-2 text-xs font-medium text-amber-400/90 transition-colors hover:bg-amber-500/10 hover:text-amber-300"
                title="Criar nova anamnese"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Nova</span>
              </button>
            )}

            <NavButton active={viewAtiva === 'anamnese'} onClick={() => onMudarView('anamnese')} icon={<FileText className="h-4 w-4" />} label="Questionário" />

            {temAnalisePronta && (
              <>
                <NavButton active={viewAtiva === 'resultado_pessoa'} onClick={() => onMudarView('resultado_pessoa')} icon={<Sparkles className="h-4 w-4 text-emerald-400" />} label="Resultado" activeClass="bg-emerald-500/20 text-emerald-300 border-emerald-500/40" />
                <NavButton active={viewAtiva === 'relatorio_everton'} onClick={() => onMudarView('relatorio_everton')} icon={<ShieldCheck className="h-4 w-4 text-indigo-400" />} label="Leitura ADM" activeClass="bg-indigo-500/20 text-indigo-300 border-indigo-500/40" />
              </>
            )}

            <NavButton active={viewAtiva === 'biblioteca'} onClick={() => onMudarView('biblioteca')} icon={<BookOpen className="h-4 w-4" />} label="Biblioteca" />
            <NavButton active={viewAtiva === 'compositor'} onClick={() => onMudarView('compositor')} icon={<SlidersHorizontal className="h-4 w-4" />} label="Cuidado" />
            <NavButton active={viewAtiva === 'reavaliacao'} onClick={() => onMudarView('reavaliacao')} icon={<Activity className="h-4 w-4" />} label="Reavaliação" />
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
  activeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40',
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors sm:text-sm ${
        active ? activeClass : 'border-transparent text-stone-300 hover:bg-stone-800 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
