import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Game } from '../types/game'
import { useGames } from '../hooks/useGames'
import { Cover } from '../components/game/Disc'
import SmartImg, { BRAND } from '../components/SmartImg'
import { useReserve } from '../components/Reserve'
import BackButton from '../components/BackButton'
import Arcade, { type ArcadeHandle, type ArcadeId, type PadBtn } from '../components/game/Arcade'
import Controller, { PAD_COLORS, loadPadColor, padThumb, preloadPad, savePadColor, type ControllerHandle, type PadColor } from '../components/game/Controller'
import { useI18n, type Key } from '../lib/i18n'
import { prefersReducedMotion } from '../lib/smooth'

type Btn = PadBtn | 'start' | 'select' | 'ls' | 'rs'
type Screen = 'boot' | 'browse' | 'list' | 'play' | 'arcade'

/** Hotspot positions as % of the console image (2048×1152). */
const HOT: Record<Btn, { x: number; y: number; d: number; label: Key | string; kind: string }> = {
  up: { x: 13.28, y: 28.65, d: 3.5, label: 'hall.btn.up', kind: 'dpad dpad-up' },
  down: { x: 13.28, y: 39.06, d: 3.5, label: 'hall.btn.down', kind: 'dpad dpad-down' },
  left: { x: 10.25, y: 33.85, d: 4.3, label: 'hall.btn.left', kind: 'dpad dpad-left' },
  right: { x: 16.36, y: 33.85, d: 4.3, label: 'hall.btn.right', kind: 'dpad dpad-right' },
  triangle: { x: 86.33, y: 26.48, d: 3.9, label: '△', kind: 'face' },
  square: { x: 82.03, y: 33.68, d: 3.9, label: '□', kind: 'face' },
  circle: { x: 90.58, y: 33.68, d: 3.9, label: '○', kind: 'face' },
  cross: { x: 86.33, y: 40.8, d: 3.9, label: '✕', kind: 'face' },
  select: { x: 18.55, y: 22.6, d: 1.9, label: 'SELECT', kind: 'pill' },
  start: { x: 81.45, y: 22.6, d: 1.9, label: 'START', kind: 'pill' },
  ls: { x: 21.97, y: 47.74, d: 6.2, label: 'hall.btn.ls', kind: 'stick' },
  rs: { x: 78.13, y: 47.74, d: 6.2, label: 'hall.btn.rs', kind: 'stick' },
}

const KEYMAP: Record<string, Btn> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  Enter: 'cross', x: 'cross', ' ': 'cross',
  Escape: 'circle', Backspace: 'circle', o: 'circle',
  q: 'square', e: 'triangle', s: 'start', l: 'select',
}

const CARTS: { id: ArcadeId; key: Key; color: string }[] = [
  { id: 'snake', key: 'hall.snake', color: '#2cb24d' },
  { id: 'tetris', key: 'hall.tetris', color: '#2470e6' },
  { id: 'breakout', key: 'hall.breakout', color: '#e8412f' },
]

const COLS = 9

export default function GameHall() {
  const { games } = useGames()
  if (!games.length) return <div className="hall" />
  return <Hall games={games} />
}

