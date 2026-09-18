const DB_NAME = 'anamnese-integrativa-audios';
const DB_VERSION = 1;
const STORE_NAME = 'personalized-audios';

export interface StoredPersonalizedAudio {
  planId: string;
  anamneseId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  blob: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'planId' });
        store.createIndex('anamneseId', 'anamneseId', { unique: false });
        store.createIndex('userId', 'userId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePersonalizedAudio(params: {
  planId: string;
  anamneseId: string;
  userId: string;
  file: File;
}): Promise<StoredPersonalizedAudio> {
  const db = await openDb();

  const record: StoredPersonalizedAudio = {
    planId: params.planId,
    anamneseId: params.anamneseId,
    userId: params.userId,
    fileName: params.file.name,
    mimeType: params.file.type || 'audio/mpeg',
    size: params.file.size,
    uploadedAt: new Date().toISOString(),
    blob: params.file,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
  return record;
}

export async function getPersonalizedAudio(planId: string): Promise<StoredPersonalizedAudio | null> {
  const db = await openDb();

  const record = await new Promise<StoredPersonalizedAudio | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(planId);
    request.onsuccess = () => resolve((request.result as StoredPersonalizedAudio) || null);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return record;
}

export async function removePersonalizedAudio(planId: string): Promise<void> {
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(planId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}

export async function createPersonalizedAudioObjectUrl(planId: string): Promise<{
  url: string;
  record: StoredPersonalizedAudio;
} | null> {
  const record = await getPersonalizedAudio(planId);
  if (!record) return null;

  return {
    url: URL.createObjectURL(record.blob),
    record,
  };
}
