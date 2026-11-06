import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import SmartImg, { BRAND } from '../components/SmartImg'
import { prefersReducedMotion } from '../lib/smooth'
import { useI18n, type Key } from '../lib/i18n'

type Side = 'game' | 'dining'

const PANELS: Record<Side, { to: string; poster: string; video: string; title: string; line: Key; tags: Key; cta: Key }> = {
  game: {
    to: '/game-center',
    poster: '/media/home/game-poster.webp',
    video: '/media/home/game-hover.mp4',
    title: 'Game Center',
    line: 'home.game.line',
    tags: 'home.game.tags',
    cta: 'home.game.cta',
  },
  dining: {
    to: '/dining',
    poster: '/media/home/dining-poster.webp',
    video: '/media/home/dining-hover.mp4',
    title: 'Dining & Lounge',
    line: 'home.dining.line',
    tags: 'home.dining.tags',
    cta: 'home.dining.cta',
  },
}

export default function Home() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const root = useRef<HTMLDivElement>(null)
  const vids = useRef<Record<Side, HTMLVideoElement | null>>({ game: null, dining: null })
  const [hover, setHover] = useState<Side | null>(null)
  const leaving = useRef(false)

  useLayoutEffect(() => {
    if (!root.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.split__panel', { clipPath: 'inset(0 0 100% 0)', duration: 1.3, stagger: 0.12 })
        .from('.split__title', { yPercent: 110, duration: 1.1, stagger: 0.1 }, '-=0.8')
        .from('.split__seam', { scale: 0, rotate: -90, duration: 0.9 }, '-=0.9')
        .from('.split__line, .split__tags, .split__cta', { opacity: 0, y: 16, duration: 0.8, stagger: 0.05 }, '-=0.6')
    }, root)
    return () => ctx.revert()
  }, [])

  const enter = (side: Side) => {
    if (leaving.current) return
    setHover(side)
    const v = vids.current[side]
    if (v) { v.currentTime = 0; v.play().catch(() => {}) }
  }
  const leave = (side: Side) => {
    if (leaving.current) return
    setHover((h) => (h === side ? null : h))
    vids.current[side]?.pause()
  }

  const open = (side: Side) => {
    if (leaving.current) return
    leaving.current = true
    const panel = root.current?.querySelector<HTMLElement>(`[data-side="${side}"]`)
    const other = root.current?.querySelector<HTMLElement>(`[data-side="${side === 'game' ? 'dining' : 'game'}"]`)
    if (!panel || prefersReducedMotion()) return navigate(PANELS[side].to)
    vids.current[side]?.play().catch(() => {})
    const vertical = window.matchMedia('(max-width: 820px)').matches
    gsap.timeline({ onComplete: () => { navigate(PANELS[side].to); window.scrollTo(0, 0) } })
      .to('.split__content, .split__seam', { opacity: 0, duration: 0.3 })
      .to(other ?? [], vertical ? { flexGrow: 0.0001, duration: 0.8, ease: 'expo.inOut' } : { flexGrow: 0.0001, duration: 0.8, ease: 'expo.inOut' }, 0.1)
      .to(panel, { flexGrow: 1, duration: 0.8, ease: 'expo.inOut' }, 0.1)
      .to(panel.querySelector('.split__media'), { scale: 1.08, duration: 1, ease: 'power2.inOut' }, 0.1)
  }

  return (
    <div ref={root} className="home">
      <section className="split" data-hover={hover ?? 'none'} aria-label={t('home.pick')}>
        {(Object.keys(PANELS) as Side[]).map((side) => {
          const p = PANELS[side]
          return (
            <a
              key={side}
              href={p.to}
              data-side={side}
              className="split__panel"
              onMouseEnter={() => enter(side)}
              onMouseLeave={() => leave(side)}
              onFocus={() => enter(side)}
              onBlur={() => leave(side)}
              onClick={(e) => { e.preventDefault(); open(side) }}
            >
              <div className="split__media">
                <img className="split__poster" src={p.poster} alt="" />
                <video
                  ref={(el) => { vids.current[side] = el }}
                  className="split__video"
                  src={p.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={p.poster}
                  aria-hidden="true"
                />
              </div>
              <div className="split__shade" aria-hidden="true" />
              <div className="split__content">
                <div className="split__title-wrap"><h2 className="split__title">
                  {/* the italic serif's "&" is a decorative "Et" glyph — show a plain ampersand instead */}
                  {p.title.split('&').map((part, i) => (
                    <span key={i}>{i > 0 && <span className="split__amp">&amp;</span>}{part}</span>
                  ))}
                </h2></div>
                <p className="split__line">{t(p.line)}</p>
                <ul className="split__tags">{t(p.tags).split('|').map((x) => <li key={x}>{x}</li>)}</ul>
                <span className="split__cta">{t(p.cta)}<span aria-hidden="true" className="split__arrow" /></span>
              </div>
            </a>
          )
        })}
        <div className="split__seam" aria-hidden="true">
          <SmartImg src={BRAND.emblem} fallbacks={[BRAND.emblemRemote, BRAND.emblemSvg]} alt="" />
        </div>
      </section>

      <section className="loyal" id="loyalty">
        <div className="loyal__card" aria-hidden="true">
          <SmartImg src={BRAND.emblem} fallbacks={[BRAND.emblemRemote, BRAND.emblemSvg]} alt="" />
          <div>
            <strong>LaLiga Rewards</strong>
            <span>{t('loyal.tagline')}</span>
          </div>
          <span className="loyal__num">•••• 2016</span>
        </div>
        <div className="loyal__copy">
          <h2>{t('loyal.title')}</h2>
          <p>{t('loyal.text')}</p>
          <dl className="loyal__list">
            <div><dt>{t('loyal.1t')}</dt><dd>{t('loyal.1d')}</dd></div>
            <div><dt>{t('loyal.2t')}</dt><dd>{t('loyal.2d')}</dd></div>
            <div><dt>{t('loyal.3t')}</dt><dd>{t('loyal.3d')}</dd></div>
            <div><dt>{t('loyal.4t')}</dt><dd>{t('loyal.4d')}</dd></div>
          </dl>
        </div>
      </section>
    </div>
  )
}
