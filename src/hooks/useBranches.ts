import { useEffect, useMemo, useState } from 'react'
import { getBranches, type Branch, type Venue } from '../services/branches'

type State = { branches: Branch[]; loading: boolean; error: Error | null }

let cache: Branch[] | null = null
let inflight: Promise<Branch[]> | null = null

const load = () => {
  if (cache) return Promise.resolve(cache)
  inflight ??= getBranches().then((b) => (cache = b)).finally(() => { inflight = null })
  return inflight
}

/** Branch list for components (all venues, or one). Swap the service, not the components. */
export function useBranches(venue?: Venue): State {
  const [all, setAll] = useState<State>({ branches: cache ?? [], loading: !cache, error: null })

  useEffect(() => {
    if (cache) return
    load()
      .then((branches) => setAll({ branches, loading: false, error: null }))
      .catch((error: Error) => setAll({ branches: [], loading: false, error }))
  }, [])

  // stable array: hovering a card must not hand the map a "new" list (it would refit and replay the pins)
  const branches = useMemo(() => (venue ? all.branches.filter((b) => b.venue === venue) : all.branches), [all.branches, venue])
  return { ...all, branches }
}
