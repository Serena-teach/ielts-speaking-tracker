import { Check, CircleDashed, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { STATUS_META, STATUS_ORDER, type PracticeStatus } from "../types";

const ICONS: Record<PracticeStatus, LucideIcon> = {
  "not-practiced": CircleDashed,
  practiced: Check,
  familiar: Sparkles,
};

/** 未练 / 练过 / 熟练 三段式切换 */
export function StatusSwitcher({
  value,
  onChange,
  size = "md",
}: {
  value: PracticeStatus;
  onChange: (status: PracticeStatus) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-inset ring-slate-200">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const Icon = ICONS[status];
        const active = status === value;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(status)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg font-medium transition",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              active
                ? "bg-white text-brand-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
