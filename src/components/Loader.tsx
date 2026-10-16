import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import LogoSpinner from './LogoSpinner'

/** First-visit loader: shows the spinning emblem until the page has loaded (min 0.9 s, max 3 s). */
export default function Loader() {
  const [done, setDone] = useState(false)
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const start = performance.now()
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      const wait = Math.max(0, 900 - (performance.now() - start))
      window.setTimeout(() => {
        if (!el.current) return setDone(true)
        gsap.timeline({ onComplete: () => setDone(true) })
          .to(el.current.querySelector('.logo-spinner'), { scale: 0.6, opacity: 0, duration: 0.35, ease: 'power2.in' })
          .to(el.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'power3.inOut' }, '-=0.05')
      }, wait)
    }
    if (document.readyState === 'complete') finish()
    else window.addEventListener('load', finish, { once: true })
    const cap = window.setTimeout(finish, 3000)
    return () => { window.removeEventListener('load', finish); window.clearTimeout(cap) }
  }, [])

  if (done) return null
  return (
    <div ref={el} className="loader" role="status" aria-label="LaLiga">
      <LogoSpinner />
    </div>
  )
}
