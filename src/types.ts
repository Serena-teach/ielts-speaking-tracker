/**
 * 全局数据模型定义。
 * 注意：Question 的字段与 public/questions.json 中的字段一一对应，
 * 用户扩充题库时只需按照同样的字段书写即可。
 */

export type Region = "mainland" | "non-mainland";

export type Category = "new" | "retained" | "classic";

export type Part = "Part 1" | "Part 2&3";

export type PracticeStatus = "not-practiced" | "practiced" | "familiar";

export type Question = {
  id: string;
  region: Region;
  category: Category;
  part: Part;
  /** 英文标题，例如 "Travelling" */
  title: string;
  /** 中文标题（可选），例如 "旅行" */
  titleZh?: string;
  /** 题目原文，Part 1 是若干小问；Part 2&3 可以放卡片描述 + 追问 */
  questions: string[];
  /** 9 分答案（用户自己整理） */
  ninePointAnswer: string;
  /** 参考高级词语 */
  advancedWords: string[];
  /** 改进问题：口语表达中暴露的问题 */
  improvementIssues: string;
  /** 我的思路 */
  myThoughts: string;
  status: PracticeStatus;
  practiceCount: number;
  /** 最后一次练习日期，ISO 字符串，由「练习次数 +1」自动写入 */
  lastPracticeDate?: string;
};

/**
 * localStorage 中保存的「用户记录」。
 * 只存用户改动过的字段，读取时与 public/questions.json 的原始题目合并，
 * 这样后续扩充/更新题库文件时，旧记录依然能保留。
 */
export type QuestionRecord = Partial<
  Pick<
    Question,
    | "title"
    | "titleZh"
    | "questions"
    | "ninePointAnswer"
    | "advancedWords"
    | "improvementIssues"
    | "myThoughts"
    | "status"
    | "practiceCount"
    | "lastPracticeDate"
  >
> & {
  updatedAt?: string;
};

/** localStorage 中保存的、题库文件里不存在的题目（通过导入 JSON 添加） */
export type CustomQuestion = Question;

/** 导出的 JSON 文件结构 */
export type ExportPayload = {
  app: "ielts-speaking-tracker";
  version: 1;
  exportedAt: string;
  stats: {
    total: number;
    practiced: number;
    familiar: number;
    notPracticed: number;
  };
  questions: Question[];
};

export type ImportResult = {
  /** 新增（题库中原本不存在）的题目数量 */
  added: number;
  /** 覆盖了已有记录的题目数量 */
  updated: number;
  /** 未识别的条目数量 */
  skipped: number;
};

/** 分区定义：左侧导航的每一项 */
export type Section = {
  key: string;
  label: string;
  /** 副标题，用于显示该分区包含的题目数量等信息 */
  region: Region | null;
  category: Category | null;
  part: Part | null;
};

export const STATUS_META: Record<
  PracticeStatus,
  { label: string; badgeClass: string; dotClass: string; activeClass: string }
> = {
  "not-practiced": {
    label: "未练",
    badgeClass: "bg-slate-100 text-slate-600 ring-slate-200",
    dotClass: "bg-slate-400",
    activeClass: "bg-slate-600 text-white ring-slate-600",
  },
  practiced: {
    label: "练过",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
    dotClass: "bg-amber-500",
    activeClass: "bg-amber-500 text-white ring-amber-500",
  },
  familiar: {
    label: "熟练",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dotClass: "bg-emerald-500",
    activeClass: "bg-emerald-600 text-white ring-emerald-600",
  },
};

export const STATUS_ORDER: PracticeStatus[] = ["not-practiced", "practiced", "familiar"];
