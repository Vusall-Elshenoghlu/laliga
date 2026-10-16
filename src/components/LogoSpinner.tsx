import SmartImg, { BRAND } from './SmartImg'

/** The LaLiga emblem stepping round like a d-pad, with the four brand colours orbiting it. */
export default function LogoSpinner() {
  return (
    <div className="logo-spinner" aria-hidden="true">
      <div className="logo-spinner__orbit"><i /><i /><i /><i /></div>
      <SmartImg className="logo-spinner__mark" src={BRAND.emblem} fallbacks={[BRAND.emblemRemote, BRAND.emblemSvg]} alt="" />
      <span className="logo-spinner__bar" />
    </div>
  )
}
