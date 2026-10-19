import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollSequence from '../components/ScrollSequence'
import Branches from '../components/Branches'
import TeamSection from '../components/team/TeamSection'
import { dishSrc, menu, pageSrc } from '../data/menu'
import { useGo } from '../lib/transition'
import { useReserve } from '../components/Reserve'
import { useI18n, type L } from '../lib/i18n'
import { itemName, translateDesc } from '../data/menu-i18n'
import { HOOKAHS } from '../data/hookah'

const FRAMES = 120
const frame = (i: number) => `/media/dining/seq/f_${String(i).padStart(3, '0')}.webp`

const ROOMS: { no: string; name: L; line: L }[] = [
  { no: '101', name: { az: 'Əsas zal', en: 'Main hall', ru: 'Главный зал' }, line: { az: 'Gündəlik süfrə, böyük qrup şam yeməyi və canlı futbol yayımı.', en: 'Everyday dining, big group dinners and live football.', ru: 'Повседневные ужины, большие компании и живой футбол.' } },
  { no: '102', name: { az: 'VIP kabinetlər', en: 'VIP cabins', ru: 'VIP-кабинки' }, line: { az: 'Ailə və dostlar üçün qapalı, sakit masalar.', en: 'Private, quiet tables for family and friends.', ru: 'Закрытые тихие столы для семьи и друзей.' } },
  { no: '103', name: { az: 'Netflix otağı', en: 'Netflix room', ru: 'Netflix-зал' }, line: { az: '214 sm ekranda film, süfrə seans boyu xidmətdə.', en: 'Films on a 214 cm screen, served at your table throughout.', ru: 'Фильмы на экране 214 см, обслуживание весь сеанс.' } },
  { no: '104', name: { az: 'Karaoke', en: 'Karaoke', ru: 'Караоке' }, line: { az: 'Öz otağınızda mikrofon və tam restoran xidməti.', en: 'Your own room, a microphone and full restaurant service.', ru: 'Своя комната, микрофон и полное обслуживание.' } },
  { no: '105', name: { az: 'PlayStation otağı', en: 'PlayStation room', ru: 'PlayStation-зал' }, line: { az: 'Yemək, içki və özəl oyun sessiyası bir yerdə.', en: 'Food, drinks and a private gaming session together.', ru: 'Еда, напитки и приватная игровая сессия.' } },
  { no: '106', name: { az: 'Tədbir otağı', en: 'Event room', ru: 'Банкетный зал' }, line: { az: 'Ad günləri, korporativ gecələr və özəl günlər.', en: 'Birthdays, corporate nights and special days.', ru: 'Дни рождения, корпоративы и особые даты.' } },
  { no: '107', name: { az: 'Terras', en: 'Terrace', ru: 'Терраса' }, line: { az: 'Açıq havada çay dəstgahı və axşam söhbətləri.', en: 'Tea sets in the open air and evening talks.', ru: 'Чай на свежем воздухе и вечерние беседы.' } },
]

const PICKS = ['ozel-burger', 'stroqanof', 'ozel-pizza', 'can-saci', 'salmon', 'balli']

