import { supabase } from '../lib/supabase';

export type CompositionReviewStatus = 'draft' | 'approved' | 'superseded';

export interface ManualCareComposition {
  baseSystemId: string;
  mainSystemId: string;
  complementSystemIds: string[];
  solfeggioId: string | null;
  floralIds: string[];
  aromatherapyIds: string[];
  crystalIds: string[];
  audioIntention: string;
  scriptLines: string[];
}

export interface CareCompositionReview {
  id: string;
  intakeId: string;
  userId: string;
  status: CompositionReviewStatus;
  engineSnapshot: Record<string, unknown>;
  manualComposition: ManualCareComposition;
  adminNotes: string;
  approvedAt: string | null;
  updatedAt: string;
}

export async function loadCareCompositionReview(
  intakeId: string
): Promise<CareCompositionReview | null> {
  const { data, error } = await supabase
    .from('care_composition_reviews')
    .select('*')
    .eq('intake_id', intakeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    intakeId: data.intake_id,
    userId: data.user_id,
    status: data.status,
    engineSnapshot: data.engine_snapshot || {},
    manualComposition: data.manual_composition as ManualCareComposition,
    adminNotes: data.admin_notes || '',
    approvedAt: data.approved_at,
    updatedAt: data.updated_at,
  };
}

export async function saveCareCompositionReview(params: {
  intakeId: string;
  userId: string;
  engineSnapshot: Record<string, unknown>;
  manualComposition: ManualCareComposition;
  adminNotes: string;
  approve?: boolean;
}): Promise<CareCompositionReview> {
  const now = new Date().toISOString();
  const status: CompositionReviewStatus = params.approve ? 'approved' : 'draft';

  const { data, error } = await supabase
    .from('care_composition_reviews')
    .upsert(
      {
        intake_id: params.intakeId,
        user_id: params.userId,
        status,
        engine_snapshot: params.engineSnapshot,
        manual_composition: params.manualComposition,
        admin_notes: params.adminNotes || null,
        approved_at: params.approve ? now : null,
        updated_at: now,
      },
      { onConflict: 'intake_id' }
    )
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    intakeId: data.intake_id,
    userId: data.user_id,
    status: data.status,
    engineSnapshot: data.engine_snapshot || {},
    manualComposition: data.manual_composition as ManualCareComposition,
    adminNotes: data.admin_notes || '',
    approvedAt: data.approved_at,
    updatedAt: data.updated_at,
  };
}
