import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { diningBranches, gameBranches, telHref, waHref, type Branch } from '../data/branches'
import { useI18n } from '../lib/i18n'

type Venue = 'game' | 'dining'
const Ctx = createContext<(v?: Venue) => void>(() => {})
export const useReserve = () => useContext(Ctx)

/** Reservation drawer: pick venue + branch, send a pre-filled WhatsApp message to that branch. */
export function ReserveProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [venue, setVenue] = useState<Venue>('game')
  const [branch, setBranch] = useState<string>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('20:00')
  const [people, setPeople] = useState(2)
  const panel = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  const lastFocus = useRef<HTMLElement | null>(null)

  const show = useCallback((v?: Venue) => {
    lastFocus.current = document.activeElement as HTMLElement
    if (v) setVenue(v)
    setOpen(true)
  }, [])

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
  const msg = t('rs.msg', { b: chosen.name, p: people, w: what, d: date ? ` — ${date}` : '', t: time })

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

            <div className="seg" role="tablist" aria-label={t('rs.venue')}>
              <button role="tab" aria-selected={venue === 'game'} onClick={() => { setVenue('game'); setBranch('') }}>Game Center</button>
              <button role="tab" aria-selected={venue === 'dining'} onClick={() => { setVenue('dining'); setBranch('') }}>Dining & Lounge</button>
            </div>

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

            <p className="reserve__preview">{msg}</p>

            <a className="btn btn--solid reserve__send" href={waHref(chosen.phone, msg)} target="_blank" rel="noreferrer">
              {t('rs.send')}
            </a>
            <a className="reserve__call" href={telHref(chosen.phone)}>{t('rs.call')}: {chosen.phone}</a>
            <p className="reserve__note">{t('rs.note')}</p>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
