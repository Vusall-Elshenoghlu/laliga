import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { DEPARTMENTS, type Venue } from '../../services/team'
import { useGo } from '../../lib/transition'
import { useI18n } from '../../lib/i18n'
import { prefersReducedMotion } from '../../lib/smooth'
import DeptIcon from './DeptIcon'

/** "Our team" teaser on the Game Center / Dining pages → /komanda, and "Join" → /karyera */
export default function TeamSection({ venue }: { venue: Venue }) {
  const { t, tr } = useI18n()
  const go = useGo()
  const root = useRef<HTMLElement>(null)
  const list = DEPARTMENTS.filter((d) => d.venue === venue)

  useLayoutEffect(() => {
    if (!root.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 72%' } })
        .from('.tms__head > *', { y: 30, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'expo.out' })
        .from('.tms__card', { y: 50, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out' }, 0.15)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="tms" id="komanda" data-venue={venue} aria-labelledby={`tms-${venue}`}>
      <div className="tms__head">
        <p className="tms__eyebrow"><span />{t('tm.eyebrow')}</p>
        <h2 id={`tms-${venue}`}>{t('tm.title')}</h2>
        <p className="tms__text">{t(venue === 'game' ? 'tm.textGame' : 'tm.textDining')}</p>
        <div className="tms__btns">
          <a className="tms__btn tms__btn--main" href={`/komanda/${venue}`} onClick={(e) => { e.preventDefault(); go(`/komanda/${venue}`) }}>
            {t('tm.meet')} <span aria-hidden="true">→</span>
          </a>
          <a className="tms__btn" href="/karyera" onClick={(e) => { e.preventDefault(); go('/karyera') }}>
            {t('tm.join')}
          </a>
        </div>
      </div>
      <ul className="tms__grid">
        {list.map((d, i) => (
          <li key={d.id} className="tms__card" style={{ ['--i' as string]: i }}>
            <span className="tms__ico"><DeptIcon name={d.icon} /></span>
            <strong className="tms__size">{d.size}<small>{t('tm.people')}</small></strong>
            <h3>{tr(d.name)}</h3>
            <p>{tr(d.text)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
