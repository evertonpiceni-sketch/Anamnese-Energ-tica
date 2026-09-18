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


export async function persistApprovedCarePlan(params: {
  intakeId: string;
  userId: string;
  audioPlanId: string;
  audioTitle: string;
  compositionSignature: string;
  baseSystem: string;
  mainSystem: string;
  complementarySystems: string[];
  internalResources: Record<string, unknown>;
  scriptLines: string[];
  adminNotes: string;
  solfeggio: Record<string, unknown> | null;
  florals: Array<Record<string, unknown>>;
  aromatherapy: Array<Record<string, unknown>>;
  ethericCrystals: Array<Record<string, unknown>>;
  journeyMode?: 'NAO_INDICADO' | 'PREPARACAO' | 'ENTRADA_DIRETA' | 'APOIO_PARALELO';
}) {
  const now = new Date().toISOString();

  await supabase
    .from('care_plans')
    .update({
      status: 'superseded',
      updated_at: now,
    })
    .eq('intake_id', params.intakeId)
    .neq('audio_plan_id', params.audioPlanId)
    .in('status', ['preparing', 'ready', 'active']);

  const { data: carePlan, error: carePlanError } = await supabase
    .from('care_plans')
    .upsert(
      {
        intake_id: params.intakeId,
        user_id: params.userId,
        status: 'preparing',
        audio_plan_id: params.audioPlanId,
        audio_title: params.audioTitle,
        audio_status: 'awaiting_audio',
        solfeggio: params.solfeggio,
        floral: params.florals,
        aromatherapy: params.aromatherapy,
        etheric_crystals: params.ethericCrystals,
        journey_mode: params.journeyMode || 'NAO_INDICADO',
        updated_at: now,
      },
      { onConflict: 'audio_plan_id' }
    )
    .select('id')
    .single();

  if (carePlanError) throw carePlanError;

  const { error: technicalError } = await supabase
    .from('care_plan_technical')
    .upsert(
      {
        care_plan_id: carePlan.id,
        user_id: params.userId,
        composition_signature: params.compositionSignature,
        base_system: params.baseSystem,
        main_system: params.mainSystem,
        complementary_systems: params.complementarySystems,
        internal_resources: params.internalResources,
        script_outline: params.scriptLines,
        admin_notes: params.adminNotes || null,
        updated_at: now,
      },
      { onConflict: 'care_plan_id' }
    );

  if (technicalError) throw technicalError;

  return carePlan.id as string;
}
