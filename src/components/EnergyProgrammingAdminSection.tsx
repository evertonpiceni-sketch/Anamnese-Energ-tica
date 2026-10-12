import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { AnamneseInput } from '../types';
import { buildAutomaticCare } from '../care/automaticCare';
import type { DailyEnergyPlan } from '../care/dailyEnergySchedule';
import { getAdminEntitlementForIntake } from '../services/entitlementBackend';
import { loadCareCompositionReview } from '../services/compositionBackend';
import { EnergyProgrammingPanel } from './EnergyProgrammingPanel';

interface EnergyProgrammingAdminSectionProps {
  anamnese: AnamneseInput;
  backendIntakeId?: string;
}

export function EnergyProgrammingAdminSection({ anamnese, backendIntakeId }: EnergyProgrammingAdminSectionProps) {
  const [schedule, setSchedule] = useState<DailyEnergyPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!backendIntakeId) {
        setSchedule([]);
        setMessage('Abra uma anamnese real do backend para gerar o roteiro operacional.');
        return;
      }

      setLoading(true);
      setMessage('');
      try {
        const [review, entitlement] = await Promise.all([
          loadCareCompositionReview(backendIntakeId),
          getAdminEntitlementForIntake(backendIntakeId),
        ]);
        if (!active) return;

        const savedSchedule = review?.manualComposition?.dailyEnergySchedule;
        if (savedSchedule?.length) {
          setSchedule(savedSchedule);
          setMessage(review?.status === 'approved'
            ? 'Roteiro montado a partir da composição aprovada desta pessoa.'
            : 'Roteiro montado a partir do rascunho salvo desta pessoa.');
          return;
        }

        if (entitlement) {
          const automatic = buildAutomaticCare(anamnese, entitlement.days).report.dailyEnergySchedule;
          setSchedule(automatic);
          setMessage('Roteiro provisório montado a partir do percurso automático. Salve sua revisão no Cuidado para atualizar aqui.');
          return;
        }

        setSchedule([]);
        setMessage('Confirme o plano da pessoa para que o ADM monte o roteiro de programação energética.');
      } catch (error) {
        if (!active) return;
        setSchedule([]);
        setMessage(error instanceof Error ? error.message : 'Não foi possível carregar o roteiro de programação energética.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [anamnese, backendIntakeId, refreshKey]);

  return (
    <div id="roteiro-programacao-energetica" className="mx-auto max-w-6xl px-4 pt-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-stone-100">Acesso rápido ao roteiro</div>
          <div className="mt-1 text-xs text-stone-500">{loading ? 'Atualizando roteiro...' : message}</div>
        </div>
        <button type="button" onClick={() => setRefreshKey(value => value + 1)} disabled={loading} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-stone-700 px-3 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Atualizar
        </button>
      </div>
      <EnergyProgrammingPanel personName={anamnese.nomePessoa || 'Interagente'} schedule={schedule} />
    </div>
  );
}
