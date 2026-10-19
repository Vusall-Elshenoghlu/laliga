import { useEffect, useLayoutEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import { DEPARTMENTS, JOBS, SHIFT, TEAM_COVER, TEAM_PHOTOS, type Venue } from '../services/team'
import { STATIC_BRANCHES } from '../services/branches'
import { useGo } from '../lib/transition'
import { useI18n } from '../lib/i18n'
import { prefersReducedMotion } from '../lib/smooth'
import DeptIcon from '../components/team/DeptIcon'
import Team from './Team'

const NAME: Record<Venue, string> = { game: 'Game Center', dining: 'Dining & Lounge' }

export default function TeamVenue() {
  const { venue } = useParams()
  if (venue !== 'game' && venue !== 'dining') return <Team />
  return <Detail key={venue} venue={venue} />
}

function Detail({ venue }: { venue: Venue }) {
  const { t, tr, lang } = useI18n()
  const go = useGo()
  const page = useRef<HTMLDivElement>(null)
  const depts = DEPARTMENTS.filter((d) => d.venue === venue)
  const people = depts.reduce((n, d) => n + parseInt(d.size, 10), 0)
  const branches = STATIC_BRANCHES.filter((b) => b.venue === venue).length
  const photos = TEAM_PHOTOS[venue]
  const jobs = JOBS.filter((j) => j.venue === venue || j.venue === 'both')
  const shift = SHIFT[venue]

  useEffect(() => { document.title = `${t(venue === 'game' ? 'tm.gameTeam' : 'tm.diningTeam')} · LaLiga` }, [venue, t, lang])

  useLayoutEffect(() => {
    if (!page.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.2 })
        .from('.tv-hero__bg img', { scale: 1.18, duration: 2.2, ease: 'power3.out' }, 0)
        .from('.tv-hero__back, .tv-hero__tag', { y: 16, opacity: 0, stagger: 0.07, duration: 0.8 }, 0.1)
        .from('.tp-hero__title .ln > span', { yPercent: 115, stagger: 0.09, duration: 1.2 }, 0.15)
        .from('.tv-hero__lead, .tp-stats > *', { y: 24, opacity: 0, stagger: 0.07, duration: 0.9 }, 0.45)
      gsap.to('.tv-hero__bg img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.tv-hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.utils.toArray<HTMLElement>('.tp-reveal').forEach((el) => {
        gsap.from(el.children, { scrollTrigger: { trigger: el, start: 'top 84%' }, y: 46, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out' })
      })
      // timeline line draws as you scroll
      gsap.fromTo('.tv-shift__line i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.tv-shift__list', start: 'top 70%', end: 'bottom 60%', scrub: true } })
      gsap.utils.toArray<HTMLElement>('.tv-step').forEach((el) => {
        gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 82%' }, x: -30, opacity: 0, duration: 0.9, ease: 'power3.out' })
      })
    }, page)
    return () => ctx.revert()
  }, [venue])

  return (
    <div ref={page} className="tp tv" data-venue={venue}>
      {/* ---------- hero ---------- */}
      <section className="tv-hero">
        <div className="tv-hero__bg" aria-hidden="true"><img src={TEAM_COVER[venue]} alt="" /></div>
        <div className="tv-hero__in">
          <a className="tv-hero__back bd__back" href="/komanda" onClick={(e) => { e.preventDefault(); go('/komanda') }}>
            <span aria-hidden="true">←</span> {t('tm.back')}
          </a>
          <span className="tv-hero__tag tp-venue__tag">LaLiga {NAME[venue]}</span>
          <h1 className="tp-hero__title">
            <span className="ln"><span>{NAME[venue]}</span></span>
            <span className="ln"><span className="tv-grad">{t('tm.title').toLowerCase()}</span></span>
          </h1>
          <p className="tv-hero__lead tp-hero__lead">{t(venue === 'game' ? 'tm.textGame' : 'tm.textDining')}</p>
          <dl className="tp-stats">
            <div><dt><b>{people}+</b></dt><dd>{t('tm.stat1')}</dd></div>
            <div><dt><b>{depts.length}</b></dt><dd>{t('tm.depts')}</dd></div>
            <div><dt><b>{branches}</b></dt><dd>{t('tm.stat2')}</dd></div>
            <div><dt><b>{venue === 'game' ? '7/24' : '365'}</b></dt><dd>{venue === 'game' ? t('tm.open247') : t('tm.open247')}</dd></div>
          </dl>
        </div>
      </section>

      {/* ---------- departments ---------- */}
      <section className="tv-who" aria-labelledby="tv-who">
        <h2 id="tv-who" className="ct-h2 tp-reveal"><span>{t('tm.whoTitle')}</span></h2>
        <ul className="tv-who__grid tp-reveal">
          {depts.map((d, i) => (
            <li key={d.id} className="tv-dept">
              <span className="tv-dept__n">{String(i + 1).padStart(2, '0')}</span>
              <span className="tms__ico"><DeptIcon name={d.icon} /></span>
              <strong className="tms__size">{d.size}<small>{t('tm.people')}</small></strong>
              <h3>{tr(d.name)}</h3>
              <p>{tr(d.text)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- photos (only when real team photos are added) ---------- */}
      {photos.length > 0 && (
        <section className="tv-photos" aria-labelledby="tv-photos">
          <h2 id="tv-photos" className="ct-h2 tp-reveal"><span>{t('tm.photosTitle')}</span></h2>
          <ul className={`tv-photos__grid tv-photos__grid--${Math.min(photos.length, 5)} tp-reveal`}>
            {photos.map((p, i) => (
              <li key={p.src + i}>
                <img src={p.src} alt={p.caption ? tr(p.caption) : ''} loading="lazy" />
                {p.caption && <span>{tr(p.caption)}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- a day ---------- */}
      <section className="tv-shift" aria-labelledby="tv-shift">
        <h2 id="tv-shift" className="ct-h2 tp-reveal"><span>{t('tm.shiftTitle')}</span></h2>
        <div className="tv-shift__list">
          <span className="tv-shift__line" aria-hidden="true"><i /></span>
          {shift.map((s) => (
            <article key={s.time} className="tv-step">
              <time>{s.time}</time>
              <div>
                <h3>{tr(s.title)}</h3>
                <p>{tr(s.text)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- roles ---------- */}
      <section className="tv-roles" aria-labelledby="tv-roles">
        <div className="cr-jobs__head tp-reveal">
          <h2 id="tv-roles" className="ct-h2">{t('tm.rolesTitle')}</h2>
          <a className="tms__btn" href="/karyera" onClick={(e) => { e.preventDefault(); go('/karyera') }}>{t('tm.allRoles')} →</a>
        </div>
        <ul className="tv-roles__grid tp-reveal">
          {jobs.map((j) => (
            <li key={j.id}>
              <a href="/karyera" onClick={(e) => { e.preventDefault(); go('/karyera') }}>
                <span className="cr-job__meta">{tr(j.type)}</span>
                <strong>{tr(j.title)}</strong>
                <span className="cr-job__meta">{tr(j.shift)}</span>
                <em aria-hidden="true">↗</em>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="tp-cta tp-reveal">
        <h2>{t('tm.ctaTitle')}</h2>
        <p>{t('tm.ctaText')}</p>
        <a className="tms__btn tms__btn--main" href="/karyera" onClick={(e) => { e.preventDefault(); go('/karyera') }}>
          {t('tm.join')} <span aria-hidden="true">→</span>
        </a>
      </section>
    </div>
  )
}
