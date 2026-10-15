import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CalendarClock, Download, Play } from "lucide-react";
import { useQuestionStore } from "../store/useQuestionStore";

const EXPORT_KEY = "ielts-speaking-tracker:last-export:v1";
const REMIND_AFTER_DAYS = 14;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

function daysOverdue(iso: string): number {
  const target = new Date(iso).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - target) / (24 * 60 * 60 * 1000));
}

/**
 * 首页顶部面板：
 * 1) 今日到期的复习题（间隔复习 3→7→21→45 天）
 * 2) 导出提醒（记录只在本机浏览器里，超过两周没备份就提醒）
 */
export function ReviewPanel() {
  const questions = useQuestionStore((state) => state.questions);
  const buildExportPayload = useQuestionStore((state) => state.buildExportPayload);
  const [exportedAt, setExportedAt] = useState<string | null>(() => localStorage.getItem(EXPORT_KEY));

  const due = questions
    .filter((question) => question.nextReviewAt && new Date(question.nextReviewAt).getTime() <= Date.now())
    .sort((a, b) => new Date(a.nextReviewAt ?? 0).getTime() - new Date(b.nextReviewAt ?? 0).getTime());

  const needExport = !exportedAt || daysSince(exportedAt) >= REMIND_AFTER_DAYS;

  const exportNow = () => {
    const payload = buildExportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ielts-records-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    const now = new Date().toISOString();
    localStorage.setItem(EXPORT_KEY, now);
    setExportedAt(now);
  };

  if (!due.length && !needExport) return null;

  return (
    <>
      {due.length ? (
        <section className="card border-amber-200 bg-amber-50/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CalendarClock className="h-4 w-4 text-amber-600" />
              今天该复习 {due.length} 道
            </h2>
            <Link
              to={`/question/${due[0].id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-800"
            >
              <Play className="h-3.5 w-3.5" />
              从第一道开始
            </Link>
          </div>
          <ul className="mt-3 space-y-1.5">
            {due.slice(0, 6).map((question) => (
              <li key={question.id} className="flex items-center justify-between gap-3 text-sm">
                <Link to={`/question/${question.id}`} className="truncate text-slate-700 hover:text-brand-900 hover:underline">
                  {question.title}
                </Link>
                <span className="shrink-0 text-xs tabular-nums text-amber-700">
                  已到期 {daysOverdue(question.nextReviewAt ?? "")} 天
                </span>
              </li>
            ))}
          </ul>
          {due.length > 6 ? (
            <p className="mt-2 text-xs text-slate-500">还有 {due.length - 6} 道到期题，练完这些会自动往后排。</p>
          ) : null}
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            节奏是「练过 → 3 天 → 7 天 → 21 天 → 45 天」；点题目右侧练习卡的「练习次数 +1」就会自动排下一次。
          </p>
        </section>
      ) : null}

      {needExport ? (
        <section className="card border-amber-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-start gap-2 text-sm text-slate-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>
                {exportedAt ? `已经 ${daysSince(exportedAt)} 天没备份了` : "还没有导出过备份"}
                ，练习记录只存在这台电脑的浏览器里（换网址 / 清缓存都会丢）。
              </span>
            </p>
            <button
              type="button"
              onClick={exportNow}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-50"
            >
              <Download className="h-3.5 w-3.5" />
              一键导出 JSON
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            导出的文件可以在「设置」页导入回来；建议固定用一个网址练习，减少两份数据（如 localhost 与 127.0.0.1）。
          </p>
        </section>
      ) : null}
    </>
  );
}