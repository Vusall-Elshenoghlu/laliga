import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Props = {
  frameCount: number
  /** returns URL for frame i (0-based) */
  frameSrc: (i: number) => string
  /** total scroll distance in viewport heights */
  lengthVh?: number
  className?: string
  /** build overlay animations on a timeline of duration 1 that is scrubbed with the frames */
  timeline?: (tl: gsap.core.Timeline, root: HTMLElement) => void
  onProgress?: (p: number) => void
  children?: ReactNode
}

/**
 * Apple-style scroll-scrubbed image sequence drawn on a <canvas>.
 * The section is `lengthVh` tall; its inner stage is sticky for the whole run.
 */
export default function ScrollSequence({ frameCount, frameSrc, lengthVh = 400, className = '', timeline, onProgress, children }: Props) {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const images = useRef<HTMLImageElement[]>([])
  const current = useRef(0)

  // Preload: first frame immediately, then every 8th (for coarse scrubbing), then the rest.
  useEffect(() => {
    const imgs: HTMLImageElement[] = new Array(frameCount)
    images.current = imgs
    const load = (i: number) => {
      if (imgs[i]) return
      const im = new Image()
      im.decoding = 'async'
      im.src = frameSrc(i)
      im.onload = () => { if (i === current.current || i === 0) draw(current.current) }
      imgs[i] = im
    }
    load(0)
    const order: number[] = []
    for (let i = 0; i < frameCount; i += 8) order.push(i)
    for (let i = 0; i < frameCount; i++) if (i % 8) order.push(i)
    let k = 0
    let cancelled = false
    const pump = () => {
      if (cancelled) return
      for (let n = 0; n < 12 && k < order.length; n++, k++) load(order[k])
      if (k < order.length) setTimeout(pump, 40)
    }
    pump()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount])

  const nearestLoaded = (i: number) => {
    const imgs = images.current
    for (let d = 0; d < frameCount; d++) {
      const a = imgs[i - d], b = imgs[i + d]
      if (a?.complete && a.naturalWidth) return a
      if (b?.complete && b.naturalWidth) return b
    }
    return null
  }

  const draw = (i: number) => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')
    const img = nearestLoaded(i)
    if (!ctx || !img) return
    const { width: w, height: h } = c
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
  }

  useEffect(() => {
    const resize = () => {
      const c = canvas.current
      if (!c) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.width = c.clientWidth * dpr
      c.height = c.clientHeight * dpr
      draw(current.current)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    if (!root.current) return
    const ctx = gsap.context(() => {
      const state = { f: 0 }
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
          onUpdate: (st) => onProgress?.(st.progress),
        },
      })
      tl.to(state, {
        f: frameCount - 1,
        duration: 1,
        onUpdate: () => {
          const i = Math.round(state.f)
          if (i !== current.current) {
            current.current = i
            requestAnimationFrame(() => draw(i))
          }
        },
      }, 0)
      timeline?.(tl, root.current!)
    }, root)
    ScrollTrigger.refresh()
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount])

  return (
    <section ref={root} className={`seq ${className}`} style={{ height: `${lengthVh}vh` }}>
      <div className="seq__stage">
        <canvas ref={canvas} className="seq__canvas" aria-hidden="true" />
        {children}
      </div>
    </section>
  )
}
