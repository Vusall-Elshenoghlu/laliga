import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { L } from '../../lib/i18n'

/**
 * The PS-style handheld controller, in several real finishes (photos in /media/game/pads/,
 * all shot in exactly the same position, so hotspots / screen / cartridges line up for every one).
 *
 * Switching finish: the new photo is preloaded, then revealed with a circle that spreads from the
 * swatch that was clicked, with a glowing wave on its edge.
 */

export type PadColor = {
  id: string
  name: L
  /** a colour for the wave / glow */
  glow: string
}

export const PAD_COLORS: PadColor[] = [
  { id: 'white', name: { az: 'Ağ', en: 'White', ru: 'Белый' }, glow: '#ffffff' },
  { id: 'black', name: { az: 'Gecə qarası', en: 'Midnight Black', ru: 'Полночный чёрный' }, glow: '#8a93ff' },
  { id: 'blue', name: { az: 'Ulduz mavisi', en: 'Starlight Blue', ru: 'Звёздный синий' }, glow: '#4fc3ff' },
  { id: 'pink', name: { az: 'Nova çəhrayı', en: 'Nova Pink', ru: 'Розовый «Нова»' }, glow: '#ff5fb8' },
  { id: 'chrome-red', name: { az: 'Xrom qırmızı', en: 'Chroma Red', ru: 'Хромированный красный' }, glow: '#ff3344' },
  { id: 'camo', name: { az: 'Boz kamuflyaj', en: 'Grey Camouflage', ru: 'Серый камуфляж' }, glow: '#c9ccd2' },
  { id: 'cobalt-camo', name: { az: 'Kobalt · kamuflyaj', en: 'Cobalt · Camo', ru: 'Кобальт · камуфляж' }, glow: '#3d7bff' },
  { id: 'sunset', name: { az: 'Gün batımı', en: 'Sunset Fade', ru: 'Закат' }, glow: '#ff8a1f' },
  { id: 'lime', name: { az: 'Neon yaşıl', en: 'Neon Lime', ru: 'Неоновый лайм' }, glow: '#9bff2e' },
  { id: 'spider', name: { az: 'Hörümçək toru', en: 'Spider Web', ru: 'Паутина' }, glow: '#ff2b3a' },
  { id: 'galaxy', name: { az: 'Qalaktika', en: 'Galaxy', ru: 'Галактика' }, glow: '#c98bff' },
]

export const padSrc = (c: Pick<PadColor, 'id'>) => `/media/game/pads/${c.id}.webp`
export const padThumb = (c: Pick<PadColor, 'id'>) => `/media/game/pads/${c.id}-sw.webp`

const KEY = 'laliga.pad'
export const loadPadColor = (): PadColor => {
  try {
    const id = localStorage.getItem(KEY)
    return PAD_COLORS.find((c) => c.id === id) ?? PAD_COLORS[0]
  } catch { return PAD_COLORS[0] }
}
export const savePadColor = (c: PadColor) => {
  try { localStorage.setItem(KEY, c.id) } catch { /* storage blocked */ }
}

/** warm the cache so a switch never shows an empty frame */
const loaded = new Map<string, Promise<void>>()
export const preloadPad = (c: Pick<PadColor, 'id'>) => {
  const src = padSrc(c)
  if (!loaded.has(src)) {
    const img = new Image()
    img.src = src
    loaded.set(src, (img.decode ? img.decode() : Promise.resolve()).catch(() => {}))
  }
  return loaded.get(src)!
}

export type ControllerHandle = {
  /** switch to another finish, revealed from (x, y) given in % of the image */
  paint: (c: PadColor, from?: { x: number; y: number }) => void
}

type Props = {
  color: PadColor
  className?: string
  alt?: string
  onPainted?: (c: PadColor) => void
}

const Controller = forwardRef<ControllerHandle, Props>(function Controller({ color, className = '', alt = '', onPainted }, ref) {
  const root = useRef<HTMLDivElement>(null)
  const nextEl = useRef<HTMLImageElement>(null)
  const waveEl = useRef<HTMLSpanElement>(null)
  const [incoming, setIncoming] = useState<{ c: PadColor; x: number; y: number } | null>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const ticket = useRef(0)
  const cb = useRef(onPainted)
  cb.current = onPainted

  useImperativeHandle(ref, () => ({
    paint: (c, from = { x: 104, y: 108 }) => {
      if (c.id === color.id && !incoming) return
      tl.current?.progress(1)
      const my = ++ticket.current
      // wait for the photo, then reveal it (a newer click wins)
      preloadPad(c).then(() => { if (my === ticket.current) setIncoming({ c, x: from.x, y: from.y }) })
    },
  }), [color.id, incoming])

  // the reveal, once the new photo is mounted on top
  useLayoutEffect(() => {
    if (!incoming) return
    const n = nextEl.current, w = waveEl.current, el = root.current
    if (!n || !w || !el) return
    const { width, height } = el.getBoundingClientRect()
    const max = Math.hypot(width, height) * 1.25 // covers the image from any starting point
    const st = { r: 0 }
    const apply = () => {
      const px = (st.r / 100) * max
      n.style.clipPath = `circle(${px}px at ${incoming.x}% ${incoming.y}%)`
      w.style.setProperty('--r', `${px}px`)
    }
    apply()
    const done = () => {
      tl.current = null
      cb.current?.(incoming.c)
      // the parent now renders the new photo as the base; drop the overlay a frame later
      const mine = incoming
      requestAnimationFrame(() => setIncoming((cur) => (cur === mine ? null : cur)))
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { st.r = 100; apply(); done(); return }
    tl.current = gsap.timeline({ onComplete: done })
      .to(st, { r: 100, duration: 1.15, ease: 'power2.inOut', onUpdate: apply })
      .fromTo(w, { opacity: 1 }, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 0.75)
      .fromTo(el, { scale: 1 }, { scale: 1.012, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.1)
    return () => { tl.current?.kill() }
  }, [incoming])

  // a soft light follows the pointer over the grips
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const host = el.parentElement ?? el
    const qx = gsap.quickTo(el, '--lx', { duration: 0.6, ease: 'power3.out' })
    const qy = gsap.quickTo(el, '--ly', { duration: 0.6, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      qx(((e.clientX - r.left) / r.width) * 100)
      qy(((e.clientY - r.top) / r.height) * 100)
    }
    host.addEventListener('pointermove', move)
    return () => host.removeEventListener('pointermove', move)
  }, [])

  return (
    <div ref={root} className={`pad ${className}`} style={{ ['--lx' as string]: 70, ['--ly' as string]: 30 }}>
      <img className="pad__img" src={padSrc(color)} alt={alt} draggable={false} />
      {incoming && (
        <>
          <img ref={nextEl} className="pad__img pad__img--next" src={padSrc(incoming.c)} alt="" draggable={false} style={{ clipPath: 'circle(0px at 100% 100%)' }} />
          <span
            ref={waveEl}
            className="pad__wave"
            style={{ ['--wx' as string]: `${incoming.x}%`, ['--wy' as string]: `${incoming.y}%`, ['--wc' as string]: incoming.c.glow }}
            aria-hidden="true"
          />
        </>
      )}
      <span className="pad__light" aria-hidden="true" />
    </div>
  )
})

export default Controller
