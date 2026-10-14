import { AlertTriangle, Loader2, RotateCcw, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProgressBar } from "../components/ProgressBar";
import { QuestionListItem } from "../components/QuestionListItem";
import { SectionNav, type SectionNavItem } from "../components/SectionNav";
import {
  ALL_SECTION,
  ALL_SECTION_KEY,
  OTHER_SECTION,
  OTHER_SECTION_KEY,
  SECTIONS,
  STATUS_FILTERS,
  getSection,
  matchesSection,
} from "../data/sections";
import { cn } from "../lib/utils";
import { useQuestionStore } from "../store/useQuestionStore";
import type { PracticeStatus } from "../types";

/**
 * 题目列表页（/）
 * 左侧分区导航 + 右侧题目列表（搜索 / 状态筛选 / 进度条）。
 * 分区信息放在 URL 查询参数里（?section=mainland-new-p1），保持只有三个路由。
 */
export default function QuestionList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeKey = searchParams.get("section") ?? ALL_SECTION_KEY;
  const section = useMemo(() => getSection(activeKey), [activeKey]);

  const questions = useQuestionStore((state) => state.questions);
  const loading = useQuestionStore((state) => state.loading);
  const error = useQuestionStore((state) => state.error);
  const load = useQuestionStore((state) => state.load);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PracticeStatus>("all");

  /** 每个分区的题目数与已练数，用于左侧导航的角标 */
  const navItems = useMemo<SectionNavItem[]>(() => {
    const candidates = [ALL_SECTION, ...SECTIONS, OTHER_SECTION];
    return candidates
      .map((item) => {
        const scoped = questions.filter((question) => matchesSection(question, item));
        return {
          section: item,
          total: scoped.length,
          done: scoped.filter((question) => question.status !== "not-practiced").length,
        };
      })
      .filter((item) => item.section.key !== OTHER_SECTION_KEY || item.total > 0);
  }, [questions]);

  /** 当前分区下的题目 */
  const scoped = useMemo(
    () => questions.filter((question) => matchesSection(question, section)),
    [questions, section]
  );

  /** 搜索 + 状态筛选之后真正要展示的题目 */
  const visible = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return scoped.filter((question) => {
      if (statusFilter !== "all" && question.status !== statusFilter) return false;
      if (!kw) return true;
      return (
        question.title.toLowerCase().includes(kw) ||
        (question.titleZh ?? "").toLowerCase().includes(kw) ||
        question.questions.some((text) => text.toLowerCase().includes(kw))
      );
    });
  }, [scoped, keyword, statusFilter]);

  const done = scoped.filter((question) => question.status !== "not-practiced").length;
  const isFiltering = keyword.trim().length > 0 || statusFilter !== "all";

  const selectSection = (key: string) => {
    // 切换分区时保留搜索词与筛选条件，方便跨分区找同一话题
    setSearchParams(key === ALL_SECTION_KEY ? {} : { section: key });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <SectionNav items={navItems} activeKey={section.key} onSelect={selectSection} />
        <p className="mt-3 hidden px-1 text-xs leading-relaxed text-slate-400 lg:block">
          题库读取自 public/questions.json，可按同样格式继续扩充（详见 README）。
        </p>
      </aside>

      <section className="space-y-4">
        <header className="card">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-brand-900">{section.label}</h1>
              <p className="mt-1 text-sm text-slate-500">
                共 {scoped.length} 道题
                {isFiltering ? `，筛选后 ${visible.length} 道` : ""}
              </p>
            </div>
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                加载题库中…
              </span>
            ) : null}
          </div>
          <ProgressBar className="mt-4" done={done} total={scoped.length} label={`${section.label} 进度`} />
        </header>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索题目标题 / 中文名 / 题目关键词"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            />
            {keyword ? (
              <button
                type="button"
                onClick={() => setKeyword("")}
                aria-label="清空搜索"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-inset ring-slate-200">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={statusFilter === filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  statusFilter === filter.value
                    ? "bg-white text-brand-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span className="inline-flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </span>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200 transition hover:bg-red-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              重试
            </button>
          </div>
        ) : null}

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              {scoped.length === 0 ? "这个分区还没有题目" : "没有符合条件的题目"}
            </p>
            <p className="mt-1.5 text-xs text-slate-400">
              {scoped.length === 0
                ? "可以在 public/questions.json 里按格式补题，或在「设置」页导入 JSON 题库。"
                : "试试清空搜索词，或把筛选切回「全部」。"}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((question) => (
              <li key={question.id}>
                <QuestionListItem question={question} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
