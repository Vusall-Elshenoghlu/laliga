import { useLocation } from 'react-router-dom'

export type Mode = 'home' | 'game' | 'dining'

export function modeFromPath(path: string): Mode {
  if (path.startsWith('/game-center')) return 'game'
  if (path.startsWith('/dining')) return 'dining'
  return 'home'
}

export function useMode(): Mode {
  return modeFromPath(useLocation().pathname)
}
