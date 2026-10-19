/**
 * Branches service — the single place the app gets its branch list from.
 *
 * Today: returns the static data below.
 * Later: set VITE_API_URL in .env and getBranches() will call `GET {API_URL}/branches` instead.
 * Only `BranchDTO` and `mapBranch()` need adjusting to match the real backend.
 *
 * Photos: until each branch has its own photos, every branch shows the venue's shared gallery
 * (starting at a different picture so the pages don't look identical). Put real photos in `photos`.
 * Coordinates are approximate (street level) — used for "find the nearest branch" and the map.
 */
import { apiGet, hasApi } from './api'

export type Venue = 'game' | 'dining'

export type Branch = {
  id: string
  venue: Venue
  name: string
  street: string
  landmark: string
  phone: string
  /** e.g. "7/24" — null when the hours are not published */
  hours: string | null
  open24: boolean
  lat: number
  lng: number
  photos: string[]
}

/* -------------------------------------------------------------------------- */
/*  API shape (edit to match the backend)                                     */
/* -------------------------------------------------------------------------- */

export type BranchDTO = {
  id: string | number
  slug?: string
  brand: 'game-center' | 'dining'
  name: string
  address: string
  landmark?: string
  phone: string
  working_hours?: string | null
  latitude: number
  longitude: number
  images?: string[]
  is_active?: boolean
  sort_order?: number
}

export function mapBranch(dto: BranchDTO): Branch {
  const venue: Venue = dto.brand === 'dining' ? 'dining' : 'game'
  const hours = dto.working_hours ?? null
  return {
    id: dto.slug ?? String(dto.id),
    venue,
    name: dto.name,
    street: dto.address,
    landmark: dto.landmark ?? '',
    phone: dto.phone,
    hours,
    open24: hours === '7/24' || hours === '24/7',
    lat: dto.latitude,
    lng: dto.longitude,
    photos: dto.images?.length ? dto.images : GALLERY[venue],
  }
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export async function getBranches(venue?: Venue): Promise<Branch[]> {
  let list: Branch[]
  if (!hasApi()) list = STATIC_BRANCHES
  else {
    const raw = await apiGet<BranchDTO[]>('/branches')
    list = raw
      .filter((b) => b.is_active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(mapBranch)
  }
  return venue ? list.filter((b) => b.venue === venue) : list
}

export async function getBranch(venue: Venue, id: string): Promise<Branch | null> {
  const list = await getBranches(venue)
  return list.find((b) => b.id === id) ?? null
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`

export const waHref = (phone: string, text: string) =>
  `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`

const query = (b: Pick<Branch, 'street'>) => `LaLiga ${b.street}, Bakı`

export const mapHref = (b: Pick<Branch, 'street'>) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query(b))}`

export const routeHref = (b: Branch) =>
  `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`

export const mapEmbed = (b: Branch) =>
  `https://maps.google.com/maps?q=${b.lat},${b.lng}&z=16&hl=az&output=embed`

export const branchPath = (b: Pick<Branch, 'venue' | 'id'>) =>
  `${b.venue === 'game' ? '/game-center' : '/dining'}/filiallar/${b.id}`

/* -------------------------------------------------------------------------- */
/*  Static data (laliga.az/brands/…/branches)                                 */
/* -------------------------------------------------------------------------- */

const GALLERY: Record<Venue, string[]> = {
  game: [
    '/media/branches/game-7.webp',
    '/media/branches/game-3.webp',
    '/media/branches/game-6.webp',
    '/media/branches/game-2.webp',
    '/media/branches/game-4.webp',
    '/media/branches/game-5.webp',
  ],
  dining: [
    '/media/branches/dining-5.webp',
    '/media/branches/dining-4.webp',
    '/media/dishes/stroqanof.webp',
    '/media/branches/dining-3.webp',
    '/media/dishes/ozel-burger.webp',
    '/media/dishes/salmon.webp',
    '/media/dishes/ozel-pizza.webp',
  ],
}

/** each branch starts its gallery at a different picture */
const rotate = (list: string[], by: number) => list.map((_, i) => list[(i + by) % list.length])

type Seed = Omit<Branch, 'venue' | 'hours' | 'open24' | 'photos'>

const game: Seed[] = [
  { id: 'genclik', name: 'Gənclik', street: 'Fətəli Xan Xoyski 85', landmark: 'Gənclik m/st yaxınlığı', phone: '+994 55 861 61 61', lat: 40.4007, lng: 49.8513 },
  { id: 'politexnik', name: 'Politexnik', street: 'Hüseyn Cavid 528', landmark: 'Texniki Universitetin qarşısı', phone: '+994 55 844 64 64', lat: 40.3727, lng: 49.8157 },
  { id: 'tibb', name: 'Tibb', street: 'Səməd Vurğun 192', landmark: 'Tibb Universitetinin yaxınlığı', phone: '+994 55 522 64 64', lat: 40.3866, lng: 49.8354 },
  { id: 'nizami', name: 'Nizami', street: 'Şıxəli Qurbanov 2', landmark: 'Nizami m/st, 5-ci mərtəbə', phone: '+994 55 865 64 64', lat: 40.3794, lng: 49.8298 },
  { id: 'tarqovi', name: 'Tarqovı', street: 'Nizami 66', landmark: 'Fəvvarələr meydanı', phone: '+994 55 532 64 64', lat: 40.3707, lng: 49.8370 },
  { id: 'icerisheher', name: 'İçərişəhər', street: 'Şeyx Şamil 3', landmark: 'İçərişəhər m/st yaxınlığı', phone: '+994 55 974 64 64', lat: 40.3663, lng: 49.8318 },
  { id: 'xalqlar', name: 'Xalqlar', street: 'Məhəmməd Hadi 136A', landmark: 'Xalqlar m/st yaxınlığı', phone: '+994 50 668 64 64', lat: 40.3942, lng: 49.9512 },
  { id: 'nerimanov', name: 'Nərimanov', street: 'Əhməd Rəcəbli 3V', landmark: 'Nərimanov m/st yaxınlığı', phone: '+994 55 441 64 64', lat: 40.4027, lng: 49.8703 },
]

const dining: Seed[] = [
  { id: 'elmler', name: 'Elmlər', street: 'Zahid Xəlilov 25B', landmark: 'Elmlər Akademiyası m/st yaxınlığı', phone: '+994 50 293 93 93', lat: 40.3757, lng: 49.8129 },
  { id: 'ehmedli', name: 'Əhmədli', street: 'Məhəmməd Hadi 9E', landmark: 'Əhmədli m/st yaxınlığı', phone: '+994 50 600 93 93', lat: 40.3852, lng: 49.9547 },
  { id: 'musabeyov', name: 'Musabəyov', street: 'Abdurrəhim bəy Haqverdiyev 62', landmark: 'Q. Musabəyov parkı', phone: '+994 50 300 93 93', lat: 40.3946, lng: 49.8226 },
]

export const STATIC_BRANCHES: Branch[] = [
  ...game.map((b, i): Branch => ({ ...b, venue: 'game', hours: '7/24', open24: true, photos: rotate(GALLERY.game, i) })),
  ...dining.map((b, i): Branch => ({ ...b, venue: 'dining', hours: null, open24: false, photos: rotate(GALLERY.dining, i * 2) })),
]
