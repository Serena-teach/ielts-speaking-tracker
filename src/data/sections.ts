import type { Part, PracticeStatus, Question, Section } from "../types";

/**
 * 七个分区是固定导航项，对应 prompt 中要求的大陆 / 非大陆 + 新题 / 保留题 / 老题 组合。
 * key 使用在 URL 查询参数里（?section=xxx），因此只能包含小写字母、数字和连字符。
 */
export const SECTIONS: Section[] = [
  {
    key: "mainland-new-p1",
    label: "大陆新题 Part 1",
    region: "mainland",
    category: "new",
    part: "Part 1",
  },
  {
    key: "mainland-new-p23",
    label: "大陆新题 Part 2&3",
    region: "mainland",
    category: "new",
    part: "Part 2&3",
  },
  {
    key: "mainland-retained-p1",
    label: "大陆保留题 Part 1",
    region: "mainland",
    category: "retained",
    part: "Part 1",
  },
  {
    key: "mainland-classic-p1",
    label: "大陆万年老题 Part 1",
    region: "mainland",
    category: "classic",
    part: "Part 1",
  },
  {
    key: "mainland-retained-p23",
    label: "大陆保留题 Part 2&3",
    region: "mainland",
    category: "retained",
    part: "Part 2&3",
  },
  {
    key: "non-mainland-new-p1",
    label: "非大陆新题 Part 1",
    region: "non-mainland",
    category: "new",
    part: "Part 1",
  },
  {
    key: "non-mainland-new-p23",
    label: "非大陆新题 Part 2&3",
    region: "non-mainland",
    category: "new",
    part: "Part 2&3",
  },
];

export const ALL_SECTION_KEY = "all";

/** 不属于上面七个分区的题目（例如导入题库后出现的 classic Part 2&3）统一归到这里 */
export const OTHER_SECTION_KEY = "other";

export const ALL_SECTION: Section = {
  key: ALL_SECTION_KEY,
  label: "全部题目",
  region: null,
  category: null,
  part: null,
};

export const OTHER_SECTION: Section = {
  key: OTHER_SECTION_KEY,
  label: "其他题目",
  region: null,
  category: null,
  part: null,
};

export function getSection(key: string | null): Section {
  if (!key || key === ALL_SECTION_KEY) return ALL_SECTION;
  return (
    SECTIONS.find((section) => section.key === key) ??
    (key === OTHER_SECTION_KEY ? OTHER_SECTION : ALL_SECTION)
  );
}

/** 判断题目是否属于某个分区 */
export function matchesSection(question: Question, section: Section): boolean {
  if (section.key === ALL_SECTION_KEY) return true;
  if (section.key === OTHER_SECTION_KEY) {
    return !SECTIONS.some((candidate) => isInSection(question, candidate));
  }
  return isInSection(question, section);
}

export function isInSection(question: Question, section: Section): boolean {
  if (section.region && question.region !== section.region) return false;
  if (section.category && question.category !== section.category) return false;
  if (section.part && question.part !== section.part) return false;
  return true;
}

export const REGION_LABEL: Record<Question["region"], string> = {
  mainland: "大陆",
  "non-mainland": "非大陆",
};

export const CATEGORY_LABEL: Record<Question["category"], string> = {
  new: "新题",
  retained: "保留题",
  classic: "万年老题",
};

/** 列表页顶部筛选：全部 / 未练 / 练过 / 熟练 */
export const STATUS_FILTERS: Array<{ value: "all" | PracticeStatus; label: string }> = [
  { value: "all", label: "全部" },
  { value: "not-practiced", label: "未练" },
  { value: "practiced", label: "练过" },
  { value: "familiar", label: "熟练" },
];

export const PART_OPTIONS: Part[] = ["Part 1", "Part 2&3"];
