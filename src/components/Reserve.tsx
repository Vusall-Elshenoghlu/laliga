import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { diningBranches, gameBranches, waHref, type Branch } from '../data/branches'
import { useI18n } from '../lib/i18n'
import { useMode } from '../lib/mode'
import { submitForm } from '../services/forms'
import FormActions, { FormSent, type SendState } from './FormActions'

type Venue = 'game' | 'dining'
/** open the drawer — optionally for a venue and a specific branch */
type Open = (v?: Venue, branchId?: string) => void
const Ctx = createContext<Open>(() => {})
export const useReserve = () => useContext(Ctx)

/** Reservation drawer: pick venue + branch, send a pre-filled WhatsApp message to that branch. */
export function ReserveProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [venue, setVenue] = useState<Venue>('game')
  const [branch, setBranch] = useState<string>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('20:00')
  const [people, setPeople] = useState(2)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState<SendState>('idle')
  const [tried, setTried] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  const lastFocus = useRef<HTMLElement | null>(null)
  // home page: both venues to choose from; inside Game Center / Dining the drawer is locked to that venue
  const mode = useMode()
  const locked: Venue | null = mode === 'home' ? null : mode

  const show = useCallback<Open>((v, branchId) => {
    lastFocus.current = document.activeElement as HTMLElement
    const next = locked ?? v
    if (next) setVenue((cur) => { if (cur !== next) setBranch(''); return next })
    if (branchId) setBranch(branchId)
    setOpen(true)
  }, [locked])

  // leaving a section while the drawer is open never shows the wrong venue
  useEffect(() => { if (locked) setVenue(locked) }, [locked])

  const close = useCallback(() => {
    const el = panel.current
    if (!el) return setOpen(false)
    gsap.to(el, { xPercent: 100, duration: 0.4, ease: 'power3.in', onComplete: () => setOpen(false) })
    lastFocus.current?.focus()
  }, [])

  useEffect(() => {
    if (!open || !panel.current) return
    gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: 'power3.out' })
    panel.current.querySelector<HTMLElement>('button, select, input')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const list: Branch[] = venue === 'game' ? gameBranches : diningBranches
  const chosen = list.find((b) => b.id === branch) ?? list[0]
  const what = venue === 'game' ? t('rs.station') : t('rs.table')
  const msg = t('rs.msg', { b: chosen.name, p: people, w: what, d: date ? ` — ${date}` : '', t: time }) + (name.trim() ? `\n— ${name.trim()}` : '')
  const valid = name.trim().length > 1 && phone.replace(/\D/g, '').length >= 7
  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!valid || state === 'sending') return
    setState('sending')
    try {
      await submitForm('booking', { venue, branch: chosen.id, branchName: chosen.name, date, time, people: String(people), name: name.trim(), phone: phone.trim(), message: msg })
      setState('sent')
    } catch { setState('error') }
  }

  return (
    <Ctx.Provider value={show}>
      {children}
      {open && (
        <div className="reserve" role="dialog" aria-modal="true" aria-labelledby="reserve-title">
          <button className="reserve__scrim" aria-label={t('close')} onClick={close} />
          <div ref={panel} className="reserve__panel" data-venue={venue}>
            <div className="reserve__head">
              <h2 id="reserve-title">{t('rs.title')}</h2>
              <button className="icon-btn" onClick={close} aria-label={t('close')}>✕</button>
            </div>

            {locked ? (
              <p className="reserve__venue"><span aria-hidden="true" />{venue === 'game' ? 'LaLiga Game Center' : 'LaLiga Dining & Lounge'}</p>
            ) : (
              <div className="seg" role="tablist" aria-label={t('rs.venue')}>
                <button role="tab" aria-selected={venue === 'game'} onClick={() => { setVenue('game'); setBranch('') }}>Game Center</button>
                <button role="tab" aria-selected={venue === 'dining'} onClick={() => { setVenue('dining'); setBranch('') }}>Dining & Lounge</button>
              </div>
            )}

            <label className="field">
              <span>{t('rs.branch')}</span>
              <select value={chosen.id} onChange={(e) => setBranch(e.target.value)}>
                {list.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} — {b.street}</option>
                ))}
              </select>
            </label>
            <div className="field-row">
              <label className="field">
                <span>{t('rs.date')}</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="field">
                <span>{t('rs.time')}</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
            </div>
            <div className="field">
              <span>{t('rs.people')}</span>
              <div className="stepper">
                <button onClick={() => setPeople(Math.max(1, people - 1))} aria-label={t('rs.less')}>−</button>
                <output aria-live="polite">{people}</output>
                <button onClick={() => setPeople(Math.min(30, people + 1))} aria-label={t('rs.more')}>+</button>
              </div>
            </div>

            {state === 'sent' ? (
              <FormSent onAgain={() => { setState('idle'); setTried(false) }} />
            ) : (
              <form className="reserve__form" onSubmit={send} noValidate>
                <div className="field-row">
                  <label className={`field ${tried && name.trim().length < 2 ? 'is-bad' : ''}`}>
                    <span>{t('f.name')}</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </label>
                  <label className={`field ${tried && phone.replace(/\D/g, '').length < 7 ? 'is-bad' : ''}`}>
                    <span>{t('f.phone')}</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+994" />
                  </label>
                </div>
                <p className="reserve__preview">{msg}</p>
                {tried && !valid && <p className="ferr">{t('f.need')}</p>}
                <FormActions state={state} wa={waHref(chosen.phone, msg)} phone={chosen.phone} />
                <p className="reserve__note">{t('rs.note')}</p>
              </form>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
