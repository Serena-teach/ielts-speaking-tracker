import { useState, type ReactNode } from "react";
import { useAutoSaveDraft } from "../lib/useAutoSaveDraft";
import { cn } from "../lib/utils";
import { SaveIndicator } from "./SaveIndicator";

type Props = {
  /** 留空则不显示字段名（外层卡片已有标题时用） */
  label?: string;
  value: string;
  onSave: (next: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: ReactNode;
  /** 参考答案是英文长文，用衬线字体阅读更舒服 */
  serif?: boolean;
  /** 是否在右下角显示字符数 */
  showCount?: boolean;
  /** 阅读优先：默认只显示只读文本，点「编辑」才出现输入框（有内容时） */
  collapsible?: boolean;
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
  collapsible,
  className,
}: Props) {
  const { draft, change, state } = useAutoSaveDraft(value, onSave);
  const [editing, setEditing] = useState(false);
  // 阅读优先模式下：空白内容直接给输入框，避免看不到入口
  const isEditing = !collapsible || editing || !draft.trim();

  return (
    <div className={cn("block", className)}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        {label ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        ) : null}
        <div className="flex items-center gap-2">
          <SaveIndicator state={state} />
          {collapsible && draft.trim() ? (
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              {isEditing ? "收起编辑框" : "编辑"}
            </button>
          ) : null}
        </div>
      </div>
      {isEditing ? (
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
      ) : (
        <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3.5 py-3">
          <pre className={cn("whitespace-pre-wrap text-slate-800", serif ? "font-serif text-[15px] leading-7" : "text-sm leading-6")}>
            {draft}
          </pre>
        </div>
      )}
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">{hint}</p>
        {showCount ? (
          <p className="shrink-0 text-xs tabular-nums text-slate-400">{draft.length} 字符</p>
        ) : null}
      </div>
    </div>
  );
}
