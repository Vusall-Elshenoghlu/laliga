import { useGo } from '../lib/transition'

type Props = { to: string; label: string; variant?: 'game' | 'dining' }

/** Fixed "go back" pill for full-screen experiences (Game Hall, menu book). */
export default function BackButton({ to, label, variant = 'game' }: Props) {
  const go = useGo()
  return (
    <a
      href={to}
      className={`backbtn backbtn--${variant}`}
      onClick={(e) => {
        e.preventDefault()
        go(to)
      }}
    >
      <span className="backbtn__arrow" aria-hidden="true" />
      <span>{label}</span>
    </a>
  )
}
