import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { createPortal } from 'react-dom'
import { useI18n } from '../../lib/i18n'
import { prefersReducedMotion, useLenis } from '../../lib/smooth'

type Props = { photos: string[]; alt: string; onChange?: (i: number) => void }

const AUTO_MS = 4800

/**
 * 3D cover-flow of branch photos.
 * Glides on its own, follows the mouse with a slight tilt, can be dragged / swiped,
 * and the front photo opens full screen.
 */
export default function Gallery({ photos, alt, onChange }: Props) {
  const { t } = useI18n()
  const lenis = useLenis()
  const n = photos.length
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [box, setBox] = useState<number | null>(null)
  const stage = useRef<HTMLDivElement>(null)
  const tilt = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; dx: number; moved: boolean } | null>(null)
  const reduced = prefersReducedMotion()

  const goTo = useCallback((i: number) => setActive(((i % n) + n) % n), [n])
  useEffect(() => { onChange?.(active) }, [active, onChange])

  // autoplay
  useEffect(() => {
    if (paused || reduced || box !== null || n < 2) return
    const id = window.setTimeout(() => goTo(active + 1), AUTO_MS)
    return () => window.clearTimeout(id)
  }, [active, paused, reduced, box, n, goTo])

  // pause while the tab is hidden
  useEffect(() => {
    const on = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])

  // mouse tilt
  useEffect(() => {
    const el = stage.current, inner = tilt.current
    if (!el || !inner || reduced) return
    const rx = gsap.quickTo(inner, 'rotateX', { duration: 0.8, ease: 'power3.out' })
    const ry = gsap.quickTo(inner, 'rotateY', { duration: 0.8, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * 10)
      rx(-py * 8)
    }
    const leave = () => { rx(0); ry(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [reduced])

  // drag / swipe — cards follow the finger, then snap
  const unit = () => (stage.current?.clientWidth ?? 600) * 0.32
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    drag.current = { x: e.clientX, dx: 0, moved: false }
    const move = (ev: PointerEvent) => {
      const d = drag.current
      if (!d) return
      d.dx = ev.clientX - d.x
      if (!d.moved && Math.abs(d.dx) > 6) { d.moved = true; stage.current?.classList.add('is-dragging') }
      if (d.moved) stage.current?.style.setProperty('--drag', String(d.dx / unit()))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      const d = drag.current
      stage.current?.classList.remove('is-dragging')
      stage.current?.style.setProperty('--drag', '0')
      if (!d || !d.moved) { drag.current = null; return }
      const steps = Math.round(-d.dx / unit())
      if (steps) goTo(active + steps)
      else if (Math.abs(d.dx) > 40) goTo(active + (d.dx < 0 ? 1 : -1))
      // keep "moved" for the click that follows this pointerup, then forget the drag
      window.setTimeout(() => { drag.current = null }, 0)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const clickCard = (i: number) => {
    if (drag.current?.moved) return
    if (i === active) setBox(i)
    else goTo(i)
  }

  // shortest signed distance on a loop
  const offset = (i: number) => {
    let d = i - active
    if (d > n / 2) d -= n
    if (d < -n / 2) d += n
    return d
  }

  // keyboard
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (box !== null) {
        if (e.key === 'Escape') setBox(null)
        if (e.key === 'ArrowRight') setBox((b) => ((b ?? 0) + 1) % n)
        if (e.key === 'ArrowLeft') setBox((b) => ((b ?? 0) - 1 + n) % n)
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [box, n])

  // lightbox: lock scroll, animate in
  const boxRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (box === null) return
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    return () => { lenis?.start(); document.body.style.overflow = '' }
  }, [box === null, lenis]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (box === null || !boxRef.current || reduced) return
    gsap.fromTo(boxRef.current.querySelector('img'), { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out' })
  }, [box, reduced])

  return (
    <div className="gal" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        ref={stage}
        className="gal__stage"
        onPointerDown={onDown}
        style={{ ['--drag' as string]: 0 }}
      >
        <div ref={tilt} className="gal__tilt">
          {photos.map((src, i) => {
            const d = offset(i)
            const ad = Math.abs(d)
            return (
              <button
                key={src + i}
                className={`gal__card ${d === 0 ? 'is-front' : ''}`}
                style={{ ['--d' as string]: d, ['--ad' as string]: ad, zIndex: 20 - ad, opacity: ad > 2 ? 0 : 1, pointerEvents: ad > 2 ? 'none' : undefined }}
                onClick={() => clickCard(i)}
                aria-label={`${t('br.photo')} ${i + 1} / ${n}${d === 0 ? ' — ' + t('menu.enlarge') : ''}`}
                tabIndex={ad > 1 ? -1 : 0}
              >
                <img src={src} alt={d === 0 ? alt : ''} draggable={false} loading={ad > 1 ? 'lazy' : 'eager'} />
                <span className="gal__shine" aria-hidden="true" />
                {d === 0 && (
                  <span className="gal__zoom" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="gal__bar">
        <button className="gal__arrow" onClick={() => goTo(active - 1)} aria-label={t('prev')}>←</button>
        <div className="gal__dots" role="tablist" aria-label={t('br.lightbox')}>
          {photos.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`${t('br.photo')} ${i + 1}`}
              className={`gal__dot ${i === active ? 'is-on' : ''} ${paused ? 'is-paused' : ''}`}
              onClick={() => goTo(i)}
              style={{ ['--ms' as string]: `${AUTO_MS}ms` }}
            >
              <i key={i === active ? active : -1} />
            </button>
          ))}
        </div>
        <span className="gal__count"><b>{String(active + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}</span>
        <button className="gal__arrow" onClick={() => goTo(active + 1)} aria-label={t('next')}>→</button>
      </div>

      {box !== null && createPortal(
        <div ref={boxRef} className="gal-box" role="dialog" aria-modal="true" aria-label={t('br.lightbox')} onClick={() => setBox(null)}>
          <img key={box} src={photos[box]} alt={alt} />
          <div className="gal-box__nav" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" onClick={() => setBox((box - 1 + n) % n)} aria-label={t('prev')}>←</button>
            <span>{box + 1} / {n}</span>
            <button className="icon-btn" onClick={() => setBox((box + 1) % n)} aria-label={t('next')}>→</button>
            <button className="icon-btn" onClick={() => setBox(null)} aria-label={t('close')}>✕</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
