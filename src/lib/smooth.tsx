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

/** Scroll to a selector / element / pixel, using Lenis when available. */
export function scrollToTarget(lenis: Lenis | null, target: string | number | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4 })
    return
  }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: 'smooth' })
  }
}
