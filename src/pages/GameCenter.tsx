import { useLayoutEffect, useRef } from 'react'
import { HandsBack, HandsFront } from '../components/game/Hands'
import { prefersReducedMotion } from '../lib/smooth'
import gsap from 'gsap'
import ScrollSequence from '../components/ScrollSequence'
import DiscShelf from '../components/game/DiscShelf'
import Branches from '../components/Branches'
import { gameBranches } from '../data/branches'
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
  const page = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!page.current) return
    const ctx = gsap.context(() => {
      gsap.from('.gc-hero__title .ln > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.2 })
      gsap.utils.toArray<HTMLElement>('.how__step').forEach((el, i) => {
        gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 40, opacity: 0, duration: 0.9, delay: i * 0.08, ease: 'power3.out' })
      })
      // hands wait below the controller until "Pick up the controller" is pressed
      gsap.set('.hall-teaser .hand-move--left', { x: -260, y: 760, rotate: -16, opacity: 0, transformOrigin: '50% 100%' })
      gsap.set('.hall-teaser .hand-move--right', { x: 260, y: 760, rotate: 16, opacity: 0, transformOrigin: '50% 100%' })
      gsap.set('.hall-teaser .hand-thumb', { rotate: 38, transformOrigin: '88% 92%' })
      gsap.set('.hall-teaser .hand-fingers', { x: 60, opacity: 0 })
      gsap.from('.hall-teaser__wrap', {
        scrollTrigger: { trigger: '.hall-teaser', start: 'top bottom', end: 'bottom top', scrub: true },
        yPercent: 18, rotate: -4, ease: 'none',
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
      // hands reach in from below
      .to(q('.hand-move--left, .hand-move--right'), { x: 0, y: 0, rotate: 0, opacity: 1, duration: 0.85, ease: 'expo.out', stagger: 0.07 }, 0.05)
      // fingers wrap the grips, thumbs come onto the face
      .to(q('.hand-fingers'), { x: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)' }, 0.7)
      .to(q('.hand-thumb'), { rotate: 0, duration: 0.35, ease: 'back.out(1.8)', stagger: 0.05 }, 0.72)
      // and lift it up towards the viewer, into the centre of the screen
      .to(lift, { x: dx, y: dy, scale: 1.25, rotate: -2, duration: 1, ease: 'expo.inOut' }, 1.05)
      .to(lift, { rotate: 0, duration: 0.3, ease: 'sine.inOut' }, 1.85)
  }

  return (
    <div ref={page} className="gc">
      <ScrollSequence
        className="gc-hero"
        frameCount={FRAMES}
        frameSrc={frame}
        lengthVh={560}
        onProgress={(p) => rail.current?.style.setProperty('--p', String(p))}
        timeline={(tl) => {
          tl.to('.gc-hero__intro', { opacity: 0, y: -60, duration: 0.12, ease: 'power2.in' }, 0.08)
            .fromTo('.gc-hero__beat--1', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06 }, 0.24)
            .to('.gc-hero__beat--1', { opacity: 0, y: -40, duration: 0.06 }, 0.4)
            .fromTo('.gc-hero__beat--2', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06 }, 0.56)
            .to('.gc-hero__beat--2', { opacity: 0, y: -40, duration: 0.06 }, 0.72)
            .fromTo('.gc-hero__beat--3', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06 }, 0.8)
            .to('.gc-hero__beat--3', { opacity: 0, y: -30, duration: 0.05 }, 0.93)
            .to('.gc-hero__veil', { opacity: 1, duration: 0.05 }, 0.95)
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
          <span className="gc-hero__hint" aria-hidden="true">{t('gc.hint')}</span>
        </div>
        <p className="gc-hero__beat gc-hero__beat--1">{t('gc.beat1')}</p>
        <p className="gc-hero__beat gc-hero__beat--2">{t('gc.beat2')}</p>
        <p className="gc-hero__beat gc-hero__beat--3">{t('gc.beat3')}</p>
        <div ref={rail} className="gc-hero__rail" aria-hidden="true"><span /></div>
      </ScrollSequence>

      <DiscShelf />

      <section className="hall-teaser" aria-labelledby="hall-teaser-title">
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
              <HandsBack />
              <img className="hall-teaser__console" src="/media/game/console.webp" alt={t('gc.hallAlt')} loading="lazy" />
              <HandsFront />
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

      <Branches id="filiallar" title={t('gc.branchesTitle'    )} venue="game" branches={gameBranches} />
    </div>
  )
}