export default function Dining() {
  const go = useGo()
  const { t, tr, lang } = useI18n()
  const reserve = useReserve()
  const page = useRef<HTMLDivElement>(null)

  const allItems = menu.flatMap((c) => c.items)
  const picks = PICKS.map((slug) => allItems.find((i) => i.img === slug)!).filter(Boolean)

  useLayoutEffect(() => {
    if (!page.current) return
    const ctx = gsap.context(() => {
      gsap.from('.dn-hero__title .ln > span', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.1, delay: 0.2 })
      gsap.from('.key', {
        scrollTrigger: { trigger: '.rooms__keys', start: 'top 80%' },
        rotate: (i) => (i % 2 ? 14 : -14), y: -40, opacity: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', stagger: 0.07,
      })
      gsap.from('.menu-teaser__book', {
        scrollTrigger: { trigger: '.menu-teaser', start: 'top bottom', end: 'center center', scrub: true },
        rotateY: -40, rotateX: 18, y: 80, ease: 'none',
      })
    }, page)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={page} className="dn">
      <ScrollSequence
        className="dn-hero"
        frameCount={FRAMES}
        frameSrc={frame}
        lengthVh={360}
        timeline={(tl) => {
          tl.to('.dn-hero__intro', { opacity: 0, y: -50, duration: 0.15 }, 0.1)
            .fromTo('.dn-hero__beat--1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08 }, 0.3)
            .to('.dn-hero__beat--1', { opacity: 0, y: -30, duration: 0.08 }, 0.52)
            .fromTo('.dn-hero__end', { opacity: 0, y: 40, pointerEvents: 'none' }, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.1 }, 0.7)
            .to('.seq__canvas', { filter: 'brightness(0.55)', duration: 0.2 }, 0.7)
        }}
      >
        <div className="dn-hero__intro">
          <h1 className="dn-hero__title">
            <span className="ln"><span>{t('dn.title1')}</span></span>
            <span className="ln"><span>{t('dn.title2')}</span></span>
          </h1>
          <p>{t('dn.sub')}</p>
        </div>
        <p className="dn-hero__beat dn-hero__beat--1">{t('dn.beat')}</p>
        <div className="dn-hero__end">
          <h2>{t('dn.endTitle')}</h2>
          <p>{t('dn.endText')}</p>
          <div className="dn-hero__ctas">
            <a className="btn btn--brass" href="/dining/menu" onClick={(e) => { e.preventDefault(); go('/dining/menu') }}>{t('dn.menuCta')}</a>
            <button className="btn btn--ghost" onClick={() => reserve('dining')}>{t('nav.bookTable')}</button>
          </div>
        </div>
      </ScrollSequence>

      <section className="rooms" id="otaqlar" aria-labelledby="rooms-title">
        <header className="rooms__head">
          <h2 id="rooms-title">{t('dn.roomsTitle')}</h2>
          <p>{t('dn.roomsSub')}</p>
        </header>
        <ul className="rooms__keys">
          {ROOMS.map((r) => (
            <li key={r.no} className="key" tabIndex={0}>
              <span className="key__ring" aria-hidden="true" />
              <span className="key__tag">
                <span className="key__no">{r.no}</span>
                <span className="key__name">{tr(r.name)}</span>
                <span className="key__line">{tr(r.line)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="menu-teaser" id="menyu" aria-labelledby="mt-title">
        <div className="menu-teaser__book" aria-hidden="true">
          <img src={pageSrc(1)} alt="" loading="lazy" />
        </div>
        <div className="menu-teaser__copy">
          <h2 id="mt-title">{t('dn.teaserTitle')}</h2>
          <p>{t('dn.teaserText', { n: Math.floor(allItems.length / 10) * 10 })}</p>
          <a className="btn btn--brass" href="/dining/menu" onClick={(e) => { e.preventDefault(); go('/dining/menu') }}>{t('nav.openMenu')}</a>
        </div>
      </section>

      <section className="picks" id="secilmis" aria-labelledby="picks-title">
        <header className="picks__head">
          <h2 id="picks-title">{t('dn.picksTitle')}</h2>
          <a href="/dining/menu" onClick={(e) => { e.preventDefault(); go('/dining/menu') }}>{t('dn.fullMenu')}</a>
        </header>
        <ul className="picks__list">
          {picks.map((d) => (
            <li key={d.img} className="pick">
              <img src={dishSrc(d.img!)} alt={itemName(d, lang)} loading="lazy" />
              <div className="pick__body">
                <h3>{itemName(d, lang)}</h3>
                <p>{d.desc && translateDesc(d.desc, lang)}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* hookah — the chef's tobacco picks */}
        <div className="hk">
          <div className="hk__head">
            <span className="hk__smoke" aria-hidden="true"><i /><i /><i /></span>
            <h3>{t('dn.hookahTitle')}</h3>
            <p>{t('dn.hookahText')}</p>
          </div>
          <ul className="hk__list">
            {HOOKAHS.map((h) => (
              <li key={h.id} className="hk__item" style={{ ['--c1' as string]: h.tags[0], ['--c2' as string]: h.tags[1] }}>
                <span className="hk__dot" aria-hidden="true" />
                <div>
                  <strong>{tr(h.name)}</strong>
                  <p>{tr(h.notes)}</p>
                </div>
                <span className="hk__str" aria-label={`${t('dn.hookahStrength')}: ${h.strength}/3`}>
                  {[1, 2, 3].map((n) => <i key={n} className={n <= h.strength ? 'is-on' : ''} />)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Branches id="filiallar" title={t('dn.branchesTitle')} venue="dining" />

      <TeamSection venue="dining" />
    </div>
  )
}
