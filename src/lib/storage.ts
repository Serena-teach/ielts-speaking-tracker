import type { CustomQuestion, QuestionRecord } from "../types";
import { getKv, setKv } from "./idb";

/** 所有 localStorage key 集中在这里，方便清空和排查 */
export const STORAGE_KEYS = {
  records: "ielts-speaking-tracker:records:v1",
  custom: "ielts-speaking-tracker:custom-questions:v1",
} as const;

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] 读取 ${key} 失败，已忽略`, error);
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // 例如隐私模式或配额写满：只提示，不影响界面继续使用
    console.warn(`[storage] 写入 ${key} 失败`, error);
  }
}

/**
 * 内存缓存：读取仍是同步的（界面不用改），
 * 启动时由 initStorage() 从 IndexedDB 灌进来，写入时同时落 IndexedDB 与 localStorage。
 */
const cache: {
  records: Record<string, QuestionRecord> | null;
  custom: CustomQuestion[] | null;
} = { records: null, custom: null };

/** 启动时调用一次：从 IndexedDB 读数据，并把 localStorage 里的旧数据迁移过去 */
export async function initStorage(): Promise<void> {
  try {
    const [idbRecords, idbCustom] = await Promise.all([
      getKv<Record<string, QuestionRecord>>("records"),
      getKv<CustomQuestion[]>("custom"),
    ]);
    const localRecords = readJson<Record<string, QuestionRecord>>(STORAGE_KEYS.records) ?? {};
    const localCustom = readJson<CustomQuestion[]>(STORAGE_KEYS.custom) ?? [];

    if (!idbRecords && Object.keys(localRecords).length) {
      await setKv("records", localRecords); // 一次性迁移
      cache.records = localRecords;
    } else {
      cache.records = idbRecords ?? localRecords;
    }

    if (!idbCustom && localCustom.length) {
      await setKv("custom", localCustom);
      cache.custom = localCustom;
    } else {
      cache.custom = idbCustom ?? localCustom;
    }
  } catch (error) {
    // IndexedDB 不可用（隐私模式等）就退回 localStorage，功能不受影响
    console.warn("[storage] IndexedDB 不可用，继续使用 localStorage", error);
  }
}

/** 用户改动的字段（与 public/questions.json 合并后得到完整题目） */
export function readRecords(): Record<string, QuestionRecord> {
  if (cache.records) return cache.records;
  return readJson<Record<string, QuestionRecord>>(STORAGE_KEYS.records) ?? {};
}

export function writeRecords(records: Record<string, QuestionRecord>): void {
  cache.records = records;
  writeJson(STORAGE_KEYS.records, records);
  void setKv("records", records).catch(() => undefined);
}

/** 题库文件中不存在、由导入 JSON 添加的题目 */
export function readCustomQuestions(): CustomQuestion[] {
  if (cache.custom) return cache.custom;
  const value = readJson<CustomQuestion[]>(STORAGE_KEYS.custom);
  return Array.isArray(value) ? value : [];
}

export function writeCustomQuestions(questions: CustomQuestion[]): void {
  cache.custom = questions;
  writeJson(STORAGE_KEYS.custom, questions);
  void setKv("custom", questions).catch(() => undefined);
}

/** 清空本应用写入的所有 localStorage 数据 */
export function clearAllStorage(): void {
  cache.records = null;
  cache.custom = null;
  void setKv("records", {}).catch(() => undefined);
  void setKv("custom", []).catch(() => undefined);
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[storage] 删除 ${key} 失败`, error);
    }
  });
}

/** 估算本应用占用的 localStorage 体积 */
export function storageUsageBytes(): number {
  return Object.values(STORAGE_KEYS).reduce((total, key) => {
    const raw = window.localStorage.getItem(key) ?? "";
    return total + raw.length * 2; // localStorage 存的是 UTF-16
  }, 0);
}
