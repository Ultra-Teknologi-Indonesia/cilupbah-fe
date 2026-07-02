export type ScanFeedbackKind = "ok" | "error";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function playPremiumSynth(
  c: AudioContext,
  startFreq: number,
  endFreq: number,
  type: OscillatorType,
  duration: number,
  volume: number,
): void {
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;

  osc.frequency.setValueAtTime(startFreq, t0);
  if (startFreq !== endFreq) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);
  }

  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

  osc.connect(gain);
  gain.connect(c.destination);

  osc.start(t0);
  osc.stop(t0 + duration);
}

export function playScanFeedback(kind: ScanFeedbackKind): void {
  const c = getCtx();
  if (c) {
    if (kind === "ok") {
      playPremiumSynth(c, 880, 1200, "triangle", 0.4, 0.4);
    } else {
      playPremiumSynth(c, 220, 150, "square", 0.35, 0.3);
    }
  }
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function"
  ) {
    navigator.vibrate(kind === "ok" ? 35 : [60, 40, 60]);
  }
}
