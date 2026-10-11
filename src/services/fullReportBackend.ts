import { applyConfirmedJourney } from '../result/confirmedJourney';
import { getCurrentUserEntitlementForIntake } from './entitlementBackend';
import { supabase } from '../lib/supabase';
import type { FullReportNarrative } from '../result/fullReportNarrative';
import { narrativeSource } from '../result/answerEvidence';
import type { AnamneseInput } from '../types';
import { PERGUNTAS_ANAMNESE } from '../data/questions';

async function loadNarrativeIntake(intakeId: string): Promise<AnamneseInput> {
  const { data, error } = await supabase.from('intake_sessions')
    .select('id,external_ref,person_name,answers,declared_intention,free_text_need,free_text_challenges,free_text_strengths,body_regions,energetic_sensitivity')
    .eq('id', intakeId).single();
  if (error) throw error;
  return {
    id: data.external_ref || data.id, data: '', nomePessoa: data.person_name || '',
    respostasObjetivas: data.answers || {}, intencaoDeclarada: data.declared_intention || '',
    relatoLivreNecessidade: data.free_text_need || '', relatoLivreDesafios: data.free_text_challenges || '',
    relatoLivrePreservado: data.free_text_strengths || '', regioesCorporaisPercebidas: data.body_regions || [],
    sensibilidadeEnergetica: data.energetic_sensitivity || 'moderada',
  };
}

export interface FullReportPublication {
  id: string;
  intakeId: string;
  userId: string;
  report: FullReportNarrative;
  publishedAt: string;
  updatedAt: string;
}

function mapPublication(data: any): FullReportPublication {
  return {
    id: data.id,
    intakeId: data.intake_id,
    userId: data.user_id,
    report: data.report_json as FullReportNarrative,
    publishedAt: data.published_at,
    updatedAt: data.updated_at,
  };
}

export async function validateFullReportSource(intakeId: string, report: FullReportNarrative): Promise<void> {
  const intake = await loadNarrativeIntake(intakeId);
  const expected = narrativeSource(intake);
  if (report.source?.generatorVersion !== expected.generatorVersion || report.source.fingerprint !== expected.fingerprint || report.source.intakeId !== expected.intakeId) {
    throw new Error('O relatório não corresponde às respostas salvas desta anamnese. Reabra e gere a leitura novamente antes de publicar.');
  }
  if (PERGUNTAS_ANAMNESE.some(question => {
    const answer = intake.respostasObjetivas[question.id];
    return !Number.isInteger(answer) || answer < 0 || answer > 4;
  })) throw new Error('Conclua todas as respostas da anamnese antes de publicar o relatório.');
}

export async function publishFullReport(params: {
  intakeId: string;
  userId: string;
  report: FullReportNarrative;
}): Promise<FullReportPublication> {
  await validateFullReportSource(params.intakeId, params.report);
  const entitlement = await getCurrentUserEntitlementForIntake(params.intakeId);
  const report = entitlement ? applyConfirmedJourney(params.report, entitlement.days) : params.report;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('full_report_publications')
    .upsert(
      {
        intake_id: params.intakeId,
        user_id: params.userId,
        report_json: report,
        published_at: now,
        updated_at: now,
      },
      { onConflict: 'intake_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return mapPublication(data);
}

export async function loadOwnFullReport(
  intakeId: string
): Promise<FullReportPublication | null> {
  const { data, error } = await supabase
    .from('full_report_publications')
    .select('*')
    .eq('intake_id', intakeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const publication = mapPublication(data);
  const intake = await loadNarrativeIntake(intakeId);
  const expected = narrativeSource(intake);
  if (publication.report.source?.generatorVersion !== expected.generatorVersion || publication.report.source.fingerprint !== expected.fingerprint || publication.report.source.intakeId !== expected.intakeId) {
    const [{ executarAnaliseIntegrativa }, { refreshReportReading }] = await Promise.all([
      import('../engine/analysisEngine'), import('../result/fullReportNarrative'),
    ]);
    publication.report = refreshReportReading(publication.report, intake, executarAnaliseIntegrativa(intake));
  }
  const entitlement = await getCurrentUserEntitlementForIntake(intakeId);
  return entitlement ? { ...publication, report: applyConfirmedJourney(publication.report, entitlement.days) } : publication;
}

export async function loadFullReportForAdmin(
  intakeId: string
): Promise<FullReportPublication | null> {
  return loadOwnFullReport(intakeId);
}
