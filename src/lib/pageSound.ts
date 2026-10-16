/**
 * Page-turn sound for the menu book — generated in the browser, no audio files.
 *
 * A real page turn is not a "whoosh" — it is paper: hundreds of tiny crackles as the sheet
 * bends (bright, 1–8 kHz), a faint hiss of the surface sliding, a soft push of air as it sweeps
 * over, and a quiet flap when it lands. Each part is synthesised sample-by-sample into a buffer;
 * a few variations are pre-rendered so consecutive turns never sound identical.
 *
 * Browsers only allow audio after a click / tap / key press, so the context unlocks on the first one.
 */
const KEY = 'laliga.sound'
const VARIANTS = 6

let ctx: AudioContext | null = null
let buffers: AudioBuffer[] = []
let lastAt = 0
let lastVariant = -1

export const soundEnabled = () => {
  try { return localStorage.getItem(KEY) !== 'off' } catch { return true }
}
export const setSoundEnabled = (on: boolean) => {
  try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* storage blocked */ }
  if (on) unlock()
}

/* -------------------------------------------------------------------------- */
/*  Synthesis                                                                 */
/* -------------------------------------------------------------------------- */

/** seeded RNG so variants are stable */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** one-pole filter coefficient for a cutoff frequency */
const coef = (fc: number, sr: number) => Math.exp((-2 * Math.PI * fc) / sr)

export function renderPageTurn(sr: number, seed: number): Float32Array {
  const r = rng(seed * 7919 + 17)
  const dur = 0.5 + r() * 0.16
  const n = Math.floor(sr * dur)
  const out = new Float32Array(n)

  // overall shape: lift (soft) → bend (crackly peak) → sweep → land
  const env = (x: number) => {
    if (x < 0.12) return (x / 0.12) ** 2 * 0.35
    if (x < 0.42) return 0.35 + ((x - 0.12) / 0.3) * 0.65
    if (x < 0.62) return 1 - ((x - 0.42) / 0.2) * 0.35
    return Math.max(0, 0.65 * (1 - (x - 0.62) / 0.38) ** 1.6)
  }

  /* 1. crackle — sparse sharp grains of bright noise */
  const crack = new Float32Array(n)
  const density = 1500 + r() * 900 // grains per second at the peak
  for (let i = 0; i < n; i++) {
    const e = env(i / n)
    if (r() < (density * e * e) / sr) {
      const len = Math.floor(sr * (0.0003 + r() * 0.0026))
      const amp = Math.min(1, 0.12 + -Math.log(1 - r() * 0.98) * 0.32) * (0.4 + 0.6 * e)
      for (let k = 0; k < len && i + k < n; k++) {
        crack[i + k] += (r() * 2 - 1) * amp * Math.exp((-5 * k) / len)
      }
    }
  }
  // band-limit the grains to where paper lives: high-pass ≈1.2 kHz (crisp, not thumpy),
  // low-pass ≈7.5 kHz twice (no fizzy ultra-highs)
  {
    const a = coef(1200, sr), b = coef(7500, sr)
    let px = 0, py = 0, l1 = 0, l2 = 0
    for (let i = 0; i < n; i++) {
      const y = a * (py + crack[i] - px)
      px = crack[i]
      py = y
      l1 = (1 - b) * y + b * l1
      l2 = (1 - b) * l1 + b * l2
      crack[i] = l2 * 1.6
    }
  }

  /* 2. surface hiss — band-limited noise 2–7 kHz following the envelope */
  const hiss = new Float32Array(n)
  {
    const aLp = coef(5200, sr), aHp = coef(1800, sr)
    let lp = 0, hpx = 0, hpy = 0
    for (let i = 0; i < n; i++) {
      const w = r() * 2 - 1
      lp = (1 - aLp) * w + aLp * lp
      const y = aHp * (hpy + lp - hpx)
      hpx = lp
      hpy = y
      hiss[i] = y * env(i / n) * 0.16
    }
  }

  /* 3. air — low noise swell as the sheet sweeps over (peaks ~60%) */
  const air = new Float32Array(n)
  {
    const a = coef(520, sr)
    let l1 = 0, l2 = 0
    for (let i = 0; i < n; i++) {
      const x = i / n
      const w = r() * 2 - 1
      l1 = (1 - a) * w + a * l1
      l2 = (1 - a) * l1 + a * l2
      const swell = Math.exp(-(((x - 0.6) / 0.17) ** 2))
      air[i] = l2 * swell * 2.2
    }
  }

  /* 4. landing flap — tiny low thud near the end */
  const flap = new Float32Array(n)
  {
    const start = Math.floor(n * (0.84 + r() * 0.05))
    const len = Math.floor(sr * 0.035)
    const a = coef(380, sr)
    let l = 0
    for (let k = 0; k < len && start + k < n; k++) {
      l = (1 - a) * (r() * 2 - 1) + a * l
      flap[start + k] = l * Math.exp((-6 * k) / len) * 3.2
    }
  }

  // mix + gentle fade-in/out (no clicks) + normalise
  let peak = 0
  for (let i = 0; i < n; i++) {
    const fade = Math.min(1, i / (sr * 0.004), (n - i) / (sr * 0.01))
    const v = (crack[i] * 0.9 + hiss[i] + air[i] + flap[i]) * fade
    out[i] = v
    peak = Math.max(peak, Math.abs(v))
  }
  const g = peak > 0 ? 0.8 / peak : 1
  for (let i = 0; i < n; i++) out[i] *= g
  return out
}

/* -------------------------------------------------------------------------- */
/*  Playback                                                                  */
/* -------------------------------------------------------------------------- */

function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    buffers = Array.from({ length: VARIANTS }, (_, v) => {
      const data = renderPageTurn(ctx!.sampleRate, v + 1)
      const b = ctx!.createBuffer(1, data.length, ctx!.sampleRate)
      b.getChannelData(0).set(data)
      return b
    })
  }
  return ctx
}

export function unlock() {
  const a = audio()
  if (a && a.state === 'suspended') a.resume().catch(() => {})
}

if (typeof window !== 'undefined') {
  const events = ['pointerdown', 'keydown', 'touchstart'] as const
  const once = () => { unlock(); events.forEach((e) => window.removeEventListener(e, once)) }
  events.forEach((e) => window.addEventListener(e, once, { passive: true }))
}

/** One page turn. `fast` = flipping several pages quickly (shorter, quieter). */
export function playPageTurn(fast = false) {
  if (!soundEnabled()) return
  const a = audio()
  if (!a || a.state !== 'running' || !buffers.length) return
  const now = a.currentTime
  if (now - lastAt < (fast ? 0.09 : 0.06)) return
  lastAt = now

  let v = Math.floor(Math.random() * buffers.length)
  if (v === lastVariant) v = (v + 1) % buffers.length
  lastVariant = v

  const src = a.createBufferSource()
  src.buffer = buffers[v]
  src.playbackRate.value = (fast ? 1.35 : 1) * (0.94 + Math.random() * 0.12)

  const gain = a.createGain()
  gain.gain.value = fast ? 0.32 : 0.5

  // the page sweeps from right to left — pan follows it
  const pan = a.createStereoPanner ? a.createStereoPanner() : null
  if (pan) {
    const d = buffers[v].duration / src.playbackRate.value
    pan.pan.setValueAtTime(0.35, now)
    pan.pan.linearRampToValueAtTime(-0.35, now + d)
    src.connect(gain).connect(pan).connect(a.destination)
  } else {
    src.connect(gain).connect(a.destination)
  }
  src.start(now)
}
