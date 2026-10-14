import type { ReactNode } from "react";
import { CATEGORY_LABEL, REGION_LABEL } from "../data/sections";
import { cn } from "../lib/utils";
import type { Question } from "../types";

function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200",
        className
      )}
    >
      {children}
    </span>
  );
}

/** 区/类别/Part 信息标签 */
export function MetaChips({ question }: { question: Question }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Chip className="bg-brand-50 text-brand-900 ring-brand-100">{REGION_LABEL[question.region]}</Chip>
      <Chip>{CATEGORY_LABEL[question.category]}</Chip>
      <Chip>{question.part}</Chip>
    </div>
  );
}

