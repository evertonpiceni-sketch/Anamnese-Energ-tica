import { supabase } from '../lib/supabase';

export interface RemotePracticeLog {
  id: string;
  carePlanId: string;
  startedAt: string;
  completedAt: string | null;
  perceptionBefore: number | null;
  perceptionAfter: number | null;
  observation: string | null;
  status: 'started' | 'completed';
  audioTitle: string | null;
}

type PracticeLogRow = {
  id: string;
  care_plan_id: string;
  started_at: string;
  completed_at: string | null;
  perception_before: number | null;
  perception_after: number | null;
  observation: string | null;
  status: 'started' | 'completed';
  care_plans: { audio_title: string | null } | Array<{ audio_title: string | null }> | null;
};

export async function startPractice(params: {
  carePlanId: string;
  before?: number | null;
}): Promise<string> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('practice_logs')
    .insert({
      user_id: authData.user.id,
      care_plan_id: params.carePlanId,
      perception_before: params.before ?? null,
      status: 'started',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function updatePracticeBefore(params: {
  practiceId: string;
  before: number;
}) {
  const { error } = await supabase
    .from('practice_logs')
    .update({ perception_before: params.before })
    .eq('id', params.practiceId);

  if (error) throw error;
}

export async function completePractice(params: {
  practiceId: string;
  before?: number | null;
  after?: number | null;
  observation?: string;
}) {
  const { error } = await supabase
    .from('practice_logs')
    .update({
      completed_at: new Date().toISOString(),
      perception_before: params.before ?? null,
      perception_after: params.after ?? null,
      observation: params.observation?.trim() || null,
      status: 'completed',
    })
    .eq('id', params.practiceId);

  if (error) throw error;
}

export async function listOwnPracticeLogs(limit = 10): Promise<RemotePracticeLog[]> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('practice_logs')
    .select(
      'id,care_plan_id,started_at,completed_at,perception_before,perception_after,observation,status,care_plans(audio_title)'
    )
    .eq('user_id', authData.user.id)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return ((data || []) as PracticeLogRow[]).map(item => {
    const relatedPlan = Array.isArray(item.care_plans)
      ? item.care_plans[0] || null
      : item.care_plans;

    return {
      id: item.id,
      carePlanId: item.care_plan_id,
      startedAt: item.started_at,
      completedAt: item.completed_at,
      perceptionBefore: item.perception_before,
      perceptionAfter: item.perception_after,
      observation: item.observation,
      status: item.status,
      audioTitle: relatedPlan?.audio_title || null,
    };
  });
}
