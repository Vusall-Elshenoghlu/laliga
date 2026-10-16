import { mapHref, telHref, waHref, type Branch } from '../data/branches'
import { useI18n } from '../lib/i18n'

type Props = { id: string; title: string; venue: 'game' | 'dining'; branches: Branch[] }

export default function Branches({ id, title, venue, branches }: Props) {
  const { t } = useI18n()
  const msg = (b: Branch) => t(venue === 'game' ? 'br.msgGame' : 'br.msgDining', { b: b.name })
  return (
    <section className="branches" id={id} data-venue={venue} aria-labelledby={`${id}-title`}>
      <header className="branches__head">
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{t('br.text')}</p>
      </header>
      <ul className="branches__list">
        {branches.map((b) => (
          <li key={b.id} className="branch">
            <div className="branch__name">
              <h3>{b.name}</h3>
              <span className="branch__open">{t('br.open')}</span>
            </div>
            <p className="branch__addr">{b.street}<br /><span>{b.landmark}</span></p>
            <div className="branch__links">
              <a href={telHref(b.phone)}>{b.phone}</a>
              <a href={waHref(b.phone, msg(b))} target="_blank" rel="noreferrer">WhatsApp</a>
              <a href={mapHref(b)} target="_blank" rel="noreferrer">{t('br.map')}</a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
