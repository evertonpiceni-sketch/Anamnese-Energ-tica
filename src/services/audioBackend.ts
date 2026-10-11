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
  planStatus: string;
  audioStatus: string;
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mapCarePlan(data: any): RemotePersonalizedAudio {
  return {
    carePlanId: data.id,
    audioPlanId: data.audio_plan_id,
    userId: data.user_id,
    intakeId: data.intake_id,
    storagePath: data.audio_storage_path,
    title: data.audio_title,
    planStatus: data.status,
    audioStatus: data.audio_status,
    durationSeconds: data.audio_duration_seconds,
    updatedAt: data.updated_at,
  };
}

export async function getCarePlanByAudioPlanId(
  audioPlanId: string
): Promise<RemotePersonalizedAudio | null> {
  const { data, error } = await supabase
    .from('care_plans')
    .select(
      'id,status,audio_plan_id,user_id,intake_id,audio_storage_path,audio_title,audio_status,audio_duration_seconds,updated_at'
    )
    .eq('audio_plan_id', audioPlanId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.audio_storage_path) return null;

  return mapCarePlan(data);
}

async function getApprovedCarePlanForUpload(audio: PersonalizedAudioPlan) {
  const { data, error } = await supabase
    .from('care_plans')
    .select(
      'id,status,audio_plan_id,user_id,intake_id,audio_storage_path,audio_title,audio_status,audio_duration_seconds,updated_at'
    )
    .eq('audio_plan_id', audio.id)
    .eq('user_id', audio.userId)
    .eq('intake_id', audio.anamneseId)
    .neq('status', 'superseded')
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('A composição precisa estar aprovada no ADM antes do upload do áudio.');
  }

  return data;
}

export async function uploadPersonalizedAudio(params: {
  audio: PersonalizedAudioPlan;
  file: File;
  durationSeconds?: number | null;
}): Promise<RemotePersonalizedAudio> {
  const { audio, file, durationSeconds } = params;

  if (!isUuid(audio.userId) || !isUuid(audio.anamneseId)) {
    throw new Error('Este áudio não possui vínculo válido com usuário e anamnese do backend.');
  }

  const approvedPlan = await getApprovedCarePlanForUpload(audio);
  const extension = safeExtension(file);
  const storagePath = `${audio.userId}/${audio.anamneseId}/${audio.id}/sessao.${extension}`;
  const previousStoragePath = approvedPlan.audio_storage_path as string | null;

  const { error: uploadError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || 'audio/mpeg',
      upsert: true,
      cacheControl: '3600',
    });

  if (uploadError) throw uploadError;

  const now = new Date().toISOString();
  const { data, error: planError } = await supabase
    .from('care_plans')
    .update({
      status: 'ready',
      audio_title: audio.titulo,
      audio_status: 'published',
      audio_storage_path: storagePath,
      audio_duration_seconds:
        durationSeconds === undefined || durationSeconds === null
          ? approvedPlan.audio_duration_seconds ?? null
          : Math.max(0, Math.round(durationSeconds)),
      solfeggio: audio.solfeggio
        ? {
            hz: audio.solfeggio.hz,
            chakraProjeto: audio.solfeggio.chakraProjeto,
            intencaoProjeto: audio.solfeggio.intencaoProjeto,
          }
        : null,
      published_at: now,
      updated_at: now,
    })
    .eq('id', approvedPlan.id)
    .eq('audio_plan_id', audio.id)
    .eq('user_id', audio.userId)
    .eq('intake_id', audio.anamneseId)
    .select(
      'id,status,audio_plan_id,user_id,intake_id,audio_storage_path,audio_title,audio_status,audio_duration_seconds,updated_at'
    )
    .single();

  if (planError) {
    if (!previousStoragePath || previousStoragePath !== storagePath) {
      await supabase.storage.from(AUDIO_BUCKET).remove([storagePath]);
    }
    throw planError;
  }

  if (previousStoragePath && previousStoragePath !== storagePath) {
    const { error: cleanupError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([previousStoragePath]);

    if (cleanupError) {
      console.warn('Não foi possível remover a versão anterior do áudio.', cleanupError);
    }
  }

  return mapCarePlan(data);
}

export async function removePersonalizedAudioRemote(
  audioPlanId: string
): Promise<void> {
  const existing = await getCarePlanByAudioPlanId(audioPlanId);
  if (!existing) return;

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
    .eq('id', existing.carePlanId)
    .eq('audio_plan_id', existing.audioPlanId)
    .eq('user_id', existing.userId)
    .eq('intake_id', existing.intakeId);

  if (planError) throw planError;

  const { error: storageError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .remove([existing.storagePath]);

  if (storageError) {
    console.warn('Plano despublicado, mas o arquivo antigo não pôde ser removido do Storage.', storageError);
  }
}

export async function createPrivateAudioPlaybackUrl(
  audioPlanId: string,
  expiresInSeconds = 60 * 60
): Promise<{
  url: string;
  carePlan: RemotePersonalizedAudio;
} | null> {
  const carePlan = await getCarePlanByAudioPlanId(audioPlanId);
  if (
    !carePlan ||
    carePlan.audioStatus !== 'published' ||
    carePlan.planStatus === 'superseded'
  ) {
    return null;
  }

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

export async function downloadPrivatePersonalizedAudio(
  audioPlanId: string,
  fallbackTitle = 'audio-exclusivo'
): Promise<void> {
  const carePlan = await getCarePlanByAudioPlanId(audioPlanId);
  if (
    !carePlan ||
    carePlan.audioStatus !== 'published' ||
    carePlan.planStatus === 'superseded'
  ) {
    throw new Error('Este áudio ainda não está disponível para download.');
  }

  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .download(carePlan.storagePath);

  if (error) throw error;
  if (!data) throw new Error('Arquivo de áudio não encontrado.');

  const extension = carePlan.storagePath.split('.').pop() || 'mp3';
  const safeTitle = (carePlan.title || fallbackTitle)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'audio-exclusivo';

  const url = URL.createObjectURL(data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeTitle}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
