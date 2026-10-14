import { cn } from "../lib/utils";

/** 顶部进度条：已练 X / 总 Y */
export function ProgressBar({
  done,
  total,
  label = "练习进度",
  className,
}: {
  done: number;
  total: number;
  label?: string;
  className?: string;
}) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-xs font-medium">
        <span className="text-slate-500">{label}</span>
        <span className="tabular-nums text-slate-600">
          已练 <span className="text-base font-semibold text-brand-900">{done}</span> / 总 {total}
          <span className="ml-2 text-slate-400">({percent}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-900 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
