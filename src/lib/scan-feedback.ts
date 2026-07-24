export type ScanFeedbackKind =
  | "ok"
  | "error"
  | "order_canceled"
  | "order_cancel_requested"
  | "courier_mismatch";

let zzfxCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!zzfxCtx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      zzfxCtx = new AC();
    }
    if (zzfxCtx.state === "suspended") void zzfxCtx.resume();
    return zzfxCtx;
  } catch {
    return null;
  }
}

/* eslint-disable */
function zzfx(
  p = 1,
  k = 0.05,
  b = 220,
  e = 0,
  r = 0,
  t = 0.1,
  q = 0,
  D = 1,
  u = 0,
  y = 0,
  v = 0,
  z = 0,
  l = 0,
  E = 0,
  A = 0,
  F = 0,
  c = 0,
  w = 1,
  m = 0,
  B = 0,
  N = 0,
): void {
  const ctx = getCtx();
  if (!ctx) return;

  const R = 44100;
  const PI2 = Math.PI * 2;
  const abs = Math.abs;
  const sign = (x: number) => (x < 0 ? -1 : 1);
  const masterVol = 0.3;

  let startSlide = (u *= (500 * PI2) / R / R);
  let startFreq = (b *= ((1 + k * 2 * Math.random() - k) * PI2) / R);
  let modOff = 0,
    rep = 0,
    crush = 0,
    jump = 1,
    len: number,
    buf: number[] = [],
    ph = 0,
    i = 0,
    s = 0,
    f: number;

  const qual = 2,
    ww = (PI2 * abs(N) * 2) / R,
    co = Math.cos(ww),
    al = Math.sin(ww) / 2 / qual,
    a0 = 1 + al,
    a1 = (-2 * co) / a0,
    a2 = (1 - al) / a0,
    b0 = (1 + sign(N) * co) / 2 / a0,
    b1 = -(sign(N) + co) / a0,
    b2 = b0;
  let x2 = 0,
    x1 = 0,
    y2 = 0,
    y1 = 0;

  e = e * R + 9;
  m *= R;
  r *= R;
  t *= R;
  c *= R;
  y *= (500 * PI2) / R ** 3;
  A *= PI2 / R;
  v *= PI2 / R;
  z *= R;
  l = (l * R) | 0;
  p *= masterVol;

  for (len = (e + m + r + t + c) | 0; i < len; buf[i++] = s * p) {
    if (!(++crush % ((F * 100) | 0) || !F)) {
      s = q
        ? q > 1
          ? q > 2
            ? q > 3
              ? q > 4
                ? (ph / PI2) % 1 < D / 2
                  ? 1
                  : -1
                : Math.sin(ph ** 3)
              : Math.max(Math.min(Math.tan(ph), 1), -1)
            : 1 - (((((2 * ph) / PI2) % 2) + 2) % 2)
          : 1 - 4 * abs(Math.round(ph / PI2) - ph / PI2)
        : Math.sin(ph);

      s =
        (l ? 1 - B + B * Math.sin((PI2 * i) / l) : 1) *
        (q > 4 ? s : sign(s) * abs(s) ** D) *
        (i < e
          ? i / e
          : i < e + m
            ? 1 - ((i - e) / m) * (1 - w)
            : i < e + m + r
              ? w
              : i < len - c
                ? ((len - i - c) / t) * w
                : 0);

      s = c
        ? s / 2 +
          (c > i
            ? 0
            : ((i < len - c ? 1 : (len - i) / c) * buf[(i - c) | 0]) / 2 / p)
        : s;

      if (N)
        s = y1 =
          b2 * x2 + b1 * (x2 = x1) + b0 * (x1 = s) - a2 * y2 - a1 * (y2 = y1);
    }

    f = (b += u += y) * Math.cos(A * modOff++);
    ph += f + f * E * Math.sin(i ** 5);

    if (jump && ++jump > z) {
      b += v;
      startFreq += v;
      jump = 0;
    }

    if (l && !(++rep % l)) {
      b = startFreq;
      u = startSlide;
      jump ||= 1;
    }
  }

  const buffer = ctx.createBuffer(1, buf.length, R);
  buffer.getChannelData(0).set(buf);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}

const SFX_SUCCESS          = [2,0,987,.005,.04,.5,0,1.5,,500,.05,,,.8] as const;
const SFX_ERROR            = [2,0,523,.01,.12,.25,0,1,,-120,.08,,,.8] as const;
const SFX_CANCELED         = [2,0,180,.01,.16,.3,1,1,,-60,.1,,,.7] as const;
const SFX_CANCEL_REQUESTED = [2,0,700,.01,.09,.2,0,1,,90,.06,,,.6] as const;
const SFX_COURIER_MISMATCH = [2,0,340,.01,.2,.3,0,1,,-260,.14,,,.9] as const;

let audioUnlocked = false;

export function primeScanAudio(): void {
  const ctx = getCtx();
  if (!ctx || audioUnlocked) return;

  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    audioUnlocked = true;
  } catch {}
}

export function scanFeedbackFromErrorCode(
  code: string | null | undefined,
): ScanFeedbackKind {
  switch (code) {
    case "order_canceled":
      return "order_canceled";
    case "order_cancel_requested":
      return "order_cancel_requested";
    case "courier_mismatch":
      return "courier_mismatch";
    default:
      return "error";
  }
}

export function playScanFeedback(kind: ScanFeedbackKind): void {
  switch (kind) {
    case "ok":
      zzfx(...SFX_SUCCESS);
      break;
    case "order_canceled":
      zzfx(...SFX_CANCELED);
      break;
    case "order_cancel_requested":
      zzfx(...SFX_CANCEL_REQUESTED);
      break;
    case "courier_mismatch":
      zzfx(...SFX_COURIER_MISMATCH);
      break;
    default:
      zzfx(...SFX_ERROR);
  }

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function"
  ) {
    const pattern: number | number[] =
      kind === "ok"
        ? 35
        : kind === "order_canceled"
          ? [100, 60, 100, 60, 100]
          : kind === "courier_mismatch"
            ? [140, 70, 140]
            : [60, 40, 60];
    navigator.vibrate(pattern);
  }
}
