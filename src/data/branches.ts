/**
 * Kept for older imports — the branch data now lives in src/services/branches.ts.
 */
import { STATIC_BRANCHES } from '../services/branches'

export type { Branch, Venue } from '../services/branches'
export { telHref, waHref, mapHref, routeHref, branchPath } from '../services/branches'

export const gameBranches = STATIC_BRANCHES.filter((b) => b.venue === 'game')
export const diningBranches = STATIC_BRANCHES.filter((b) => b.venue === 'dining')
