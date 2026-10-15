import { Layers, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SaveState } from "../lib/useAutoSaveDraft";
import { SaveIndicator } from "./SaveIndicator";

type Props = {
  questions: string[];
  onChange: (next: string[]) => void;
};

/** 以「【」开头的行视为分块标题（例如【Part 2】【Part 3】），在界面上突出显示 */
const BLOCK_HEADER_PREFIX = "【";

/** 保存前清理：去掉首尾空格；如果全空了，保留一行空输入方便继续写 */
function cleanList(list: string[]): string[] {
  const trimmed = list.map((item) => item.trim());
  return trimmed.length === 0 ? [""] : trimmed;
}

/**
 * 题目原文编辑器：一行一个问题。
 * Part 2&3 的题目会以【Part 2】/【Part 3】两个分块标题隔开，便于区分卡片题和追问。
 * 与单行输入框一样走 500ms 防抖保存，组件卸载时立刻补写一次。
 * 注意：父组件需要用 key={question.id} 渲染，切换题目时让它重新挂载。
 */
export function QuestionTextEditor({ questions, onChange }: Props) {
  const [draft, setDraft] = useState<string[]>(() =>
    questions.length > 0 ? questions : [""]
  );
  const [state, setState] = useState<SaveState>("idle");

  const timerRef = useRef<number | null>(null);
  const draftRef = useRef(draft);
  const pendingRef = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const flush = () => {
    if (!pendingRef.current) return;
    pendingRef.current = false;
    onChangeRef.current(cleanList(draftRef.current));
    setState("saved");
  };

  // 卸载（例如返回列表页）时把还没写出去的内容立刻保存
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (pendingRef.current) {
        pendingRef.current = false;
        onChangeRef.current(cleanList(draftRef.current));
      }
    };
  }, []);

  const commit = (next: string[]) => {
    setDraft(next);
    setState("dirty");
    pendingRef.current = true;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      flush();
    }, 500);
  };

  const updateAt = (index: number, value: string) => {
    commit(draft.map((item, current) => (current === index ? value : item)));
  };

  const removeAt = (index: number) => {
    if (draft.length <= 1) {
      commit([""]);
      return;
    }
    commit(draft.filter((_, current) => current !== index));
  };

  const addRow = () => {
    commit([...draft, ""]);
  };

  const hasBlocks = draft.some((item) => item.trim().startsWith(BLOCK_HEADER_PREFIX));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400">
          {hasBlocks ? "已按 Part 2 / Part 3 分块，逐行可编辑，内容自动保存" : "一行一个问题，内容会自动保存"}
        </span>
        <SaveIndicator state={state} />
      </div>
      <ul className="space-y-2">
        {draft.map((item, index) => {
          if (item.trim().startsWith(BLOCK_HEADER_PREFIX)) {
            return (
              <li key={index} className="flex items-center gap-2">
                <span className="w-4 shrink-0" />
                <span className="flex flex-1 items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold tracking-wide text-brand-900 ring-1 ring-inset ring-brand-100">
                  <Layers className="h-3.5 w-3.5" />
                  {item.trim()}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label={`删除分块标题 ${item.trim()}`}
                  className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          }
          return (
            <li key={index} className="flex items-start gap-2">

              <textarea
                value={item}
                rows={Math.min(4, Math.max(1, Math.ceil(item.length / 58)))}
                onChange={(event) => updateAt(index, event.target.value)}
                placeholder={index === 0 ? "What transport do you often use when travelling?" : "继续添加小问…"}
                className="thin-scrollbar w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`删除第 ${index + 1} 行`}
                className="mt-1.5 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-brand-300 hover:text-brand-900"
      >
        <Plus className="h-4 w-4" />
        添加一行
      </button>
    </div>
  );
}
