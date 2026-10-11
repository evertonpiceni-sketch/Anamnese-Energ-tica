import { supabase } from '../lib/supabase';
import type { FullReportNarrative } from '../result/fullReportNarrative';

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

export async function publishFullReport(params: {
  intakeId: string;
  userId: string;
  report: FullReportNarrative;
}): Promise<FullReportPublication> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('full_report_publications')
    .upsert(
      {
        intake_id: params.intakeId,
        user_id: params.userId,
        report_json: params.report,
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
  return data ? mapPublication(data) : null;
}

export async function loadFullReportForAdmin(
  intakeId: string
): Promise<FullReportPublication | null> {
  return loadOwnFullReport(intakeId);
}
