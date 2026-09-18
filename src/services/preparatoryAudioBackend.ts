import { supabase } from '../lib/supabase';

const BUCKET = 'protocol-audios';
const PREPARATORY_ID = 'preparatory-default';

export interface PreparatoryAudioAsset {
  id: string;
  title: string;
  subtitle: string | null;
  storagePath: string | null;
  durationSeconds: number | null;
  status: 'draft' | 'published' | 'inactive';
  fixedForAllUsers: boolean;
  downloadable: boolean;
  energeticProgramming: {
    support?: string[];
    main_system?: string;
    sequence?: string[];
    fields?: string[];
  };
  publishedAt: string | null;
}

function mapAsset(data: any): PreparatoryAudioAsset {
  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    storagePath: data.storage_path,
    durationSeconds: data.duration_seconds,
    status: data.status,
    fixedForAllUsers: Boolean(data.fixed_for_all_users),
    downloadable: Boolean(data.downloadable),
    energeticProgramming: data.energetic_programming || {},
    publishedAt: data.published_at,
  };
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

export async function getPreparatoryAudioAsset(): Promise<PreparatoryAudioAsset | null> {
  const { data, error } = await supabase
    .from('protocol_audio_assets')
    .select('*')
    .eq('id', PREPARATORY_ID)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAsset(data) : null;
}

export async function createPreparatoryPlaybackUrl(
  expiresInSeconds = 30 * 60
): Promise<{ url: string; asset: PreparatoryAudioAsset } | null> {
  const asset = await getPreparatoryAudioAsset();
  if (!asset || asset.status !== 'published' || !asset.storagePath) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(asset.storagePath, expiresInSeconds);

  if (error) throw error;
  if (!data?.signedUrl) return null;

  return { url: data.signedUrl, asset };
}

export async function uploadPreparatoryAudio(params: {
  file: File;
  durationSeconds?: number | null;
}): Promise<PreparatoryAudioAsset> {
  const extension = safeExtension(params.file);
  const storagePath = `preparatory/${PREPARATORY_ID}.${extension}`;
  const current = await getPreparatoryAudioAsset();

  if (current?.storagePath && current.storagePath !== storagePath) {
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([current.storagePath]);

    if (removeError) throw removeError;
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, params.file, {
      contentType: params.file.type || 'audio/mpeg',
      upsert: true,
      cacheControl: '3600',
    });

  if (uploadError) throw uploadError;

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('protocol_audio_assets')
    .update({
      storage_path: storagePath,
      duration_seconds:
        params.durationSeconds === undefined || params.durationSeconds === null
          ? current?.durationSeconds ?? null
          : Math.max(0, Math.round(params.durationSeconds)),
      status: 'published',
      fixed_for_all_users: true,
      downloadable: false,
      published_at: now,
      updated_at: now,
    })
    .eq('id', PREPARATORY_ID)
    .select('*')
    .single();

  if (error) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw error;
  }

  return mapAsset(data);
}

export async function getAudioDuration(file: File): Promise<number | null> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement('audio');
    audio.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.removeAttribute('src');
      audio.load();
    };

    audio.onloadedmetadata = () => {
      const value = Number.isFinite(audio.duration) ? audio.duration : null;
      cleanup();
      resolve(value);
    };

    audio.onerror = () => {
      cleanup();
      resolve(null);
    };

    audio.src = url;
  });
}
