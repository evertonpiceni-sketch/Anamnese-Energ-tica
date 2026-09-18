import { supabase } from '../lib/supabase';

export type AudioGenerationStatus =
  | 'script_draft'
  | 'awaiting_script_approval'
  | 'script_approved'
  | 'awaiting_voice_provider'
  | 'generating_voice'
  | 'narration_ready'
  | 'awaiting_mix'
  | 'mix_ready'
  | 'awaiting_final_review'
  | 'ready_to_publish'
  | 'published'
  | 'failed'
  | 'cancelled';

export interface AudioGenerationJob {
  id: string;
  carePlanId: string;
  userId: string;
  intakeId: string;
  audioPlanId: string;
  status: AudioGenerationStatus;
  spokenScript: string;
  voiceProvider: string | null;
  voiceId: string | null;
  narrationStoragePath: string | null;
  finalStoragePath: string | null;
  solfeggioHz: number | null;
  mixNotes: string;
  adminNotes: string;
  lastError: string | null;
  scriptApprovedAt: string | null;
  finalApprovedAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

function mapJob(data: any): AudioGenerationJob {
  return {
    id: data.id,
    carePlanId: data.care_plan_id,
    userId: data.user_id,
    intakeId: data.intake_id,
    audioPlanId: data.audio_plan_id,
    status: data.status,
    spokenScript: data.spoken_script || '',
    voiceProvider: data.voice_provider,
    voiceId: data.voice_id,
    narrationStoragePath: data.narration_storage_path,
    finalStoragePath: data.final_storage_path,
    solfeggioHz: data.solfeggio_hz,
    mixNotes: data.mix_notes || '',
    adminNotes: data.admin_notes || '',
    lastError: data.last_error,
    scriptApprovedAt: data.script_approved_at,
    finalApprovedAt: data.final_approved_at,
    publishedAt: data.published_at,
    updatedAt: data.updated_at,
  };
}

export function buildInitialSpokenScript(params: {
  firstName: string;
  intention: string;
}): string {
  const firstName = params.firstName.trim() || 'você';
  const intention = params.intention.trim();

  return [
    `Olá, ${firstName}. Este momento foi preparado especialmente para você.`,
    '',
    'Encontre uma posição confortável e permita que o corpo se acomode sem esforço.',
    'Respire de forma tranquila. Não é preciso apressar nada.',
    '',
    intention || 'Permita-se apenas estar presente neste momento.',
    '',
    'Você não precisa produzir nenhuma sensação específica.',
    'Apenas perceba o que acontece em você enquanto permanece presente e receptivo ao cuidado.',
    '',
    'Fique alguns instantes em silêncio, acompanhando a própria respiração e deixando o corpo encontrar o ritmo que for possível agora.',
    '',
    'Quando sentir que é o momento, perceba novamente o corpo, o ambiente ao seu redor e a sua respiração.',
    'Leve consigo somente o que fizer sentido para você neste momento.',
  ].join('\n');
}

export async function ensureAudioGenerationJob(params: {
  audioPlanId: string;
  firstName: string;
  intention: string;
  solfeggioHz?: number | null;
}): Promise<AudioGenerationJob> {
  const { data: existing, error: existingError } = await supabase
    .from('audio_generation_jobs')
    .select('*')
    .eq('audio_plan_id', params.audioPlanId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return mapJob(existing);

  const { data: carePlan, error: carePlanError } = await supabase
    .from('care_plans')
    .select('id,user_id,intake_id')
    .eq('audio_plan_id', params.audioPlanId)
    .single();

  if (carePlanError) throw carePlanError;

  const spokenScript = buildInitialSpokenScript({
    firstName: params.firstName,
    intention: params.intention,
  });

  const { data, error } = await supabase
    .from('audio_generation_jobs')
    .insert({
      care_plan_id: carePlan.id,
      user_id: carePlan.user_id,
      intake_id: carePlan.intake_id,
      audio_plan_id: params.audioPlanId,
      status: 'script_draft',
      spoken_script: spokenScript,
      solfeggio_hz: params.solfeggioHz || null,
    })
    .select('*')
    .single();

  if (error) throw error;

  await createVersion(data);
  return mapJob(data);
}

async function createVersion(job: any) {
  const { error } = await supabase
    .from('audio_generation_job_versions')
    .insert({
      job_id: job.id,
      status: job.status,
      spoken_script: job.spoken_script || '',
      voice_provider: job.voice_provider,
      voice_id: job.voice_id,
      narration_storage_path: job.narration_storage_path,
      final_storage_path: job.final_storage_path,
      solfeggio_hz: job.solfeggio_hz,
      mix_notes: job.mix_notes,
      admin_notes: job.admin_notes,
    });

  if (error) throw error;
}

export async function saveAudioScript(params: {
  jobId: string;
  spokenScript: string;
  adminNotes?: string;
  approve?: boolean;
}): Promise<AudioGenerationJob> {
  const now = new Date().toISOString();
  const status: AudioGenerationStatus = params.approve
    ? 'awaiting_voice_provider'
    : 'script_draft';

  const { data, error } = await supabase
    .from('audio_generation_jobs')
    .update({
      spoken_script: params.spokenScript,
      admin_notes: params.adminNotes || null,
      status,
      script_approved_at: params.approve ? now : null,
      last_error: null,
      updated_at: now,
    })
    .eq('id', params.jobId)
    .select('*')
    .single();

  if (error) throw error;

  await createVersion(data);
  return mapJob(data);
}

export async function markAudioGenerationPublished(params: {
  audioPlanId: string;
  finalStoragePath: string;
}): Promise<void> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('audio_generation_jobs')
    .update({
      status: 'published',
      final_storage_path: params.finalStoragePath,
      final_approved_at: now,
      published_at: now,
      updated_at: now,
    })
    .eq('audio_plan_id', params.audioPlanId)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  if (data) await createVersion(data);
}

export async function getAudioGenerationJob(
  audioPlanId: string
): Promise<AudioGenerationJob | null> {
  const { data, error } = await supabase
    .from('audio_generation_jobs')
    .select('*')
    .eq('audio_plan_id', audioPlanId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapJob(data) : null;
}
