import { useEffect, useRef, useState } from 'react'
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
    { label: 'nav.loyalty', to: '/#loyalty' },
    { label: 'nav.contact', to: '/#elaqe' },
  ],
  game: [
    { label: 'nav.shelf', to: '/game-center#oyunlar' },
    { label: 'Game Hall', to: '/game-center/hall' },
    { label: 'nav.how', to: '/game-center#nece' },
    { label: 'nav.branches', to: '/game-center#filiallar' },
  ],
  dining: [
    { label: 'nav.menu', to: '/dining/menu' },
    { label: 'nav.rooms', to: '/dining#otaqlar' },
    { label: 'nav.picks', to: '/dining#secilmis' },
    { label: 'nav.branches', to: '/dining#filiallar' },
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

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      // the bar stays put (no hide-on-scroll); it only gains a solid backdrop once the page moves
      setScrolled(y > 40)
      lastY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const isActive = (to: string) => !to.includes('#') && to === pathname

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-menu-open' : ''}`} data-mode={mode}>
      <a href="/" className="nav__brand" onClick={(e) => { e.preventDefault(); nav('/') }} aria-label={t('nav.home')}>
        <SmartImg className="nav__emblem" src={BRAND.emblem} fallbacks={[BRAND.emblemRemote, BRAND.emblemSvg]} alt="" />
        <SmartImg className="nav__wordmark" src={BRAND.wordmark} fallbacks={[BRAND.wordmarkRemote]} alt="LaLiga" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
        {mode !== 'home' && <span className="nav__world">{mode === 'game' ? 'Game Center' : 'Dining & Lounge'}</span>}
      </a>

      <nav className="nav__links" aria-label={t('nav.main')}>
        {LINKS[mode].map((l) => (
          <a key={l.to} href={l.to} aria-current={isActive(l.to) ? 'page' : undefined} onClick={(e) => { e.preventDefault(); nav(l.to) }}>
            {label(l)}
          </a>
        ))}
      </nav>

      <div className="nav__actions">
        {mode !== 'home' && (
          <a
            href={mode === 'game' ? '/dining' : '/game-center'}
            className="nav__switch"
            onClick={(e) => { e.preventDefault(); nav(mode === 'game' ? '/dining' : '/game-center') }}
          >
            <span className="nav__switch-dot" aria-hidden="true" />
            {mode === 'game' ? 'Dining & Lounge' : 'Game Center'}
          </a>
        )}
        <div className="lang" role="group" aria-label={t('langLabel')}>
          {LANGS.map((l) => (
            <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}>{l.toUpperCase()}</button>
          ))}
        </div>
        <button className="btn btn--solid nav__cta" onClick={() => reserve(mode === 'dining' ? 'dining' : 'game')}>
          {mode === 'dining' ? t('nav.bookTable') : t('nav.book')}
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
