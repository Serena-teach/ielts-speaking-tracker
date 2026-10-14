import { useEffect, useRef } from "react";
import { useQuestionStore } from "../store/useQuestionStore";
import { STORAGE_KEYS } from "./storage";

const WATCHED_KEYS = new Set<string>(Object.values(STORAGE_KEYS));

/**
 * 同一网址（同源）下多个标签页之间同步数据。
 *
 * 数据存在 localStorage 里，而每个标签页有自己的内存状态：
 * 当另一个标签页写入 localStorage 时，浏览器会在本页面触发 storage 事件，
 * 这里据此重新读取数据，所以「在 A 标签页改完，B 标签页会自动更新」，不用手动刷新。
 *
 * 注意：storage 事件只在「其他标签页」触发，本标签页自己的写入不会触发，因此不会打架。
 * 换成不同网址（localhost ↔ 127.0.0.1、换端口）、换浏览器或换设备属于不同存储空间，
 * 这种情况仍然需要用「设置 → 导出/导入 JSON」迁移。
 */
export function useStorageSync() {
  const syncFromStorage = useQuestionStore((state) => state.syncFromStorage);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      // event.key 为 null 表示对方调用了 localStorage.clear()
      if (event.key !== null && !WATCHED_KEYS.has(event.key)) return;

      // 连续输入会产生多次写入，这里合并成一次同步
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        syncFromStorage();
      }, 120);
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [syncFromStorage]);
}
