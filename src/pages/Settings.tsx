import { format } from "date-fns";
import {
  AlertTriangle,
  Copy,
  Database,
  Download,
  HardDrive,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { STORAGE_KEYS } from "../lib/storage";
import { downloadJson, formatBytes, formatDateTime } from "../lib/utils";
import { useQuestionStore } from "../store/useQuestionStore";

type Message = { type: "ok" | "error"; text: string } | null;

/**
 * 设置页（/settings）
 * 导出 / 导入 JSON、清空全部数据，以及总题数、已练题数等基础信息。
 */
export default function Settings() {
  const questions = useQuestionStore((state) => state.questions);
  const customQuestions = useQuestionStore((state) => state.customQuestions);
  const records = useQuestionStore((state) => state.records);
  const buildExportPayload = useQuestionStore((state) => state.buildExportPayload);
  const importPayload = useQuestionStore((state) => state.importPayload);
  const clearAll = useQuestionStore((state) => state.clearAll);
  const load = useQuestionStore((state) => state.load);
  const storageBytes = useQuestionStore((state) => state.storageBytes);
  const loading = useQuestionStore((state) => state.loading);
  const lastSyncedAt = useQuestionStore((state) => state.lastSyncedAt);

  const [message, setMessage] = useState<Message>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [importingBank, setImportingBank] = useState(false);
  const [copied, setCopied] = useState(false);
  /** 当前网址：localStorage 按「协议 + 主机 + 端口」隔离，换网址就是另一份数据 */
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stats = useMemo(() => {
    const total = questions.length;
    const familiar = questions.filter((item) => item.status === "familiar").length;
    const practiced = questions.filter((item) => item.status === "practiced").length;
    const notPracticed = questions.filter((item) => item.status === "not-practiced").length;
    return {
      total,
      familiar,
      practiced,
      notPracticed,
      done: familiar + practiced,
      custom: customQuestions.length,
      edited: Object.keys(records).length,
      bytes: storageBytes(),
    };
  }, [questions, customQuestions, records, storageBytes]);

  const handleCopyOrigin = async () => {
    const url = `${origin}/`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setMessage({ type: "error", text: `复制失败，请手动复制这个网址：${url}` });
    }
  };

  const handleExport = () => {
    const payload = buildExportPayload();
    downloadJson(
      `ielts-speaking-tracker-${format(new Date(), "yyyyMMdd-HHmm")}.json`,
      payload
    );
    setMessage({
      type: "ok",
      text: `已导出 ${payload.questions.length} 道题（含 9 分答案、高级词语、练习记录）。`,
    });
  };

  /** 统一的导入流程：解析 JSON -> 合并进本地数据 */
  const runImport = (rawText: string, sourceLabel: string) => {
    if (!rawText.trim()) {
      setMessage({ type: "error", text: "没有可导入的内容，请选择文件或粘贴 JSON。" });
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      setMessage({ type: "error", text: `${sourceLabel}不是合法的 JSON，请检查文件内容。` });
      return;
    }
    const result = importPayload(parsed);
    if (result.added === 0 && result.updated === 0) {
      setMessage({
        type: "error",
        text: "没有识别到任何题目：请确认每条数据至少包含 title（或 titleZh）字段。",
      });
      return;
    }
    setMessage({
      type: "ok",
      text: `导入完成：新增 ${result.added} 道题，更新 ${result.updated} 条记录${
        result.skipped > 0 ? `，跳过 ${result.skipped} 条无法识别的数据` : ""
      }。`,
    });
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    runImport(text, `文件「${file.name}」`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** 一键导入随项目附带的完整题库（public/questions-full.json） */
  const handleImportBundledBank = async () => {
    setImportingBank(true);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}questions-full.json`, {
        cache: "no-cache",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: unknown = await response.json();
      const result = importPayload(data);
      setMessage({
        type: "ok",
        text: `已导入内置完整题库：新增 ${result.added} 道题，更新 ${result.updated} 条记录。`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: `导入内置题库失败：${error instanceof Error ? error.message : "未知错误"}。请确认 public/questions-full.json 存在。`,
      });
    } finally {
      setImportingBank(false);
    }
  };

  const handleClear = () => {
    clearAll();
    setConfirmOpen(false);
    setMessage({ type: "ok", text: "已清空所有练习记录，题库已恢复到 questions.json 的原始状态。" });
  };

  const statCards = [
    { label: "总题数", value: stats.total, hint: "题库 + 导入的题目" },
    { label: "已练题数", value: stats.done, hint: "练过 + 熟练" },
    { label: "未练题数", value: stats.notPracticed, hint: "还没开口练过" },
    { label: "熟练题数", value: stats.familiar, hint: "已经完全掌握" },
  ];

  return (
    <div className="space-y-5">
      <header className="card">
        <h1 className="text-xl font-semibold text-brand-900">设置</h1>
        <p className="mt-1 text-sm text-slate-500">
          所有数据都存在这台电脑的浏览器里（localStorage），换设备请用导出 / 导入。
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="text-xs font-medium text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-900">{card.value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{card.hint}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-brand-800" />
          <h2 className="text-sm font-semibold text-slate-900">数据存储</h2>
        </div>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div className="flex items-center justify-between gap-2 sm:block">
            <dt className="text-slate-500">题库原始题目</dt>
            <dd className="tabular-nums text-slate-800">{stats.total - stats.custom} 道</dd>
          </div>
          <div className="flex items-center justify-between gap-2 sm:block">
            <dt className="text-slate-500">导入追加的题目</dt>
            <dd className="tabular-nums text-slate-800">{stats.custom} 道</dd>
          </div>
          <div className="flex items-center justify-between gap-2 sm:block">
            <dt className="text-slate-500">已编辑的题目 / 占用空间</dt>
            <dd className="tabular-nums text-slate-800">
              {stats.edited} 条 / {formatBytes(stats.bytes)}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-900 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          重新读取 public/questions.json
        </button>
      </section>

      <section className="card">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-brand-800" />
          <h2 className="text-sm font-semibold text-slate-900">数据存在哪里 / 为什么换了网页就看不到</h2>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">当前网址（数据只属于这个网址）</p>
            <p className="truncate font-mono text-sm text-slate-800">{origin}/</p>
          </div>
          <button
            type="button"
            onClick={() => void handleCopyOrigin()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-900"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "已复制" : "复制网址"}
          </button>
        </div>

        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">存储位置</dt>
            <dd className="text-slate-800">浏览器 localStorage</dd>
          </div>
          <div>
            <dt className="text-slate-500">已保存的题目记录</dt>
            <dd className="tabular-nums text-slate-800">{stats.edited} 条</dd>
          </div>
          <div>
            <dt className="text-slate-500">最近一次被其他标签页同步</dt>
            <dd className="tabular-nums text-slate-800">
              {lastSyncedAt ? formatDateTime(new Date(lastSyncedAt).toISOString()) : "尚未发生"}
            </dd>
          </div>
        </dl>
        <p className="mt-2 break-all font-mono text-[11px] text-slate-400">
          存储键：{STORAGE_KEYS.records} / {STORAGE_KEYS.custom}
        </p>

        <ul className="mt-3 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-500">
          <li>
            <b>同一个网址</b>下开多个标签页：一边改，另一边会自动同步，不需要刷新。
          </li>
          <li>
            <b>换了网址就是另一份数据</b>：localhost 与 127.0.0.1、不同端口、不同浏览器、无痕窗口、另一台电脑，
            浏览器都会各自隔离保存，网站无法互相读取（这是浏览器的安全策略，不是 bug）。
          </li>
          <li>
            要搬数据：在当前网址<b>导出 JSON</b>，到新网址（或新设备）<b>导入 JSON</b> 即可，同 id 的题目会合并。
          </li>
        </ul>
      </section>
      <section className="card">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-brand-800" />
          <h2 className="text-sm font-semibold text-slate-900">导出 JSON</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          导出内容包含全部题目、9 分答案、高级词语、改进问题、我的思路与练习记录，可直接用于备份或迁移到另一台设备。
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          <Download className="h-4 w-4" />
          导出为 JSON 文件
        </button>
      </section>

      <section className="card">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-brand-800" />
          <h2 className="text-sm font-semibold text-slate-900">导入 JSON</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          导入采用<b>合并</b>语义：同 id 的题目会用导入数据覆盖当前内容，题库里没有的题目会被追加进来。
          可以直接导入本应用导出的备份文件，也可以导入自己整理的题库（字段格式见 README）。
        </p>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
          <p className="text-xs text-slate-500">
            随项目附带的完整题库（2026 年 9-12 月，99 道题）就在 public/questions-full.json，可以一键导入。
          </p>
          <button
            type="button"
            onClick={() => void handleImportBundledBank()}
            disabled={importingBank}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm font-medium text-brand-900 transition hover:bg-brand-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${importingBank ? "animate-spin" : ""}`} />
            导入内置完整题库（99 题）
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(event) => void handleFileChange(event.target.files?.[0])}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            <Upload className="h-4 w-4" />
            选择 JSON 文件
          </button>
          <span className="text-xs text-slate-400">或直接在下面粘贴 JSON 内容</span>
        </div>

        <textarea
          value={pasted}
          onChange={(event) => setPasted(event.target.value)}
          rows={5}
          placeholder='[{"id":"p1-new-topic","region":"mainland","category":"new","part":"Part 1","title":"New topic"}]'
          className="thin-scrollbar mt-3 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="button"
          disabled={!pasted.trim()}
          onClick={() => {
            runImport(pasted, "粘贴的内容");
            setPasted("");
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-900 disabled:opacity-50"
        >
          导入粘贴的内容
        </button>
      </section>

      <section className="card border-red-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <h2 className="text-sm font-semibold text-red-700">危险操作</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          清空所有数据会删除练习记录、答案、标签以及导入的题目，并恢复到 public/questions.json 的初始状态，且无法撤销。
        </p>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4" />
          清空所有数据
        </button>
      </section>

      {message ? (
        <div
          role="status"
          className={`rounded-2xl border p-4 text-sm ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="确定要清空所有数据吗？"
        description={"练习记录、9 分答案、高级词语、导入的题目都会被删除。\n建议先导出 JSON 备份。"}
        confirmLabel="确认清空"
        onConfirm={handleClear}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}


