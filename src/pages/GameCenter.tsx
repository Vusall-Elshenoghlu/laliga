import { useLayoutEffect, useRef, useState } from 'react'
import Controller, { loadPadColor } from '../components/game/Controller'
import { prefersReducedMotion } from '../lib/smooth'
import gsap from 'gsap'
import ScrollSequence from '../components/ScrollSequence'
import DiscShelf from '../components/game/DiscShelf'
import Branches from '../components/Branches'
import SmartImg, { BRAND } from '../components/SmartImg'
import TeamSection from '../components/team/TeamSection'
import { useGo } from '../lib/transition'
import { useReserve } from '../components/Reserve'
import { useI18n } from '../lib/i18n'

const FRAMES = 281
const frame = (i: number) => `/media/game/seq/f_${String(i).padStart(3, '0')}.webp`

export default function GameCenter() {
  const go = useGo()
  const { t } = useI18n()
  const reserve = useReserve()
  const rail = useRef<HTMLDivElement>(null)
  const cue = useRef<HTMLDivElement>(null)
  const page = useRef<HTMLDivElement>(null)
  const [padColor] = useState(loadPadColor)

  useLayoutEffect(() => {
    if (!page.current) return
    const ctx = gsap.context(() => {
      gsap.from('.gc-hero__title .ln > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.2 })
      gsap.utils.toArray<HTMLElement>('.how__step').forEach((el, i) => {
        gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 40, opacity: 0, duration: 0.9, delay: i * 0.08, ease: 'power3.out' })
      })
      gsap.from('.hall-teaser__wrap', {
        scrollTrigger: { trigger: '.hall-teaser', start: 'top bottom', end: 'bottom top', scrub: true },
        yPercent: 6, rotate: -2, ease: 'none',
      })
    }, page)
    return () => ctx.revert()
  }, [])

  const grabbing = useRef(false)
  const grab = () => {
    if (grabbing.current) return
    const lift = page.current?.querySelector<HTMLElement>('.hall-teaser__lift')
    if (!lift || prefersReducedMotion()) return go('/game-center/hall')
    grabbing.current = true
    const r = lift.getBoundingClientRect()
    const dx = window.innerWidth / 2 - (r.left + r.width / 2)
    const dy = window.innerHeight / 2 - (r.top + r.height / 2)
    const q = (sel: string) => page.current!.querySelectorAll(`.hall-teaser ${sel}`)
    gsap.timeline({ onComplete: () => { go('/game-center/hall'); window.setTimeout(() => { grabbing.current = false }, 1500) } })
      .to(q('.hall-teaser__copy'), { opacity: 0, x: -40, duration: 0.5, ease: 'power2.in' }, 0)
      // a small dip, as if it's being picked up…
      .to(lift, { y: 10, scale: 0.97, rotate: 1.5, duration: 0.22, ease: 'power2.out' }, 0)
      // …then it floats up towards the viewer, into the centre of the screen
      .to(lift, { x: dx, y: dy, scale: 1.14, rotate: -2.5, duration: 1.1, ease: 'expo.inOut' }, 0.22)
      .to(lift, { rotate: 0, scale: 1.12, duration: 0.35, ease: 'sine.inOut' }, 1.15)
  }

  return (
    <div ref={page} className="gc">
      <ScrollSequence
        className="gc-hero"
        frameCount={FRAMES}
        frameSrc={frame}
        lengthVh={560}
        onProgress={(p) => {
          rail.current?.style.setProperty('--p', String(p))
          cue.current?.style.setProperty('--p', String(p))
        }}
        timeline={(tl) => {
          tl.to('.gc-hero__intro', { opacity: 0, y: -60, duration: 0.12, ease: 'power2.in' }, 0.08)
            .fromTo('.gc-hero__beat--1', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06 }, 0.24)
            .to('.gc-hero__beat--1', { opacity: 0, y: -40, duration: 0.06 }, 0.4)
            .fromTo('.gc-hero__beat--2', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06 }, 0.56)
            .to('.gc-hero__beat--2', { opacity: 0, y: -40, duration: 0.06 }, 0.72)
            .fromTo('.gc-hero__beat--3', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06 }, 0.8)
            .to('.gc-hero__beat--3', { opacity: 0, y: -30, duration: 0.05 }, 0.93)
            .to('.gc-hero__veil', { opacity: 1, duration: 0.05 }, 0.95)
            // the scroll cue stays until the disc is out of its case, then hands over to the shelf
            .to('.gc-cue__label--start', { opacity: 0, y: -10, duration: 0.04 }, 0.1)
            .fromTo('.gc-cue__label--go', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.04 }, 0.12)
            .to('.gc-cue', { opacity: 0, y: 20, duration: 0.05 }, 0.9)
        }}
      >
        <div className="gc-hero__veil" aria-hidden="true" />
        <div className="gc-hero__intro">
          <h1 className="gc-hero__title">
            <span className="ln"><span>{t('gc.title1')}</span></span>
            <span className="ln"><span>{t('gc.title2')}</span></span>
          </h1>
          <div className="gc-hero__row">
            <p>{t('gc.sub')}</p>
            <button className="btn btn--solid" onClick={() => reserve('game')}>{t('gc.bookStation')}</button>
          </div>
        </div>
        <div ref={cue} className="gc-cue" aria-hidden="true">
          <span className="gc-cue__case">
            <span className="gc-cue__cd"><i /></span>
            <span className="gc-cue__box">
              <span className="gc-cue__band">PS5</span>
              <span className="gc-cue__art" />
              <span className="gc-cue__glare" />
            </span>
          </span>
          <span className="gc-cue__text">
            <span className="gc-cue__label gc-cue__label--start">{t('gc.hint')}</span>
            <span className="gc-cue__label gc-cue__label--go">{t('gc.hintGo')}</span>
            <span className="gc-cue__bar"><b /></span>
          </span>
          <span className="gc-cue__disc" />
          <span className="gc-cue__chev"><i /><i /><i /></span>
        </div>
        <p className="gc-hero__beat gc-hero__beat--1">{t('gc.beat1')}</p>
        <p className="gc-hero__beat gc-hero__beat--2">{t('gc.beat2')}</p>
        <p className="gc-hero__beat gc-hero__beat--3">{t('gc.beat3')}</p>
        <div ref={rail} className="gc-hero__rail" aria-hidden="true"><span /></div>
      </ScrollSequence>

      <DiscShelf />

      <section className="hall-teaser" id="game-hall" aria-labelledby="hall-teaser-title">
        <div className="hall-teaser__copy">
          <h2 id="hall-teaser-title">Game Hall</h2>
          <p>{t('gc.hallText')}</p>
          <a className="btn btn--solid" href="/game-center/hall" onClick={(e) => { e.preventDefault(); grab() }}>
            {t('gc.hallCta')}
          </a>
        </div>
        <div className="hall-teaser__wrap">
          <div className="hall-teaser__lift" onClick={grab}>
            <div className="hall-teaser__rig">
              <Controller className="hall-teaser__console" color={padColor} alt={t('gc.hallAlt')} />
              {/* the controller's screen shows the same LaLiga boot screen as the Game Hall */}
              <div className="hall-teaser__ui" aria-hidden="true">
                <div className="hall__boot">
                  <SmartImg src={BRAND.emblem} fallbacks={[BRAND.emblemRemote, BRAND.emblemSvg]} alt="" />
                  <span>LALIGA</span>
                  <i className="hall-teaser__bar" />
                </div>
              </div>
              <div className="hall-teaser__name" aria-hidden="true">LaLiga</div>
            </div>
          </div>
        </div>
      </section>

      <section className="how" id="nece" aria-labelledby="how-title">
        <h2 id="how-title">{t('how.title')}</h2>
        <ol className="how__steps">
          <li className="how__step"><b>1</b><h3>{t('how.1t')}</h3><p>{t('how.1d')}</p></li>
          <li className="how__step"><b>2</b><h3>{t('how.2t')}</h3><p>{t('how.2d')}</p></li>
          <li className="how__step"><b>3</b><h3>{t('how.3t')}</h3><p>{t('how.3d')}</p></li>
          <li className="how__step"><b>4</b><h3>{t('how.4t')}</h3><p>{t('how.4d')}</p></li>
        </ol>
        <dl className="facts">
          <div><dt>8</dt><dd>{t('facts.branches')}</dd></div>
          <div><dt>50+</dt><dd>{t('facts.games')}</dd></div>
          <div><dt>PS5</dt><dd>{t('facts.hw')}</dd></div>
          <div><dt>7/24</dt><dd>{t('facts.open')}</dd></div>
        </dl>
      </section>

      <Branches id="filiallar" title={t('gc.branchesTitle')} venue="game" />

      <TeamSection venue="game" />
    </div>
  )
}
