import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { DEPARTMENTS, type Venue } from '../services/team'
import { STATIC_BRANCHES } from '../services/branches'
import { useGo } from '../lib/transition'
import { useI18n, type Key } from '../lib/i18n'
import { prefersReducedMotion } from '../lib/smooth'
import DeptIcon from '../components/team/DeptIcon'

const VALUES: [Key, Key, string][] = [['tm.v1t', 'tm.v1d', '01'], ['tm.v2t', 'tm.v2d', '02'], ['tm.v3t', 'tm.v3d', '03'], ['tm.v4t', 'tm.v4d', '04']]

export default function Team() {
  const { t, tr } = useI18n()
  const go = useGo()
  const page = useRef<HTMLDivElement>(null)
  const total = DEPARTMENTS.reduce((n, d) => n + parseInt(d.size, 10), 0)

  useLayoutEffect(() => {
    if (!page.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.2 })
        .from('.tp-hero__title .ln > span', { yPercent: 115, stagger: 0.09, duration: 1.2 })
        .from('.tp-hero__lead, .tp-stats > *', { y: 24, opacity: 0, stagger: 0.07, duration: 0.9 }, 0.35)
      gsap.utils.toArray<HTMLElement>('.tp-reveal').forEach((el) => {
        gsap.from(el.children, { scrollTrigger: { trigger: el, start: 'top 82%' }, y: 50, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out' })
      })
      // stat counters
      gsap.utils.toArray<HTMLElement>('.tp-stats b[data-n]').forEach((b) => {
        const n = Number(b.dataset.n), suf = b.dataset.s ?? ''
        const o = { v: 0 }
        gsap.to(o, { v: n, duration: 1.6, ease: 'power2.out', delay: 0.5, onUpdate: () => { b.textContent = Math.round(o.v) + suf } })
      })
    }, page)
    return () => ctx.revert()
  }, [])

  const block = (venue: Venue) => (
    <section className={`tp-venue tp-venue--${venue}`} aria-labelledby={`tp-${venue}`}>
      <div className="tp-venue__head tp-reveal">
        <span className="tp-venue__tag">{venue === 'game' ? 'Game Center' : 'Dining & Lounge'}</span>
        <h2 id={`tp-${venue}`}>{t(venue === 'game' ? 'tm.gameTeam' : 'tm.diningTeam')}</h2>
        <p>{t(venue === 'game' ? 'tm.textGame' : 'tm.textDining')}</p>
        <a className="tms__btn tms__btn--main" href={`/komanda/${venue}`} onClick={(e) => { e.preventDefault(); go(`/komanda/${venue}`) }}>
          {t('tm.open')} <span aria-hidden="true">→</span>
        </a>
      </div>
      <ul className="tp-depts tp-reveal">
        {DEPARTMENTS.filter((d) => d.venue === venue).map((d) => (
          <li key={d.id} className="tp-dept">
            <span className="tms__ico"><DeptIcon name={d.icon} /></span>
            <div>
              <h3>{tr(d.name)}</h3>
              <p>{tr(d.text)}</p>
            </div>
            <strong>{d.size}</strong>
          </li>
        ))}
      </ul>
    </section>
  )

  return (
    <div ref={page} className="tp">
      <div className="tp__bg" aria-hidden="true"><span /><span /></div>
      <section className="tp-hero">
        <p className="ct-hero__kicker">LaLiga · {t('tm.title')}</p>
        <h1 className="tp-hero__title">
          <span className="ln"><span>{t('tm.pageTitle1')}</span></span>
          <span className="ln"><span className="ct-grad">{t('tm.pageTitle2')}</span></span>
        </h1>
        <p className="tp-hero__lead">{t('tm.pageLead')}</p>
        <dl className="tp-stats">
          <div><dt><b data-n={total} data-s="+">{total}+</b></dt><dd>{t('tm.stat1')}</dd></div>
          <div><dt><b data-n={STATIC_BRANCHES.length}>{STATIC_BRANCHES.length}</b></dt><dd>{t('tm.stat2')}</dd></div>
          <div><dt><b data-n={new Date().getFullYear() - 2016}>{new Date().getFullYear() - 2016}</b></dt><dd>{t('tm.stat3')}</dd></div>
          <div><dt><b>24</b></dt><dd>{t('tm.stat4')}</dd></div>
        </dl>
      </section>

      {block('game')}
      {block('dining')}

      <section className="tp-values" aria-labelledby="tp-values">
        <h2 id="tp-values" className="ct-h2 tp-reveal"><span>{t('tm.valuesTitle')}</span></h2>
        <ul className="tp-values__grid tp-reveal">
          {VALUES.map(([title, text, n]) => (
            <li key={n}><span>{n}</span><h3>{t(title)}</h3><p>{t(text)}</p></li>
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
