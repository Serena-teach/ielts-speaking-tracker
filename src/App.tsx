import { useEffect, useRef } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { useStorageSync } from "./lib/useStorageSync";
import QuestionDetail from "./pages/QuestionDetail";
import QuestionList from "./pages/QuestionList";
import Settings from "./pages/Settings";
import { useQuestionStore } from "./store/useQuestionStore";

/**
 * 应用入口：负责在启动时加载 public/questions.json，
 * 并把三个页面挂到路由上（题目列表 / 题目详情 / 设置）。
 */
export default function App() {
  const load = useQuestionStore((state) => state.load);
  const loaded = useQuestionStore((state) => state.loaded);
  const loading = useQuestionStore((state) => state.loading);
  // StrictMode 下 effect 会执行两次，这里保证题库只加载一次
  const requested = useRef(false);

  // 同一个网址开多个标签页时，自动同步彼此的修改
  useStorageSync();

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    void load();
  }, [load]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<QuestionList />} />
        <Route path="/question/:id" element={<QuestionDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* 首次加载题库时给一个轻量提示，避免详情页直开时出现空白 */}
      {!loaded && loading ? (
        <p className="mt-6 text-center text-sm text-slate-400">正在加载题库…</p>
      ) : null}
    </Layout>
  );
}

