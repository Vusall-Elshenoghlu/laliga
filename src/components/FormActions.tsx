import { useI18n } from '../lib/i18n'
import { telHref } from '../services/branches'

export type SendState = 'idle' | 'sending' | 'sent' | 'error'

type Props = {
  state: SendState
  /** WhatsApp link — omitted for job applications */
  wa?: string
  phone: string
  onWa?: () => void
}

/**
 * Order of actions in every form:
 *  1. Send  → goes to the admin panel (primary, the form's submit button)
 *  2. WhatsApp (optional)
 *  3. Call
 */
export default function FormActions({ state, wa, phone, onWa }: Props) {
  const { t } = useI18n()
  return (
    <div className="factions">
      <button type="submit" className={`fsend ${state === 'sending' ? 'is-busy' : ''}`} disabled={state === 'sending'}>
        <span>{state === 'sending' ? t('f.sending') : t('f.send')}</span>
        <i aria-hidden="true">
          {state === 'sending'
            ? <svg viewBox="0 0 24 24" className="fsend__spin"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeDasharray="34 50" strokeLinecap="round" /></svg>
            : <svg viewBox="0 0 24 24"><path d="M4 12l16-8-6 16-2.5-6.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>}
        </i>
      </button>
      <div className="factions__alt">
        {wa && (
          <a className="falt falt--wa" href={wa} target="_blank" rel="noreferrer" onClick={onWa}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z" fill="currentColor" /></svg>
            {t('f.wa')}
          </a>
        )}
        <a className="falt" href={telHref(phone)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          <span className="falt__txt">{t('f.call')} <small>{phone}</small></span>
        </a>
      </div>
      {state === 'error' && <p className="ferr" role="alert">{t('f.err')}</p>}
    </div>
  )
}

export function FormSent({ onAgain, text }: { onAgain: () => void; text?: string }) {
  const { t } = useI18n()
  return (
    <div className="fsent" role="status">
      <span className="fsent__tick" aria-hidden="true">
        <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="none" /><path d="M15 27l7 7 15-16" fill="none" /></svg>
      </span>
      <h3>{t('f.sentTitle')}</h3>
      <p>{text ?? t('f.sentText')}</p>
      <button type="button" className="falt" onClick={onAgain}>{t('f.again')}</button>
    </div>
  )
}
