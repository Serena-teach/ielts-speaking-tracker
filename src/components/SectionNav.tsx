import { cn } from "../lib/utils";
import type { Section } from "../types";

export type SectionNavItem = {
  section: Section;
  total: number;
  done: number;
};

type Props = {
  items: SectionNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
};

/** 左侧分区导航 */
export function SectionNav({ items, activeKey, onSelect }: Props) {
  return (
    <nav className="rounded-2xl border border-slate-200 bg-white p-2 shadow-card">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">题库分区</p>
      <ul className="space-y-0.5">
        {items.map(({ section, total, done }) => {
          const active = section.key === activeKey;
          return (
            <li key={section.key}>
              <button
                type="button"
                onClick={() => onSelect(section.key)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                  active
                    ? "bg-brand-900 font-semibold text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span className="leading-snug">{section.label}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-xs tabular-nums",
                    active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {done}/{total}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
