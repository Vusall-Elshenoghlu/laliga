import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useI18n } from '../../lib/i18n'

export type ArcadeId = 'snake' | 'tetris' | 'breakout'
export type PadBtn = 'up' | 'down' | 'left' | 'right' | 'cross' | 'circle' | 'square' | 'triangle'
export type ArcadeHandle = { press: (b: PadBtn) => void; hold: (b: PadBtn, down: boolean) => void }

type Props = { id: ArcadeId; accent: string; onExit: () => void }

const BEST_KEY = 'laliga.arcade.best.'
const readBest = (id: ArcadeId) => {
  try { return Number(localStorage.getItem(BEST_KEY + id)) || 0 } catch { return 0 }
}
const writeBest = (id: ArcadeId, v: number) => {
  try { localStorage.setItem(BEST_KEY + id, String(v)) } catch { /* storage blocked */ }
}

type Status = 'ready' | 'run' | 'over'

/* ========================================================================== */
/*  Game engines — each is a tiny state machine drawn onto a 2D canvas        */
/* ========================================================================== */

interface Engine {
  reset(): void
  tick(dt: number): void
  draw(ctx: CanvasRenderingContext2D, w: number, h: number): void
  press(b: PadBtn): void
  hold?(b: PadBtn, down: boolean): void
  score: number
  over: boolean
}

/* ---------- Snake ---------- */
function makeSnake(accent: string): Engine {
  const COLS = 32, ROWS = 18
  let body: { x: number; y: number }[] = []
  let dir = { x: 1, y: 0 }, queued = { x: 1, y: 0 }
  let food = { x: 20, y: 9 }
  let acc = 0, step = 0.11
  const e: Engine = {
    score: 0,
    over: false,
    reset() {
      body = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }]
      dir = { x: 1, y: 0 }; queued = { x: 1, y: 0 }
      e.score = 0; e.over = false; step = 0.11; acc = 0
      placeFood()
    },
    tick(dt) {
      if (e.over) return
      acc += dt
      while (acc >= step) {
        acc -= step
        dir = queued
        const head = { x: body[0].x + dir.x, y: body[0].y + dir.y }
        if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || body.some((p) => p.x === head.x && p.y === head.y)) {
          e.over = true
          return
        }
        body.unshift(head)
        if (head.x === food.x && head.y === food.y) {
          e.score += 10
          step = Math.max(0.055, step - 0.003)
          placeFood()
        } else body.pop()
      }
    },
    draw(ctx, w, h) {
      const cell = Math.min(w / COLS, h / ROWS)
      const ox = (w - cell * COLS) / 2, oy = (h - cell * ROWS) / 2
      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) if ((x + y) % 2) ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell)
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.strokeRect(ox + 0.5, oy + 0.5, cell * COLS - 1, cell * ROWS - 1)
      // food
      ctx.fillStyle = '#ff4d6d'
      ctx.shadowColor = '#ff4d6d'; ctx.shadowBlur = cell
      ctx.beginPath(); ctx.arc(ox + (food.x + 0.5) * cell, oy + (food.y + 0.5) * cell, cell * 0.36, 0, Math.PI * 2); ctx.fill()
      // snake
      ctx.shadowColor = accent; ctx.shadowBlur = cell * 0.8
      body.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? '#ffffff' : accent
        ctx.globalAlpha = i === 0 ? 1 : Math.max(0.35, 1 - i / (body.length + 6))
        const pad = cell * 0.1
        ctx.beginPath()
        ctx.roundRect(ox + p.x * cell + pad, oy + p.y * cell + pad, cell - pad * 2, cell - pad * 2, cell * 0.25)
        ctx.fill()
      })
      ctx.globalAlpha = 1; ctx.shadowBlur = 0
    },
    press(b) {
      const d = b === 'up' ? { x: 0, y: -1 } : b === 'down' ? { x: 0, y: 1 } : b === 'left' ? { x: -1, y: 0 } : b === 'right' ? { x: 1, y: 0 } : null
      if (d && (d.x !== -dir.x || d.y !== -dir.y)) queued = d
    },
  }
  function placeFood() {
    do { food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) } } while (body.some((p) => p.x === food.x && p.y === food.y))
  }
  return e
}

