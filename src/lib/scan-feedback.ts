// Feedback scan gudang: bunyi (Web Audio, tanpa file) + getar (vibrate).
// Dipakai bersama picking/packing/putaway lewat ScanAutoflowBar supaya operator
// dapat konfirmasi instan tanpa harus menatap layar.
//
// Kenapa disintesis, bukan file mp3: tidak ada aset binary, jalan offline,
// latensi ~0, tanpa isu lisensi. Bisa diganti <audio> mp3 nanti bila perlu.

export type ScanFeedbackKind = "ok" | "error"

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    if (!audioCtx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      audioCtx = new AC()
    }
    // AudioContext mulai "suspended" sampai ada gesture user; scan (Enter) = gesture.
    if (audioCtx.state === "suspended") void audioCtx.resume()
    return audioCtx
  } catch {
    return null
  }
}

function tone(
  c: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = "sine",
  peak = 0.18
): void {
  const t0 = c.currentTime + startOffset
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

/**
 * Mainkan feedback scan. `ok` = blip ganda naik (cerah), `error` = buzz rendah.
 * Sertakan getar bila didukung (Android/tablet gudang).
 */
export function playScanFeedback(kind: ScanFeedbackKind): void {
  const c = getCtx()
  if (c) {
    if (kind === "ok") {
      tone(c, 880, 0, 0.08, "sine", 0.18)
      tone(c, 1320, 0.08, 0.1, "sine", 0.18)
    } else {
      tone(c, 200, 0, 0.26, "square", 0.16)
    }
  }
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(kind === "ok" ? 35 : [60, 40, 60])
  }
}
