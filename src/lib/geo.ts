import { useEffect, useState } from 'react'

/**
 * Visitor location for "find the nearest branch" — asked only when the visitor presses the button,
 * then shared by every component for the rest of the visit.
 */
export type GeoState =
  | { status: 'idle' | 'asking' | 'denied' | 'unsupported' | 'error'; pos: null }
  | { status: 'ok'; pos: { lat: number; lng: number } }

let state: GeoState = { status: 'idle', pos: null }
const subs = new Set<(s: GeoState) => void>()
const set = (s: GeoState) => { state = s; subs.forEach((f) => f(s)) }

export function locate() {
  if (state.status === 'asking') return
  if (!('geolocation' in navigator)) return set({ status: 'unsupported', pos: null })
  set({ status: 'asking', pos: null })
  navigator.geolocation.getCurrentPosition(
    (p) => set({ status: 'ok', pos: { lat: p.coords.latitude, lng: p.coords.longitude } }),
    (e) => set({ status: e.code === e.PERMISSION_DENIED ? 'denied' : 'error', pos: null }),
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 5 * 60 * 1000 },
  )
}

export function useGeo() {
  const [s, setS] = useState(state)
  useEffect(() => {
    subs.add(setS)
    return () => { subs.delete(setS) }
  }, [])
  return s
}

/** great-circle distance in km */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la = (a.lat * Math.PI) / 180, lb = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const fmtKm = (km: number, lang: string) => {
  const unit = lang === 'ru' ? 'км' : 'km'
  const m = lang === 'ru' ? 'м' : 'm'
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} ${m}`
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} ${unit}`
}
