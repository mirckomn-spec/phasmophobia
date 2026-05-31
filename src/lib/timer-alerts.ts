let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

function playTone(frequency: number, durationMs: number, volume = 0.25) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.value = frequency;
  gain.gain.value = volume;

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  osc.start(now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
  osc.stop(now + durationMs / 1000);
}

/** PI — beep curto */
export function playShortBeep() {
  playTone(880, 120);
}

/** PIIIII — beep longo */
export function playLongBeep() {
  playTone(660, 550, 0.3);
}

/** Segundos restantes nos quais cada fantasma pode caçar (max - elapsed). */
export const SMUDGE_ALERT_THRESHOLDS = [120, 90, 0] as const;

export function checkCountdownAlerts(
  prevSeconds: number,
  currentSeconds: number,
  thresholds: readonly number[]
) {
  if (currentSeconds >= prevSeconds) return;

  for (const target of thresholds) {
    if (
      currentSeconds === target + 3 ||
      currentSeconds === target + 2 ||
      currentSeconds === target + 1
    ) {
      playShortBeep();
      return;
    }
    if (prevSeconds > target && currentSeconds === target) {
      playLongBeep();
      return;
    }
  }
}
