import { useMode } from '../lib/mode'
import { useGo } from '../lib/transition'
import SmartImg, { BRAND } from './SmartImg'
import { useI18n } from '../lib/i18n'

export default function Footer() {
  const mode = useMode()
  const go = useGo()
  const { t } = useI18n()
  const link = (to: string, label: string) => (
    <a href={to} onClick={(e) => { e.preventDefault(); go(to) }}>{label}</a>
  )
  return (
    <footer className="footer" data-mode={mode} id="elaqe">
      <div className="footer__top">
        <div className="footer__brand">
          <SmartImg src={BRAND.emblem} fallbacks={[BRAND.emblemRemote, BRAND.emblemSvg]} alt="" width={56} height={56} />
          <p>{t('ft.tagline')}</p>
        </div>
        <div className="footer__cols">
          <div>
            <h3>{t('ft.venues')}</h3>
            {link('/game-center', 'Game Center')}
            {link('/game-center/hall', 'Game Hall')}
            {link('/dining', 'Dining & Lounge')}
            {link('/dining/menu', t('nav.menu'))}
          </div>
          <div>
            <h3>{t('ft.branches')}</h3>
            {link('/game-center#filiallar', t('ft.gcBranches'))}
            {link('/dining#filiallar', t('ft.dnBranches'))}
          </div>
          <div>
            <h3>{t('ft.follow')}</h3>
            <a href="https://www.instagram.com/laligadininglounge/" target="_blank" rel="noreferrer">Instagram — Dining</a>
            <a href="https://laliga.az" target="_blank" rel="noreferrer">laliga.az</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>{t('ft.copy')}</span>
        <span>{t('ft.hours')}</span>
      </div>
    </footer>
  )
}
