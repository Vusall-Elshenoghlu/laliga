import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useMode } from '../lib/mode'
import { useGo } from '../lib/transition'
import SmartImg, { BRAND } from './SmartImg'
import { useI18n } from '../lib/i18n'
import { useLenis, scrollToTarget, prefersReducedMotion } from '../lib/smooth'
import { diningBranches, gameBranches, telHref } from '../data/branches'

const IG = 'https://www.instagram.com/laligadininglounge/'

export default function Footer() {
  const mode = useMode()
  const go = useGo()
  const lenis = useLenis()
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)
  const link = (to: string, label: string) => (
    <a href={to} onClick={(e) => { e.preventDefault(); go(to) }}>
      <span>{label}</span>
    </a>
  )

  // quiet entrance: columns rise in, the big wordmark is drawn letter by letter
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.ft__reveal', { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 30, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'power3.out' })
    }, el)
    return () => ctx.revert()
  }, [mode])

  const phone = mode === 'dining' ? diningBranches[0].phone : gameBranches[1].phone

  return (
    <footer ref={root} className="ft" data-mode={mode}>
      <div className="ft__glow" aria-hidden="true" />

      <div className="ft__grid">
        <div className="ft__brand ft__reveal">
          <a href="/" className="ft__logo" onClick={(e) => { e.preventDefault(); go('/') }} aria-label={t('nav.home')}>
            <SmartImg src={BRAND.emblem} fallbacks={[BRAND.emblemRemote, BRAND.emblemSvg]} alt="" width={44} height={44} />
            <SmartImg className="ft__wordmark" src={BRAND.wordmark} fallbacks={[BRAND.wordmarkRemote]} alt="LaLiga" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
          </a>
          <p>{t('ft.tagline')}</p>
          <div className="ft__social">
            <a href={IG} target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" /></svg>
            </a>
            <a href={`https://wa.me/${phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z" fill="currentColor" /></svg>
            </a>
            <a href={telHref(phone)} aria-label={t('br.call')}>
              <svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            </a>
            <a href="https://laliga.az" target="_blank" rel="noreferrer" aria-label="laliga.az">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            </a>
          </div>
        </div>

        <nav className="ft__col ft__reveal" aria-label={t('ft.venues')}>
          <h3>{t('ft.venues')}</h3>
          {link('/game-center', 'Game Center')}
          {link('/game-center/hall', 'Game Hall')}
          {link('/dining', 'Dining & Lounge')}
          {link('/dining/menu', t('nav.menu'))}
        </nav>

        <nav className="ft__col ft__reveal" aria-label={t('ft.branches')}>
          <h3>{t('ft.branches')}</h3>
          {link('/game-center#filiallar', t('ft.gcBranches'))}
          {link('/dining#filiallar', t('ft.dnBranches'))}
          {link('/game-center#nece', t('nav.how'))}
          {link('/#loyalty', t('nav.loyalty'))}
        </nav>

        <div className="ft__col ft__reveal">
          <h3>{t('nav.contact')}</h3>
          {link('/elaqe', t('ft.contactPage'))}
          <a href={telHref(phone)}><span>{phone}</span></a>
          <a href={IG} target="_blank" rel="noreferrer"><span>@laligadininglounge</span></a>
          <p className="ft__hours"><i aria-hidden="true" />{t('ft.hours')}</p>
        </div>
      </div>

      {/* big quiet wordmark */}
      <div className="ft__word" aria-hidden="true">
        {'LALIGA'.split('').map((ch, i) => <span key={i}>{ch}</span>)}
      </div>

      <div className="ft__bottom">
        <span>{t('ft.copy')}</span>
        <button className="ft__top" onClick={() => scrollToTarget(lenis, 0)}>
          {t('ft.toTop')} <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  )
}
