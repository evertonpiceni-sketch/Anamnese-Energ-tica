import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import type { CommercialEntitlement } from '../commercial/entitlements';
import { canAccessFullReport } from '../commercial/entitlements';
import type { FullReportPublication } from '../services/fullReportBackend';
import { loadOwnFullReport } from '../services/fullReportBackend';
import { FullReportApprovedView } from './FullReportApprovedView';
import { downloadFullReportPdf } from '../pdf/fullReportPdf';

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
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setPublication(null);
    setMessage('');

    if (!allowed) return () => { active = false; };

    setLoading(true);
    loadOwnFullReport(intakeId)
      .then(result => {
        if (!active) return;
        setPublication(result);
      })
      .catch(error => {
        if (!active) return;
        setMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar seu relatório completo agora.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [allowed, intakeId]);

  if (!allowed) return null;

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 text-sm text-[#657168]">
        Preparando a visualização do seu relatório completo...
      </section>
    );
  }

  if (!publication) {
    return (
      <section className="rounded-[2rem] border border-[#dfcf9d] bg-[#fff6df] p-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#a18443]" />
          <div>
            <h2 className="font-serif text-xl text-[#173c2c]">Relatório completo incluído</h2>
            <p className="mt-2 text-sm leading-6 text-[#715f36]">
              Seu plano dá acesso ao relatório completo. Ele aparecerá aqui assim que a composição for revisada e a versão final for publicada.
            </p>
            {message && <p className="mt-2 text-xs leading-5 text-[#8a6a57]">{message}</p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-[0.16em] text-[#a18443]">
              RELATÓRIO COMPLETO
            </div>
            <h2 className="mt-2 font-serif text-2xl text-[#173c2c]">
              Sua leitura completa está disponível.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#667268]">
              Esta é a versão completa vinculada à sua anamnese e à composição aprovada para este momento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void downloadFullReportPdf(publication.report)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#cdbc91] bg-white/70 px-5 py-3 font-semibold text-[#53675b] transition hover:bg-white"
          >
            <Download className="h-4 w-4" /> Baixar relatório completo
          </button>
        </div>
      </div>

      <FullReportApprovedView report={publication.report} />
    </section>
  );
}
