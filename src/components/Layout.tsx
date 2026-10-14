import { BookOpen, Settings as SettingsIcon } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

/** 全站外壳：顶部导航 + 内容容器 */
export default function Layout({ children }: { children: ReactNode }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
      isActive ? "bg-white/15 text-white" : "text-brand-100 hover:bg-white/10 hover:text-white"
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-brand-800/40 bg-brand-900 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-wide">雅思口语题库</span>
              <span className="block text-[11px] text-brand-100/80">Speaking Practice Tracker</span>
            </span>
          </NavLink>
          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={linkClass}>
              <BookOpen className="h-4 w-4" />
              题目列表
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              <SettingsIcon className="h-4 w-4" />
              设置
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-center text-xs text-slate-400 sm:px-6">
        数据保存在浏览器 localStorage 中，不会上传到任何服务器 · 同一网址的多个标签页会自动同步；换网址 / 换设备请用「设置」页导出导入
      </footer>
    </div>
  );
}


