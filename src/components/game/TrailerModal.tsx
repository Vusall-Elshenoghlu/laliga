import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type { Game } from '../../types/game'
import { useI18n } from '../../lib/i18n'

export default function TrailerModal({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const { t, tr } = useI18n()
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!game) return
    const prev = document.activeElement as HTMLElement | null
    closeBtn.current?.focus()
    if (box.current) gsap.fromTo(box.current, { scale: 0.85, opacity: 0, rotateX: 12 }, { scale: 1, opacity: 1, rotateX: 0, duration: 0.6, ease: 'expo.out' })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [game, onClose])

  if (!game) return null
  return (
    <div className="trailer" role="dialog" aria-modal="true" aria-label={`${game.title} — ${t('trailer.label')}`} style={{ ['--accent' as string]: game.accent }}>
      <button className="trailer__scrim" onClick={onClose} aria-label={t('close')} />
      <div ref={box} className="trailer__box">
        <div className="trailer__bar">
          <span className="trailer__live" aria-hidden="true" />
          <strong>{game.title}</strong>
          <span className="trailer__genre">{tr(game.genre)}</span>
          <button ref={closeBtn} className="icon-btn" onClick={onClose} aria-label={t('trailer.close')}>✕</button>
        </div>
        <div className="trailer__frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${game.trailer}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={`${game.title} — ${t('trailer.official')}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
