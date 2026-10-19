import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import BranchMap from './branch/BranchMap'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { branchPath, type Branch, type Venue } from '../services/branches'
import { useBranches } from '../hooks/useBranches'
import { distanceKm, fmtKm, locate, useGeo } from '../lib/geo'
import { useGo } from '../lib/transition'
import { useI18n } from '../lib/i18n'
import { prefersReducedMotion } from '../lib/smooth'

gsap.registerPlugin(Flip)

type Props = { id: string; title: string; venue: Venue; branches?: Branch[] }

export default function Branches({ id, title, venue, branches: given }: Props) {
  const { t, lang } = useI18n()
  const go = useGo()
  const geo = useGeo()
  const { branches: loaded } = useBranches(venue)
  const branches = given ?? loaded
  const [active, setActive] = useState<string | null>(null)
  const root = useRef<HTMLElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const flipState = useRef<Flip.FlipState | null>(null)

  const me = geo.status === 'ok' ? geo.pos : null

  // distances + order (nearest first once we know where the visitor is)
  const rows = useMemo(() => {
    const r = branches.map((b, i) => ({ b, i, km: me ? distanceKm(me, b) : null }))
    if (me) r.sort((a, c) => (a.km ?? 0) - (c.km ?? 0))
    return r
  }, [branches, me])
  const nearest = me ? rows[0] : null

  // entrance
  useLayoutEffect(() => {
    if (!root.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%' } })
      tl.from('.brx__head > *', { y: 30, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'expo.out' })
        .from('.brx__map', { scale: 0.94, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0.1)
        .from('.brx__card', { y: 40, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'power3.out' }, 0.25)
    }, root)
    return () => ctx.revert()
  }, [branches.length])

  // re-order the cards smoothly when distances arrive
  const askNearest = () => {
    if (list.current) flipState.current = Flip.getState(list.current.querySelectorAll('.brx__card'))
    locate()
  }
  useLayoutEffect(() => {
    if (!flipState.current || !me) return
    Flip.from(flipState.current, { duration: 0.9, ease: 'expo.inOut', stagger: 0.03, absolute: false })
    flipState.current = null
    if (nearest) setActive(nearest.b.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me])

  const open = (b: Branch) => go(branchPath(b))

  const status =
    geo.status === 'asking' ? t('br.locating')
      : geo.status === 'denied' ? t('br.denied')
        : geo.status === 'unsupported' ? t('br.unsupported')
          : geo.status === 'error' ? t('br.geoError')
            : nearest && nearest.km !== null ? t('br.nearestIs', { b: nearest.b.name, d: fmtKm(nearest.km, lang) })
              : ''


  return (
    <section ref={root} className={`brx ${branches.length <= 4 ? 'brx--few' : ''}`} id={id} data-venue={venue} aria-labelledby={`${id}-title`}>
      <div className="brx__bg" aria-hidden="true" />
      <header className="brx__head">
        <p className="brx__eyebrow"><span />{t('br.count', { n: branches.length })}</p>
        <h2 id={`${id}-title`}>{title}</h2>
        <p className="brx__text">{t(venue === 'game' ? 'br.textGame' : 'br.textDining')}</p>
        <div className="brx__locate-row">
          <button className={`brx__locate ${geo.status === 'asking' ? 'is-busy' : ''} ${me ? 'is-done' : ''}`} onClick={askNearest} disabled={geo.status === 'asking'}>
            <span className="brx__locate-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 2.5a7 7 0 0 0-7 7c0 5.2 7 12 7 12s7-6.8 7-12a7 7 0 0 0-7-7z" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9.5" r="2.6" fill="currentColor" /></svg>
            </span>
            {t('br.findNearest')}
          </button>
          <p className="brx__status" role="status" aria-live="polite">{status}</p>
        </div>
      </header>

      <div className="brx__body">
        {/* real city map — labels laid out so nothing overlaps */}
        <div className="brx__map">
          <BranchMap
            branches={branches}
            active={active}
            nearestId={nearest?.b.id ?? null}
            me={me}
            nearestLabel={t('br.nearest')}
            meLabel={t('br.youAreHere')}
            onHover={(hid) => setActive(hid ?? nearest?.b.id ?? null)}
            onOpen={open}
          />
          <span className="brx__city" aria-hidden="true">BAKI · 40.4°N 49.9°E</span>
        </div>

        <ul ref={list} className="brx__list">
          {rows.map(({ b, i, km }) => {
            const isNear = nearest?.b.id === b.id
            return (
              <li key={b.id} className={`brx__card ${active === b.id ? 'is-active' : ''} ${isNear ? 'is-near' : ''}`} data-flip-id={b.id}>
                <a
                  href={branchPath(b)}
                  onClick={(e) => { e.preventDefault(); open(b) }}
                  onMouseEnter={() => setActive(b.id)}
                  onFocus={() => setActive(b.id)}
                >
                  <span className="brx__thumb"><img src={b.photos[0]} alt="" loading="lazy" draggable={false} /></span>
                  <span className="brx__info">
                    <span className="brx__top">
                      <span className="brx__no">{String(i + 1).padStart(2, '0')}</span>
                      {isNear && <span className="brx__badge">{t('br.nearest')}</span>}
                      {b.open24 && <span className="brx__live"><i />7/24</span>}
                    </span>
                    <strong className="brx__name">{b.name}</strong>
                    <span className="brx__addr">{b.street} · <span>{b.landmark}</span></span>
                  </span>
                  <span className="brx__side">
                    {km !== null && <span className="brx__km">{fmtKm(km, lang)}</span>}
                    <span className="brx__go" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
