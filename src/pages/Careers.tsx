import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { HR_PHONE, JOBS, type Job } from '../services/team'
import { STATIC_BRANCHES } from '../services/branches'
import { CV_ACCEPT, cvOk, submitForm } from '../services/forms'
import FormActions, { FormSent, type SendState } from '../components/FormActions'
import { useI18n, type Key } from '../lib/i18n'
import { prefersReducedMotion, scrollToTarget, useLenis } from '../lib/smooth'

type Filter = 'all' | 'game' | 'dining'
const PERKS: [Key, Key][] = [['cr.p1t', 'cr.p1d'], ['cr.p2t', 'cr.p2d'], ['cr.p3t', 'cr.p3d'], ['cr.p4t', 'cr.p4d']]

export default function Careers() {
  const { t, tr } = useI18n()
  const lenis = useLenis()
  const page = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<string | null>(null)
  const [job, setJob] = useState<string>('')
  const [branch, setBranch] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [about, setAbout] = useState('')
  const [tried, setTried] = useState(false)
  const [cv, setCv] = useState<File | null>(null)
  const [cvErr, setCvErr] = useState(false)
  const [drag, setDrag] = useState(false)
  const [state, setState] = useState<SendState>('idle')
  const pickCv = (f?: File | null) => {
    if (!f) return
    if (!cvOk(f)) { setCvErr(true); setCv(null); return }
    setCvErr(false); setCv(f)
  }
  const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

  const jobs = JOBS.filter((j) => filter === 'all' || j.venue === filter || j.venue === 'both')
  const venueLabel = (j: Job) => (j.venue === 'game' ? 'Game Center' : j.venue === 'dining' ? 'Dining & Lounge' : t('cr.both'))
  const chosen = JOBS.find((j) => j.id === job)
  const posName = chosen ? tr(chosen.title) : t('cr.other')
  const b = STATIC_BRANCHES.find((x) => x.id === branch)
  const msg = [
    t('cr.msg', { p: posName }),
    name && `${t('cr.name')}: ${name}`,
    phone && `${t('cr.phone')}: ${phone}`,
    age && `${t('cr.age')}: ${age}`,
    b && `${t('rs.branch')}: ${b.name} (${b.venue === 'game' ? 'Game Center' : 'Dining'})`,
    about.trim(),
  ].filter(Boolean).join('\n')
  const ok = name.trim().length > 1 && phone.replace(/\D/g, '').length >= 7

  const applyFor = (id: string) => {
    setJob(id)
    scrollToTarget(lenis, '#cr-form', -90)
  }

  useLayoutEffect(() => {
    if (!page.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.2 })
        .from('.tp-hero__title .ln > span', { yPercent: 115, stagger: 0.09, duration: 1.2 })
        .from('.tp-hero__lead', { y: 24, opacity: 0, duration: 0.9 }, 0.35)
      gsap.utils.toArray<HTMLElement>('.tp-reveal').forEach((el) => {
        gsap.from(el.children, { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 40, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'power3.out' })
      })
    }, page)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={page} className="tp cr">
      <div className="tp__bg" aria-hidden="true"><span /><span /></div>
      <section className="tp-hero">
        <p className="ct-hero__kicker">LaLiga · {t('nav.careers')}</p>
        <h1 className="tp-hero__title">
          <span className="ln"><span>{t('cr.title1')}</span></span>
          <span className="ln"><span className="ct-grad">{t('cr.title2')}</span></span>
        </h1>
        <p className="tp-hero__lead">{t('cr.lead')}</p>
      </section>

      <section className="cr-perks" aria-label={t('cr.perksTitle')}>
        <ul className="tp-values__grid tp-reveal">
          {PERKS.map(([a, d], i) => <li key={a}><span>{String(i + 1).padStart(2, '0')}</span><h3>{t(a)}</h3><p>{t(d)}</p></li>)}
        </ul>
      </section>

      <section className="cr-jobs" aria-labelledby="cr-jobs">
        <div className="cr-jobs__head tp-reveal">
          <h2 id="cr-jobs" className="ct-h2">{t('cr.openTitle')} <sup>{jobs.length}</sup></h2>
          <div className="ct-chips" role="radiogroup" aria-label={t('rs.venue')}>
            {(['all', 'game', 'dining'] as Filter[]).map((f) => (
              <button key={f} role="radio" aria-checked={filter === f} className={filter === f ? 'is-on' : ''} onClick={() => setFilter(f)}>
                {f === 'all' ? t('cr.all') : f === 'game' ? 'Game Center' : 'Dining & Lounge'}
              </button>
            ))}
          </div>
        </div>
        <ul className="cr-list">
          {jobs.map((j) => (
            <li key={j.id} className={`cr-job ${open === j.id ? 'is-open' : ''}`} data-venue={j.venue}>
              <button className="cr-job__top" aria-expanded={open === j.id} onClick={() => setOpen(open === j.id ? null : j.id)}>
                <span className="cr-job__venue">{venueLabel(j)}</span>
                <strong>{tr(j.title)}</strong>
                <span className="cr-job__meta">{tr(j.type)} · {tr(j.shift)}</span>
                <i aria-hidden="true" />
              </button>
              <div className="ct-q__a"><div>
                <div className="cr-job__body">
                  <p>{tr(j.about)}</p>
                  <h4>{t('cr.needs')}</h4>
                  <ul>{j.needs.map((n, k) => <li key={k}>{tr(n)}</li>)}</ul>
                  <button className="tms__btn tms__btn--main" onClick={() => applyFor(j.id)}>{t('cr.apply')} <span aria-hidden="true">→</span></button>
                </div>
              </div></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="ct-form cr-form tp-reveal" id="cr-form" aria-labelledby="cr-form-title">
        <div className="ct-form__intro">
          <h2 id="cr-form-title" className="ct-h2">{t('cr.formTitle')}</h2>
          <p>{t('cr.formText')}</p>
        </div>
        {state === 'sent' ? (
          <div className="ct-card"><FormSent text={t('cr.sentText')} onAgain={() => { setState('idle'); setTried(false); setCv(null); setAbout('') }} /></div>
        ) : (
        <form className="ct-card" noValidate onSubmit={async (e) => {
          e.preventDefault(); setTried(true)
          if (!ok || state === 'sending') return
          setState('sending')
          try {
            await submitForm('job', { position: posName, positionId: job, branch: b ? `${b.venue}:${b.id}` : '', name: name.trim(), phone: phone.trim(), age, about: about.trim(), message: msg }, cv)
            setState('sent')
          } catch { setState('error') }
        }}>
          <label className="ct-field">
            <span>{t('cr.position')}</span>
            <select value={job} onChange={(e) => setJob(e.target.value)}>
              <option value="">{t('cr.other')}</option>
              {JOBS.map((j) => <option key={j.id} value={j.id}>{tr(j.title)} — {venueLabel(j)}</option>)}
            </select>
          </label>
          <label className="ct-field">
            <span>{t('rs.branch')}</span>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="">—</option>
              {STATIC_BRANCHES.map((x) => <option key={x.venue + x.id} value={x.id}>{x.venue === 'game' ? 'Game Center' : 'Dining'} — {x.name}</option>)}
            </select>
          </label>
          <div className="cr-row">
            <label className={`ct-field ${tried && name.trim().length < 2 ? 'is-bad' : ''}`}>
              <span>{t('cr.name')}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label className="ct-field cr-age">
              <span>{t('cr.age')}</span>
              <input value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 2))} inputMode="numeric" />
            </label>
          </div>
          <label className={`ct-field ${tried && phone.replace(/\D/g, '').length < 7 ? 'is-bad' : ''}`}>
            <span>{t('cr.phone')}</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+994" />
          </label>
          <label className="ct-field">
            <span>{t('cr.about')}</span>
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder={t('cr.aboutPh')} rows={4} />
          </label>
          <div className="ct-field">
            <span>{t('cr.cv')}</span>
            <label
              className={`cv-drop ${drag ? 'is-drag' : ''} ${cv ? 'has-file' : ''} ${cvErr ? 'is-bad' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pickCv(e.dataTransfer.files?.[0]) }}
            >
              <input type="file" accept={CV_ACCEPT} onChange={(e) => { pickCv(e.target.files?.[0]); e.target.value = '' }} />
              <span className="cv-drop__ico" aria-hidden="true">
                {cv
                  ? <svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 14l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : <svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </span>
              {cv ? (
                <span className="cv-drop__txt"><strong>{cv.name}</strong><small>{kb(cv.size)}</small></span>
              ) : (
                <span className="cv-drop__txt"><strong>{t('cr.cvDrop')}</strong><small>{cvErr ? t('cr.cvBad') : t('cr.cvHint')}</small></span>
              )}
              {cv && <button type="button" className="cv-drop__x" onClick={(e) => { e.preventDefault(); setCv(null) }}>{t('cr.cvRemove')}</button>}
            </label>
          </div>
          {tried && !ok && <p className="ferr">{t('cr.fill')}</p>}
          <FormActions state={state} phone={HR_PHONE} />
        </form>
        )}
      </section>
    </div>
  )
}
