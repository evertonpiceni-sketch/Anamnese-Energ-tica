import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, FileText } from 'lucide-react';
import type { CommercialEntitlement } from '../commercial/entitlements';
import { canAccessFullReport } from '../commercial/entitlements';
import type { FullReportPublication } from '../services/fullReportBackend';
import { loadOwnFullReport } from '../services/fullReportBackend';
import { FullReportApprovedView } from './FullReportApprovedView';
import { requestFullReportEmail } from '../services/resultEmail';
export function EntitledFullReportCard({
  intakeId,
  entitlement,
}: {
  intakeId: string;
  entitlement: CommercialEntitlement | null;
}) {
  const allowed = canAccessFullReport(entitlement);
  const [publication, setPublication] = useState<FullReportPublication | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setPublication(null);
    setMessage('');

    if (!allowed) return () => { active = false; };

    setLoading(true);
    loadOwnFullReport(intakeId)
      .then(result => { if (active) setPublication(result); })
      .catch(error => {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : 'Não foi possível carregar seu relatório completo agora.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [allowed, intakeId]);

  if (!allowed) return null;

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 text-sm text-[#657168]">
        Preparando a visualização do seu relatório completo...
      </section>
    );
  }

  const report = publication?.report;

  if (!report) {
    return (
      <section className="rounded-[2rem] border border-[#dfcf9d] bg-[#fff6df] p-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#a18443]" />
          <div>
            <h2 className="font-serif text-xl text-[#173c2c]">Relatório completo incluído</h2>
            <p className="mt-2 text-sm leading-6 text-[#715f36]">
              Seu plano dá acesso ao relatório completo. A leitura será preparada automaticamente a partir das suas respostas.
            </p>
            {message && <p className="mt-2 text-xs leading-5 text-[#8a6a57]">{message}</p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
          <button type="button" disabled={busy} onClick={async () => { setBusy(true); setMessage(''); try { const { downloadFullReportPdf } = await import('../pdf/fullReportPdf'); await downloadFullReportPdf(report); } catch { setMessage('Não foi possível preparar seu PDF. Tente novamente.'); } finally { setBusy(false); } }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#173f2d] px-5 py-3 font-semibold text-white shadow-md transition hover:bg-[#22533d]">
            <Download className="h-4 w-4" /> Baixar relatório completo
          </button>
      </div>

      <button type="button" disabled={busy} onClick={async () => { if (!publication) return; setBusy(true); setMessage(''); try { const userId = publication.userId || (await supabase.auth.getUser()).data.user?.id; if (!userId) throw new Error('Usuário não autenticado.'); const result = await requestFullReportEmail({ userId, intakeId, report, requestedBy: 'user' }); setMessage(result.message); } catch { setMessage('Não foi possível solicitar o envio agora. Tente novamente.'); } finally { setBusy(false); } }} className="rounded-full border border-[#cdbc91] px-5 py-3 text-sm font-semibold disabled:opacity-50">Receber por e-mail</button>
      {message && <p role="status" className="text-sm text-[#715f36]">{message}</p>}
      <FullReportApprovedView report={report} />
    </section>
  );
}
