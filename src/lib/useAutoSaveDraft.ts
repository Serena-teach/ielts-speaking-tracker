import { useCallback, useEffect, useRef, useState } from "react";

export type SaveState = "idle" | "dirty" | "saved";

/**
 * 自动保存草稿：输入时先更新本地 state，防抖 delay 毫秒后再写进 store（store 负责落 localStorage）。
 * 额外做两件事：
 *  1. 外部值变化（切换题目、导入数据）时同步草稿；
 *  2. 组件卸载时立刻 flush，避免快速返回列表时丢字。
 */
export function useAutoSaveDraft(
  value: string,
  onSave: (next: string) => void,
  delay = 500
) {
  const [draft, setDraft] = useState(value);
  const [state, setState] = useState<SaveState>("idle");

  const onSaveRef = useRef(onSave);
  const draftRef = useRef(draft);
  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef(false);
  /** 记录最近一次由本组件写出去的值，用于区分「自己写入后的回流」和「外部改动」 */
  const lastSavedRef = useRef<string | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    if (lastSavedRef.current !== null && value === lastSavedRef.current) {
      // 自己保存导致的 props 回流，保留「已保存」提示
      lastSavedRef.current = null;
      return;
    }
    setDraft(value);
    setState("idle");
  }, [value]);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!pendingRef.current) return;
    pendingRef.current = false;
    lastSavedRef.current = draftRef.current;
    onSaveRef.current(draftRef.current);
    setState("saved");
  }, []);

  const change = useCallback(
    (next: string) => {
      setDraft(next);
      setState("dirty");
      pendingRef.current = true;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        flush();
      }, delay);
    },
    [delay, flush]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (pendingRef.current) {
        pendingRef.current = false;
        onSaveRef.current(draftRef.current);
      }
    };
  }, []);

  return { draft, change, state, flush };
}