/* ---------- Tetris ---------- */
const SHAPES: { m: number[][]; c: string }[] = [
  { m: [[1, 1, 1, 1]], c: '#3ee6ff' },
  { m: [[1, 1], [1, 1]], c: '#f7c41c' },
  { m: [[0, 1, 0], [1, 1, 1]], c: '#b06bff' },
  { m: [[1, 0, 0], [1, 1, 1]], c: '#2470e6' },
  { m: [[0, 0, 1], [1, 1, 1]], c: '#ff8a3d' },
  { m: [[0, 1, 1], [1, 1, 0]], c: '#2cb24d' },
  { m: [[1, 1, 0], [0, 1, 1]], c: '#e8412f' },
]
function makeTetris(): Engine {
  const W = 10, H = 20
  let grid: (string | null)[][] = []
  let piece = { m: SHAPES[0].m, c: SHAPES[0].c, x: 3, y: 0 }
  let nextI = 0, acc = 0, lines = 0
  const rand = () => Math.floor(Math.random() * SHAPES.length)
  const fits = (m: number[][], x: number, y: number) =>
    m.every((row, r) => row.every((v, c) => !v || (x + c >= 0 && x + c < W && y + r < H && (y + r < 0 || !grid[y + r][x + c]))))
  const rotate = (m: number[][]) => m[0].map((_, c) => m.map((row) => row[c]).reverse())
  const spawn = () => {
    const s = SHAPES[nextI]
    nextI = rand()
    piece = { m: s.m, c: s.c, x: Math.floor((W - s.m[0].length) / 2), y: -1 }
    if (!fits(piece.m, piece.x, piece.y + 1)) e.over = true
  }
  const lock = () => {
    piece.m.forEach((row, r) => row.forEach((v, c) => { if (v && piece.y + r >= 0) grid[piece.y + r][piece.x + c] = piece.c }))
    let cleared = 0
    grid = grid.filter((row) => { const full = row.every(Boolean); if (full) cleared++; return !full })
    while (grid.length < H) grid.unshift(Array(W).fill(null))
    if (cleared) { lines += cleared; e.score += [0, 100, 300, 500, 800][cleared] }
    spawn()
  }
  const drop = () => {
    if (fits(piece.m, piece.x, piece.y + 1)) piece.y++
    else lock()
  }
  const e: Engine = {
    score: 0,
    over: false,
    reset() {
      grid = Array.from({ length: H }, () => Array(W).fill(null))
      e.score = 0; e.over = false; lines = 0; acc = 0
      nextI = rand(); spawn()
    },
    tick(dt) {
      if (e.over) return
      acc += dt
      const speed = Math.max(0.12, 0.6 - lines * 0.025)
      while (acc >= speed) { acc -= speed; drop() }
    },
    draw(ctx, w, h) {
      const cell = Math.floor(h / (H + 1))
      const bw = cell * W, ox = Math.floor((w - bw) / 2 - cell * 2.5), oy = Math.floor((h - cell * H) / 2)
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.fillRect(ox, oy, bw, cell * H)
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.strokeRect(ox - 0.5, oy - 0.5, bw + 1, cell * H + 1)
      const block = (x: number, y: number, c: string, a = 1) => {
        ctx.globalAlpha = a
        ctx.fillStyle = c
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2)
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.fillRect(x + 1, y + 1, cell - 2, Math.max(2, cell * 0.18))
        ctx.globalAlpha = 1
      }
      grid.forEach((row, r) => row.forEach((c, k) => c && block(ox + k * cell, oy + r * cell, c)))
      // ghost
      let gy = piece.y
      while (fits(piece.m, piece.x, gy + 1)) gy++
      piece.m.forEach((row, r) => row.forEach((v, c) => v && gy + r >= 0 && block(ox + (piece.x + c) * cell, oy + (gy + r) * cell, piece.c, 0.18)))
      piece.m.forEach((row, r) => row.forEach((v, c) => v && piece.y + r >= 0 && block(ox + (piece.x + c) * cell, oy + (piece.y + r) * cell, piece.c)))
      // next
      const nx = ox + bw + cell * 1.5, ny = oy + cell * 1.5
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.font = `${Math.round(cell * 0.7)}px Unbounded, sans-serif`
      ctx.fillText('NEXT', nx, ny - cell * 0.4)
      SHAPES[nextI].m.forEach((row, r) => row.forEach((v, c) => v && block(nx + c * cell, ny + r * cell, SHAPES[nextI].c)))
      ctx.fillText('LINES', nx, ny + cell * 4.6)
      ctx.fillStyle = '#fff'
      ctx.fillText(String(lines), nx, ny + cell * 5.8)
    },
    press(b) {
      if (e.over) return
      if (b === 'left' && fits(piece.m, piece.x - 1, piece.y)) piece.x--
      if (b === 'right' && fits(piece.m, piece.x + 1, piece.y)) piece.x++
      if (b === 'down') { drop(); e.score += 1 }
      if (b === 'up' || b === 'cross' || b === 'triangle') {
        const r = rotate(piece.m)
        for (const k of [0, -1, 1, -2, 2]) if (fits(r, piece.x + k, piece.y)) { piece.m = r; piece.x += k; break }
      }
      if (b === 'square') { while (fits(piece.m, piece.x, piece.y + 1)) { piece.y++; e.score += 2 } lock() }
    },
  }
  return e
}

