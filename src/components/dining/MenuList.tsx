import { useMemo, useState } from 'react'
import { dishSrc, fmtPrice, menu } from '../../data/menu'
import { catName, itemAlt, itemName, translateDesc } from '../../data/menu-i18n'
import { useI18n } from '../../lib/i18n'

const norm = (s: string) =>
  s.toLocaleLowerCase('az').replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')

export default function MenuList() {
  const { t, lang } = useI18n()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')

  const cats = useMemo(() => {
    const nq = norm(q.trim())
    return menu
      .filter((c) => cat === 'all' || c.id === cat)
      .map((c) => ({
        ...c,
        items: nq ? c.items.filter((i) => norm(`${i.az} ${i.en} ${itemName(i, 'ru')} ${i.desc ?? ''} ${i.desc ? translateDesc(i.desc, lang) : ''}`).includes(nq)) : c.items,
      }))
      .filter((c) => c.items.length)
  }, [q, cat, lang])

  const count = cats.reduce((n, c) => n + c.items.length, 0)

  return (
    <section className="mlist" aria-label={t('menu.list')}>
      <div className="mlist__tools">
        <label className="mlist__search">
          <span className="sr-only">{t('menu.searchLabel')}</span>
          <input type="search" placeholder={t('menu.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="mlist__chips" role="tablist" aria-label={t('menu.sections')}>
          <button role="tab" aria-selected={cat === 'all'} onClick={() => setCat('all')}>{t('menu.all')}</button>
          {menu.map((c) => (
            <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}>{catName(c, lang)}</button>
          ))}
        </div>
      </div>

      {count === 0 && (
        <p className="mlist__empty">{t('menu.empty', { q })}</p>
      )}

      {cats.map((c) => (
        <div key={c.id} className="mlist__cat">
          <h2>{catName(c, lang)} <span>{lang === 'az' ? c.en : c.az}</span></h2>
          <ul className={`mlist__items ${c.items.some((i) => i.img) ? 'has-img' : ''}`}>
            {c.items.map((i) => (
              <li key={i.az + i.price} className="dish">
                {i.img && <img src={dishSrc(i.img)} alt="" loading="lazy" />}
                <div className="dish__body">
                  <div className="dish__row">
                    <h3>{itemName(i, lang)}</h3>
                    <span className="dish__dots" aria-hidden="true" />
                    <span className="dish__price">{fmtPrice(i.price)}</span>
                  </div>
                  <p className="dish__en">{itemAlt(i, lang)}</p>
                  {i.desc && <p className="dish__desc">{translateDesc(i.desc, lang)}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="mlist__note">{t('menu.service')}</p>
    </section>
  )
}
