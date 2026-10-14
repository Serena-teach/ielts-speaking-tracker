import type { ReactNode } from "react";
import { useAutoSaveDraft } from "../lib/useAutoSaveDraft";
import { cn } from "../lib/utils";
import { SaveIndicator } from "./SaveIndicator";

type Props = {
  label: string;
  value: string;
  onSave: (next: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: ReactNode;
  /** 9 分答案是英文长文，用衬线字体阅读更舒服 */
  serif?: boolean;
  /** 是否在右下角显示字符数 */
  showCount?: boolean;
  className?: string;
};

/** 多行文本框，停止输入 500ms 后自动保存；卸载时会立刻补一次写入 */
export function AutoSaveTextarea({
  label,
  value,
  onSave,
  placeholder,
  rows = 6,
  hint,
  serif,
  showCount,
  className,
}: Props) {
  const { draft, change, state } = useAutoSaveDraft(value, onSave);

  return (
    <div className={cn("block", className)}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <SaveIndicator state={state} />
      </div>
      <textarea
        value={draft}
        rows={rows}
        onChange={(event) => change(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "thin-scrollbar w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
          serif ? "font-serif text-[15px] leading-7" : "text-sm"
        )}
      />
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">{hint}</p>
        {showCount ? (
          <p className="shrink-0 text-xs tabular-nums text-slate-400">{draft.length} 字符</p>
        ) : null}
      </div>
    </div>
  );
}
