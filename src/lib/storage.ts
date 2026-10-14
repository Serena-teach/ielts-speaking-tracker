import type { CustomQuestion, QuestionRecord } from "../types";

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

/** 用户改动的字段（与 public/questions.json 合并后得到完整题目） */
export function readRecords(): Record<string, QuestionRecord> {
  return readJson<Record<string, QuestionRecord>>(STORAGE_KEYS.records) ?? {};
}

export function writeRecords(records: Record<string, QuestionRecord>): void {
  writeJson(STORAGE_KEYS.records, records);
}

/** 题库文件中不存在、由导入 JSON 添加的题目 */
export function readCustomQuestions(): CustomQuestion[] {
  const value = readJson<CustomQuestion[]>(STORAGE_KEYS.custom);
  return Array.isArray(value) ? value : [];
}

export function writeCustomQuestions(questions: CustomQuestion[]): void {
  writeJson(STORAGE_KEYS.custom, questions);
}

/** 清空本应用写入的所有 localStorage 数据 */
export function clearAllStorage(): void {
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
