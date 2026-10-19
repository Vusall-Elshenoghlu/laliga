import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Branch } from '../../services/branches'

type Pos = { lat: number; lng: number }
type Props = {
  branches: Branch[]
  active: string | null
  nearestId: string | null
  me: Pos | null
  nearestLabel: string
  meLabel: string
  onHover: (id: string | null) => void
  onOpen: (b: Branch) => void
}

/**
 * Basemap tiles.
 * CARTO's dark style needs a free key (carto.com/basemaps/apikey) — put it in .env as VITE_CARTO_KEY.
 * Without a key the map falls back to standard OpenStreetMap tiles, darkened with a CSS filter.
 */
const CARTO_KEY: string = (import.meta.env.VITE_CARTO_KEY ?? '').trim()
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
const BASEMAP = CARTO_KEY
  ? {
      url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(CARTO_KEY)}`,
      opts: { subdomains: 'abcd', maxZoom: 19, className: 'brmap__tiles brmap__tiles--carto', attribution: `${OSM_ATTR} &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>` },
    }
  : {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      opts: { maxZoom: 19, className: 'brmap__tiles brmap__tiles--osm', attribution: OSM_ATTR },
    }
const PIN_R = 19 // half the pin size incl. its ring
const ME_R = 13

type Rect = { x: number; y: number; w: number; h: number }
const hit = (a: Rect, b: Rect, m = 4) => a.x < b.x + b.w + m && a.x + a.w + m > b.x && a.y < b.y + b.h + m && a.y + a.h + m > b.y
const area = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))

// where a label may sit around its pin, in order of preference
const DIRS: [number, number][] = [[0, -1], [1, 0], [-1, 0], [0, 1], [1, -1], [-1, -1], [1, 1], [-1, 1]]
const GAPS = [8, 26, 48, 78, 112]

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/**
 * Real map of the branches (Leaflet + CARTO dark tiles).
 * Every name label is placed so it never covers another label, another pin or "you are here";
 * when the space right next to a pin is taken, the label moves further out with a thin leader line.
 */
export default function BranchMap({ branches, active, nearestId, me, nearestLabel, meLabel, onHover, onOpen }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const pins = useRef(new Map<string, L.Marker>())
  const labels = useRef(new Map<string, L.Marker>())
  const meMarker = useRef<L.Marker | null>(null)
  const route = useRef<L.Polyline | null>(null)
  const cb = useRef({ onHover, onOpen })
  cb.current = { onHover, onOpen }

  const pad = (): [number, number] => ((box.current?.clientWidth ?? 800) < 520 ? [40, 40] : [70, 70])

  /* ---------- label placement ---------- */
  const place = () => {
    const m = map.current
    if (!m) return
    const size = m.getSize()
    const bounds: Rect = { x: 6, y: 6, w: size.x - 12, h: size.y - 12 }

    type Item = { key: string; p: L.Point; home: L.Point; r: number; el: HTMLElement; marker: L.Marker; prio: number; fixed?: boolean }
    const items: Item[] = []
    branches.forEach((b, i) => {
      const marker = labels.current.get(b.id)
      const el = marker?.getElement()?.querySelector<HTMLElement>('.brmap__label')
      if (!marker || !el) return
      const home = m.latLngToContainerPoint([b.lat, b.lng])
      items.push({ key: b.id, p: home.clone(), home, r: PIN_R, el, marker, prio: b.id === nearestId ? -2 : i })
    })
    const meLab = labels.current.get('__me')
    const meEl = meLab?.getElement()?.querySelector<HTMLElement>('.brmap__label')
    if (me && meLab && meEl) {
      const home = m.latLngToContainerPoint([me.lat, me.lng])
      items.push({ key: '__me', p: home.clone(), home, r: ME_R, el: meEl, marker: meLab, prio: -3, fixed: true })
    }

    // pins outside the current view get no label (and are no obstacle)
    const inView = (q: L.Point) => q.x > -4 && q.y > -4 && q.x < size.x + 4 && q.y < size.y + 4
    items.forEach((it) => it.el.parentElement?.classList.toggle('is-off', !inView(it.home)))
    for (let k = items.length - 1; k >= 0; k--) if (!inView(items[k].home)) items.splice(k, 1)

    // 1) pins that would touch are nudged apart ("you are here" never moves);
    //    a displaced pin keeps a thin stem to its true spot
    for (let it = 0; it < 80; it++) {
      let moved = false
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j]
        const min = a.r + b.r + 10
        let dx = b.p.x - a.p.x, dy = b.p.y - a.p.y
        let d = Math.hypot(dx, dy)
        if (d >= min) continue
        if (d < 0.01) { dx = 1; dy = -1; d = Math.SQRT2 }
        const push = min - d, ux = dx / d, uy = dy / d
        if (a.fixed) { b.p.x += ux * push; b.p.y += uy * push }
        else if (b.fixed) { a.p.x -= ux * push; a.p.y -= uy * push }
        else { a.p.x -= (ux * push) / 2; a.p.y -= (uy * push) / 2; b.p.x += (ux * push) / 2; b.p.y += (uy * push) / 2 }
        moved = true
      }
      if (!moved) break
    }
    items.forEach((it) => {
      if (it.key === '__me') return
      const el = pins.current.get(it.key)?.getElement()
      if (!el) return
      const dx = it.p.x - it.home.x, dy = it.p.y - it.home.y
      const away = Math.hypot(dx, dy) > 1
      el.querySelector<HTMLElement>('.brmap__pin-in')!.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`
      el.classList.toggle('is-moved', away)
      const ln = el.querySelector('line')
      if (ln) { ln.setAttribute('x2', String(17 + dx)); ln.setAttribute('y2', String(17 + dy)) }
    })

    // every pin is an obstacle for every label but its own
    const obstacles = items.map((it) => ({ key: it.key, rect: { x: it.p.x - it.r, y: it.p.y - it.r, w: it.r * 2, h: it.r * 2 } }))
    const placed: Rect[] = []

    items.sort((a, b) => a.prio - b.prio).forEach((it) => {
      const w = it.el.offsetWidth, h = it.el.offsetHeight
      let best: { rect: Rect; gap: number; dir: [number, number] } | null = null
      let bestCost = Infinity
      for (const gap of GAPS) {
        for (const dir of DIRS) {
          const [dx, dy] = dir
          const diag = dx !== 0 && dy !== 0 ? 0.72 : 1
          const ax = it.p.x + dx * (it.r + gap) * diag
          const ay = it.p.y + dy * (it.r + gap) * diag
          const rect: Rect = {
            x: dx > 0 ? ax : dx < 0 ? ax - w : ax - w / 2,
            y: dy > 0 ? ay : dy < 0 ? ay - h : ay - h / 2,
            w, h,
          }
          let cost = 0
          // outside the map
          const out = Math.max(0, bounds.x - rect.x) + Math.max(0, rect.x + w - (bounds.x + bounds.w)) + Math.max(0, bounds.y - rect.y) + Math.max(0, rect.y + h - (bounds.y + bounds.h))
          cost += out * 50
          placed.forEach((r) => { if (hit(rect, r)) cost += 1000 + area(rect, r) })
          obstacles.forEach((o) => { if (o.key !== it.key && hit(rect, o.rect, 3)) cost += 800 + area(rect, o.rect) })
          cost += gap * 0.5 // closer is nicer
          if (cost < bestCost) { bestCost = cost; best = { rect, gap, dir } }
        }
        if (bestCost < 200) break // found a free spot at this distance
      }
      if (!best) return
      placed.push(best.rect)
      // position relative to the pin (the label marker sits exactly on the pin)
      // label marker sits on the TRUE spot; offsets are measured from the (maybe nudged) pin
      const ox = it.p.x - it.home.x, oy = it.p.y - it.home.y
      const lx = best.rect.x - it.p.x, ly = best.rect.y - it.p.y
      it.el.style.transform = `translate(${Math.round(lx + ox)}px, ${Math.round(ly + oy)}px)`
      const line = it.marker.getElement()?.querySelector<SVGLineElement>('line')
      if (line) {
        const needs = best.gap > GAPS[0]
        // from the pin's edge to the nearest point of the label box
        const tx = Math.max(lx, Math.min(0, lx + w)), ty = Math.max(ly, Math.min(0, ly + h))
        const len = Math.hypot(tx, ty) || 1
        line.setAttribute('x1', String(ox + (tx / len) * it.r))
        line.setAttribute('y1', String(oy + (ty / len) * it.r))
        line.setAttribute('x2', String(ox + tx))
        line.setAttribute('y2', String(oy + ty))
        line.style.opacity = needs ? '1' : '0'
      }
    })
  }
  const placeRef = useRef(place)
  placeRef.current = place

  /* ---------- create the map once ---------- */
  useEffect(() => {
    const el = box.current
    if (!el) return
    const m = L.map(el, {
      zoomControl: false,
      scrollWheelZoom: false, // the page keeps scrolling over the map
      dragging: !L.Browser.mobile, // one-finger page scroll on phones
      zoomSnap: 0.25,
      attributionControl: true,
    })
    m.attributionControl.setPrefix(false)
    L.tileLayer(BASEMAP.url, BASEMAP.opts).addTo(m)
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    map.current = m

    const onZoomStart = () => el.classList.add('is-zooming')
    const onSettled = () => { placeRef.current(); el.classList.remove('is-zooming') }
    m.on('zoomstart', onZoomStart)
    m.on('zoomend moveend resize', onSettled)

    // pop the pins in when the map scrolls into view
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    const ro = new ResizeObserver(() => m.invalidateSize())
    ro.observe(el)

    return () => {
      io.disconnect()
      ro.disconnect()
      m.remove()
      map.current = null
      pins.current.clear()
      labels.current.clear()
      meMarker.current = null
      route.current = null
    }
  }, [])

  /* ---------- pins + labels for the branches ---------- */
  useEffect(() => {
    const m = map.current
    if (!m || !branches.length) return
    pins.current.forEach((mk) => mk.remove())
    labels.current.forEach((mk, k) => { if (k !== '__me') { mk.remove(); labels.current.delete(k) } })
    pins.current.clear()

    branches.forEach((b, i) => {
      const pin = L.marker([b.lat, b.lng], {
        icon: L.divIcon({
          className: 'brmap__pin',
          html: `<svg class="brmap__stem" aria-hidden="true"><line x1="17" y1="17" x2="17" y2="17"/></svg><i class="brmap__spot"></i><span class="brmap__pin-in"><span class="brx__pin-dot" style="--i:${i}"><b>${String(i + 1).padStart(2, '0')}</b></span></span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        keyboard: true,
        title: `${b.name} — ${b.street}`,
        riseOnHover: true,
      }).addTo(m)
      pin.on('mouseover', () => cb.current.onHover(b.id))
      pin.on('click', () => cb.current.onOpen(b))
      pins.current.set(b.id, pin)

      const label = L.marker([b.lat, b.lng], {
        icon: L.divIcon({
          className: 'brmap__lab',
          html: `<svg class="brmap__leader" aria-hidden="true"><line x1="0" y1="0" x2="0" y2="0"/></svg><span class="brmap__label" data-id="${b.id}">${esc(b.name)}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
        interactive: false,
        keyboard: false,
      }).addTo(m)
      labels.current.set(b.id, label)
    })

    const pts = branches.map((b) => L.latLng(b.lat, b.lng))
    m.fitBounds(L.latLngBounds(pts), { padding: pad(), maxZoom: 15, animate: false })
    requestAnimationFrame(() => placeRef.current())
  }, [branches])

  /* ---------- you are here + the line to the nearest branch ---------- */
  useEffect(() => {
    const m = map.current
    if (!m) return
    meMarker.current?.remove()
    labels.current.get('__me')?.remove()
    labels.current.delete('__me')
    route.current?.remove()
    meMarker.current = null
    route.current = null
    if (!me) return

    meMarker.current = L.marker([me.lat, me.lng], {
      icon: L.divIcon({ className: 'brmap__me', html: '<i></i>', iconSize: [22, 22], iconAnchor: [11, 11] }),
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(m)
    const lab = L.marker([me.lat, me.lng], {
      icon: L.divIcon({
        className: 'brmap__lab brmap__lab--me',
        html: `<svg class="brmap__leader" aria-hidden="true"><line x1="0" y1="0" x2="0" y2="0"/></svg><span class="brmap__label">${esc(meLabel)}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
      interactive: false,
      keyboard: false,
    }).addTo(m)
    labels.current.set('__me', lab)

    const near = branches.find((b) => b.id === nearestId)
    if (near) {
      route.current = L.polyline([[me.lat, me.lng], [near.lat, near.lng]], { className: 'brmap__route', interactive: false }).addTo(m)
    }
    // only zoom out to include the visitor when they are in town
    const pts = branches.map((b) => L.latLng(b.lat, b.lng))
    if (near && L.latLng(me.lat, me.lng).distanceTo(L.latLng(near.lat, near.lng)) < 45000) pts.push(L.latLng(me.lat, me.lng))
    m.flyToBounds(L.latLngBounds(pts), { padding: pad(), maxZoom: 15, duration: 1.1 })
  }, [me, nearestId, branches, meLabel])

  /* ---------- active state (no re-layout, so labels never jump on hover) ---------- */
  useEffect(() => {
    pins.current.forEach((mk, id) => {
      mk.getElement()?.classList.toggle('is-active', id === active)
      mk.setZIndexOffset(id === active ? 500 : id === nearestId ? 400 : 0)
    })
    labels.current.forEach((mk, id) => {
      mk.getElement()?.querySelector('.brmap__label')?.classList.toggle('is-active', id === active)
      mk.setZIndexOffset(id === active ? 500 : 0)
    })
  }, [active, nearestId, branches])

  /* ---------- nearest badge (label size changes → place again) ---------- */
  useEffect(() => {
    pins.current.forEach((mk, id) => mk.getElement()?.classList.toggle('is-near', id === nearestId))
    labels.current.forEach((mk, id) => {
      const lab = mk.getElement()?.querySelector<HTMLElement>('.brmap__label')
      const b = branches.find((x) => x.id === id)
      if (!lab || !b) return
      const wantNear = id === nearestId
      if (lab.dataset.near !== String(wantNear)) {
        lab.dataset.near = String(wantNear)
        lab.innerHTML = esc(b.name) + (wantNear ? `<em>${esc(nearestLabel)}</em>` : '')
      }
    })
    requestAnimationFrame(() => placeRef.current())
  }, [nearestId, nearestLabel, branches, me])

  return <div ref={box} className="brmap" onMouseLeave={() => cb.current.onHover(null)} />
}