/* ---------- Breakout ---------- */
function makeBreakout(accent: string): Engine {
  const ROWS = 5, COLS = 10
  const colors = ['#e8412f', '#ff8a3d', '#f7c41c', '#2cb24d', '#2470e6']
  let bricks: boolean[][] = []
  let px = 0.5, vx = 0
  let ball = { x: 0.5, y: 0.8, dx: 0.32, dy: -0.48 }
  let stuck = true, lives = 3
  const held = { left: false, right: false }
  const PW = 0.16
  const e: Engine = {
    score: 0,
    over: false,
    reset() {
      bricks = Array.from({ length: ROWS }, () => Array(COLS).fill(true))
      px = 0.5; vx = 0; lives = 3; e.score = 0; e.over = false
      serve()
    },
    tick(dt) {
      if (e.over) return
      const target = (held.right ? 1 : 0) - (held.left ? 1 : 0)
      vx += (target * 1.6 - vx) * Math.min(1, dt * 12)
      px = Math.min(1 - PW / 2, Math.max(PW / 2, px + vx * dt))
      if (stuck) { ball.x = px; ball.y = 0.86; return }
      ball.x += ball.dx * dt; ball.y += ball.dy * dt
      if (ball.x < 0.01 || ball.x > 0.99) { ball.dx *= -1; ball.x = Math.min(0.99, Math.max(0.01, ball.x)) }
      if (ball.y < 0.02) { ball.dy = Math.abs(ball.dy) }
      // paddle
      if (ball.dy > 0 && ball.y > 0.88 && ball.y < 0.93 && Math.abs(ball.x - px) < PW / 2 + 0.01) {
        const hit = (ball.x - px) / (PW / 2)
        const sp = Math.min(0.95, Math.hypot(ball.dx, ball.dy) * 1.02)
        ball.dx = hit * sp * 0.8
        ball.dy = -Math.sqrt(Math.max(0.05, sp * sp - ball.dx * ball.dx))
      }
      if (ball.y > 1) {
        lives--
        if (lives <= 0) e.over = true
        else serve()
      }
      // bricks (top area 0.08–0.38)
      const bw = 1 / COLS, bh = 0.06
      const r = Math.floor((ball.y - 0.08) / bh), c = Math.floor(ball.x / bw)
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && bricks[r][c]) {
        bricks[r][c] = false
        ball.dy *= -1
        e.score += (ROWS - r) * 10
        if (bricks.every((row) => row.every((b) => !b))) { bricks = Array.from({ length: ROWS }, () => Array(COLS).fill(true)); serve() }
      }
    },
    draw(ctx, w, h) {
      const bw = w / COLS, bh = h * 0.06
      bricks.forEach((row, r) => row.forEach((b, c) => {
        if (!b) return
        ctx.fillStyle = colors[r]
        ctx.beginPath(); ctx.roundRect(c * bw + 3, h * 0.08 + r * bh + 3, bw - 6, bh - 6, 4); ctx.fill()
      }))
      ctx.fillStyle = accent
      ctx.shadowColor = accent; ctx.shadowBlur = 16
      ctx.beginPath(); ctx.roundRect((px - PW / 2) * w, h * 0.9, PW * w, h * 0.025, 6); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'
      ctx.beginPath(); ctx.arc(ball.x * w, ball.y * h, Math.max(4, h * 0.016), 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0
      for (let i = 0; i < lives; i++) { ctx.beginPath(); ctx.arc(w - 18 - i * 18, 14, 5, 0, Math.PI * 2); ctx.fill() }
    },
    press(b) {
      if (b === 'cross' || b === 'up') { if (stuck) { stuck = false } }
      if (b === 'left') px = Math.max(PW / 2, px - 0.06)
      if (b === 'right') px = Math.min(1 - PW / 2, px + 0.06)
    },
    hold(b, down) {
      if (b === 'left') held.left = down
      if (b === 'right') held.right = down
    },
  }
  function serve() { stuck = true; ball = { x: px, y: 0.86, dx: (Math.random() - 0.5) * 0.5, dy: -0.5 } }
  return e
}

