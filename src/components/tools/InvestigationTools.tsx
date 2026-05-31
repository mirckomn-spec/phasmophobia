"use client";

import { useEffect, useRef, useState } from "react";
import {
  SMUDGE_ALERT_THRESHOLDS,
  checkCountdownAlerts,
} from "@/lib/timer-alerts";

type TimerState = "idle" | "running" | "paused";

function useTimer(
  initialSeconds: number,
  options?: {
    maxSeconds?: number;
    alertThresholds?: readonly number[];
  }
) {
  const maxSeconds = options?.maxSeconds ?? initialSeconds;
  const alertThresholds = options?.alertThresholds;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [state, setState] = useState<TimerState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevSecondsRef = useRef(initialSeconds);

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => Math.max(0, s - 1));
      }, 1000);
    } else {
      clear();
    }
    return clear;
  }, [state]);

  useEffect(() => {
    if (state !== "running" || !alertThresholds?.length) {
      prevSecondsRef.current = seconds;
      return;
    }

    checkCountdownAlerts(prevSecondsRef.current, seconds, alertThresholds);
    prevSecondsRef.current = seconds;
  }, [seconds, state, alertThresholds]);

  const start = () => setState("running");
  const pause = () => setState("paused");
  const reset = (val?: number) => {
    setState("idle");
    const next = val ?? initialSeconds;
    setSeconds(next);
    prevSecondsRef.current = next;
  };

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const remainingProgress = maxSeconds > 0 ? seconds / maxSeconds : 0;

  const togglePlay = () => {
    if (state === "running") pause();
    else start();
  };

  return {
    seconds,
    state,
    start,
    pause,
    reset,
    togglePlay,
    format,
    maxSeconds,
    remainingProgress,
  };
}

function TimerControls({
  state,
  onStart,
  onPause,
  onReset,
}: {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-6 flex gap-4">
      {state !== "running" ? (
        <button
          onClick={onStart}
          className="border border-white px-5 py-2 font-body text-xs uppercase tracking-widest text-white transition-opacity hover:opacity-70"
        >
          Iniciar
        </button>
      ) : (
        <button
          onClick={onPause}
          className="border border-[#8A8A8A] px-5 py-2 font-body text-xs uppercase tracking-widest text-[#D9D9D9] transition-opacity hover:opacity-70"
        >
          Pausar
        </button>
      )}
      <button
        onClick={onReset}
        className="border border-[#171717] px-5 py-2 font-body text-xs uppercase tracking-widest text-[#8A8A8A] transition-opacity hover:opacity-70"
      >
        Reiniciar
      </button>
    </div>
  );
}

type Mark = {
  label: string;
  remainingAt: number;
  color: string;
  dashed?: boolean;
};

