import type { Department } from '../../services/team'

/** small line icons for the departments */
export default function DeptIcon({ name }: { name: Department['icon'] }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === 'pad' && <><path {...p} d="M6 8h12a4 4 0 0 1 3.9 4.9l-1 4.3a2.4 2.4 0 0 1-4.3.8L15 16H9l-1.6 2a2.4 2.4 0 0 1-4.3-.8l-1-4.3A4 4 0 0 1 6 8z" /><path {...p} d="M7.5 11v3M6 12.5h3M16 11.5h.01M17.5 13h.01" /></>}
      {name === 'host' && <><circle {...p} cx="12" cy="8" r="3.5" /><path {...p} d="M5 20a7 7 0 0 1 14 0M9.5 14.5 12 17l2.5-2.5" /></>}
      {name === 'tech' && <><rect {...p} x="3" y="4" width="18" height="12" rx="2" /><path {...p} d="M8 20h8M12 16v4M9 10l2 2 4-4" /></>}
      {name === 'event' && <><path {...p} d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /></>}
      {name === 'chef' && <><path {...p} d="M7 14h10v6H7zM7 14a4 4 0 1 1 1.5-7.7A4 4 0 0 1 15.5 6.3 4 4 0 1 1 17 14" /></>}
      {name === 'waiter' && <><path {...p} d="M3 17h18M5 17a7 7 0 0 1 14 0M12 8V6M10 6h4" /></>}
      {name === 'bar' && <><path {...p} d="M5 4h14l-7 8zM12 12v7M8 20h8" /></>}
      {name === 'office' && <><rect {...p} x="4" y="3" width="16" height="18" rx="2" /><path {...p} d="M8 7h8M8 11h8M8 15h5" /></>}
    </svg>
  )
}
