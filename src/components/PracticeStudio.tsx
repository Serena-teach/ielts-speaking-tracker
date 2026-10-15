import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Trash2 } from "lucide-react";
import { deleteRecording, listRecordings, putRecording, recordingsSize, type Recording } from "../lib/idb";
import type { Part } from "../types";

type Phase = { label: string; seconds: number; record: boolean };
type Preset = { key: string; label: string; phases: Phase[] };

/** Part 1 只给单题计时；Part 2&3 给「准备 + 陈述」和 Part 3 单题计时 */
function presetsFor(part: Part): Preset[] {
  if (part === "Part 1") {
    return [{ key: "p1", label: "Part 1：每问 45 秒", phases: [{ label: "回答", seconds: 45, record: true }] }];
  }
  return [
    {
      key: "p2",
      label: "Part 2：1 分钟准备 + 2 分钟陈述",
      phases: [
        { label: "准备（不录音，只记关键词）", seconds: 60, record: false },
        { label: "陈述（自动录音）", seconds: 120, record: true },
      ],
    },
    { key: "p3", label: "Part 3：每问 45 秒", phases: [{ label: "回答", seconds: 45, record: true }] },
  ];
}

function formatSeconds(ms: number): string {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      void ctx.close();
    }, 320);
  } catch {
    /* 浏览器不允许出声就算了 */
  }
}

/**
 * 计时 + 录音一体：倒计时开始就录音，时间到自动停止保存。
 * Part 2 先走 1 分钟准备（不录音），准备结束自动开始 2 分钟录音。
 */
export function PracticeStudio({ questionId, part }: { questionId: string; part: Part }) {
  const presets = presetsFor(part);
  const [presetKey, setPresetKey] = useState(presets[0].key);
  const preset = presets.find((item) => item.key === presetKey) ?? presets[0];

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(preset.phases[0].seconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const [items, setItems] = useState<Recording[]>([]);
  const [size, setSize] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const urlRef = useRef<Map<string, string>>(new Map());

  const phase = preset.phases[Math.min(phaseIndex, preset.phases.length - 1)];

  const refresh = async () => {
    const rows = await listRecordings(questionId);
    rows.forEach((row) => {
      if (!urlRef.current.has(row.id)) urlRef.current.set(row.id, URL.createObjectURL(row.blob));
    });
    setItems(rows);
    setSize(await recordingsSize(questionId));
  };

  useEffect(() => {
    void refresh();
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      urlRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // 切换题型预设时重置
  useEffect(() => {
    stopRecording();
    setRunning(false);
    setFinished(false);
    setPhaseIndex(0);
    setRemaining(preset.phases[0].seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKey]);

  async function startRecording() {
    setMicError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError("这个浏览器不支持录音，建议用 Chrome / Edge。");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const now = Date.now();
        await putRecording({
          id: `${questionId}-${now}`,
          questionId,
          createdAt: now,
          durationMs: now - startedAtRef.current,
          mimeType: blob.type,
          blob,
        });
        await refresh();
      };
      startedAtRef.current = Date.now();
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
    } catch {
      setMicError("拿不到麦克风权限：点地址栏左侧的锁图标，把麦克风改成「允许」。");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    mediaRef.current = null;
    setRecording(false);
  }

  const advance = () => {
    beep();
    if (phase.record) stopRecording();
    const nextIndex = phaseIndex + 1;
    if (nextIndex < preset.phases.length) {
      setPhaseIndex(nextIndex);
      setRemaining(preset.phases[nextIndex].seconds);
      if (preset.phases[nextIndex].record) void startRecording();
      return;
    }
    setRunning(false);
    setFinished(true);
    setRemaining(0);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((value) => {
        if (value > 1) return value - 1;
        setTimeout(advance, 0);
        return 0;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIndex, presetKey]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      stopRecording();
      return;
    }
    if (finished) reset();
    setRunning(true);
    if (phase.record) void startRecording();
  };

  const reset = () => {
    setRunning(false);
    stopRecording();
    setFinished(false);
    setPhaseIndex(0);
    setRemaining(preset.phases[0].seconds);
  };

  const remove = async (id: string) => {
    await deleteRecording(id);
    const url = urlRef.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      urlRef.current.delete(id);
    }
    await refresh();
  };

  const total = phase.seconds || 1;
  const progress = finished ? 100 : Math.max(0, Math.min(100, ((total - remaining) / total) * 100));

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">计时 &amp; 录音</h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          {recording ? (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
              正在录音
            </>
          ) : (
            "录音只存在本机浏览器"
          )}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPresetKey(item.key)}
            className={
              "rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition " +
              (item.key === presetKey
                ? "bg-brand-900 text-white ring-brand-900"
                : "bg-white text-slate-600 ring-slate-200 hover:text-slate-900")
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{phase.label}</p>
          <p className={"font-serif text-4xl tabular-nums " + (finished ? "text-emerald-600" : "text-slate-900")}>
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggle}
            className={
              "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition " +
              (running ? "bg-rose-600 hover:bg-rose-500" : "bg-brand-900 hover:bg-brand-800")
            }
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "暂停" : finished ? "再来一次" : "开始"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            <RotateCcw className="h-4 w-4" />
            重置
          </button>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-700 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        {finished
          ? "时间到，录音已自动停止保存 —— 现在回放一遍，把卡壳和重复词记到下面的笔记里。"
          : phase.record
            ? "计时开始即自动录音，时间到自动停止。"
            : "准备阶段不录音，只记关键词；时间到会自动进入陈述并开始录音。"}
      </p>
      {micError ? <p className="mt-2 text-xs leading-relaxed text-rose-600">{micError}</p> : null}

      {items.length ? (
        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  第 {items.length - index} 次 · {formatSeconds(item.durationMs)}
                </span>
                <span>
                  {new Date(item.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <audio controls preload="none" src={urlRef.current.get(item.id)} className="h-8 w-full" />
                <button
                  type="button"
                  onClick={() => void remove(item.id)}
                  className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
                  title="删除这条录音"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
          <li className="list-none text-xs text-slate-400">
            共 {items.length} 条 · {(size / 1024 / 1024).toFixed(1)} MB
            {recording ? " · 正在录..." : ""}
          </li>
        </ul>
      ) : null}
    </section>
  );
}