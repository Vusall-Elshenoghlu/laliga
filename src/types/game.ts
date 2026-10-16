import type { L } from '../lib/i18n'

/** Localised text: { az, en, ru } */
export type { L }

/** A game as the UI uses it. Whatever the API returns is mapped into this shape in services/games.ts. */
export type Game = {
  id: string
  title: string
  genre: L
  mode: L
  /** e.g. "1–4" */
  players: string
  blurb: L
  /** YouTube video id of the official trailer */
  trailer: string
  /** accent colour (hex) used for disc glow, console LEDs, buttons */
  accent: string
  /** optional absolute/relative URL of the box art; falls back to /media/games/<id>.png */
  cover?: string
}
