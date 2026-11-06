import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import { branchPath, mapEmbed, mapHref, routeHref, telHref, waHref, type Branch, type Venue } from '../services/branches'
import { useBranches } from '../hooks/useBranches'
import { distanceKm, fmtKm, locate, useGeo } from '../lib/geo'
import { useGo } from '../lib/transition'
import { useReserve } from '../components/Reserve'
import { useI18n, type Key } from '../lib/i18n'
import { prefersReducedMotion } from '../lib/smooth'
import { isMenuBranch, menuBranch } from '../data/menus'
import Gallery from '../components/branch/Gallery'

const VENUE_LABEL: Record<Venue, string> = { game: 'LaLiga Game Center', dining: 'LaLiga Dining & Lounge' }
const SHORT: Record<Venue, string> = { game: 'LaLiga G.C', dining: 'LaLiga Dining' }

export default function BranchDetail({ venue }: { venue: Venue }) {
  const { id = '' } = useParams()
  const { branches, loading } = useBranches(venue)
  const go = useGo()
  const { t } = useI18n()
  const branch = branches.find((b) => b.id === id)

  if (!branch) {
    return (
      <div className="bd bd--empty" data-venue={venue}>
        {!loading && (
          <>
            <h1>{t('br.notFound')}</h1>
            <button className="btn btn--solid" onClick={() => go(`${venue === 'game' ? '/game-center' : '/dining'}#filiallar`)}>{t('br.all')}</button>
          </>
        )}
      </div>
    )
  }
  // key: a fresh page (and fresh animations) for every branch
  return <Detail key={branch.id} branch={branch} all={branches} />
}

