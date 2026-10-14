import { Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

type Props = {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

/** 高级词语标签：Enter / 逗号 添加，点 × 删除，输入框为空时按退格删除最后一个 */
export function TagInput({ tags, onChange, placeholder }: Props) {
  const [input, setInput] = useState("");

  const commit = () => {
    const value = input.trim().replace(/[，,]$/, "").trim();
    setInput("");
    if (!value) return;
    if (tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) return;
    onChange([...tags, value]);
  };

  const removeAt = (index: number) => {
    onChange(tags.filter((_, current) => current !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {tags.length === 0 ? (
          <span className="text-sm text-slate-400">还没有添加词语</span>
        ) : (
          tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm font-medium text-brand-900 ring-1 ring-inset ring-brand-100"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`删除 ${tag}`}
                className="rounded-full p-0.5 text-brand-700 transition hover:bg-brand-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "," || event.key === "，") {
              event.preventDefault();
              commit();
              return;
            }
            if (event.key === "Backspace" && input.length === 0 && tags.length > 0) {
              removeAt(tags.length - 1);
            }
          }}
          onBlur={commit}
          placeholder={placeholder ?? "输入词语后按 Enter 添加"}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="button"
          onClick={commit}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600",
            "transition hover:border-brand-200 hover:text-brand-900"
          )}
        >
          <Plus className="h-4 w-4" />
          添加
        </button>
      </div>
    </div>
  );
}
