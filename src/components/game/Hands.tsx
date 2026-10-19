/**
 * Real hands holding the controller for "Pick up the controller".
 *
 * The hands were cut from a photo of this controller being held and re-projected (one grip at a
 * time) into the controller photo's own space (2048 × 1152 = the rig box), so they wrap the grips
 * of every finish: thumbs on the d-pad and face buttons, fingers curled under the grips.
 * They are drawn twice (behind and in front of the controller) so the grab reads as a real grab.
 */
const SRC = '/media/game/hands'

const BOX = {
  left: { left: '-22.803%', top: '25.26%', width: '46.436%', aspectRatio: '951 / 1311' },
  right: { left: '75.146%', top: '25.26%', width: '47.607%', aspectRatio: '975 / 1363' },
} as const

function Hand({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`hand-move hand-move--${side}`} style={BOX[side]}>
      <img className="hand-img" src={`${SRC}/hold-${side === 'left' ? 'l' : 'r'}.webp`} alt="" draggable={false} />
    </div>
  )
}

/**
 * Two copies of the same hands that always move together:
 *  - behind the controller → while reaching in, the hands come up from behind the grips
 *  - in front of it        → fades in as they close, so thumbs and fingers end up over the grips
 */
export function HandsBack() {
  return (
    <div className="hands hands--back" aria-hidden="true">
      <Hand side="left" />
      <Hand side="right" />
    </div>
  )
}

export function HandsFront() {
  return (
    <div className="hands hands--front" aria-hidden="true">
      <Hand side="left" />
      <Hand side="right" />
    </div>
  )
}
