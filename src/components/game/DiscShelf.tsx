import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import type { Game } from '../../types/game'
import { useGames } from '../../hooks/useGames'
import Disc, { Cover } from './Disc'
import TrailerModal from './TrailerModal'
import { prefersReducedMotion } from '../../lib/smooth'
import { useI18n } from '../../lib/i18n'


type Flight = { game: Game; key: number }

gsap.registerPlugin(MotionPathPlugin)

const BOX_LIFT = 10 // px a case pops up while a disc goes in / comes out
const LIFT = '-40%' // lid of the case whose disc is on screen stays slid up
const trayDisc = (tray: Element | null) => tray?.querySelector('.disc') ?? null
const COPIES = 3 // the rail is rendered three times so it can drift endlessly
const DRIFT = 42 // px per second the rail glides on its own
const spinOf = (el: Element | null) => el?.querySelector('.disc__spin') ?? null
const labelOf = (el: Element | null) => el?.querySelector('.disc__label') ?? null


export default function DiscShelf() {
  const { games, loading, error } = useGames()
  const { t } = useI18n()
  if (!games.length) {
    return (
      <section className="shelf shelf--empty" id="oyunlar" aria-busy={loading}>
        <header className="shelf__head">
          <h2>{t('shelf.title')}</h2>
          <p>{error ? t('shelf.error') : t('shelf.loading')}</p>
        </header>
      </section>
    )
  }
  return <Shelf games={games} />
}

