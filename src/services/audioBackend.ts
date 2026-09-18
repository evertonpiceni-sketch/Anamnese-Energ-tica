import { supabase } from '../lib/supabase';
import { PersonalizedAudioPlan } from '../audio/audioCatalog';

const AUDIO_BUCKET = 'personalized-audios';

export interface RemotePersonalizedAudio {
  carePlanId: string;
  audioPlanId: string;
  userId: string;
  intakeId: string;
  storagePath: string;
  title: string | null;
  status: string;
  durationSeconds: number | null;
  updatedAt?: string;
}

function safeExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;

  const byMime: Record<string, string> = {
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
  };

  return byMime[file.type] || 'audio';
}

export async function getCarePlanByAudioPlanId(
  audioPlanId: string
): Promise<RemotePersonalizedAudio | null> {
  const { data, error } = await supabase
    .from('care_plans')
    .select(
      'id,audio_plan_id,user_id,intake_id,audio_storage_path,audio_title,audio_status,audio_duration_seconds,updated_at'
    )
    .eq('audio_plan_id', audioPlanId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.audio_storage_path) return null;

  return {
    carePlanId: data.id,
    audioPlanId: data.audio_plan_id,
    userId: data.user_id,
    intakeId: data.intake_id,
    storagePath: data.audio_storage_path,
    title: data.audio_title,
    status: data.audio_status,
    durationSeconds: data.audio_duration_seconds,
    updatedAt: data.updated_at,
  };
}

export async function uploadPersonalizedAudio(params: {
  audio: PersonalizedAudioPlan;
  file: File;
  durationSeconds?: number | null;
}): Promise<RemotePersonalizedAudio> {
  const { audio, file, durationSeconds } = params;
  const extension = safeExtension(file);
  const storagePath = `${audio.userId}/${audio.anamneseId}/${audio.id}/sessao.${extension}`;

  const existing = await getCarePlanByAudioPlanId(audio.id);

  if (existing?.storagePath && existing.storagePath !== storagePath) {
    const { error: removeOldError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([existing.storagePath]);

    if (removeOldError) throw removeOldError;
  }

  const { error: uploadError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || 'audio/mpeg',
      upsert: true,
      cacheControl: '3600',
    });

  if (uploadError) throw uploadError;

  const payload = {
    intake_id: audio.anamneseId,
    user_id: audio.userId,
    status: 'ready',
    audio_plan_id: audio.id,
    audio_title: audio.titulo,
    audio_status: 'published',
    audio_storage_path: storagePath,
    audio_duration_seconds:
      durationSeconds === undefined || durationSeconds === null
        ? existing?.durationSeconds ?? null
        : Math.max(0, Math.round(durationSeconds)),
    solfeggio: audio.solfeggio
      ? {
          hz: audio.solfeggio.hz,
          chakraProjeto: audio.solfeggio.chakraProjeto,
          intencaoProjeto: audio.solfeggio.intencaoProjeto,
        }
      : null,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error: planError } = await supabase
    .from('care_plans')
    .upsert(payload, { onConflict: 'audio_plan_id' })
    .select(
      'id,audio_plan_id,user_id,intake_id,audio_storage_path,audio_title,audio_status,audio_duration_seconds,updated_at'
    )
    .single();

  if (planError) {
    await supabase.storage.from(AUDIO_BUCKET).remove([storagePath]);
    throw planError;
  }

  return {
    carePlanId: data.id,
    audioPlanId: data.audio_plan_id,
    userId: data.user_id,
    intakeId: data.intake_id,
    storagePath: data.audio_storage_path,
    title: data.audio_title,
    status: data.audio_status,
    durationSeconds: data.audio_duration_seconds,
    updatedAt: data.updated_at,
  };
}

export async function removePersonalizedAudioRemote(
  audioPlanId: string
): Promise<void> {
  const existing = await getCarePlanByAudioPlanId(audioPlanId);
  if (!existing) return;

  const { error: storageError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .remove([existing.storagePath]);

  if (storageError) throw storageError;

  const { error: planError } = await supabase
    .from('care_plans')
    .update({
      status: 'preparing',
      audio_status: 'awaiting_audio',
      audio_storage_path: null,
      audio_duration_seconds: null,
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.carePlanId);

  if (planError) throw planError;
}

export async function createPrivateAudioPlaybackUrl(
  audioPlanId: string,
  expiresInSeconds = 60 * 60
): Promise<{
  url: string;
  carePlan: RemotePersonalizedAudio;
} | null> {
  const carePlan = await getCarePlanByAudioPlanId(audioPlanId);
  if (!carePlan || carePlan.status !== 'published') return null;

  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(carePlan.storagePath, expiresInSeconds);

  if (error) throw error;
  if (!data?.signedUrl) return null;

  return {
    url: data.signedUrl,
    carePlan,
  };
}

export async function getAudioFileDuration(file: File): Promise<number | null> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const element = document.createElement('audio');
    element.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(url);
      element.removeAttribute('src');
      element.load();
    };

    element.onloadedmetadata = () => {
      const duration = Number.isFinite(element.duration) ? element.duration : null;
      cleanup();
      resolve(duration);
    };

    element.onerror = () => {
      cleanup();
      resolve(null);
    };

    element.src = url;
  });
}
