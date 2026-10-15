import { useEffect, useRef, useState } from "react";
import { Mic, Play, Square, Trash2 } from "lucide-react";
import {
  deleteRecording,
  listRecordings,
  putRecording,
  recordingsSize,
  type Recording,
} from "../lib/idb";

type Props = { questionId: string };

function formatSeconds(ms: number): string {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * 录音回放：录下自己的口语版本，存在浏览器 IndexedDB 里（不上传任何服务器）。
 * 同一道题可以存多次，能听出「第 3 次比第 1 次顺」。
 */
export function Recorder({ questionId }: Props) {
  const [items, setItems] = useState<Recording[]>([]);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [size, setSize] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const tickRef = useRef<number | null>(null);
  const urlRef = useRef<Map<string, string>>(new Map());

  const refresh = async () => {
    const rows = await listRecordings(questionId);
    rows.forEach((row) => {
      if (!urlRef.current.has(row.id)) {
        urlRef.current.set(row.id, URL.createObjectURL(row.blob));
      }
    });
    setItems(rows);
    setSize(await recordingsSize(questionId));
  };

  useEffect(() => {
    void refresh();
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      urlRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const stopTimer = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const start = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("这个浏览器不支持录音，建议用 Chrome / Edge 打开。");
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
        stopTimer();
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
      setElapsed(0);
      tickRef.current = window.setInterval(() => setElapsed(Date.now() - startedAtRef.current), 200);
    } catch {
      setError("拿不到麦克风权限。请点地址栏左侧的锁图标，把麦克风改成「允许」。");
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    mediaRef.current = null;
    setRecording(false);
    stopTimer();
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

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">录音回放</h2>
        <span className="text-xs text-slate-400">
          {items.length} 条 · {(size / 1024 / 1024).toFixed(1)} MB
        </span>
      </div>

      <button
        type="button"
        onClick={() => (recording ? stop() : void start())}
        className={
          "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition " +
          (recording ? "bg-rose-600 hover:bg-rose-500" : "bg-brand-900 hover:bg-brand-800")
        }
      >
        {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {recording ? `停止录音 ${formatSeconds(elapsed)}` : "开始录音"}
      </button>

      {error ? <p className="mt-2 text-xs leading-relaxed text-rose-600">{error}</p> : null}

      {items.length ? (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  第 {items.length - index} 次 · {formatSeconds(item.durationMs)}
                </span>
                <span>{new Date(item.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Play className="h-3.5 w-3.5 shrink-0 text-slate-400" />
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
        </ul>
      ) : (
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          录下自己说的版本，回放能听出卡壳和重复词 —— 这是文字笔记替代不了的一环。录音只存在这台电脑的浏览器里。
        </p>
      )}
    </section>
  );
}