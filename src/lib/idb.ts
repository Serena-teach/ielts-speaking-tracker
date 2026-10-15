/**
 * 极简 IndexedDB 封装（录音等大文件用）。
 * localStorage 只有 5MB 且存不了 Blob，录音必须放这里。
 */
const DB_NAME = "ielts-speaking-tracker";
const DB_VERSION = 2;
export const STORE_RECORDINGS = "recordings";
export const STORE_KV = "kv";

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_RECORDINGS)) {
        const store = db.createObjectStore(STORE_RECORDINGS, { keyPath: "id" });
        store.createIndex("questionId", "questionId", { unique: false });
      }
      // 用户记录 / 自定义题目也放进来：容量比 localStorage 大得多
      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_RECORDINGS, mode);
    const request = run(transaction.objectStore(STORE_RECORDINGS));
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
}

export type Recording = {
  id: string;
  questionId: string;
  createdAt: number;
  durationMs: number;
  mimeType: string;
  blob: Blob;
};

export function putRecording(recording: Recording): Promise<IDBValidKey> {
  return tx("readwrite", (store) => store.put(recording));
}

export function deleteRecording(id: string): Promise<undefined> {
  return tx("readwrite", (store) => store.delete(id));
}

export async function listRecordings(questionId: string): Promise<Recording[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_RECORDINGS, "readonly");
    const index = transaction.objectStore(STORE_RECORDINGS).index("questionId");
    const request = index.getAll(questionId);
    request.onsuccess = () => {
      const rows = (request.result as Recording[]) ?? [];
      resolve(rows.sort((a, b) => b.createdAt - a.createdAt));
    };
    request.onerror = () => reject(request.error);
  });
}

/** 估算该题录音占用的字节数 */
export async function recordingsSize(questionId?: string): Promise<number> {
  const db = await openDb();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_RECORDINGS, "readonly");
    const store = transaction.objectStore(STORE_RECORDINGS);
    const request = questionId ? store.index("questionId").getAll(questionId) : store.getAll();
    request.onsuccess = () => {
      const rows = (request.result as Recording[]) ?? [];
      resolve(rows.reduce((total, row) => total + (row.blob?.size ?? 0), 0));
    };
    request.onerror = () => resolve(0);
  });
}
/* ---------- 通用键值读写（用户记录 / 自定义题） ---------- */

async function kvTx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_KV, mode);
    const request = run(transaction.objectStore(STORE_KV));
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
}

export async function getKv<T>(key: string): Promise<T | null> {
  const row = await kvTx<{ key: string; value: T } | undefined>("readonly", (store) => store.get(key));
  return row?.value ?? null;
}

export async function setKv<T>(key: string, value: T): Promise<void> {
  await kvTx("readwrite", (store) => store.put({ key, value }));
}