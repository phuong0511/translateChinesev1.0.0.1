// Lightweight IndexedDB helper for offline novel state persistence
// Uses a single object store `novels` to stash guest-mode projects.

const DB_NAME = 'novel_offline';
const DB_VERSION = 1;
const STORE = 'novels';

type NovelRecord = unknown;

const openDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveNovelsOffline = async (novels: NovelRecord[]) => {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    await Promise.all(novels.map(novel => new Promise((resolve, reject) => {
      const req = store.put(novel);
      req.onsuccess = () => resolve(null);
      req.onerror = () => reject(req.error);
    })));
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(null);
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.warn('Offline save failed:', error);
  }
};

export const loadNovelsOffline = async (): Promise<NovelRecord[]> => {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const request = store.getAll();
    const data: NovelRecord[] = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as NovelRecord[]);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return data || [];
  } catch (error) {
    console.warn('Offline load failed:', error);
    return [];
  }
};