function Shelf({ games }: { games: Game[] }) {
  const wrap = (i: number) => (i + games.length) % games.length
  const { t, tr } = useI18n()
  const [idx, setIdx] = useState(0)
  const [shown, setShown] = useState(0) // game on the stage (lags idx during a swap)
  const [playing, setPlaying] = useState<Game | null>(null)
  const [loading, setLoading] = useState(false)
  const [flyIn, setFlyIn] = useState<Flight | null>(null)
  const [flyOut, setFlyOut] = useState<Flight | null>(null)

  const section = useRef<HTMLElement>(null)
  const discRef = useRef<HTMLDivElement>(null)
  const caseRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const consoleRef = useRef<HTMLDivElement>(null)
  const flyInRef = useRef<HTMLDivElement>(null)
  const flyOutRef = useRef<HTMLDivElement>(null)
  const lids = useRef<(HTMLDivElement | null)[]>([])
  const trays = useRef<(HTMLDivElement | null)[]>([])
  const spin = useRef<gsap.core.Tween | null>(null)
  const busy = useRef(false)
  const pending = useRef<{ from: number; to: number; k: number } | null>(null)
  const n = games.length
  const copiesOf = (i: number) => Array.from({ length: COPIES }, (_, c) => c * n + i)
  const playingRef = useRef(false)
  const flightKey = useRef(0)
  const reduced = prefersReducedMotion()

  const game = games[shown]

  // idle spin of the stage disc
  useEffect(() => {
    const el = discRef.current?.querySelector('.disc__spin')
    if (!el || reduced) return
    spin.current = gsap.to(el, { rotate: '+=360', duration: 9, ease: 'none', repeat: -1 })
    return () => { spin.current?.kill() }
  }, [reduced])

  // cases rest closed and straight; the one whose disc is on screen keeps its lid slid up, tray empty
  useLayoutEffect(() => {
    lids.current.forEach((lid, k) => gsap.set(lid, { y: k % n === 0 ? LIFT : 0 }))
    trays.current.forEach((tr, k) => gsap.set(trayDisc(tr), { opacity: k % n === 0 ? 0 : 1 }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** put every copy of the rail into the resting state for the selected game */
  const syncCopies = useCallback((sel: number) => {
    lids.current.forEach((lid, k) => gsap.set(lid, { y: k % n === sel ? LIFT : 0 }))
    trays.current.forEach((tr, k) => gsap.set(trayDisc(tr), { opacity: k % n === sel ? 0 : 1 }))
  }, [n])

  /** the copy of game i that is closest to the middle of the rail */
  const nearestK = useCallback((i: number) => {
    const rail = railRef.current
    if (!rail) return n + i
    const mid = rail.scrollLeft + rail.clientWidth / 2
    let best = n + i, d = Infinity
    copiesOf(i).forEach((k) => {
      const el = rail.children[k] as HTMLElement | undefined
      if (!el) return
      const dd = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid)
      if (dd < d) { d = dd; best = k }
    })
    return best
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  // entrance
  useLayoutEffect(() => {
    if (!section.current || reduced) return
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: section.current, start: 'top 65%' } })
        .from(caseRef.current, { x: -80, rotateY: 50, opacity: 0, duration: 1.1, ease: 'expo.out' })
        .from(discRef.current, { x: '-55%', scale: 0.8, opacity: 0, duration: 1.3, ease: 'expo.out' }, '-=0.8')
        .from('.shelf__info > *', { y: 24, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'power3.out' }, '-=1')
        .from('.jcase', { y: 40, opacity: 0, stagger: 0.015, duration: 0.7, ease: 'power3.out' }, '-=0.9')
    }, section)
    return () => ctx.revert()
  }, [reduced])

  /** hover preview: any case opens exactly like the on-screen one (lid slides up), disc still inside */
  const peek = (k: number, open: boolean) => {
    if (k % n === idx || busy.current) return
    const lid = lids.current[k]
    if (lid) gsap.to(lid, { y: open ? LIFT : 0, duration: open ? 0.35 : 0.3, ease: open ? 'power3.out' : 'power3.inOut', overwrite: 'auto' })
  }

  /** centre a case in the rail; instant during a flight so measurements stay valid */
  const centerCase = useCallback((k: number, smooth = false) => {
    const rail = railRef.current
    const item = rail?.children[k] as HTMLElement | undefined
    if (!rail || !item) return
    const left = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, item.offsetLeft - rail.clientWidth / 2 + item.clientWidth / 2))
    if (smooth) rail.scrollTo({ left, behavior: 'smooth' })
    else rail.scrollLeft = left
  }, [])

  /* ------------------------------------------------------------------ */
  /*  Swap: open the chosen case, its disc flies to the stage,           */
  /*  the current disc flies home and its case closes.                   */
  /* ------------------------------------------------------------------ */
  const select = useCallback((nextRaw: number, clickedK?: number) => {
    const next = wrap(nextRaw)
    if (next === idx || busy.current || playing || loading) return
    const prev = idx
    const k = clickedK ?? nearestK(next)
    setIdx(next)
    if (reduced) {
      syncCopies(next)
      setShown(next)
      centerCase(k, true)
      return
    }
    busy.current = true
    const rail = railRef.current
    // freeze the rail right now: the disc must leave from exactly where its case is
    rail?.classList.add('is-flying')
    inertia.current = 0
    const launch = () => {
      pending.current = { from: prev, to: next, k }
      flightKey.current += 1
      setFlyIn({ game: games[next], key: flightKey.current })
      setFlyOut({ game: games[prev], key: flightKey.current })
    }
    // chosen with the arrows / keyboard and its case is (partly) off the rail?
    // glide it into view first, then take the disc out from where it stops
    const item = rail?.children[k] as HTMLElement | undefined
    if (rail && item && clickedK === undefined) {
      const l = item.offsetLeft - rail.scrollLeft, r = l + item.offsetWidth
      const pad = rail.clientWidth * 0.08
      if (l < pad || r > rail.clientWidth - pad) {
        const target = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, item.offsetLeft - rail.clientWidth / 2 + item.offsetWidth / 2))
        gsap.to(rail, { scrollLeft: target, duration: 0.55, ease: 'power3.inOut', onComplete: launch })
        return
      }
    }
    launch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, reduced, playing, loading, centerCase, games, nearestK, syncCopies])

  // run the flight once the flyers are mounted
  useLayoutEffect(() => {
    const p = pending.current
    if (!p || !flyIn || !flyOut) return
    const fin = flyInRef.current, fout = flyOutRef.current
    const sec = section.current!, rail = railRef.current!
    // the rail is frozen (no drift / drag / snapping) and is NOT moved: we measure the cases where they are
    rail.classList.add('is-flying')
    const outK = nearestK(p.from)
    const stage = discRef.current, inTray = trays.current[p.k], outTray = trays.current[outK]
    const inLid = lids.current[p.k], outLid = lids.current[outK]
    if (!fin || !fout || !stage || !inTray || !outTray) { rail.classList.remove('is-flying'); busy.current = false; pending.current = null; return }
    // the other copies of the chosen game open straight away (they are off screen)
    copiesOf(p.to).forEach((k) => {
      if (k === p.k) return
      gsap.set(lids.current[k], { y: LIFT })
      gsap.set(trayDisc(trays.current[k]), { opacity: 0 })
    })

    // positions are relative to the section, so page scrolling mid-flight can't desync them
    const base = sec.getBoundingClientRect()
    const rel = (el: Element) => {
      const r = el.getBoundingClientRect()
      return { left: r.left - base.left, top: r.top - base.top, width: r.width, height: r.height }
    }
    const stageR = rel(stage)
    const inR = rel(inTray.querySelector('.disc')!)
    const outR = rel(outTray.querySelector('.disc')!)
    const railR = rel(rail)
    const outVisible = outR.left > railR.left - 4 && outR.left + outR.width < railR.left + railR.width + 4
    const dir = p.to > p.from ? 1 : -1

    /*
     * Every hand-off (tray disc ⇄ flyer ⇄ stage disc) happens at the SAME position, size and spin angle,
     * so a disc never pops or appears twice. Only the inner .disc__spin rotates — the light (shine) stays put.
     */
    const stageSpin = spinOf(stage)
    spin.current?.pause()
    const R = Number(gsap.getProperty(stageSpin, 'rotation')) || 0

    const finSpin = spinOf(fin), foutSpin = spinOf(fout)
    gsap.set(fin, { ...inR, opacity: 0, rotationX: 0, transformPerspective: 900 })
    gsap.set(finSpin, { rotation: 0 })
    gsap.set(labelOf(fin), { opacity: 0 })
    gsap.set(fout, { ...stageR, opacity: 1, rotationX: 0, transformPerspective: 900, filter: 'drop-shadow(0 40px 40px rgba(0,0,0,0.6))' })
    gsap.set(foutSpin, { rotation: R })
    const inBox = inLid?.parentElement ?? null, outBox = outLid?.parentElement ?? null
    const lift = inR.height * 1.1 // how far a disc rises above its case

    const tl = gsap.timeline({
      onComplete: () => {
        syncCopies(p.to)
        pending.current = null
        setFlyIn(null)
        setFlyOut(null)
        busy.current = false
        spin.current?.play()
      },
    })

    /* ---------- outgoing: stage disc arcs home and drops into its open case ---------- */
    tl.set(stage, { opacity: 0 }, 0)
      .to(caseRef.current, { rotateY: 70 * dir, opacity: 0, duration: 0.35, ease: 'power3.in' }, 0)
      .to(infoRef.current, { y: -14, opacity: 0, duration: 0.25, ease: 'power2.in' }, 0)
      .to(labelOf(fout), { opacity: 0, duration: 0.3 }, 0.2)

    if (outVisible) {
      const above = { left: outR.left, top: outR.top - lift }
      const peak = { left: (stageR.left + above.left) / 2, top: Math.min(stageR.top, above.top) - 90 }
      tl.to(fout, {
          motionPath: { path: [peak, above], curviness: 1.4 },
          width: outR.width, height: outR.height, duration: 0.85, ease: 'power2.inOut',
        }, 0.05)
        .to(fout, { rotationX: 24, duration: 0.42, ease: 'sine.out' }, 0.05)
        .to(fout, { rotationX: 0, duration: 0.43, ease: 'sine.in' }, 0.47)
        .to(fout, { filter: 'drop-shadow(0 0px 0px rgba(0,0,0,0))', duration: 0.6 }, 0.5)
        .to(foutSpin, { rotation: -720, duration: 1.15, ease: 'power3.out' }, 0.05)
        // its case is still open (lid slid up) — the disc drops in, then the lid slides back down
        .to(outLid, { y: LIFT, duration: 0.2, ease: 'power2.out' }, 0.6)
        .to(outBox, { y: -BOX_LIFT, duration: 0.3, ease: 'power2.out' }, 0.6)
        .to(fout, { top: outR.top - BOX_LIFT, duration: 0.3, ease: 'power2.in' }, 0.9)
        // hand-off: identical spot, size and angle
        .set(trayDisc(outTray), { opacity: 1 }, 1.2)
        .set(fout, { opacity: 0 }, 1.2)
        .to(outLid, { y: 0, duration: 0.4, ease: 'power3.inOut' }, 1.22)
        .to(outBox, { y: 0, duration: 0.45, ease: 'back.out(2)' }, 1.3)
    } else {
      // its case is scrolled out of the rail: head off that edge and slip back in silently
      const edge = outR.left < railR.left ? railR.left - outR.width : railR.left + railR.width
      tl.to(fout, {
          motionPath: { path: [{ left: (stageR.left + edge) / 2, top: stageR.top - 60 }, { left: edge, top: railR.top + 30 }], curviness: 1.2 },
          width: outR.width, height: outR.height, opacity: 0, duration: 0.9, ease: 'power2.inOut',
        }, 0.05)
        .to(foutSpin, { rotation: -720, duration: 0.9, ease: 'power2.out' }, 0.05)
        .set(outLid, { y: 0 }, 0.95)
        .set(trayDisc(outTray), { opacity: 1 }, 0.95)
    }

    /* ---------- incoming: lid slides up, disc rises out, arcs to the stage ---------- */
    const finalRot = R + 720
    const top = { left: inR.left, top: inR.top - lift }
    const peakIn = { left: (inR.left + stageR.left) / 2, top: Math.min(top.top, stageR.top) - 110 }
    gsap.set(fin, { top: inR.top - BOX_LIFT }) // the chosen case is lifted by BOX_LIFT when its disc swaps in
    tl.to(inBox, { y: -BOX_LIFT, duration: 0.3, ease: 'power2.out' }, 0.2)
      .to(inLid, { y: LIFT, duration: 0.4, ease: 'power3.inOut' }, 0.22)
      .set(trayDisc(inTray), { opacity: 0 }, 0.5)
      .set(fin, { opacity: 1 }, 0.5)
      .to(fin, { top: top.top, duration: 0.42, ease: 'power3.out' }, 0.5)
      .to(finSpin, { rotation: 140, duration: 0.42, ease: 'power2.out' }, 0.5)
      .to(inBox, { y: 0, duration: 0.4, ease: 'back.out(2)' }, 0.6)
      .to(fin, {
          motionPath: { path: [peakIn, { left: stageR.left, top: stageR.top }], curviness: 1.3 },
          width: stageR.width, height: stageR.height, duration: 0.85, ease: 'power3.inOut',
        }, 0.9)
      .to(fin, { rotationX: -22, duration: 0.42, ease: 'sine.out' }, 0.9)
      .to(fin, { rotationX: 0, duration: 0.43, ease: 'sine.in' }, 1.32)
      .fromTo(fin, { filter: 'drop-shadow(0 0px 0px rgba(0,0,0,0))' }, { filter: 'drop-shadow(0 40px 40px rgba(0,0,0,0.6))', duration: 0.7 }, 0.95)
      .to(finSpin, { rotation: finalRot, duration: 0.95, ease: 'power3.out' }, 0.9)
      .to(labelOf(fin), { opacity: 1, duration: 0.3 }, 1.45)

    /* ---------- new game on stage ---------- */
      .add(() => setShown(p.to), 1.5)
      .fromTo(caseRef.current, { rotateY: -70 * dir, opacity: 0 }, { rotateY: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, 1.5)
      .fromTo(infoRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 1.55)
      .add(() => { gsap.set(stageSpin, { rotation: finalRot % 360 }) }, 1.84)
      .set(stage, { opacity: 1 }, 1.85)
      .set(fin, { opacity: 0 }, 1.85)
      .to(stage, { scale: 1.035, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }, 1.86)
      .add(() => rail.classList.remove('is-flying'), 1.9)
    return () => { tl.kill(); rail.classList.remove('is-flying'); spin.current?.play() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyIn, flyOut])

  playingRef.current = !!playing || loading

  /* ------------------------------------------------------------------ */
  /*  The rail glides on its own, endlessly (three copies, wrapped),     */
  /*  and can be dragged with the mouse — with a little inertia.         */
  /* ------------------------------------------------------------------ */
  const hover = useRef(false)
  const dragRail = useRef<{ x: number; start: number; lastX: number; lastT: number; v: number; moved: boolean } | null>(null)
  const pos = useRef(0)
  const inertia = useRef(0)
  const resumeAt = useRef(0)

  const setWidth = () => {
    const rail = railRef.current
    const a = rail?.children[0] as HTMLElement | undefined
    const b = rail?.children[n] as HTMLElement | undefined
    return a && b ? b.offsetLeft - a.offsetLeft : 0
  }
  /** keep the position inside the middle copy — the jump is invisible because the copies are identical */
  const wrapPos = (x: number) => {
    const w = setWidth()
    if (!w) return x
    if (x < w * 0.5) return x + w
    if (x > w * 1.5) return x - w
    return x
  }

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    centerCase(n + idx)
    pos.current = rail.scrollLeft
    let visible = false
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.05 })
    io.observe(rail)

    let raf = 0, last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      const flying = rail.classList.contains('is-flying')
      if (flying || playingRef.current) {
        pos.current = rail.scrollLeft
        inertia.current = 0
      } else if (dragRail.current) {
        // the drag handler moves pos; just apply it
        rail.scrollLeft = pos.current
      } else if (Math.abs(inertia.current) > 0.01) {
        pos.current = wrapPos(pos.current - inertia.current * dt)
        inertia.current *= Math.pow(0.94, dt / 16)
        rail.scrollLeft = pos.current
      } else if (visible && !hover.current && !document.hidden && now > resumeAt.current && !reduced) {
        // drift — read the real scroll position first so a touch swipe is never fought
        if (Math.abs(rail.scrollLeft - pos.current) > 2) pos.current = rail.scrollLeft
        pos.current = wrapPos(pos.current + (DRIFT * dt) / 1000)
        rail.scrollLeft = pos.current
      } else {
        pos.current = rail.scrollLeft
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, reduced])

  const onRailDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || busy.current) return
    e.preventDefault() // no native image drag / text selection
    const rail = railRef.current!
    inertia.current = 0
    dragRail.current = { x: e.clientX, start: rail.scrollLeft, lastX: e.clientX, lastT: performance.now(), v: 0, moved: false }

    const move = (ev: PointerEvent) => {
      const d = dragRail.current
      if (!d) return
      const dx = ev.clientX - d.x
      if (!d.moved && Math.abs(dx) > 5) { d.moved = true; rail.classList.add('is-dragging') }
      const now = performance.now()
      const v = (ev.clientX - d.lastX) / Math.max(1, now - d.lastT)
      d.v = d.v * 0.6 + v * 0.4
      d.lastX = ev.clientX
      d.lastT = now
      const raw = d.start - dx
      const wrapped = wrapPos(raw)
      if (wrapped !== raw) d.start += wrapped - raw
      pos.current = wrapped
    }
    const up = () => {
      const d = dragRail.current
      dragRail.current = null
      rail.classList.remove('is-dragging')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (!d) return
      resumeAt.current = performance.now() + 1800
      if (d.moved) {
        inertia.current = Math.max(-3, Math.min(3, d.v))
        // a drag is not a click
        const stop = (ce: MouseEvent) => { ce.stopPropagation(); ce.preventDefault() }
        window.addEventListener('click', stop, { capture: true, once: true })
        window.setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 50)
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  // keyboard while the shelf is on screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (playing) return
      const r = section.current?.getBoundingClientRect()
      if (!r || r.top > window.innerHeight * 0.5 || r.bottom < window.innerHeight * 0.5) return
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') select(idx + 1)
      if (e.key === 'ArrowLeft') select(idx - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, select, playing])

  // drag / swipe on the stage
  const drag = useRef<{ x: number } | null>(null)
  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX } }
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    drag.current = null
    if (Math.abs(dx) > 50) select(idx + (dx < 0 ? 1 : -1))
  }

  /* ------------------------------------------------------------------ */
  /*  Play: the console rises, the disc slides into its slot,            */
  /*  the console lights up, then the trailer opens.                     */
  /* ------------------------------------------------------------------ */
  const play = () => {
    if (busy.current || loading) return
    const disc = discRef.current, con = consoleRef.current
    if (reduced || !disc || !con) return setPlaying(game)
    busy.current = true
    setLoading(true)
    gsap.set(con, { display: 'block', opacity: 0, yPercent: 0 })
    const slot = con.querySelector('.console__slot')!
    const dR = disc.getBoundingClientRect()
    const sR = slot.getBoundingClientRect()
    const dx = sR.left + sR.width / 2 - (dR.left + dR.width / 2)
    const dy = sR.top + sR.height / 2 - (dR.top + dR.height / 2)
    const scale = Math.min(1, (sR.width * 0.95) / dR.width)
    spin.current?.timeScale(5)
    gsap.timeline({
      onComplete: () => {
        spin.current?.timeScale(1)
        setLoading(false)
        setPlaying(game)
        busy.current = false
      },
    })
      .set(con, { display: 'block' })
      .fromTo(con, { yPercent: 60, opacity: 0, rotateX: 25 }, { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.7, ease: 'expo.out' })
      .to(infoRef.current, { opacity: 0.25, duration: 0.3 }, 0)
      // line the disc up above the slot, tilting it edge-on
      .to(disc, { x: dx, y: dy - sR.height * 4, scale, rotateX: 78, duration: 0.75, ease: 'power3.inOut' }, 0.35)
      // push it in — the console's front face is drawn above the disc
      .to(disc, { y: dy + sR.height * 2, duration: 0.4, ease: 'power2.in' }, 1.1)
      .to(disc, { opacity: 0, duration: 0.1 }, 1.42)
      .to(con, { y: 4, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.45)
      .add(() => con.classList.add('is-on'), 1.5)
      .to({}, { duration: 0.9 })
  }

  const closeTrailer = useCallback(() => {
    setPlaying(null)
    const disc = discRef.current, con = consoleRef.current
    if (!disc || !con || reduced) {
      if (disc) gsap.set(disc, { clearProps: 'transform,opacity' })
      return
    }
    // eject: disc slides back out and returns to the stage, console sinks away
    gsap.timeline({ onComplete: () => { con.classList.remove('is-on'); gsap.set(con, { display: 'none' }) } })
      .to(disc, { opacity: 1, duration: 0.1 })
      .to(disc, { y: '-=' + 140, duration: 0.35, ease: 'power2.out' })
      .to(disc, { x: 0, y: 0, scale: 1, rotateX: 0, duration: 0.8, ease: 'expo.out' })
      .to(infoRef.current, { opacity: 1, duration: 0.4 }, '<')
      .to(con, { yPercent: 70, opacity: 0, duration: 0.5, ease: 'power3.in' }, '<0.1')
  }, [reduced])

  return (
    <section ref={section} className="shelf" id="oyunlar" aria-labelledby="shelf-title" style={{ ['--accent' as string]: game.accent }}>
      <div className="shelf__glow" aria-hidden="true" />
      <header className="shelf__head">
        <h2 id="shelf-title">{t('shelf.title')}</h2>
        <p>{t('shelf.sub')}</p>
      </header>

      <div className="shelf__stage" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (drag.current = null)}>
        <div ref={caseRef} className="shelf__case">
          <Cover game={game} />
        </div>
        <Disc ref={discRef} game={game} className="shelf__disc" />

        <div ref={infoRef} className="shelf__info" aria-live="polite">
          <p className="shelf__count"><b>{String(idx + 1).padStart(2, '0')}</b> / {games.length}</p>
          <h3 className="shelf__title">{game.title}</h3>
          <ul className="shelf__meta">
            <li>{tr(game.genre)}</li>
            <li>{tr(game.mode)}</li>
            <li>{game.players} {t('shelf.players')}</li>
          </ul>
          <p className="shelf__blurb">{tr(game.blurb)}</p>
          <div className="shelf__actions">
            <button className="btn btn--play" onClick={play} disabled={loading}>
              <span className="btn__tri" aria-hidden="true" /> {loading ? t('shelf.loading') : t('shelf.play')}
            </button>
            <div className="shelf__arrows">
              <button className="icon-btn" onClick={() => select(idx - 1)} aria-label={t('shelf.prev')}>←</button>
              <button className="icon-btn" onClick={() => select(idx + 1)} aria-label={t('shelf.next')}>→</button>
            </div>
          </div>
        </div>

        {/* the console the disc slides into before the trailer */}
        <div ref={consoleRef} className="console" aria-hidden="true">
          <div className="console__body">
            <span className="console__shell console__shell--top" />
            <span className="console__core">
              <span className="console__slot" />
              <span className="console__brand">LALIGA</span>
              <span className="console__led" />
            </span>
            <span className="console__shell console__shell--bottom" />
          </div>
          <span className="console__text">{t('shelf.loading')}</span>
        </div>
      </div>

      <div
        ref={railRef}
        className="shelf__rail"
        role="listbox"
        aria-label={t('shelf.games')}
        onPointerDown={onRailDown}
        // the rail only pauses while the pointer is on a case itself (not the empty space above / between them)
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return
          const on = !!(e.target as Element).closest('.jcase__box, .jcase__name')
          if (hover.current && !on) resumeAt.current = Math.max(resumeAt.current, performance.now() + 350)
          hover.current = on
        }}
        onPointerLeave={() => { if (hover.current) resumeAt.current = Math.max(resumeAt.current, performance.now() + 350); hover.current = false }}
        onWheel={() => { resumeAt.current = performance.now() + 1800 }}
        onTouchStart={() => { resumeAt.current = performance.now() + 2500 }}
      >
        {Array.from({ length: COPIES * n }, (_, k) => {
          const i = k % n
          const g = games[i]
          const clone = k < n || k >= 2 * n
          return (
          <button
            key={k}
            role="option"
            aria-selected={i === idx}
            aria-hidden={clone || undefined}
            tabIndex={clone ? -1 : 0}
            className={`jcase ${i === idx ? 'is-active' : ''}`}
            onMouseEnter={() => peek(k, true)}
            onMouseLeave={() => peek(k, false)}
            onFocus={() => peek(k, true)}
            onBlur={() => peek(k, false)}
            onClick={() => select(i, k)}
            style={{ ['--accent' as string]: g.accent }}
            aria-label={g.title}
            draggable={false}
          >
            <span className="jcase__box">
              <span className="jcase__tray" ref={(el) => { trays.current[k] = el as HTMLDivElement | null }}>
                <span className="jcase__slot" aria-hidden="true"><span>{t('shelf.onScreen')}</span></span>
                <Disc game={g} className="disc--mini" />
              </span>
              <span className="jcase__lid" ref={(el) => { lids.current[k] = el as HTMLDivElement | null }}>
                <span className="jcase__front">
                  <span className="jcase__band"><span>LALIGA</span><small>PS5</small></span>
                  <span className="jcase__art"><Cover game={g} /></span>
                  <span className="jcase__glare" />
                </span>
                <span className="jcase__inside" />
              </span>
              <span className="jcase__spine" />
            </span>
            <span className="jcase__name">{g.title}</span>
          </button>
          )
        })}
      </div>

      {flyOut && (
        <div ref={flyOutRef} className="flyer" key={'o' + flyOut.key} aria-hidden="true">
          <Disc game={flyOut.game} className="disc--fly" />
        </div>
      )}
      {flyIn && (
        <div ref={flyInRef} className="flyer" key={'i' + flyIn.key} aria-hidden="true">
          <Disc game={flyIn.game} className="disc--fly" />
        </div>
      )}

      <TrailerModal game={playing} onClose={closeTrailer} />
    </section>
  )
}
