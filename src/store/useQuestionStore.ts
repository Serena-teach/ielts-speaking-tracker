import { create } from "zustand";
import {
  clearAllStorage,
  readCustomQuestions,
  readRecords,
  storageUsageBytes,
  writeCustomQuestions,
  writeRecords,
} from "../lib/storage";
import type {
  CustomQuestion,
  ExportPayload,
  ImportResult,
  Part,
  PracticeStatus,
  Question,
  QuestionRecord,
  Region,
} from "../types";

/** 用户可编辑的字段（= QuestionRecord 去掉 updatedAt） */
export type QuestionPatch = QuestionRecord;

const REGIONS: Region[] = ["mainland", "non-mainland"];
const CATEGORIES: Question["category"][] = ["new", "retained", "classic"];
const STATUSES: PracticeStatus[] = ["not-practiced", "practiced", "familiar"];

/** 需要从 localStorage 记录里读出来覆盖到题目上的字段 */
const RECORD_FIELDS: Array<keyof QuestionRecord> = [
  "title",
  "titleZh",
  "questions",
  "ninePointAnswer",
  "advancedWords",
  "improvementIssues",
  "myThoughts",
  "status",
  "practiceCount",
  "lastPracticeDate",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item);
}

/** 把任意输入规范成 Question，字段缺失时给默认值；无法识别时返回 null */
function normalizeQuestion(raw: unknown, index: number): Question | null {
  if (!isRecord(raw)) return null;

  const title = asString(raw.title).trim();
  const titleZh = asString(raw.titleZh).trim();
  if (!title && !titleZh) return null;

  const rawId = asString(raw.id).trim();
  const id = rawId || `imported-${index + 1}`;

  const region = REGIONS.includes(raw.region as Region) ? (raw.region as Region) : "mainland";
  const category = CATEGORIES.includes(raw.category as Question["category"])
    ? (raw.category as Question["category"])
    : "new";
  const part: Part = asString(raw.part).toLowerCase().includes("1") ? "Part 1" : "Part 2&3";
  const status = STATUSES.includes(raw.status as PracticeStatus)
    ? (raw.status as PracticeStatus)
    : "not-practiced";
  const practiceCount =
    typeof raw.practiceCount === "number" && Number.isFinite(raw.practiceCount) && raw.practiceCount > 0
      ? Math.floor(raw.practiceCount)
      : 0;
  const lastPracticeDate = asString(raw.lastPracticeDate).trim();

  return {
    id,
    region,
    category,
    part,
    title: title || titleZh,
    titleZh: titleZh || undefined,
    questions: asStringArray(raw.questions),
    ninePointAnswer: asString(raw.ninePointAnswer),
    advancedWords: asStringArray(raw.advancedWords),
    improvementIssues: asString(raw.improvementIssues),
    myThoughts: asString(raw.myThoughts),
    status,
    practiceCount,
    lastPracticeDate: lastPracticeDate || undefined,
  };
}

/** 「同分区 + 同标题」视为同一道题：导入自带题库时不会和已有题目重复 */
function questionKey(
  question: Pick<Question, "region" | "category" | "part" | "title" | "titleZh">
): string {
  const title = (question.title || question.titleZh || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  const part = question.part.replace(/\s+/g, "").toLowerCase();
  return [question.region, question.category, part, title].join("|");
}

/** 从导入的 JSON 里取出题目数组：支持 Question[] 或 { questions: Question[] } */
function extractQuestionList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (isRecord(raw) && Array.isArray(raw.questions)) return raw.questions;
  return [];
}

/** 从导入的 JSON 里取出记录的键值对形式：支持 { records: { id: {...} } } */
function extractRecordMap(raw: unknown): Record<string, QuestionRecord> | null {
  if (isRecord(raw) && isRecord(raw.records)) {
    return raw.records as Record<string, QuestionRecord>;
  }
  return null;
}

/** 把完整题目转成待写入的记录 */
function recordFromQuestion(question: Question, updatedAt: string): QuestionRecord {
  return {
    title: question.title,
    titleZh: question.titleZh,
    questions: question.questions,
    ninePointAnswer: question.ninePointAnswer,
    advancedWords: question.advancedWords,
    improvementIssues: question.improvementIssues,
    myThoughts: question.myThoughts,
    status: question.status,
    practiceCount: question.practiceCount,
    lastPracticeDate: question.lastPracticeDate,
    updatedAt,
  };
}

/**
 * 导入专用：空字符串 / 空数组视为「没有内容」，不覆盖用户已经写好的东西。
 * 因此导入题库文件（内容为空）不会冲掉练习记录，而导入自己的备份（内容非空）仍能完整恢复。
 */
