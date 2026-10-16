import { forwardRef, type CSSProperties } from 'react'
import SmartImg from '../SmartImg'
import { coverRemote, coverSrc, type Game } from '../../services/games'
import { useI18n } from '../../lib/i18n'

type Props = { game: Game; className?: string; style?: CSSProperties }

/** A printed game disc: cover art on the label ring, iridescent data side peeking at the rim. */
const Disc = forwardRef<HTMLDivElement, Props>(function Disc({ game, className = '', style }, ref) {
  return (
    <div ref={ref} className={`disc ${className}`} style={{ ...style, ['--accent' as string]: game.accent }}>
      <div className="disc__spin">
        <div className="disc__rainbow" />
        <div className="disc__print">
          <span className="disc__print-fallback">{game.title}</span>
          <SmartImg src={coverSrc(game)} fallbacks={[coverRemote(game)]} alt="" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')} />
        </div>
        <div className="disc__label">
          <span>LALIGA</span>
        </div>
      </div>
      <div className="disc__shine" />
      <div className="disc__hub" />
    </div>
  )
})

export default Disc

export function Cover({ game, className = '' }: { game: Game; className?: string }) {
  const { t, tr } = useI18n()
  return (
    <div className={`cover ${className}`} style={{ ['--accent' as string]: game.accent }}>
      <span className="cover__fallback">
        <b>{game.title}</b>
        <small>{tr(game.genre)}</small>
      </span>
      <SmartImg src={coverSrc(game)} fallbacks={[coverRemote(game)]} alt={`${game.title} — ${t('shelf.case')}`} draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')} />
    </div>
  )
}
