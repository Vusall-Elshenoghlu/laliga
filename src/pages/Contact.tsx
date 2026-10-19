import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useBranches } from '../hooks/useBranches'
import { branchPath, mapHref, telHref, waHref, type Branch, type Venue } from '../services/branches'
import { distanceKm, fmtKm, locate, useGeo } from '../lib/geo'
import { useGo } from '../lib/transition'
import { useI18n, type Key } from '../lib/i18n'
import { prefersReducedMotion } from '../lib/smooth'
import BranchMap from '../components/branch/BranchMap'
import FormActions, { FormSent, type SendState } from '../components/FormActions'
import { submitForm } from '../services/forms'

const TOPICS: Key[] = ['ct.t.book', 'ct.t.party', 'ct.t.corp', 'ct.t.feedback', 'ct.t.other']
const IG = 'https://www.instagram.com/laligadininglounge/'

export default function Contact() {
  const { t, lang } = useI18n()
  const go = useGo()
  const geo = useGeo()
  const page = useRef<HTMLDivElement>(null)
  const { branches: all } = useBranches()
  const [venue, setVenue] = useState<Venue>('game')
  const [branchId, setBranchId] = useState('')
  const [topic, setTopic] = useState<Key>('ct.t.book')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState<SendState>('idle')
  const [tried, setTried] = useState(false)
  const [open, setOpen] = useState<number | null>(0)
  const [active, setActive] = useState<string | null>(null)

  const me = geo.status === 'ok' ? geo.pos : null
  const list = useMemo(() => {
    const l = all.filter((b) => b.venue === venue)
    return me ? [...l].sort((a, b) => distanceKm(me, a) - distanceKm(me, b)) : l
  }, [all, venue, me])
  const chosen: Branch | undefined = list.find((b) => b.id === branchId) ?? list[0]
  const nearest = me && list.length ? list[0] : null
  const valid = name.trim().length > 1 && phone.replace(/\D/g, '').length >= 7

  const text = chosen
    ? [
        t('ct.msgHello', { v: venue === 'game' ? 'LaLiga Game Center' : 'LaLiga Dining & Lounge', b: chosen.name }),
        `${t('ct.topic')}: ${t(topic)}`,
        msg.trim(),
        name.trim() ? `— ${name.trim()}` : '',
      ].filter(Boolean).join('\n')
    : ''

  useLayoutEffect(() => {
    if (!page.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.2 })
        .from('.ct-hero__title .ln > span', { yPercent: 115, stagger: 0.08, duration: 1.2 })
        .from('.ct-hero__lead, .ct-hero__chips > *', { y: 20, opacity: 0, stagger: 0.06, duration: 0.8 }, 0.3)
        .from('.ct-ch', { y: 40, opacity: 0, stagger: 0.08, duration: 0.9 }, 0.45)
      gsap.utils.toArray<HTMLElement>('.ct-reveal').forEach((el) => {
        gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 50, opacity: 0, duration: 1, ease: 'power3.out' })
      })
    }, page)
    return () => ctx.revert()
  }, [])

  const FAQ: [Key, Key][] = [['ct.q1', 'ct.a1'], ['ct.q2', 'ct.a2'], ['ct.q3', 'ct.a3'], ['ct.q4', 'ct.a4']]

  return (
    <div ref={page} className="ct">
      <div className="ct__bg" aria-hidden="true"><span /><span /></div>

      {/* ---------- hero ---------- */}
      <section className="ct-hero">
        <p className="ct-hero__kicker">LaLiga · Bakı</p>
        <h1 className="ct-hero__title">
          <span className="ln"><span>{t('ct.title1')}</span></span>
          <span className="ln"><span className="ct-grad">{t('ct.title2')}</span></span>
        </h1>
        <p className="ct-hero__lead">{t('ct.lead')}</p>
        <div className="ct-hero__chips">
          <span><i className="bd__pulse" />{t('ct.gcOpen')}</span>
          <span>{t('ct.reply')}</span>
        </div>

        <div className="ct-channels">
          <a className="ct-ch ct-ch--wa" href={chosen ? waHref(chosen.phone, text) : '#'} target="_blank" rel="noreferrer">
            <span className="ct-ch__ico"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z" fill="currentColor" /></svg></span>
            <strong>WhatsApp</strong>
            <span>{t('ct.chWa')}</span>
            <em aria-hidden="true">↗</em>
          </a>
          <a className="ct-ch ct-ch--tel" href={chosen ? telHref(chosen.phone) : '#'}>
            <span className="ct-ch__ico"><svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></span>
            <strong>{t('br.call')}</strong>
            <span>{chosen?.phone}</span>
            <em aria-hidden="true">↗</em>
          </a>
          <a className="ct-ch ct-ch--ig" href={IG} target="_blank" rel="noreferrer">
            <span className="ct-ch__ico"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" /></svg></span>
            <strong>Instagram</strong>
            <span>@laligadininglounge</span>
            <em aria-hidden="true">↗</em>
          </a>
          <button className="ct-ch ct-ch--near" onClick={locate} disabled={geo.status === 'asking'}>
            <span className="ct-ch__ico"><svg viewBox="0 0 24 24"><path d="M12 2.5a7 7 0 0 0-7 7c0 5.2 7 12 7 12s7-6.8 7-12a7 7 0 0 0-7-7z" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9.5" r="2.6" fill="currentColor" /></svg></span>
            <strong>{t('br.findNearest')}</strong>
            <span>{geo.status === 'asking' ? t('br.locating') : nearest ? `${nearest.name} — ${fmtKm(distanceKm(me!, nearest), lang)}` : geo.status === 'denied' ? t('br.denied') : t('ct.chNear')}</span>
            <em aria-hidden="true">→</em>
          </button>
        </div>
      </section>

      {/* ---------- write to a branch ---------- */}
      <section className="ct-form ct-reveal" aria-labelledby="ct-form-title" data-venue={venue}>
        <div className="ct-form__intro">
          <h2 id="ct-form-title" className="ct-h2">{t('ct.formTitle')}</h2>
          <p>{t('ct.formText')}</p>
          <ol className="ct-steps">
            <li><b>1</b>{t('ct.s1')}</li>
            <li><b>2</b>{t('ct.s2')}</li>
            <li><b>3</b>{t('ct.s3')}</li>
          </ol>
        </div>

        {state === 'sent' ? (
          <div className="ct-card"><FormSent onAgain={() => { setState('idle'); setTried(false); setMsg('') }} /></div>
        ) : (
        <form className="ct-card" noValidate onSubmit={async (e) => {
          e.preventDefault(); setTried(true)
          if (!chosen || !valid || state === 'sending') return
          setState('sending')
          try {
            await submitForm('contact', { venue, branch: chosen.id, branchName: chosen.name, topic: t(topic), name: name.trim(), phone: phone.trim(), message: msg.trim(), text })
            setState('sent')
          } catch { setState('error') }
        }}>
          <div className="ct-seg" role="tablist" aria-label={t('rs.venue')} data-v={venue}>
            <button type="button" role="tab" aria-selected={venue === 'game'} onClick={() => { setVenue('game'); setBranchId('') }}>Game Center</button>
            <button type="button" role="tab" aria-selected={venue === 'dining'} onClick={() => { setVenue('dining'); setBranchId('') }}>Dining & Lounge</button>
          </div>

          <label className="ct-field">
            <span>{t('rs.branch')}</span>
            <select value={chosen?.id ?? ''} onChange={(e) => setBranchId(e.target.value)}>
              {list.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.street}{me ? ` · ${fmtKm(distanceKm(me, b), lang)}` : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="ct-field">
            <span>{t('ct.topic')}</span>
            <div className="ct-chips" role="radiogroup" aria-label={t('ct.topic')}>
              {TOPICS.map((k) => (
                <button key={k} type="button" role="radio" aria-checked={topic === k} className={topic === k ? 'is-on' : ''} onClick={() => setTopic(k)}>{t(k)}</button>
              ))}
            </div>
          </div>

          <div className="cr-row cr-row--half">
            <label className={`ct-field ${tried && name.trim().length < 2 ? 'is-bad' : ''}`}>
              <span>{t('ct.name')}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('ct.namePh')} autoComplete="name" />
            </label>
            <label className={`ct-field ${tried && phone.replace(/\D/g, '').length < 7 ? 'is-bad' : ''}`}>
              <span>{t('f.phone')}</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+994" />
            </label>
          </div>

          <label className="ct-field">
            <span>{t('ct.message')}</span>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t('ct.msgPh')} rows={4} />
          </label>

          <div className="ct-preview" aria-live="polite">
            <span className="ct-preview__k">{t('ct.preview')}</span>
            <p>{text}</p>
          </div>

          {tried && !valid && <p className="ferr">{t('f.need')}</p>}
          {chosen && <FormActions state={state} wa={waHref(chosen.phone, text)} phone={chosen.phone} />}
        </form>
        )}
      </section>

      {/* ---------- map + directory ---------- */}
      <section className="ct-dir ct-reveal" aria-labelledby="ct-dir-title">
        <div className="ct-dir__head">
          <h2 id="ct-dir-title" className="ct-h2">{t('ct.dirTitle')}</h2>
          <p>{t('ct.dirText')}</p>
        </div>
        <div className="ct-dir__body">
          <div className="brx brx--embed" data-venue={venue}>
            <div className="brx__map">
              <BranchMap
                branches={list}
                active={active ?? chosen?.id ?? null}
                nearestId={nearest?.id ?? null}
                me={me}
                nearestLabel={t('br.nearest')}
                meLabel={t('br.youAreHere')}
                onHover={(id) => setActive(id)}
                onOpen={(b) => go(branchPath(b))}
              />
            </div>
          </div>
          <ul className="ct-list">
            {list.map((b) => (
              <li key={b.id} className={`ct-row ${(active ?? chosen?.id) === b.id ? 'is-active' : ''}`} onMouseEnter={() => setActive(b.id)} onMouseLeave={() => setActive(null)}>
                <div className="ct-row__main">
                  <strong>{b.name}{nearest?.id === b.id && <em>{t('br.nearest')}</em>}</strong>
                  <span>{b.street} · {b.landmark}</span>
                </div>
                <div className="ct-row__links">
                  <a href={telHref(b.phone)}>{b.phone}</a>
                  <a href={waHref(b.phone, t(venue === 'game' ? 'br.msgGame' : 'br.msgDining', { b: b.name }))} target="_blank" rel="noreferrer">WhatsApp</a>
                  <a href={mapHref(b)} target="_blank" rel="noreferrer">{t('br.map')}</a>
                  <a href={branchPath(b)} onClick={(e) => { e.preventDefault(); go(branchPath(b)) }} className="ct-row__go" aria-label={`${b.name} — ${t('br.details')}`}>→</a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="ct-faq ct-reveal" aria-labelledby="ct-faq-title">
        <h2 id="ct-faq-title" className="ct-h2">{t('ct.faqTitle')}</h2>
        <div className="ct-faq__list">
          {FAQ.map(([q, a], i) => (
            <div key={q} className={`ct-q ${open === i ? 'is-open' : ''}`}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                <span>{t(q)}</span>
                <i aria-hidden="true" />
              </button>
              <div className="ct-q__a"><div><p>{t(a)}</p></div></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
