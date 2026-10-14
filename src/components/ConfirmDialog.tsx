import { useEffect } from "react";
import { cn } from "../lib/utils";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** 简易确认弹窗（清空数据、覆盖导入等破坏性操作前使用） */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  danger,
  onConfirm,
  onCancel,
}: Props) {
  // Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold text-white transition",
              danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-900 hover:bg-brand-800"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
