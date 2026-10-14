import { CalendarClock, ChevronRight, Repeat2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDateTime } from "../lib/utils";
import type { Question } from "../types";
import { StatusBadge } from "./StatusBadge";

/** 题目列表中的单条卡片 */
export function QuestionListItem({ question }: { question: Question }) {
  // 跳过【Part 2】/【Part 3】分块标题和 "You should say" 行，取第一句真正的题目
  const preview = question.questions.find(
    (item) => item.trim().length > 0 && !item.trim().startsWith("【") && !item.trim().startsWith("You should say")
  );

  return (
    <Link
      to={`/question/${question.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-brand-900">
            {question.title}
            {question.titleZh ? (
              <span className="ml-2 text-sm font-normal text-slate-500">{question.titleZh}</span>
            ) : null}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{preview ?? "暂无题目原文"}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
              {question.part}
            </span>
            <span className="inline-flex items-center gap-1">
              <Repeat2 className="h-3.5 w-3.5" />
              练习 {question.practiceCount} 次
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDateTime(question.lastPracticeDate)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={question.status} />
          <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-brand-700" />
        </div>
      </div>
    </Link>
  );
}

