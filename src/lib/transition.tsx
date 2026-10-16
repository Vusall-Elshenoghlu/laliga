import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { modeFromPath } from './mode'
import { prefersReducedMotion } from './smooth'
import LogoSpinner from '../components/LogoSpinner'

type Go = (to: string) => void
const Ctx = createContext<Go>(() => {})

/** Navigate with a curtain wipe tinted for the destination world. */
export const useGo = () => useContext(Ctx)

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const curtain = useRef<HTMLDivElement>(null)
  const busy = useRef(false)

  const go = useCallback<Go>(
    (to) => {
      const el = curtain.current
      const [path, hash] = to.split('#')
      const samePage = path === '' || path === window.location.pathname
      if (samePage) {
        if (hash) window.dispatchEvent(new CustomEvent('laliga:scrollto', { detail: '#' + hash }))
        else window.dispatchEvent(new CustomEvent('laliga:scrollto', { detail: 0 }))
        return
      }
      if (!el || busy.current || prefersReducedMotion()) {
        navigate(to)
        window.scrollTo(0, 0)
        return
      }
      busy.current = true
      el.dataset.to = modeFromPath(path)
      gsap
        .timeline({ onComplete: () => { busy.current = false } })
        .set(el, { display: 'block', clipPath: 'inset(100% 0 0 0)' })
        .to(el, { clipPath: 'inset(0% 0 0 0)', duration: 0.55, ease: 'power3.inOut' })
        .add(() => {
          navigate(to)
          window.scrollTo(0, 0)
        })
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'power3.inOut', delay: 0.15 })
        .set(el, { display: 'none' })
    },
    [navigate],
  )

  return (
    <Ctx.Provider value={go}>
      {children}
      <div ref={curtain} className="curtain" aria-hidden="true">
        <LogoSpinner />
      </div>
    </Ctx.Provider>
  )
}
