import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { branchPageSrc, menuFor, type MenuBranch } from '../../data/menus'
import { scrollToTarget, useLenis, prefersReducedMotion } from '../../lib/smooth'
import { useI18n } from '../../lib/i18n'
import { catName } from '../../data/menu-i18n'
import { playPageTurn, setSoundEnabled, soundEnabled, unlock } from '../../lib/pageSound'

const VH_PER_FLIP = 55

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Spread index s shows page 2s on the left and 2s+1 on the right. */
const spreadOfPage = (n: number) => Math.floor(n / 2)

/** the flip-book of one branch's menu; `header` (the branch switch) sits under the title */
export default function MenuBook({ branch, header }: { branch: MenuBranch; header?: ReactNode }) {
  const MENU_PAGES = branch.pages
  // an odd page count leaves the last back face blank
  const SHEETS = Math.ceil(MENU_PAGES / 2)
  const menu = menuFor(branch.id)
  const pageSrc = (n: number) => branchPageSrc(branch, n)
  // book slots → PDF pages. With an odd page count a blank leaf goes before the last page,
  // so the PDF's back cover still ends up on the back of the book.
  const pdfPage = (slot: number): number | null =>
    MENU_PAGES % 2 === 0 || slot < 2 * SHEETS - 1 ? slot : slot === 2 * SHEETS ? MENU_PAGES : null
  const lenis = useLenis()
  const { t, lang } = useI18n()
  const section = useRef<HTMLElement>(null)
  const book = useRef<HTMLDivElement>(null)
  const sheets = useRef<HTMLDivElement[]>([])
  const loaded = useRef(0)
  const [spread, setSpread] = useState(0)
  const [sound, setSound] = useState(soundEnabled)
  // which sheets are past the spine — a sound plays the moment a sheet crosses it
  const flipped = useRef<boolean[]>([])
  const lastTurn = useRef(0)
  const [zoom, setZoom] = useState<number | null>(null)

  const ensureLoaded = (upto: number) => {
    const target = Math.min(MENU_PAGES, upto)
    if (target <= loaded.current) return
    sheets.current.forEach((sh) => {
      sh.querySelectorAll<HTMLImageElement>('img[data-page]').forEach((img) => {
        const n = Number(img.dataset.page)
        if (n <= target && !img.getAttribute('src')) img.src = pageSrc(n)
      })
    })
    loaded.current = target
  }

  const render = (f: number) => {
    const b = book.current
    if (!b) return
    // book slides so the closed cover / back cover sit centred
    const open = Math.min(1, Math.max(0, f))
    const close = Math.min(1, Math.max(0, f - (SHEETS - 1)))
    const shift = -25 * (1 - ease(open)) + 25 * ease(close)
    b.style.transform = `translateX(${shift}%)`

    sheets.current.forEach((sh, k) => {
      const t = Math.min(1, Math.max(0, f - k))
      const e = ease(t)
      const angle = -180 * e
      sh.style.transform = `rotateY(${angle}deg)`
      sh.style.zIndex = String(angle > -90 ? 200 - k : 200 + k)
      const isOver = angle <= -90
      if (flipped.current[k] !== undefined && flipped.current[k] !== isOver) {
        const now = performance.now()
        playPageTurn(now - lastTurn.current < 180)
        lastTurn.current = now
      }
      flipped.current[k] = isOver
      const shade = Math.sin(e * Math.PI)
      sh.style.setProperty('--shade', shade.toFixed(3))
    })
    const s = Math.round(f)
    setSpread((prev) => (prev === s ? prev : s))
    ensureLoaded(2 * s + 8)
  }

  useLayoutEffect(() => {
    if (!section.current) return
    ensureLoaded(6)
    render(0)
    const ctx = gsap.context(() => {
      const st = { f: 0 }
      gsap.to(st, {
        f: SHEETS,
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: prefersReducedMotion() ? true : 0.6,
        },
        onUpdate: () => render(st.f),
      })
      gsap.from('.book__intro > *', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', delay: 0.3 })
      gsap.from(book.current, { y: 120, rotateX: 35, opacity: 0, duration: 1.4, ease: 'expo.out', delay: 0.2 })
    }, section)
    ScrollTrigger.refresh()
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // settle on the nearest spread when scrolling stops (Lenis-friendly snap)
  useEffect(() => {
    if (!lenis) return
    let t = 0
    const onScroll = () => {
      window.clearTimeout(t)
      t = window.setTimeout(() => {
        const el = section.current
        if (!el) return
        const top = el.getBoundingClientRect().top + window.scrollY
        const dist = el.offsetHeight - window.innerHeight
        const y = window.scrollY - top
        if (y < 0 || y > dist) return
        const f = (y / dist) * SHEETS
        const target = Math.round(f)
        if (Math.abs(f - target) > 0.02) lenis.scrollTo(top + (dist * target) / SHEETS, { duration: 0.7 })
      }, 160)
    }
    lenis.on('scroll', onScroll)
    return () => { window.clearTimeout(t); lenis.off('scroll', onScroll) }
  }, [lenis])

  const goToSpread = (s: number) => {
    const el = section.current
    if (!el) return
    s = Math.max(0, Math.min(SHEETS, s))
    const top = el.getBoundingClientRect().top + window.scrollY
    const dist = el.offsetHeight - window.innerHeight
    ensureLoaded(2 * s + 8)
    scrollToTarget(lenis, top + (dist * s) / SHEETS)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoom !== null) {
        if (e.key === 'Escape') setZoom(null)
        return
      }
      if ((e.target as HTMLElement).closest('input, select, textarea')) return
      if (e.key === 'ArrowRight') { e.preventDefault(); goToSpread(spread + 1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToSpread(spread - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const activeCat = [...menu].reverse().find((c) => spreadOfPage(c.page) <= spread)
  const pagesLabel =
    spread === 0 ? t('menu.cover') : spread >= SHEETS ? t('menu.backCover') : `${t('menu.page')} ${2 * spread}–${2 * spread + 1}`

  return (
    <section ref={section} className="book" style={{ height: `${(SHEETS + 1) * VH_PER_FLIP + 100}vh` }} aria-label={t('menu.aria')}>
      <div className="book__stage">
        <div className="book__intro">
          <h1>{t('menu.title')}</h1>
          {header}
          <p>{t('menu.hint')}</p>
        </div>

        <div className="book__table">
          <div ref={book} className="book__book" style={{ ['--pa' as string]: branch.aspect }}>
            <div className="book__spine" aria-hidden="true" />
            {Array.from({ length: SHEETS }, (_, k) => {
              const face = (slot: number, side: 'front' | 'back', active: boolean) => {
                const n = pdfPage(slot)
                if (n === null) return <div className={`sheet__face sheet__face--${side} sheet__face--blank`} aria-hidden="true"><span className="sheet__shade" /></div>
                return (
                  <button className={`sheet__face sheet__face--${side}`} onClick={() => setZoom(n)} aria-label={`${t('menu.page')} ${n} — ${t('menu.enlarge')}`} tabIndex={active ? 0 : -1}>
                    <img data-page={n} alt="" draggable={false} />
                    <span className="sheet__shade" aria-hidden="true" />
                  </button>
                )
              }
              return (
                <div key={k} ref={(el) => { if (el) sheets.current[k] = el }} className={`sheet ${k === 0 ? 'sheet--cover' : ''} ${k === SHEETS - 1 ? 'sheet--last' : ''}`}>
                  {face(2 * k + 1, 'front', spread === k)}
                  {face(2 * k + 2, 'back', spread === k + 1)}
                </div>
              )
            })}
          </div>
        </div>

        <div className="book__bar">
          <button className="icon-btn" onClick={() => goToSpread(spread - 1)} aria-label={t('prev')} disabled={spread <= 0}>←</button>
          <div className="book__where">
            <strong>{activeCat && spread > 1 ? catName(activeCat, lang) : 'LaLiga Dining & Lounge'}</strong>
            <span>{pagesLabel}</span>
          </div>
          <button className="icon-btn" onClick={() => goToSpread(spread + 1)} aria-label={t('next')} disabled={spread >= SHEETS}>→</button>
          <button
            className={`icon-btn book__sound ${sound ? 'is-on' : ''}`}
            onClick={() => { const v = !sound; setSound(v); setSoundEnabled(v); if (v) { unlock(); window.setTimeout(() => playPageTurn(), 60) } }}
            aria-pressed={sound}
            aria-label={sound ? t('menu.soundOff') : t('menu.soundOn')}
            title={sound ? t('menu.soundOff') : t('menu.soundOn')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
              {sound
                ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                : <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
            </svg>
          </button>
        </div>

        <nav className="book__index" aria-label={t('menu.sections')}>
          {menu.map((c) => (
            <button key={c.id} aria-current={activeCat?.id === c.id && spread > 1 ? 'true' : undefined} onClick={() => goToSpread(spreadOfPage(c.page))}>
              {catName(c, lang)}
            </button>
          ))}
        </nav>
      </div>

      {zoom !== null && (
        <div className="zoom" role="dialog" aria-modal="true" aria-label={`${t('menu.page')} ${zoom}`} onClick={() => setZoom(null)}>
          <img src={pageSrc(zoom)} alt={`${t('menu.title')}, ${t('menu.page')} ${zoom}`} />
          <div className="zoom__nav" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" onClick={() => setZoom(Math.max(1, zoom - 1))} aria-label={t('prev')}>←</button>
            <span>{zoom} / {MENU_PAGES}</span>
            <button className="icon-btn" onClick={() => setZoom(Math.min(MENU_PAGES, zoom + 1))} aria-label={t('next')}>→</button>
            <button className="icon-btn" onClick={() => setZoom(null)} aria-label={t('close')}>✕</button>
          </div>
        </div>
      )}
    </section>
  )
}
