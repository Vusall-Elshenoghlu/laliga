/**
 * Player's hands holding the controller, drawn in the console image's own pixel space
 * (2048 × 1152, extended downward for the forearms).
 *
 *  - <HandsBack>  sits BEHIND the controller: forearms, palms and fingers wrapping the grips.
 *  - <HandsFront> sits ON TOP of it: only the thumbs, resting next to the sticks.
 *
 * The left hand is the right hand mirrored around the image's centre line.
 */
const VB = '0 0 2048 1760'
const MIRROR = 'translate(2048 0) scale(-1 1)'

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f3c9a8" />
        <stop offset="0.6" stopColor="#dba07c" />
        <stop offset="1" stopColor="#b8795a" />
      </linearGradient>
      <linearGradient id={`${id}-thumb`} x1="0" y1="1" x2="0.3" y2="0">
        <stop offset="0" stopColor="#c98a66" />
        <stop offset="0.5" stopColor="#e5b08c" />
        <stop offset="1" stopColor="#f4cdb0" />
      </linearGradient>
      <linearGradient id={`${id}-sleeve`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b2752" />
        <stop offset="1" stopColor="#0f0d24" />
      </linearGradient>
    </defs>
  )
}

/** palm + fingers + forearm for the right hand (behind the right grip) */
function BackRight({ id }: { id: string }) {
  return (
    <g className="hand-back">
      {/* forearm in a sleeve */}
      <path d="M1700 1760 L1745 1250 Q1880 1190 2010 1250 L2070 1760 Z" fill={`url(#${id}-sleeve)`} />
      <path d="M1736 1300 Q1880 1236 2022 1300 L2026 1340 Q1880 1278 1732 1342 Z" fill="var(--accent)" opacity="0.85" />
      {/* palm (mostly hidden behind the grip lobe) */}
      <path
        d="M1700 960 C1720 880 1830 840 1930 860 C2040 880 2080 980 2060 1080 C2040 1180 1960 1250 1860 1250 C1770 1250 1700 1180 1690 1100 Z"
        fill={`url(#${id}-skin)`}
      />
      {/* fingers curling round the outer edge of the grip */}
      <g className="hand-fingers">
        <rect x="1985" y="690" width="92" height="66" rx="33" fill={`url(#${id}-skin)`} transform="rotate(14 2030 723)" />
        <rect x="2000" y="768" width="92" height="66" rx="33" fill={`url(#${id}-skin)`} transform="rotate(8 2046 801)" />
        <rect x="2004" y="848" width="88" height="64" rx="32" fill={`url(#${id}-skin)`} />
        <rect x="1996" y="924" width="80" height="60" rx="30" fill={`url(#${id}-skin)`} transform="rotate(-8 2036 954)" />
      </g>
    </g>
  )
}

/** right thumb resting beside the right stick */
function ThumbRight({ id }: { id: string }) {
  return (
    <g className="hand-thumb">
      <path d="M1800 1020 C1745 955 1690 885 1650 820" stroke={`url(#${id}-thumb)`} strokeWidth="92" strokeLinecap="round" fill="none" />
      <path d="M1776 970 C1735 915 1695 860 1664 826" stroke="#fff" strokeOpacity="0.16" strokeWidth="16" strokeLinecap="round" fill="none" />
      <ellipse cx="1652" cy="818" rx="30" ry="38" fill="#f7dcc8" opacity="0.9" transform="rotate(-32 1652 818)" />
      <path d="M1734 932 q14 -10 30 -4" stroke="#a96c4c" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.55" />
    </g>
  )
}

export function HandsBack() {
  return (
    <svg className="hands hands--back" viewBox={VB} aria-hidden="true">
      <Defs id="hb" />
      <g className="hand-move hand-move--right"><BackRight id="hb" /></g>
      <g className="hand-move hand-move--left"><g transform={MIRROR}><BackRight id="hb" /></g></g>
    </svg>
  )
}

export function HandsFront() {
  return (
    <svg className="hands hands--front" viewBox={VB} aria-hidden="true">
      <Defs id="hf" />
      <g className="hand-move hand-move--right"><ThumbRight id="hf" /></g>
      <g className="hand-move hand-move--left"><g transform={MIRROR}><ThumbRight id="hf" /></g></g>
    </svg>
  )
}