function CountdownProgressBar({
  remainingProgress,
  seconds,
  marks,
  max,
  timerState,
  onTogglePlay,
  showHint = true,
}: {
  remainingProgress: number;
  seconds: number;
  marks: Mark[];
  max: number;
  timerState?: TimerState;
  onTogglePlay?: () => void;
  showHint?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, remainingProgress * 100));

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        {onTogglePlay && (
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#333] bg-[#1a1a1a] text-[#8A8A8A] transition-colors hover:border-[#555] hover:text-white"
            aria-label={timerState === "running" ? "Pausar" : "Iniciar"}
          >
            {timerState === "running" ? (
              <span className="flex gap-0.5">
                <span className="h-3 w-0.5 bg-current" />
                <span className="h-3 w-0.5 bg-current" />
              </span>
            ) : (
              <span className="ml-0.5 block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-[#8A8A8A]" />
            )}
          </button>
        )}

        <div className="relative h-1 min-w-0 flex-1 bg-[#171717]">
          <div
            className="absolute left-0 top-0 h-1 bg-white transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
          {marks.map((mark) => {
            const left = (mark.remainingAt / max) * 100;
            return (
              <div
                key={`${mark.label}-${mark.remainingAt}`}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${left}%` }}
              >
                {mark.dashed ? (
                  <div
                    className="h-3 w-px border-l border-dashed"
                    style={{ borderColor: mark.color }}
                  />
                ) : (
                  <div className="h-3 w-px" style={{ backgroundColor: mark.color }} />
                )}
                {mark.label && (
                  <span
                    className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-body text-[10px] uppercase tracking-wider"
                    style={{ color: mark.color }}
                  >
                    {mark.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="shrink-0 font-display text-2xl tabular-nums text-white md:text-3xl">
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
        </p>
      </div>
      {showHint && (
        <p className="mt-4 font-body text-[10px] text-[#8A8A8A]">
          Apito 3s antes de cada marca · PI PI PI PIIIII
        </p>
      )}
    </div>
  );
}

function TimerPanel({
  title,
  description,
  children,
  controls,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  controls: React.ReactNode;
}) {
  return (
    <div className="border border-[#171717] bg-[#0A0A0A] p-6 md:p-8">
      <p className="label">{title}</p>
      {description && (
        <p className="mt-2 font-body text-xs text-[#8A8A8A]">{description}</p>
      )}
      {children}
      {controls}
    </div>
  );
}

const SMUDGE_MAX = 180;

const SMUDGE_MARKS: Mark[] = [
  { label: "Spirit", remainingAt: 0, color: "#2dd4bf" },
  { label: "Normal", remainingAt: 90, color: "#FFFFFF" },
  { label: "Demon", remainingAt: 120, color: "#f87171", dashed: true },
];

const DEMON_COOLDOWN_MAX = 25;
const DEMON_COOLDOWN_ALERT = [6, 0] as const;

const DEMON_COOLDOWN_MARKS: Mark[] = [
  { label: "", remainingAt: 0, color: "#FFFFFF" },
  { label: "Demon", remainingAt: 6, color: "#c0392b", dashed: true },
];

export function SmudgeTimer() {
  const timer = useTimer(SMUDGE_MAX, {
    maxSeconds: SMUDGE_MAX,
    alertThresholds: SMUDGE_ALERT_THRESHOLDS,
  });

  return (
    <TimerPanel
      title="Smudge Stick"
      description="Delay de caça pós-incenso · timer regressivo"
      controls={
        <TimerControls
          state={timer.state}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={() => timer.reset(SMUDGE_MAX)}
        />
      }
    >
      <CountdownProgressBar
        remainingProgress={timer.remainingProgress}
        seconds={timer.seconds}
        marks={SMUDGE_MARKS}
        max={SMUDGE_MAX}
        timerState={timer.state}
        onTogglePlay={timer.togglePlay}
      />
    </TimerPanel>
  );
}

export function DemonCooldownTimer() {
  const timer = useTimer(DEMON_COOLDOWN_MAX, {
    maxSeconds: DEMON_COOLDOWN_MAX,
    alertThresholds: DEMON_COOLDOWN_ALERT,
  });

  return (
    <TimerPanel
      title="Cooldown de Demon"
      description="Intervalo mínimo entre caças do Demon · 25s"
      controls={
        <TimerControls
          state={timer.state}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={() => timer.reset(DEMON_COOLDOWN_MAX)}
        />
      }
    >
      <CountdownProgressBar
        remainingProgress={timer.remainingProgress}
        seconds={timer.seconds}
        marks={DEMON_COOLDOWN_MARKS}
        max={DEMON_COOLDOWN_MAX}
        timerState={timer.state}
        onTogglePlay={timer.togglePlay}
      />
    </TimerPanel>
  );
}

const HUNT_DURATIONS: Record<string, Record<string, number>> = {
  Small: { Amateur: 30, Intermediate: 40, Professional: 50, Nightmare: 60, Insanity: 60 },
  Medium: { Amateur: 40, Intermediate: 50, Professional: 60, Nightmare: 65, Insanity: 65 },
  Large: { Amateur: 50, Intermediate: 60, Professional: 60, Nightmare: 65, Insanity: 65 },
};

export function HuntTimer() {
  const [mapSize, setMapSize] = useState<keyof typeof HUNT_DURATIONS>("Medium");
  const [difficulty, setDifficulty] = useState("Professional");
  const duration = HUNT_DURATIONS[mapSize][difficulty] ?? 60;
  const timer = useTimer(duration, { maxSeconds: duration });

  const changeConfig = (size: keyof typeof HUNT_DURATIONS, diff: string) => {
    setMapSize(size);
    setDifficulty(diff);
    timer.reset(HUNT_DURATIONS[size][diff] ?? 60);
  };

  return (
    <TimerPanel
      title="Duração de Hunt"
      description={`${mapSize} · ${difficulty} · ${duration}s estimados`}
      controls={
        <>
          <div className="mt-8 flex flex-wrap gap-4">
            {(Object.keys(HUNT_DURATIONS) as (keyof typeof HUNT_DURATIONS)[]).map((size) => (
              <button
                key={size}
                onClick={() => changeConfig(size, difficulty)}
                className={`label transition-opacity ${
                  mapSize === size ? "text-white" : "text-[#8A8A8A] hover:text-[#D9D9D9]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <select
            value={difficulty}
            onChange={(e) => changeConfig(mapSize, e.target.value)}
            className="mt-4 border border-[#171717] bg-black px-4 py-2 font-body text-xs text-white outline-none"
          >
            {Object.keys(HUNT_DURATIONS.Medium).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="mt-6">
            <div className="relative h-1 w-full bg-[#171717]">
              <div
                className="absolute left-0 top-0 h-1 bg-white transition-all duration-1000 ease-linear"
                style={{ width: `${timer.remainingProgress * 100}%` }}
              />
            </div>
          </div>
          <TimerControls
            state={timer.state}
            onStart={timer.start}
            onPause={timer.pause}
            onReset={() => timer.reset(duration)}
          />
        </>
      }
    />
  );
}

export function ParanormalSoundTimer() {
  const timer = useTimer(20, { maxSeconds: 20 });

  return (
    <TimerPanel
      title="Sons Paranormais"
      description="Intervalo entre interações"
      controls={
        <>
          <div className="mt-6">
            <div className="relative h-1 w-full bg-[#171717]">
              <div
                className="absolute left-0 top-0 h-1 bg-white transition-all duration-1000 ease-linear"
                style={{ width: `${timer.remainingProgress * 100}%` }}
              />
            </div>
          </div>
          <p className="mt-4 font-display text-4xl tabular-nums text-white">
            {timer.format(timer.seconds)}
          </p>
          <TimerControls
            state={timer.state}
            onStart={timer.start}
            onPause={timer.pause}
            onReset={() => timer.reset(20)}
          />
        </>
      }
    />
  );
}

export function InvestigationTools() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SmudgeTimer />
      <DemonCooldownTimer />
      <HuntTimer />
      <ParanormalSoundTimer />
    </div>
  );
}
