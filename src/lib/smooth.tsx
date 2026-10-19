import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LenisCtx = createContext<Lenis | null>(null)
export const useLenis = () => useContext(LenisCtx)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Lenis smooth scrolling wired into GSAP's ticker so ScrollTrigger scrubs stay in sync. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const raf = useRef<(t: number) => void>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.4 })
    l.on('scroll', ScrollTrigger.update)
    raf.current = (t: number) => l.raf(t * 1000)
    gsap.ticker.add(raf.current)
    gsap.ticker.lagSmoothing(0)
    setLenis(l)
    return () => {
      if (raf.current) gsap.ticker.remove(raf.current)
      l.destroy()
    }
  }, [])

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>
}

/**
 * Scroll to a selector / element / pixel, using Lenis when available.
 * Lenis' page height is re-measured first (a freshly mounted page is much taller than the
 * previous one — without this the scroll stops at the old bottom), and the duration grows with the
 * distance so a long trip (e.g. through the Game Center hero) plays out instead of jumping.
 */
export function scrollToTarget(lenis: Lenis | null, target: string | number | HTMLElement, offset = 0) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : typeof target === 'number' ? null : target
  if (lenis) {
    lenis.resize()
    const to = typeof target === 'number' ? target : el ? el.getBoundingClientRect().top + window.scrollY + offset : null
    if (to === null) return
    const dist = Math.abs(to - window.scrollY)
    const duration = Math.min(3.2, Math.max(1, dist / 2200))
    lenis.scrollTo(to, { duration, force: true, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) })
    return
  }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
  else el?.scrollIntoView({ behavior: 'smooth' })
}

/** Wait until a hash target exists and the page has settled, then scroll to it. */
export function scrollToHash(lenis: Lenis | null, hash: string, offset = 0) {
  let tries = 0, lastH = -1, stable = 0
  const step = () => {
    const el = document.querySelector(hash)
    const h = document.documentElement.scrollHeight
    stable = h === lastH ? stable + 1 : 0
    lastH = h
    // target mounted and page height unchanged for a few frames (or give up waiting after ~2s)
    if ((el && stable >= 4) || tries++ > 120) {
      lenis?.resize()
      ScrollTrigger.refresh()
      if (el) scrollToTarget(lenis, hash, offset)
      return
    }
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
