import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SmoothScroll, useLenis, scrollToTarget } from './lib/smooth'
import { TransitionProvider } from './lib/transition'
import { useMode } from './lib/mode'
import { LangProvider, useI18n } from './lib/i18n'
import { ReserveProvider } from './components/Reserve'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Loader from './components/Loader'
import Home from './pages/Home'
import GameCenter from './pages/GameCenter'
import GameHall from './pages/GameHall'
import Dining from './pages/Dining'
import DiningMenu from './pages/DiningMenu'

function RouteEffects() {
  const { pathname, hash } = useLocation()
  const lenis = useLenis()
  const mode = useMode()
  const { t, lang } = useI18n()

  useEffect(() => {
    document.documentElement.dataset.mode = mode
    const titles = { home: t('title.home'), game: 'LaLiga Game Center', dining: 'LaLiga Dining & Lounge' }
    document.title = pathname === '/dining/menu' ? t('title.menu') : pathname === '/game-center/hall' ? 'Game Hall · LaLiga' : titles[mode]
  }, [mode, pathname, t, lang])

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
    const t = setTimeout(() => {
      ScrollTrigger.refresh()
      if (hash) scrollToTarget(lenis, hash, -70)
    }, 120)
    return () => clearTimeout(t)
  }, [pathname, hash, lenis])

  useEffect(() => {
    const on = (e: Event) => scrollToTarget(lenis, (e as CustomEvent).detail, -70)
    window.addEventListener('laliga:scrollto', on)
    return () => window.removeEventListener('laliga:scrollto', on)
  }, [lenis])

  return null
}

function SkipLink() {
  const { t } = useI18n()
  return <a href="#main" className="skip">{t('skip')}</a>
}

export default function App() {
  return (
    <LangProvider>
    <SmoothScroll>
      <TransitionProvider>
        <ReserveProvider>
          <RouteEffects />
          <Loader />
          <SkipLink />
          <Navbar />
          <main id="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game-center" element={<GameCenter />} />
              <Route path="/game-center/hall" element={<GameHall />} />
              <Route path="/dining" element={<Dining />} />
              <Route path="/dining/menu" element={<DiningMenu />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </ReserveProvider>
      </TransitionProvider>
    </SmoothScroll>
    </LangProvider>
  )
}
