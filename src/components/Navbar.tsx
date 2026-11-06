import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLenis } from '../lib/smooth'
import { useLocation } from 'react-router-dom'
import { useMode, type Mode } from '../lib/mode'
import { useGo } from '../lib/transition'
import { useReserve } from './Reserve'
import SmartImg, { BRAND } from './SmartImg'
import { LANGS, useI18n, type Key } from '../lib/i18n'

type Link = { label: Key | string; to: string }

const LINKS: Record<Mode, Link[]> = {
  home: [
    { label: 'Game Center', to: '/game-center' },
    { label: 'Dining & Lounge', to: '/dining' },
    { label: 'nav.team', to: '/komanda' },
    { label: 'nav.careers', to: '/karyera' },
    { label: 'nav.contact', to: '/elaqe' },
  ],
  game: [
    { label: 'Game Center', to: '/game-center' },
    { label: 'nav.shelf', to: '/game-center#oyunlar' },
    { label: 'Game Hall', to: '/game-center#game-hall' },
    { label: 'nav.how', to: '/game-center#nece' },
    { label: 'nav.branches', to: '/game-center#filiallar' },
    { label: 'nav.team', to: '/game-center#komanda' },
  ],
  dining: [
    { label: 'Dining & Lounge', to: '/dining' },
    { label: 'nav.rooms', to: '/dining#otaqlar' },
    { label: 'nav.menu', to: '/dining#menyu' },
    { label: 'nav.picks', to: '/dining#secilmis' },
    { label: 'nav.branches', to: '/dining#filiallar' },
    { label: 'nav.team', to: '/dining#komanda' },
  ],
}

