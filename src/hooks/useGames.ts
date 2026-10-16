import { useEffect, useState } from 'react'
import { getGames, type Game } from '../services/games'

type State = { games: Game[]; loading: boolean; error: Error | null }

// one request per page load, shared by every component that needs the list
let cache: Game[] | null = null
let inflight: Promise<Game[]> | null = null

const load = () => {
  if (cache) return Promise.resolve(cache)
  inflight ??= getGames().then((g) => (cache = g)).finally(() => { inflight = null })
  return inflight
}

/** Game list for components. Swap the service, not the components. */
export function useGames(): State & { reload: () => void } {
  const [state, setState] = useState<State>({ games: cache ?? [], loading: !cache, error: null })

  const fetchGames = () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    load()
      .then((games) => setState({ games, loading: false, error: null }))
      .catch((error: Error) => setState({ games: [], loading: false, error }))
  }

  useEffect(() => {
    if (!cache) fetchGames()
  }, [])

  return { ...state, reload: () => { cache = null; fetchGames() } }
}
