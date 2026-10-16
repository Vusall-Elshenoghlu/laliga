import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Game } from '../types/game'
import { useGames } from '../hooks/useGames'
import { Cover } from '../components/game/Disc'
import SmartImg, { BRAND } from '../components/SmartImg'
import { useReserve } from '../components/Reserve'
import BackButton from '../components/BackButton'
import Arcade, { type ArcadeHandle, type ArcadeId, type PadBtn } from '../components/game/Arcade'
import { useI18n, type Key } from '../lib/i18n'
import { prefersReducedMotion } from '../lib/smooth'

type Btn = PadBtn | 'start' | 'select' | 'ls' | 'rs'
type Screen = 'boot' | 'browse' | 'list' | 'play' | 'arcade'

/** Hotspot positions as % of the console image (2048×1152). */
const HOT: Record<Btn, { x: number; y: number; d: number; label: Key | string; kind: string }> = {
  up: { x: 13.25, y: 27.2, d: 3.7, label: 'hall.btn.up', kind: 'dpad dpad-up' },
  down: { x: 13.25, y: 39.6, d: 3.7, label: 'hall.btn.down', kind: 'dpad dpad-down' },
  left: { x: 9.6, y: 33.5, d: 4.6, label: 'hall.btn.left', kind: 'dpad dpad-left' },
  right: { x: 16.9, y: 33.5, d: 4.6, label: 'hall.btn.right', kind: 'dpad dpad-right' },
  triangle: { x: 87, y: 26.4, d: 4.3, label: '△', kind: 'face' },
  square: { x: 82.75, y: 33.6, d: 4.3, label: '□', kind: 'face' },
  circle: { x: 91.25, y: 33.6, d: 4.3, label: '○', kind: 'face' },
  cross: { x: 87, y: 40.9, d: 4.3, label: '✕', kind: 'face' },
  select: { x: 18.35, y: 19.1, d: 2.6, label: 'SELECT', kind: 'pill' },
  start: { x: 82, y: 19.1, d: 2.6, label: 'START', kind: 'pill' },
  ls: { x: 18.5, y: 60.4, d: 7.6, label: 'hall.btn.ls', kind: 'stick' },
  rs: { x: 81.5, y: 60.4, d: 7.6, label: 'hall.btn.rs', kind: 'stick' },
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

function FaceSymbol({ b }: { b: Btn }) {
  if (b === 'triangle') return <svg viewBox="0 0 24 24"><path d="M12 4 L21 19 H3 Z" fill="none" stroke="#2fb67c" strokeWidth="2.4" strokeLinejoin="round" /></svg>
  if (b === 'circle') return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5" fill="none" stroke="#ef4558" strokeWidth="2.4" /></svg>
  if (b === 'cross') return <svg viewBox="0 0 24 24"><path d="M5.5 5.5 L18.5 18.5 M18.5 5.5 L5.5 18.5" stroke="#4f86f7" strokeWidth="2.4" strokeLinecap="round" /></svg>
  return <svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="1.5" fill="none" stroke="#e86bc6" strokeWidth="2.4" /></svg>
}

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
          <div className="hall__console">
            <img className="hall__img" src="/media/game/console.webp" alt="" draggable={false} />
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
              const isFace = h.kind === 'face'
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
                  {isFace && <FaceSymbol b={b} />}
                </button>
              )
            })}
          </div>
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
