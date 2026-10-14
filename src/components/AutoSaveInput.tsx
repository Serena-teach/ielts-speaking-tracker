import { useAutoSaveDraft } from "../lib/useAutoSaveDraft";
import { cn } from "../lib/utils";
import { SaveIndicator } from "./SaveIndicator";

type Props = {
  label?: string;
  value: string;
  onSave: (next: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

/** 单行输入框，输入停止 500ms 后自动写入 localStorage */
export function AutoSaveInput({
  label,
  value,
  onSave,
  placeholder,
  className,
  inputClassName,
}: Props) {
  const { draft, change, state } = useAutoSaveDraft(value, onSave);

  return (
    <label className={cn("block", className)}>
      {label ? (
        <span className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
          <SaveIndicator state={state} />
        </span>
      ) : null}
      <input
        value={draft}
        onChange={(event) => change(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
          inputClassName
        )}
      />
    </label>
  );
}
