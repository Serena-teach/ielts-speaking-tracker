import { cn } from "../lib/utils";
import { STATUS_META, type PracticeStatus } from "../types";

/** 练习状态小标签 */
export function StatusBadge({
  status,
  className,
}: {
  status: PracticeStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        meta.badgeClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </span>
  );
}