function recordFromImport(question: Question, updatedAt: string): QuestionRecord {
  const record = recordFromQuestion(question, updatedAt);
  (Object.keys(record) as Array<keyof QuestionRecord>).forEach((field) => {
    const value = record[field];
    const isEmpty =
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (field === "practiceCount" && value === 0) ||
      (field === "status" && value === "not-practiced");
    if (isEmpty) delete record[field];
  });
  return record;
}

/** 记录 -> 可覆盖到题目上的字段（忽略 updatedAt 这类元数据） */
function recordToPatch(record: QuestionRecord): Partial<Question> {
  const patch: Record<string, unknown> = {};
  RECORD_FIELDS.forEach((field) => {
    const value = record[field];
    if (value !== undefined) patch[field] = value;
  });
  return patch as Partial<Question>;
}

/**
 * 合并：题库原始数据 + 导入的自定义题目 + localStorage 记录。
 * 同 id 时记录（用户数据）优先级最高。
 */
function mergeQuestions(
  base: Question[],
  custom: CustomQuestion[],
  records: Record<string, QuestionRecord>
): Question[] {
  const merged: Question[] = [];
  const seen = new Set<string>();

  const push = (question: Question) => {
    if (seen.has(question.id)) return;
    seen.add(question.id);
    const record = records[question.id];
    merged.push(record ? { ...question, ...recordToPatch(record) } : question);
  };

  base.forEach(push);
  custom.forEach(push);
  return merged;
}

