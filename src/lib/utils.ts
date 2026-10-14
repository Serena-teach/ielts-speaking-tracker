import { format, isValid, parseISO } from "date-fns";

/** 拼接 className，过滤掉 false / null / undefined */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** 生成题目 id（导入题库时不会用到，主要给「新增题目」之类的场景留口子） */
export function createId(prefix = "q"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** 格式化「最后练习时间」，如 2026-10-11 20:35 */
export function formatDateTime(iso?: string): string {
  if (!iso) return "尚未练习";
  const date = parseISO(iso);
  if (!isValid(date)) return "尚未练习";
  return format(date, "yyyy-MM-dd HH:mm");
}

/** 格式化日期（不含时间） */
export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const date = parseISO(iso);
  if (!isValid(date)) return "—";
  return format(date, "yyyy-MM-dd");
}

/** 把字节数转成人类可读大小 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** 触发浏览器下载一个 JSON 文件 */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