/* ========================================================================== */

const Arcade = forwardRef<ArcadeHandle, Props>(function Arcade({ id, accent, onExit }, ref) {
  const { t } = useI18n()
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<Engine | null>(null)
  const [status, setStatus] = useState<Status>('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => readBest(id))
  const statusRef = useRef<Status>('ready')
  statusRef.current = status

  useEffect(() => {
    engine.current = id === 'snake' ? makeSnake(accent) : id === 'tetris' ? makeTetris() : makeBreakout(accent)
    engine.current.reset()
    setStatus('ready')
    setScore(0)
    setBest(readBest(id))
  }, [id, accent])

  // render loop
  useEffect(() => {
    let raf = 0, last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const c = canvas.current, e = engine.current
      if (c && e) {
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        const w = c.clientWidth, h = c.clientHeight
        if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr) }
        const ctx = c.getContext('2d')!
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, w, h)
        if (statusRef.current === 'run') {
          e.tick(dt)
          if (e.over) {
            setStatus('over')
            setBest((b) => { const nb = Math.max(b, e.score); writeBest(id, nb); return nb })
          }
        }
        e.draw(ctx, w, h)
        setScore((s) => (s === e.score ? s : e.score))
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [id])

  useImperativeHandle(ref, () => ({
    press(b) {
      const e = engine.current
      if (!e) return
      if (b === 'circle') { onExit(); return }
      if (statusRef.current === 'ready') {
        if (b === 'cross') { setStatus('run'); if (id === 'breakout') e.press('cross') }
        return
      }
      if (statusRef.current === 'over') {
        if (b === 'cross') { e.reset(); setScore(0); setStatus('run') }
        return
      }
      e.press(b)
    },
    hold(b, down) {
      engine.current?.hold?.(b, down)
    },
  }), [id, onExit])

  const ctrl = id === 'snake' ? t('hall.ctrl.snake') : id === 'tetris' ? t('hall.ctrl.tetris') : t('hall.ctrl.breakout')
  const name = id === 'snake' ? t('hall.snake') : id === 'tetris' ? t('hall.tetris') : t('hall.breakout')

  return (
    <div className="arcade" style={{ ['--accent' as string]: accent }}>
      <div className="arcade__hud">
        <strong>{name}</strong>
        <span>{t('hall.score')} <b>{score}</b></span>
        <span>{t('hall.best')} <b>{best}</b></span>
        <span className="arcade__exit"><i>○</i> {t('hall.hint.back')}</span>
      </div>
      <canvas ref={canvas} className="arcade__canvas" />
      {status !== 'run' && (
        <div className="arcade__overlay">
          {status === 'ready' ? (
            <>
              <p className="arcade__title">{name}</p>
              <p className="arcade__ctrl">{ctrl}</p>
              <p className="arcade__go">{t('hall.start')}</p>
            </>
          ) : (
            <>
              <p className="arcade__title">{t('hall.over')}</p>
              <p className="arcade__ctrl">{t('hall.score')}: {score}</p>
              <p className="arcade__go">{t('hall.again')}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
})

export default Arcade