type QuestionStore = {
  /** public/questions.json 里的原始题目 */
  baseQuestions: Question[];
  /** 通过导入 JSON 添加的题目 */
  customQuestions: CustomQuestion[];
  /** localStorage 中的用户记录 */
  records: Record<string, QuestionRecord>;
  /** 合并后的最终展示数据 */
  questions: Question[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  /** 读取 public/questions.json 并与本地记录合并 */
  load: () => Promise<void>;
  /** 局部更新某道题（自动落 localStorage） */
  updateQuestion: (id: string, patch: QuestionPatch) => void;
  /** 练习次数 +1，同时自动记录最后练习日期 */
  incrementPractice: (id: string) => void;
  /** 撤销一次练习记录（次数 -1；减到 0 时清空最后练习时间并回到「未练」） */
  decrementPractice: (id: string) => void;
  /** 直接切换练习状态 */
  setStatus: (id: string, status: PracticeStatus) => void;
  /** 清空所有本地数据，恢复到题库原始状态 */
  clearAll: () => void;
  /** 导出当前完整数据 */
  buildExportPayload: () => ExportPayload;
  /** 导入 JSON（合并语义） */
  importPayload: (raw: unknown) => ImportResult;
  /** 当前 localStorage 占用量（字节） */
  storageBytes: () => number;
  /** 重新从 localStorage 读取数据（同源多标签页同步用） */
  syncFromStorage: () => void;
  /** 最近一次从其他标签页同步过来的时间戳 */
  lastSyncedAt: number | null;
};

export const useQuestionStore = create<QuestionStore>((set, get) => {
  /** 统一的「写记录 + 重建列表」流程 */
  const commit = (
    state: QuestionStore,
    id: string,
    patch: QuestionPatch
  ): Partial<QuestionStore> => {
    const record: QuestionRecord = {
      ...(state.records[id] ?? {}),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    const records = { ...state.records, [id]: record };
    writeRecords(records);
    return {
      records,
      questions: mergeQuestions(state.baseQuestions, state.customQuestions, records),
    };
  };

  return {
    baseQuestions: [],
    customQuestions: [],
    records: readRecords(),
    questions: [],
    loading: false,
    loaded: false,
    error: null,
    lastSyncedAt: null,

    load: async () => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}questions.json`, {
          cache: "no-cache",
        });
        if (!response.ok) {
          throw new Error(`读取题库失败（HTTP ${response.status}）`);
        }
        const raw: unknown = await response.json();
        const baseQuestions = extractQuestionList(raw)
          .map((item, index) => normalizeQuestion(item, index))
          .filter((item): item is Question => item !== null);

        const records = readRecords();
        const customQuestions = readCustomQuestions().filter(
          (question) => !baseQuestions.some((base) => base.id === question.id)
        );

        set({
          baseQuestions,
          customQuestions,
          records,
          questions: mergeQuestions(baseQuestions, customQuestions, records),
          loading: false,
          loaded: true,
          error: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "未知错误";
        set({
          loading: false,
          loaded: true,
          error: `${message}。请确认 public/questions.json 存在（可在项目根目录运行 npm run dev）。`,
        });
      }
    },

    updateQuestion: (id, patch) => {
      set((state) => commit(state, id, patch));
    },

    incrementPractice: (id) => {
      set((state) => {
        const question = state.questions.find((item) => item.id === id);
        if (!question) return {};
        const nextCount = (question.practiceCount ?? 0) + 1;
        const patch: QuestionPatch = {
          practiceCount: nextCount,
          lastPracticeDate: new Date().toISOString(),
        };
        // 第一次练习时自动从「未练」升级为「练过」，用户之后仍可手动改回
        if (question.status === "not-practiced") patch.status = "practiced";
        return commit(state, id, patch);
      });
    },

    decrementPractice: (id) => {
      set((state) => {
        const question = state.questions.find((item) => item.id === id);
        if (!question || (question.practiceCount ?? 0) <= 0) return {};
        const nextCount = (question.practiceCount ?? 0) - 1;
        const patch: QuestionPatch = { practiceCount: nextCount };
        if (nextCount === 0) {
          // 撤销到 0 次：清空最后练习时间，并把「练过」退回「未练」
          patch.lastPracticeDate = undefined;
          if (question.status === "practiced") patch.status = "not-practiced";
        }
        return commit(state, id, patch);
      });
    },

    setStatus: (id, status) => {
      set((state) => commit(state, id, { status }));
    },

    clearAll: () => {
      clearAllStorage();
      set((state) => ({
        records: {},
        customQuestions: [],
        questions: mergeQuestions(state.baseQuestions, [], {}),
      }));
    },

    buildExportPayload: () => {
      const questions = get().questions;
      return {
        app: "ielts-speaking-tracker",
        version: 1,
        exportedAt: new Date().toISOString(),
        stats: {
          total: questions.length,
          practiced: questions.filter((item) => item.status !== "not-practiced").length,
          familiar: questions.filter((item) => item.status === "familiar").length,
          notPracticed: questions.filter((item) => item.status === "not-practiced").length,
        },
        questions,
      };
    },

        importPayload: (raw) => {
      const state = get();
      const list = extractQuestionList(raw);
      const recordMap = extractRecordMap(raw);
      const now = new Date().toISOString();

      const records: Record<string, QuestionRecord> = { ...state.records };
      const custom: CustomQuestion[] = [...state.customQuestions];
      const baseIds = new Set(state.baseQuestions.map((question) => question.id));
      const customIndex = new Map(custom.map((question, index) => [question.id, index] as const));
      // 已存在题目的 key -> id（用合并后的数据建索引，用户改过标题也能匹配上）
      const idByKey = new Map<string, string>();
      state.questions.forEach((question) => {
        const key = questionKey(question);
        if (!idByKey.has(key)) idByKey.set(key, question.id);
      });

      let added = 0;
      let updated = 0;
      let skipped = 0;

      list.forEach((entry, index) => {
        const question = normalizeQuestion(entry, index);
        if (!question) {
          skipped += 1;
          return;
        }

        // 先按 id 匹配，再按「分区 + 标题」匹配
        const matchedId = baseIds.has(question.id)
          ? question.id
          : idByKey.get(questionKey(question));

        if (matchedId && baseIds.has(matchedId)) {
          // 命中题库原有题目：覆盖记录并保留原 id，练习历史不会丢
          records[matchedId] = {
            ...(records[matchedId] ?? {}),
            ...recordFromImport(question, now),
          };
          updated += 1;
          return;
        }

        if (matchedId) {
          const existingIndex = customIndex.get(matchedId);
          if (existingIndex !== undefined) {
            // 命中之前导入过的题目：沿用原 id 覆盖内容
            custom[existingIndex] = { ...custom[existingIndex], ...question, id: matchedId };
            delete records[matchedId];
            updated += 1;
            return;
          }
        }

        custom.push(question);
        customIndex.set(question.id, custom.length - 1);
        idByKey.set(questionKey(question), question.id);
        added += 1;
      });

      if (recordMap) {
        Object.entries(recordMap).forEach(([id, record]) => {
          if (!isRecord(record)) {
            skipped += 1;
            return;
          }
          records[id] = { ...(records[id] ?? {}), ...record };
          updated += 1;
        });
      }

      writeRecords(records);
      writeCustomQuestions(custom);
      set({
        records,
        customQuestions: custom,
        questions: mergeQuestions(state.baseQuestions, custom, records),
      });

      return { added, updated, skipped };
    },
    syncFromStorage: () => {
      set((state) => {
        // 其他标签页刚写过 localStorage，这里重新读一遍并重建合并结果
        const records = readRecords();
        const customQuestions = readCustomQuestions().filter(
          (question) => !state.baseQuestions.some((base) => base.id === question.id)
        );
        return {
          records,
          customQuestions,
          questions: mergeQuestions(state.baseQuestions, customQuestions, records),
          lastSyncedAt: Date.now(),
        };
      });
    },

    storageBytes: () => storageUsageBytes(),
  };
});