function Hall({ games }: { games: Game[] }) {
  const reserve = useReserve()
  const { t, tr } = useI18n()
  const [screen, setScreen] = useState<Screen>('boot')
  const [idx, setIdx] = useState(0)
  const [cursor, setCursor] = useState(0)
  const [info, setInfo] = useState(false)
  const [arcade, setArcade] = useState<ArcadeId>('snake')
  const [pressed, setPressed] = useState<Btn | null>(null)
  const page = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const arcadeRef = useRef<ArcadeHandle>(null)
  const padRef = useRef<ControllerHandle>(null)
  const consoleRef = useRef<HTMLDivElement>(null)
  const { lang } = useI18n()
  const [color, setColor] = useState<PadColor>(loadPadColor)
  const [picking, setPicking] = useState<string | null>(null)
  const [dockOpen, setDockOpen] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => PAD_COLORS.forEach((c) => preloadPad(c)), 2500)
    return () => window.clearTimeout(id)
  }, [])

  const pickColor = (c: PadColor, e: React.MouseEvent) => {
    if (c.id === (picking ?? color.id)) return
    const pad = consoleRef.current?.querySelector('.pad')
    let from = { x: 104, y: 108 }
    if (pad) {
      const r = pad.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100
      from = { x: Math.max(-8, Math.min(108, x)), y: Math.max(-8, Math.min(112, y)) }
    }
    setPicking(c.id)
    savePadColor(c)
    padRef.current?.paint(c, from)
  }

  const game = games[idx]
  const label = (k: Key | string) => (k.includes('.') ? t(k as Key) : k)

  /* ---- intro: the controller (already picked up on the previous page) arrives and powers on ---- */
  useLayoutEffect(() => {
    if (!page.current) return
    if (prefersReducedMotion()) { setScreen('browse'); return }
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.hall__rig', { y: 70, scale: 1.08, opacity: 0, duration: 1.1 })
        .from('.hall__head, .hall__under', { opacity: 0, y: 20, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0.3)
        .from('.hall__boot img', { scale: 0.4, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, 0.5)
        .from('.hall__boot span', { letterSpacing: '1em', opacity: 0, duration: 0.7 }, 0.7)
        .add(() => setScreen('browse'), 1.6)
    }, page)
    return () => ctx.revert()
  }, [])

  // screen content swap animation
  useEffect(() => {
    if (screen !== 'browse' || !screenRef.current) return
    gsap.fromTo(screenRef.current.querySelectorAll('.scr-browse__cover, .scr-browse__text > *'),
      { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: 'power3.out' })
  }, [idx, screen])

  const step = useCallback((d: number) => setIdx((i) => (i + d + games.length) % games.length), [games.length])

  const openArcade = useCallback((id: ArcadeId) => {
    setArcade(id)
    setInfo(false)
    setScreen('arcade')
  }, [])

  const press = useCallback((b: Btn) => {
    setPressed(b)
    window.setTimeout(() => setPressed((p) => (p === b ? null : p)), 160)

    if (screen === 'boot') return
    if (b === 'start') return reserve('game')

    if (screen === 'arcade') {
      if (b === 'select') return setScreen('browse')
      if (b === 'ls' || b === 'rs') return
      arcadeRef.current?.press(b as PadBtn)
      return
    }

    if (screen === 'play') {
      if (b === 'circle' || b === 'cross') setScreen('browse')
      if (b === 'left' || b === 'ls') step(-1)
      if (b === 'right' || b === 'rs') step(1)
      return
    }

    if (screen === 'list') {
      const n = games.length
      if (b === 'left') setCursor((c) => (c - 1 + n) % n)
      if (b === 'right') setCursor((c) => (c + 1) % n)
      if (b === 'up') setCursor((c) => (c - COLS + n) % n)
      if (b === 'down') setCursor((c) => (c + COLS) % n)
      if (b === 'cross') { setIdx(cursor); setScreen('browse') }
      if (b === 'circle' || b === 'select') setScreen('browse')
      return
    }

    // browse
    if (b === 'left' || b === 'up' || b === 'ls') step(-1)
    if (b === 'right' || b === 'down' || b === 'rs') step(1)
    if (b === 'cross') { setInfo(false); setScreen('play') }
    if (b === 'circle') setInfo(false)
    if (b === 'triangle') setInfo((v) => !v)
    if (b === 'square') setIdx((i) => { let r = i; while (r === i) r = Math.floor(Math.random() * games.length); return r })
    if (b === 'select') { setCursor(idx); setScreen('list') }
  }, [screen, cursor, idx, reserve, step, games.length])

  const hold = useCallback((b: Btn, down: boolean) => {
    if (screen === 'arcade' && (b === 'left' || b === 'right')) arcadeRef.current?.hold(b, down)
  }, [screen])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, select, textarea, .reserve, .backbtn')) return
      const b = KEYMAP[e.key] ?? KEYMAP[e.key.toLowerCase()]
      if (!b) return
      e.preventDefault()
      if (!e.repeat) { press(b); hold(b, true) }
      else if (screen === 'arcade' && b !== 'cross' && b !== 'circle') press(b)
    }
    const onUp = (e: KeyboardEvent) => {
      const b = KEYMAP[e.key] ?? KEYMAP[e.key.toLowerCase()]
      if (b) hold(b, false)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [press, hold, screen])

  return (
    <div ref={page} className="hall" style={{ ['--accent' as string]: game.accent }}>
      <BackButton to="/game-center" label={t('back')} variant="game" />

      <header className="hall__head">
        <h1>Game Hall</h1>
        <p>{t('hall.lead')}</p>
      </header>

      <div className="hall__stage">
        <div className="hall__rig">
          <div
            ref={consoleRef}
            className="hall__console"
          >
            <Controller
              ref={padRef}
              className="hall__img"
              color={color}
              onPainted={(c) => { setColor(c); setPicking((p) => (p === c.id ? null : p)) }}
            />
            <span className="hall__led hall__led--l" aria-hidden="true" />
            <span className="hall__led hall__led--r" aria-hidden="true" />

            <div ref={screenRef} className="hall__screen" data-screen={screen} aria-live="polite">
              {screen === 'boot' && (
                <div className="hall__boot">
                  <SmartImg src={BRAND.emblem} fallbacks={[BRAND.emblemRemote, BRAND.emblemSvg]} alt="" />
                  <span>LALIGA</span>
                </div>
              )}

              {screen === 'browse' && (
                <div className="scr-browse">
                  <div className="scr-browse__bg" aria-hidden="true"><Cover game={game} /></div>
                  <Cover game={game} className="scr-browse__cover" />
                  <div className="scr-browse__text">
                    <span className="scr-browse__count">{idx + 1} / {games.length}</span>
                    <h2>{game.title}</h2>
                    <p className="scr-browse__meta">{tr(game.genre)} — {game.players} {t('shelf.players')}</p>
                    {info && <p className="scr-browse__blurb">{tr(game.blurb)}</p>}
                    <span className="scr-browse__go"><i className="ps ps--cross">✕</i> {t('hall.play')}</span>
                  </div>
                  <div className="scr-hints" aria-hidden="true">
                    <span>◀ ▶ {t('hall.hint.game')}</span>
                    <span><i className="ps ps--triangle">△</i> {t('hall.hint.info')}</span>
                    <span><i className="ps ps--square">□</i> {t('hall.hint.random')}</span>
                    <span>SELECT {t('hall.hint.list')}</span>
                    <span>START {t('hall.hint.book')}</span>
                  </div>
                </div>
              )}

              {screen === 'list' && (
                <div className="scr-list">
                  <p className="scr-list__title">{t('hall.shelf')} — {games[cursor].title}</p>
                  <div className="scr-list__grid">
                    {games.map((g, i) => (
                      <button key={g.id} className={`scr-list__item ${i === cursor ? 'is-focus' : ''}`} onClick={() => { setIdx(i); setScreen('browse') }} aria-label={g.title} tabIndex={-1}>
                        <Cover game={g} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {screen === 'play' && (
                <div className="scr-play">
                  <iframe
                    key={game.id}
                    src={`https://www.youtube-nocookie.com/embed/${game.trailer}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=0`}
                    title={`${game.title} — ${t('trailer.label')}`}
                    allow="autoplay; encrypted-media"
                  />
                  <span className="scr-play__back"><i className="ps ps--circle">○</i> {t('hall.hint.back')}</span>
                </div>
              )}

              {screen === 'arcade' && (
                <Arcade ref={arcadeRef} id={arcade} accent={game.accent} onExit={() => setScreen('browse')} />
              )}
            </div>

            <div className="hall__label" aria-hidden="true">{screen === 'boot' ? 'LaLiga' : screen === 'arcade' ? t(CARTS.find((c) => c.id === arcade)!.key) : game.title}</div>

            {/* cartridge bay on the controller body */}
            <div className="hall__carts" role="group" aria-label={t('hall.carts')}>
              {CARTS.map((c) => (
                <button
                  key={c.id}
                  className={`cart ${screen === 'arcade' && arcade === c.id ? 'is-in' : ''}`}
                  style={{ ['--cart' as string]: c.color }}
                  onClick={() => openArcade(c.id)}
                  disabled={screen === 'boot'}
                >
                  <span className="cart__chip" aria-hidden="true" />
                  <span className="cart__name">{t(c.key)}</span>
                </button>
              ))}
            </div>

            {(Object.keys(HOT) as Btn[]).map((b) => {
              const h = HOT[b]
              return (
                <button
                  key={b}
                  className={`hot ${h.kind.split(' ').map((k) => 'hot--' + k).join(' ')} ${pressed === b ? 'is-pressed' : ''}`}
                  style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.d}%` }}
                  onClick={() => press(b)}
                  onPointerDown={() => hold(b, true)}
                  onPointerUp={() => hold(b, false)}
                  onPointerLeave={() => hold(b, false)}
                  aria-label={label(h.label)}
                  title={label(h.label)}
                >
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* controller colour */}
      <div className={`paddock ${dockOpen ? 'is-open' : ''}`} role="radiogroup" aria-label={t('hall.padColor')} onMouseLeave={() => setDockOpen(false)}>
        <button className="paddock__head" onClick={() => setDockOpen((v) => !v)} onMouseEnter={() => setDockOpen(true)} aria-expanded={dockOpen}>
          <span className="paddock__cur" style={{ backgroundImage: `url(${padThumb({ id: picking ?? color.id })})`, ['--glow' as string]: (PAD_COLORS.find((c) => c.id === (picking ?? color.id)) ?? color).glow }} />
          <span className="paddock__title">{t('hall.padColor')}</span>
          <span className="paddock__name" key={picking ?? color.id}>{(PAD_COLORS.find((c) => c.id === (picking ?? color.id)) ?? color).name[lang]}</span>
          <span className="paddock__chev" aria-hidden="true" />
        </button>
        <div className="paddock__list">
          {PAD_COLORS.map((c) => {
            const on = (picking ?? color.id) === c.id
            return (
              <button
                key={c.id}
                role="radio"
                aria-checked={on}
                aria-label={c.name[lang]}
                title={c.name[lang]}
                className={`paddock__sw ${on ? 'is-on' : ''}`}
                style={{ ['--glow' as string]: c.glow }}
                onMouseEnter={() => preloadPad(c)}
                onClick={(e) => pickColor(c, e)}
              >
                <span style={{ backgroundImage: `url(${padThumb(c)})` }} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="hall__under">
        <dl className="hall__keys">
          <div><dt>← → ↑ ↓</dt><dd>{t('hall.keys.switch')}</dd></div>
          <div><dt><i className="ps ps--cross">✕</i> Enter</dt><dd>{t('hall.keys.cross')}</dd></div>
          <div><dt><i className="ps ps--circle">○</i> Esc</dt><dd>{t('hall.keys.circle')}</dd></div>
          <div><dt><i className="ps ps--square">□</i> Q</dt><dd>{t('hall.keys.square')}</dd></div>
          <div><dt><i className="ps ps--triangle">△</i> E</dt><dd>{t('hall.keys.triangle')}</dd></div>
          <div><dt>SELECT / L</dt><dd>{t('hall.keys.select')}</dd></div>
          <div><dt>START / S</dt><dd>{t('hall.keys.start')}</dd></div>
        </dl>
      </div>
    </div>
  )
}
