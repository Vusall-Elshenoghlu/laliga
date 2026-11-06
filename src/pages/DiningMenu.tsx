import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MenuBook from '../components/dining/MenuBook'
import MenuList from '../components/dining/MenuList'
import BackButton from '../components/BackButton'
import { useLenis, prefersReducedMotion } from '../lib/smooth'
import { useI18n } from '../lib/i18n'
import { diningBranches } from '../data/branches'
import { MENU_BRANCHES, branchPageSrc, isMenuBranch, lastMenuBranch, menuBranch, rememberMenuBranch, type MenuBranchId } from '../data/menus'

type View = 'book' | 'list'

const info = (id: MenuBranchId) => diningBranches.find((b) => b.id === id)

/**
 * /dining/menu            → "which branch are you in?" — three menus to choose from
 * /dining/menu/:branch    → that branch's menu (the QR codes on the tables point here)
 */
export default function DiningMenu() {
  const { branch: param } = useParams()
  const id = isMenuBranch(param) ? param : null
  const [view, setView] = useState<View>(() => (window.matchMedia('(max-width: 640px)').matches ? 'list' : 'book'))
  const lenis = useLenis()
  const navigate = useNavigate()
  const { t } = useI18n()

  useEffect(() => { if (id) rememberMenuBranch(id) }, [id])

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    const tm = setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => clearTimeout(tm)
  }, [view, id, lenis])

  if (!id) return <MenuPicker onPick={(b) => navigate(`/dining/menu/${b}`)} />

  const branch = menuBranch(id)
  const header = (
    <div className="mbr" role="tablist" aria-label={t('menu.branch')}>
      {MENU_BRANCHES.map((b) => (
        <button
          key={b.id}
          role="tab"
          aria-selected={b.id === id}
          onClick={() => b.id !== id && navigate(`/dining/menu/${b.id}`, { replace: true })}
        >
          {info(b.id)?.name ?? b.id}
        </button>
      ))}
    </div>
  )

  return (
    <div className="dmenu" data-view={view}>
      <BackButton to="/dining" label={t('menu.backTo')} variant="dining" />
      <div className="dmenu__switch seg" role="tablist" aria-label={t('menu.view')}>
        <button role="tab" aria-selected={view === 'book'} onClick={() => setView('book')}>{t('menu.book')}</button>
        <button role="tab" aria-selected={view === 'list'} onClick={() => setView('list')}>{t('menu.list')}</button>
      </div>
      {view === 'book'
        ? <MenuBook key={id} branch={branch} header={header} />
        : <MenuList key={id} branch={branch} header={header} />}
    </div>
  )
}

/** the three menus as closed books on a table — pick yours */
function MenuPicker({ onPick }: { onPick: (id: MenuBranchId) => void }) {
  const { t } = useI18n()
  const root = useRef<HTMLDivElement>(null)
  const last = lastMenuBranch()

  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.mpick__head > *', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', delay: 0.15 })
      gsap.from('.mpick__card', { y: 80, rotateX: 25, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'expo.out', delay: 0.3 })
    }, el)
    return () => ctx.revert()
  }, [])

  // a slight tilt towards the pointer, like lifting a menu off the table
  const tilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`)
  }
  const untilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={root} className="dmenu mpick">
      <BackButton to="/dining" label={t('menu.backTo')} variant="dining" />
      <header className="mpick__head">
        <span className="mpick__eyebrow">LaLiga Dining & Lounge</span>
        <h1>{t('menu.pickTitle')}</h1>
        <p>{t('menu.pickText')}</p>
      </header>
      <div className="mpick__grid">
        {MENU_BRANCHES.map((b) => {
          const br = info(b.id)
          return (
            <button
              key={b.id}
              className="mpick__card"
              onClick={() => onPick(b.id)}
              onPointerMove={tilt}
              onPointerLeave={untilt}
              onPointerEnter={() => { const img = new Image(); img.src = branchPageSrc(b, 2) }}
            >
              <span className="mpick__book" style={{ ['--pa' as string]: b.aspect }}>
                <img src={branchPageSrc(b, 1)} alt="" loading="eager" />
                <i className="mpick__spine" aria-hidden="true" />
                <i className="mpick__gloss" aria-hidden="true" />
              </span>
              <span className="mpick__meta">
                {last === b.id && <em>{t('menu.pickLast')}</em>}
                <strong>{br?.name ?? b.id}</strong>
                <small>{br?.street}</small>
                <span className="mpick__go">{t('menu.pickOpen')} <span aria-hidden="true">→</span></span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="mpick__note">{t('menu.pickNote')}</p>
    </div>
  )
}
