import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

type Phase = { label: string; seconds: number };

const PRESETS: { key: string; label: string; phases: Phase[] }[] = [
  {
    key: "part2",
    label: "Part 2：1 分钟准备 + 2 分钟陈述",
    phases: [
      { label: "准备", seconds: 60 },
      { label: "陈述", seconds: 120 },
    ],
  },
  { key: "part13", label: "Part 1 / 3：单题 45 秒", phases: [{ label: "回答", seconds: 45 }] },
  { key: "short", label: "30 秒冲刺", phases: [{ label: "回答", seconds: 30 }] },
];

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
    /* 浏览器不允许就算了 */
  }
}

/** 考场节奏计时器：Part 2 的 1+2 分钟，Part 1/3 的单题限时。 */
export function PracticeTimer() {
  const [presetKey, setPresetKey] = useState(PRESETS[0].key);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(PRESETS[0].phases[0].seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const preset = PRESETS.find((item) => item.key === presetKey) ?? PRESETS[0];
  const phase = preset.phases[Math.min(phaseIndex, preset.phases.length - 1)];

  const reset = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setDone(false);
    setPhaseIndex(0);
    setRemaining(preset.phases[0].seconds);
  };

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKey]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((value) => {
        if (value > 1) return value - 1;
        // 进入下一阶段
        beep();
        const nextIndex = phaseIndex + 1;
        if (nextIndex < preset.phases.length) {
          setPhaseIndex(nextIndex);
          return preset.phases[nextIndex].seconds;
        }
        setRunning(false);
        setDone(true);
        return 0;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIndex, presetKey]);

  const total = phase.seconds;
  const progress = total ? Math.max(0, Math.min(100, ((total - remaining) / total) * 100)) : 0;

  return (
    <section className="card">
      <h2 className="text-sm font-semibold text-slate-900">计时器</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((item) => (
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
          <p className={"font-serif text-4xl tabular-nums " + (done ? "text-emerald-600" : "text-slate-900")}>
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            disabled={done}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-40"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "暂停" : "开始"}
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
        {done ? "时间到 —— 现在回头看录音和笔记，标出卡壳的地方。" : "准备时间别写句子，只记关键词；陈述时看着关键词说。"}
      </p>
    </section>
  );
}