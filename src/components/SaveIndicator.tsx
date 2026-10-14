import { Check, Loader2 } from "lucide-react";
import type { SaveState } from "../lib/useAutoSaveDraft";

/** 自动保存状态提示（防抖 500ms 写入 localStorage） */
export function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "dirty") {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-amber-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        保存中…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-emerald-600">
        <Check className="h-3 w-3" />
        已保存
      </span>
    );
  }
  return <span className="whitespace-nowrap text-xs text-slate-400">自动保存</span>;
}