function Detail({ branch: b, all }: { branch: Branch; all: Branch[] }) {
  const { t, lang } = useI18n()
  const go = useGo()
  const reserve = useReserve()
  const geo = useGeo()
  const page = useRef<HTMLDivElement>(null)
  const [photo, setPhoto] = useState(0)
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const reduced = prefersReducedMotion()
  const home = `${b.venue === 'game' ? '/game-center' : '/dining'}`
  const index = all.findIndex((x) => x.id === b.id)
  const prev = all[(index - 1 + all.length) % all.length]
  const next = all[(index + 1) % all.length]
  const me = geo.status === 'ok' ? geo.pos : null
  const km = me ? distanceKm(me, b) : null

  useEffect(() => { document.title = `${b.name} · ${VENUE_LABEL[b.venue]}` }, [b, lang])

  // live clock for the "open now" card
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const others = useMemo(() => {
    const list = all.filter((x) => x.id !== b.id).map((x) => ({ x, km: me ? distanceKm(me, x) : null }))
    if (me) list.sort((p, q) => (p.km ?? 0) - (q.km ?? 0))
    return list
  }, [all, b.id, me])

  const onPhoto = useCallback((i: number) => setPhoto(i), [])

  /* ---------- entrance + scroll animations ---------- */
  useLayoutEffect(() => {
    if (!page.current || reduced) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.25 })
        .from('.bd__back', { x: -20, opacity: 0, duration: 0.8 })
        .from('.bd__chips > *', { y: 16, opacity: 0, stagger: 0.07, duration: 0.7 }, 0.05)
        .from('.bd__title .ln > span', { yPercent: 115, rotate: 3, stagger: 0.09, duration: 1.2 }, 0.1)
        .from('.bd__addr > *', { y: 18, opacity: 0, stagger: 0.07, duration: 0.8 }, 0.45)
        .from('.bd__meta > *', { y: 18, opacity: 0, stagger: 0.07, duration: 0.8 }, 0.55)
        .from('.bd__actions > *', { y: 22, opacity: 0, stagger: 0.08, duration: 0.8 }, 0.65)
        .from('.bd__gallery', { x: 140, opacity: 0, duration: 1.4, clearProps: 'transform,opacity' }, 0.15)
        .from('.gal__bar', { y: 20, opacity: 0, duration: 0.8 }, 0.8)
        .from('.bd__strip > *', { y: 20, opacity: 0, stagger: 0.06, duration: 0.8 }, 0.85)

      gsap.utils.toArray<HTMLElement>('.bd-reveal').forEach((el) => {
        gsap.from(el.children, {
          scrollTrigger: { trigger: el, start: 'top 82%' },
          y: 50, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out',
        })
      })
      // map card floats up over the map while scrolling
      gsap.fromTo('.bd-map__card', { yPercent: 25 }, {
        yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: '.bd-map', start: 'top bottom', end: 'bottom top', scrub: true },
      })
      // hero image parallax
      gsap.to('.bd__bgimg', { yPercent: 12, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.bd__hero', start: 'top top', end: 'bottom top', scrub: true } })
    }, page)
    return () => ctx.revert()
  }, [reduced])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${b.street}, Bakı — ${b.landmark}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked */ }
  }

  const msg = t(b.venue === 'game' ? 'br.msgGame' : 'br.msgDining', { b: b.name })
  const time = now.toLocaleTimeString(lang === 'en' ? 'en-GB' : lang === 'ru' ? 'ru-RU' : 'az-Latn-AZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Baku' })

  const features: { k: string; title: Key; text: Key; cta?: { label: Key; to?: string; act?: () => void } }[] =
    b.venue === 'game'
      ? [
          { k: 'PS5', title: 'br.f.ps5t', text: 'br.f.ps5d' },
          { k: '50+', title: 'br.f.gamest', text: 'br.f.gamesd', cta: { label: 'br.f.shelf', to: '/game-center#oyunlar' } },
          { k: '24', title: 'br.f.24t', text: 'br.f.24d' },
        ]
      : [
          { k: String(isMenuBranch(b.id) ? menuBranch(b.id).pages : 56), title: 'br.f.menut', text: 'br.f.menud', cta: { label: 'br.f.open', to: isMenuBranch(b.id) ? `/dining/menu/${b.id}` : '/dining/menu' } },
          { k: '07', title: 'br.f.roomst', text: 'br.f.roomsd', cta: { label: 'br.f.open', to: '/dining#otaqlar' } },
          { k: '01', title: 'br.f.bookt', text: 'br.f.bookd', cta: { label: 'br.book', act: () => reserve(b.venue, b.id) } },
        ]

  return (
    <div ref={page} className="bd" data-venue={b.venue}>
      {/* ================= HERO ================= */}
      <section className="bd__hero" aria-labelledby="bd-title">
        <div className="bd__bg" aria-hidden="true">
          {b.photos.map((src, i) => (
            <img key={src + i} className={`bd__bgimg ${i === photo ? 'is-on' : ''}`} src={src} alt="" />
          ))}
          <span className="bd__grain" />
        </div>

        <div className="bd__grid">
          <div className="bd__copy">
            <a className="bd__back" href={`${home}#filiallar`} onClick={(e) => { e.preventDefault(); go(`${home}#filiallar`) }}>
              <span aria-hidden="true">←</span> {t('br.all')}
            </a>

            <div className="bd__chips">
              <span className="bd__chip"><i className="bd__venue-dot" />{b.venue === 'game' ? 'Game Center' : 'Dining & Lounge'}</span>
              {b.open24 ? (
                <span className="bd__chip bd__chip--open"><i className="bd__pulse" />{t('br.openNow')}</span>
              ) : (
                <span className="bd__chip">{t('br.callToBook')}</span>
              )}
              {km !== null && <span className="bd__chip bd__chip--km">{t('br.fromYou', { d: fmtKm(km, lang) })}</span>}
            </div>

            <h1 id="bd-title" className="bd__title">
              <span className="ln"><span className="bd__brand">{SHORT[b.venue]}</span></span>
              <span className="ln"><span className="bd__name" style={{ ['--len' as string]: Math.max(5, b.name.length) }}>{b.name}</span></span>
            </h1>

            <p className="bd__addr">
              <span className="bd__street">{b.street}</span>
              <span className="bd__landmark">{b.landmark}</span>
            </p>

            <div className="bd__meta">
              {b.hours && (
                <span className="bd__metaitem">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  {b.hours}
                </span>
              )}
              <a className="bd__metaitem bd__phone" href={telHref(b.phone)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
                {b.phone}
              </a>
            </div>

            <div className="bd__actions">
              <a className="btn btn--ghost bd__btn bd__btn--map" href={mapHref(b)} target="_blank" rel="noreferrer" aria-label={t('br.address')}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.5 7-11.5a7 7 0 0 0-14 0C5 14.5 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
                <span>{t('br.address')}</span>
              </a>
              <button className="btn btn--solid bd__btn bd__btn--main" onClick={() => reserve(b.venue, b.id)}>
                {t('br.book')}
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <a className="bd__wa" href={waHref(b.phone, msg)} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z" fill="currentColor" /></svg>
              </a>
            </div>
          </div>

          <div className="bd__gallery">
            <Gallery photos={b.photos} alt={`${VENUE_LABEL[b.venue]} — ${b.name}`} onChange={onPhoto} />
          </div>
        </div>

        <div className="bd__strip">
          <span className="bd__idx"><b>{String(index + 1).padStart(2, '0')}</b> / {String(all.length).padStart(2, '0')}</span>
          <div className="bd__pn">
            <a href={branchPath(prev)} onClick={(e) => { e.preventDefault(); go(branchPath(prev)) }}>
              <span aria-hidden="true">←</span> {prev.name}
            </a>
            <a href={branchPath(next)} onClick={(e) => { e.preventDefault(); go(branchPath(next)) }}>
              {next.name} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================= INFO CARDS ================= */}
      <section className="bd-info bd-reveal" aria-label={t('br.hours')}>
        <article className="bd-card bd-card--hours">
          <span className="bd-card__k">{t('br.hours')}</span>
          {b.hours ? (
            <>
              <strong className="bd-card__big">{b.hours}</strong>
              <p>{b.open24 ? t('br.allDay') : ''}</p>
            </>
          ) : (
            <>
              <strong className="bd-card__mid">{t('br.callToBook')}</strong>
              <a className="bd-card__copy" href={telHref(b.phone)}>{t('br.call')}</a>
            </>
          )}
          {b.open24 && <span className="bd-card__live"><i className="bd__pulse" />{t('br.openNow')} · {time}</span>}
          <span className="bd-card__ring" aria-hidden="true" />
        </article>
        <article className="bd-card">
          <span className="bd-card__k">{t('br.address')}</span>
          <strong className="bd-card__mid">{b.street}</strong>
          <p>{b.landmark}</p>
          <button className={`bd-card__copy ${copied ? 'is-done' : ''}`} onClick={copy}>
            {copied ? '✓ ' + t('br.copied') : t('br.copy')}
          </button>
        </article>
        <article className="bd-card">
          <span className="bd-card__k">{t('br.phone')}</span>
          <strong className="bd-card__mid">{b.phone}</strong>
          <p>WhatsApp · {t('br.call')}</p>
          <div className="bd-card__row">
            <a className="bd-card__copy" href={telHref(b.phone)}>{t('br.call')}</a>
            <a className="bd-card__copy" href={waHref(b.phone, msg)} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </article>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bd-feat" aria-labelledby="bd-feat-title">
        <h2 id="bd-feat-title" className="bd-h2 bd-reveal"><span>{t('br.inside')}</span></h2>
        <div className="bd-feat__grid bd-reveal">
          {features.map((f) => (
            <article key={f.title} className="bd-feat__item">
              <span className="bd-feat__k" aria-hidden="true">{f.k}</span>
              <h3>{t(f.title)}</h3>
              <p>{t(f.text)}</p>
              {f.cta && (
                <button className="bd-feat__cta" onClick={() => (f.cta!.to ? go(f.cta!.to) : f.cta!.act?.())}>
                  {t(f.cta.label)} <span aria-hidden="true">→</span>
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ================= MAP ================= */}
      <section className="bd-map" aria-labelledby="bd-map-title">
        <div className="bd-map__frame">
          <span className="bd-map__ph" aria-hidden="true"><i /></span>
          <iframe title={`${b.name} — ${t('br.mapTitle')}`} src={mapEmbed(b)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <div className="bd-map__card">
          <span className="bd-card__k">{t('br.mapTitle')}</span>
          <h2 id="bd-map-title">{b.name}</h2>
          <p>{b.street} · {b.landmark}</p>
          {km !== null && <p className="bd-map__km">{t('br.fromYou', { d: fmtKm(km, lang) })}</p>}
          <div className="bd-map__btns">
            <a className="btn btn--solid" href={routeHref(b)} target="_blank" rel="noreferrer">{t('br.route')}</a>
            {!me && (
              <button className="btn btn--ghost" onClick={locate} disabled={geo.status === 'asking'}>
                {geo.status === 'asking' ? t('br.locating') : t('br.findNearest')}
              </button>
            )}
          </div>
          {(geo.status === 'denied' || geo.status === 'error') && <p className="bd-map__err">{t(geo.status === 'denied' ? 'br.denied' : 'br.geoError')}</p>}
        </div>
      </section>

      {/* ================= OTHER BRANCHES ================= */}
      <section className="bd-more" aria-labelledby="bd-more-title">
        <div className="bd-more__head bd-reveal">
          <h2 id="bd-more-title" className="bd-h2"><span>{t('br.others')}</span></h2>
          <a href={`${home}#filiallar`} onClick={(e) => { e.preventDefault(); go(`${home}#filiallar`) }}>{t('br.all')} →</a>
        </div>
        <ul className="bd-more__rail bd-reveal">
          {others.map(({ x, km: d }) => (
            <li key={x.id}>
              <a href={branchPath(x)} onClick={(e) => { e.preventDefault(); go(branchPath(x)) }} className="bd-more__card">
                <img src={x.photos[0]} alt="" loading="lazy" draggable={false} />
                <span className="bd-more__shade" aria-hidden="true" />
                <span className="bd-more__txt">
                  {d !== null && <em>{fmtKm(d, lang)}</em>}
                  <strong>{x.name}</strong>
                  <span>{x.street}</span>
                </span>
                <span className="bd-more__go" aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* mobile quick actions */}
      <div className="bd-dock">
        <a href={telHref(b.phone)}>{t('br.call')}</a>
        <button onClick={() => reserve(b.venue, b.id)}>{t('br.book')}</button>
      </div>
    </div>
  )
}
