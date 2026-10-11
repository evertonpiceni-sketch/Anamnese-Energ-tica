import { useEffect, useMemo, useState } from 'react';
import { CreditCard, RefreshCcw, X } from 'lucide-react';
import {
  AdminIntakeRecord,
  listRecentCompletedIntakesForAdmin,
} from '../services/adminIntakeBackend';
import {
  confirmCommercialPaymentAsAdmin,
  getAdminEntitlementForIntake,
} from '../services/entitlementBackend';
import type { CommercialEntitlement } from '../commercial/entitlements';

type CommercialAmount = 1500 | 5000 | 6500 | 10000 | 18000;

const OPTIONS: Array<{ amount: CommercialAmount; label: string; detail: string }> = [
  { amount: 5000, label: 'R$ 50', detail: '7 dias • áudio personalizado sem meditação guiada' },
  { amount: 6500, label: 'R$ 65', detail: 'R$ 50 + relatório completo' },
  { amount: 10000, label: 'R$ 100', detail: '7 dias • meditação guiada + relatório completo' },
  { amount: 18000, label: 'R$ 180', detail: '21 dias • percurso aprofundado + relatório completo' },
];

function entitlementLabel(value: CommercialEntitlement | null) {
  if (!value) return 'Nenhum pagamento confirmado';
  if (value.productCode === 'CARE_21') return 'R$ 180 • 21 dias';
  if (value.productCode === 'CARE_7_GUIDED') return 'R$ 100 • 7 dias com meditação guiada';
  if (value.fullReportAddonPaid) return 'R$ 65 • 7 dias + relatório completo';
  return 'R$ 50 • 7 dias';
}

export function AdminCommercialPaymentPanel() {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState<AdminIntakeRecord[]>([]);
  const [selectedIntakeId, setSelectedIntakeId] = useState('');
  const [entitlement, setEntitlement] = useState<CommercialEntitlement | null>(null);
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const selected = useMemo(
    () => records.find(item => item.intakeId === selectedIntakeId) || null,
    [records, selectedIntakeId]
  );

  async function loadRecords() {
    setLoading(true);
    setMessage('');
    try {
      const next = await listRecentCompletedIntakesForAdmin(25);
      setRecords(next);
      const nextId = selectedIntakeId && next.some(item => item.intakeId === selectedIntakeId)
        ? selectedIntakeId
        : next[0]?.intakeId || '';
      setSelectedIntakeId(nextId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível carregar as anamneses.');
    } finally {
      setLoading(false);
    }
  }

  async function loadEntitlement(intakeId: string) {
    if (!intakeId) {
      setEntitlement(null);
      return;
    }
    try {
      setEntitlement(await getAdminEntitlementForIntake(intakeId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível carregar o plano comercial.');
    }
  }

  useEffect(() => {
    if (!open) return;
    void loadRecords();
  }, [open]);

  useEffect(() => {
    if (!open || !selectedIntakeId) return;
    void loadEntitlement(selectedIntakeId);
  }, [open, selectedIntakeId]);

  async function confirm(amount: CommercialAmount) {
    if (!selected) return;

    const option = amount === 1500
      ? { label: '+ R$ 15', detail: 'liberar relatório completo no plano básico' }
      : OPTIONS.find(item => item.amount === amount);
    if (!option) return;

    const ok = window.confirm(
      `Confirmar pagamento recebido de ${option.label} para ${selected.intake.nomePessoa || 'esta pessoa'}?\n\n${option.detail}`
    );
    if (!ok) return;

    setLoading(true);
    setMessage('');
    try {
      const updated = await confirmCommercialPaymentAsAdmin({
        intakeId: selected.intakeId,
        amountCents: amount,
        paymentReference: reference,
      });
      setEntitlement(updated);
      setMessage('Pagamento confirmado e acesso comercial atualizado.');
      setReference('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível confirmar o pagamento.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[80] inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-stone-950 px-4 py-3 text-xs font-bold text-amber-300 shadow-2xl"
        title="Controle comercial"
      >
        <CreditCard className="h-4 w-4" /> Comercial
      </button>
    );
  }

  return (
    <aside className="fixed bottom-5 right-5 z-[80] w-[min(92vw,430px)] rounded-2xl border border-stone-700 bg-stone-950 p-5 text-stone-100 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">Controle comercial</div>
          <h2 className="mt-1 text-lg font-bold">Confirmar pagamento</h2>
          <p className="mt-1 text-xs leading-5 text-stone-400">Somente para pagamento já conferido. Não cria cobrança.</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-stone-400">Anamnese real do backend</span>
          <select
            value={selectedIntakeId}
            onChange={event => setSelectedIntakeId(event.target.value)}
            className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
          >
            {!records.length && <option value="">Nenhuma anamnese concluída</option>}
            {records.map(record => (
              <option key={record.intakeId} value={record.intakeId}>
                {record.intake.nomePessoa || 'Sem nome'} • {record.completedAt?.slice(0, 10) || 'sem data'}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-3">
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Situação atual</div>
          <div className="mt-1 text-sm font-semibold text-stone-200">{entitlementLabel(entitlement)}</div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-stone-400">Referência do pagamento</span>
          <input
            value={reference}
            onChange={event => setReference(event.target.value)}
            placeholder="Opcional: ID Pix, cobrança, recibo..."
            className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          {OPTIONS.map(option => (
            <button
              key={option.amount}
              type="button"
              disabled={loading || !selected}
              onClick={() => void confirm(option.amount)}
              className="rounded-xl border border-stone-700 bg-stone-900 p-3 text-left transition hover:border-amber-500/60 hover:bg-stone-800 disabled:opacity-40"
            >
              <div className="font-bold text-amber-300">{option.label}</div>
              <div className="mt-1 text-[11px] leading-4 text-stone-400">{option.detail}</div>
            </button>
          ))}
        </div>

        {entitlement?.productCode === 'CARE_7_BASIC' && !entitlement.fullReportAddonPaid && (
          <button
            type="button"
            disabled={loading || !selected}
            onClick={() => void confirm(1500)}
            className="w-full rounded-xl border border-emerald-700/60 bg-emerald-950/30 p-3 text-left text-sm font-semibold text-emerald-300 disabled:opacity-40"
          >
            + R$ 15 • liberar Relatório Completo neste plano básico
          </button>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadRecords()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white disabled:opacity-40"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Atualizar
          </button>
          {message && <div className="text-right text-xs leading-5 text-amber-200">{message}</div>}
        </div>
      </div>
    </aside>
  );
}