export default function Navbar() {
  const mode = useMode()
  const go = useGo()
  const reserve = useReserve()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastY = useRef(0)
  const { t, lang, setLang } = useI18n()
  const label = (l: Link) => (l.label.startsWith('nav.') ? t(l.label as Key) : l.label)

  // over the scroll-scrubbed hero animations (Game Center / Dining) the bar slides away so the
  // frames are seen clean; scrolling back up brings it in again, and it returns for good after the hero
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const y = window.scrollY
      const up = y < lastY.current - 2
      const down = y > lastY.current + 2
      setScrolled(y > 40)
      const seq = document.querySelector<HTMLElement>('.seq')
      let inHero = false
      if (seq && y > 40) {
        const r = seq.getBoundingClientRect()
        inHero = r.top <= 1 && r.bottom > window.innerHeight * 0.5
      }
      setHidden((h) => (!inHero ? false : down ? true : up ? false : h))
      lastY.current = y
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check) }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll) }
  }, [pathname])

  useEffect(() => setMenuOpen(false), [pathname])

  // While the drawer is open: freeze page scrolling (native + Lenis), close on Esc or when the
  // viewport grows past the burger breakpoint (otherwise it could stay open with no button to close it).
  const lenis = useLenis()
  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'
    lenis?.stop()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    const mq = window.matchMedia('(min-width: 1101px)')
    const onMq = () => mq.matches && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onMq)
    return () => {
      document.body.style.overflow = ''
      lenis?.start()
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [menuOpen, lenis])

  const nav = (to: string) => {
    setMenuOpen(false)
    go(to)
  }

  /* ---------- active link: by page, and by section while scrolling (scroll-spy) ---------- */
  const [spy, setSpy] = useState<string | null>(null)
  useEffect(() => {
    setSpy(null)
    const sections = LINKS[mode]
      .filter((l) => l.to.includes('#') && l.to.split('#')[0] === pathname)
      .map((l) => ({ to: l.to, id: l.to.split('#')[1] }))
    if (!sections.length) return
    let raf = 0
    const check = () => {
      raf = 0
      const line = window.innerHeight * 0.42
      let cur: string | null = null
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= line && r.bottom > line) cur = s.to
      }
      setSpy((p) => (p === cur ? p : cur))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check) }
    const t = window.setTimeout(check, 400) // sections mount after the route change
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.clearTimeout(t); cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [mode, pathname])

  const isActive = (to: string) => {
    if (to.includes('#')) {
      if (spy === to) return true
      // sub-pages that belong to a section
      if (to === '/game-center#game-hall' && pathname === '/game-center/hall') return true
      if (to.endsWith('#filiallar') && pathname.startsWith(to.split('#')[0] + '/filiallar/')) return true
      if (to === '/dining#menyu' && pathname.startsWith('/dining/menu')) return true
      return false
    }
    // the world link (Game Center / Dining & Lounge) stays active on its page until a section takes over
    return (to === pathname || (to === '/komanda' && pathname.startsWith('/komanda/'))) && !spy
  }
  const activeTo = LINKS[mode].find((l) => isActive(l.to))?.to ?? null

  // the sliding pill under the active link
  const linksRef = useRef<HTMLElement>(null)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)
  useLayoutEffect(() => {
    const place = () => {
      const box = linksRef.current
      const a = box?.querySelector<HTMLElement>(`a[data-to="${activeTo}"]`)
      setPill(a ? { x: a.offsetLeft, w: a.offsetWidth } : null)
    }
    place()
    window.addEventListener('resize', place)
    document.fonts?.ready.then(place)
    return () => window.removeEventListener('resize', place)
  }, [activeTo, lang, mode])

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${hidden && !menuOpen ? 'is-hidden' : ''} ${menuOpen ? 'is-menu-open' : ''}`} data-mode={mode}>
      <a href="/" className="nav__brand" onClick={(e) => { e.preventDefault(); nav('/') }} aria-label={t('nav.home')}>
        {mode === 'home' ? (
          <>
            <SmartImg className="nav__emblem" src={BRAND.emblem} fallbacks={[BRAND.emblemRemote, BRAND.emblemSvg]} alt="" />
            <SmartImg className="nav__wordmark" src={BRAND.wordmark} fallbacks={[BRAND.wordmarkRemote]} alt="LaLiga" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
          </>
        ) : (
          <img
            key={mode}
            className={`nav__logo nav__logo--${mode}`}
            src={mode === 'game' ? '/media/brand/logo-gc.webp' : '/media/brand/logo-dining.webp'}
            alt={mode === 'game' ? 'LaLiga Game Center' : 'LaLiga Dining & Lounge'}
          />
        )}
      </a>

      <nav ref={linksRef} className="nav__links" aria-label={t('nav.main')}>
        <span
          className={`nav__pill ${pill ? 'is-on' : ''}`}
          style={pill ? { transform: `translateX(${pill.x}px)`, width: pill.w } : undefined}
          aria-hidden="true"
        />
        {LINKS[mode].map((l) => (
          <a key={l.to} href={l.to} data-to={l.to} aria-current={isActive(l.to) ? (l.to.includes('#') ? 'location' : 'page') : undefined} onClick={(e) => { e.preventDefault(); nav(l.to) }}>
            {label(l)}
          </a>
        ))}
      </nav>

      <div className="nav__actions">
        {mode !== 'home' && (
          <a
            href={mode === 'game' ? '/dining' : '/game-center'}
            className={`nav__swap nav__swap--${mode === 'game' ? 'dining' : 'game'}`}
            onClick={(e) => { e.preventDefault(); nav(mode === 'game' ? '/dining' : '/game-center') }}
            aria-label={`${t('nav.goTo')}: ${mode === 'game' ? 'Dining & Lounge' : 'Game Center'}`}
          >
            <span className="nav__swap-label" aria-hidden="true">
              <small>{t('nav.goTo')}</small>
              {mode === 'game' ? 'Dining & Lounge' : 'Game Center'}
            </span>
            <span className="nav__swap-ico" aria-hidden="true">
              {/* the other world's own emblem: gold d-pad = Dining, grey d-pad = Game Center */}
              <img src={mode === 'game' ? '/media/brand/emblem-dining.webp' : '/media/brand/emblem-gc.webp'} alt="" />
            </span>
          </a>
        )}
        <div className="lang" role="group" aria-label={t('langLabel')}>
          {LANGS.map((l) => (
            <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}>{l.toUpperCase()}</button>
          ))}
        </div>
        <button className="btn btn--solid nav__cta" onClick={() => reserve(mode === 'dining' ? 'dining' : 'game')}>
          {mode === 'dining' ? t('nav.ctaTable') : t('nav.cta')}
        </button>
        <button className="nav__burger" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={t('nav.openMenu')} onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span />
        </button>
      </div>

      {/* Rendered into <body>: the header gets a backdrop-filter once the page scrolls, and a
          fixed element inside a filtered parent is positioned against that parent (64px tall)
          instead of the screen — that is why the drawer used to vanish after scrolling. */}
      {createPortal(
        <div id="mobile-menu" className={`mnav ${menuOpen ? 'is-open' : ''}`} data-mode={mode} aria-hidden={!menuOpen} inert={!menuOpen}>
          {LINKS[mode].map((l) => (
            <a key={l.to} href={l.to} onClick={(e) => { e.preventDefault(); nav(l.to) }}>{label(l)}</a>
          ))}
          <div className="lang lang--mobile" role="group" aria-label={t('langLabel')}>
            {LANGS.map((l) => (
              <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}>{l.toUpperCase()}</button>
            ))}
          </div>
          <div className="mnav__worlds">
            <a href="/game-center" onClick={(e) => { e.preventDefault(); nav('/game-center') }}>Game Center</a>
            <a href="/dining" onClick={(e) => { e.preventDefault(); nav('/dining') }}>Dining & Lounge</a>
          </div>
        </div>,
        document.body,
      )}
    </header>
  )
}
