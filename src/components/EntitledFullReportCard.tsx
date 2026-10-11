import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import type { CommercialEntitlement } from '../commercial/entitlements';
import { canAccessFullReport } from '../commercial/entitlements';
import type { FullReportPublication } from '../services/fullReportBackend';
import { loadOwnFullReport } from '../services/fullReportBackend';
import type { FullReportNarrative } from '../result/fullReportNarrative';
import { buildFullReportNarrative } from '../result/fullReportNarrative';
import { FullReportApprovedView } from './FullReportApprovedView';
import { downloadFullReportPdf } from '../pdf/fullReportPdf';
import { executarAnaliseIntegrativa } from '../engine/analysisEngine';
import { BIBLIOTECA_MESTRA } from '../data/bibliotecaMestra';
import type { AnamneseInput } from '../types';
import { supabase } from '../lib/supabase';

type TestIntakeRow = {
  id: string;
  external_ref: string | null;
  person_name: string | null;
  age_text: string | null;
  contact_text: string | null;
  answers: Record<string, number> | null;
  free_text_need: string | null;
  free_text_challenges: string | null;
  free_text_strengths: string | null;
  body_regions: string[] | null;
  declared_intention: string | null;
  service_preferences: string | null;
  energetic_sensitivity: AnamneseInput['sensibilidadeEnergetica'] | null;
  completed_at: string | null;
};

function buildLiveTestReport(row: TestIntakeRow): FullReportNarrative {
  const intake: AnamneseInput = {
    id: row.external_ref || row.id,
    data: row.completed_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    nomePessoa: row.person_name || '',
    idade: row.age_text || '',
    contato: row.contact_text || '',
    historicoEnergetico: '',
    intencaoDeclarada: row.declared_intention || '',
    respostasObjetivas: row.answers || {},
    relatoLivreNecessidade: row.free_text_need || '',
    relatoLivreDesafios: row.free_text_challenges || '',
    relatoLivrePreservado: row.free_text_strengths || '',
    regioesCorporaisPercebidas: row.body_regions || [],
    preferenciasAtendimento: row.service_preferences || '',
    sensibilidadeEnergetica: row.energetic_sensitivity || 'moderada',
  };

  const analysis = executarAnaliseIntegrativa(intake, BIBLIOTECA_MESTRA);
  return buildFullReportNarrative({ intake, analysis, composition: null });
}

export function EntitledFullReportCard({
  intakeId,
  entitlement,
}: {
  intakeId: string;
  entitlement: CommercialEntitlement | null;
}) {
  const allowed = canAccessFullReport(entitlement);
  const isOneRealTest = entitlement?.paidAmountCents === 100;
  const [publication, setPublication] = useState<FullReportPublication | null>(null);
  const [testReport, setTestReport] = useState<FullReportNarrative | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setPublication(null);
    setTestReport(null);
    setMessage('');

    if (!allowed) return () => { active = false; };

    setLoading(true);
    loadOwnFullReport(intakeId)
      .then(async result => {
        if (!active) return;
        setPublication(result);

        if (!result && isOneRealTest) {
          const { data, error } = await supabase
            .from('intake_sessions')
            .select('id,external_ref,person_name,age_text,contact_text,answers,free_text_need,free_text_challenges,free_text_strengths,body_regions,declared_intention,service_preferences,energetic_sensitivity,completed_at')
            .eq('id', intakeId)
            .maybeSingle();

          if (!active) return;
          if (error) throw error;
          if (data) setTestReport(buildLiveTestReport(data as TestIntakeRow));
        }
      })
      .catch(error => {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : 'Não foi possível carregar seu relatório completo agora.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [allowed, intakeId, isOneRealTest]);

  if (!allowed) return null;

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 text-sm text-[#657168]">
        Preparando a visualização do seu relatório completo...
      </section>
    );
  }

  const report = publication?.report || testReport;

  if (!report) {
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
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-[#d5c18b] bg-[linear-gradient(135deg,#fffaf0_0%,#f5edd9_55%,#edf2e8_100%)] p-6 shadow-xl shadow-[#173f2d]/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#b89546]/20" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-[#bfd0bc]/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-[0.18em] text-[#9a7838]">LEITURA DO SEU MOMENTO</div>
            <h2 className="mt-2 font-serif text-3xl leading-tight text-[#173c2c]">Sua leitura completa está disponível.</h2>
            <p className="mt-3 text-sm leading-7 text-[#5d6d63]">
              {publication
                ? 'Esta é a leitura vinculada à sua anamnese e à composição aprovada para este momento.'
                : 'Esta leitura de validação agora usa o mesmo motor da anamnese: cruza suas respostas, relatos, padrões, prioridades e recursos em vez de exibir um texto fixo de teste.'}
            </p>
          </div>
          <button type="button" onClick={() => void downloadFullReportPdf(report)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#173f2d] px-5 py-3 font-semibold text-white shadow-md transition hover:bg-[#22533d]">
            <Download className="h-4 w-4" /> Baixar relatório completo
          </button>
        </div>
      </div>

      <FullReportApprovedView report={report} />
    </section>
  );
}
