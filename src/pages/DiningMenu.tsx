import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MenuBook from '../components/dining/MenuBook'
import MenuList from '../components/dining/MenuList'
import BackButton from '../components/BackButton'
import { useLenis } from '../lib/smooth'
import { useI18n } from '../lib/i18n'

type View = 'book' | 'list'

export default function DiningMenu() {
  const [view, setView] = useState<View>(() => (window.matchMedia('(max-width: 640px)').matches ? 'list' : 'book'))
  const lenis = useLenis()
  const { t } = useI18n()

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    const id = setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => clearTimeout(id)
  }, [view, lenis])

  return (
    <div className="dmenu" data-view={view}>
      <BackButton to="/dining" label={t('menu.backTo')} variant="dining" />
      <div className="dmenu__switch seg" role="tablist" aria-label={t('menu.view')}>
        <button role="tab" aria-selected={view === 'book'} onClick={() => setView('book')}>{t('menu.book')}</button>
        <button role="tab" aria-selected={view === 'list'} onClick={() => setView('list')}>{t('menu.list')}</button>
      </div>
      {view === 'book' ? <MenuBook /> : <MenuList />}
    </div>
  )
}
