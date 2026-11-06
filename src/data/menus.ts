/**
 * One menu per Dining & Lounge branch. Each branch has its own PDF (rendered to page images in
 * /public/media/menu/…) and its own prices and dishes.
 *
 * The list view reuses the transcribed catalogue in ./menu.ts (that is the Əhmədli menu, 1:1) and
 * applies a small per-branch patch: changed prices, dishes the branch does not serve, and dishes
 * only that branch has. The patches were generated from the PDFs, so when a branch prints a new
 * menu, regenerate them (or edit by hand: keys are "categoryId|catalogue name").
 */
import { menu, type MenuCategory, type MenuItem } from './menu'

export type MenuBranchId = 'elmler' | 'ehmedli' | 'musabeyov'

export type MenuBranch = {
  id: MenuBranchId
  /** number of pages in the PDF */
  pages: number
  /** page width / height */
  aspect: number
  /** folder of the page images under /media/menu ('' = the original root folder) */
  dir: string
}

export const MENU_BRANCHES: MenuBranch[] = [
  { id: 'elmler', pages: 47, aspect: 708.75 / 849.75, dir: 'elmler/' },
  { id: 'ehmedli', pages: 56, aspect: 900 / 1039, dir: '' },
  { id: 'musabeyov', pages: 52, aspect: 722.835 / 850.394, dir: 'musabeyov/' },
]

export const isMenuBranch = (id: string | undefined): id is MenuBranchId => MENU_BRANCHES.some((b) => b.id === id)
export const menuBranch = (id: MenuBranchId) => MENU_BRANCHES.find((b) => b.id === id)!

const pad = (n: number) => String(n).padStart(2, '0')
export const branchPageSrc = (b: MenuBranch, n: number) => `/media/menu/${b.dir}p${pad(n)}.webp`
export const branchThumbSrc = (b: MenuBranch, n: number) => `/media/menu/${b.dir}thumbs/p${pad(n)}.webp`

type Patch = {
  price: Record<string, number>
  hide: string[]
  /** first PDF page of each section, for the flip-book index */
  pages: Record<string, number>
}

// generated from the branch PDFs
const PATCH: Partial<Record<MenuBranchId, Patch>> = {
  elmler: {
    price: {"sorbalar|Düşbərə": 7.0, "salatlar|Toyuqlu Sezar salatı": 10.5, "salatlar|Krevetli Sezar salatı": 16.0, "salatlar|Laliga can əti salatı": 16.0, "salatlar|Xırçıltılı badımcan salatı": 7.5, "salatlar|Toyuqlu Kajun salatı": 9.5, "salatlar|Tuna salatı": 8.5, "qelyanaltilar|Mozzarella çubuqları": 6.9, "qelyanaltilar|Krevet tempura": 14.0, "qelyanaltilar|Sacda pomidor-yumurta (2 nəfərlik)": 14.0, "burgerler|Çizburger": 10.5, "burgerler|Laliga özəl burger": 12.0, "burgerler|Mini burger": 11.0, "burgerler|Toyuq burger": 6.9, "burgerler|Şaurma": 5.9, "pizzalar|Barbekyu pizza": 13.0, "pizzalar|Pizza Marqarita": 10.0, "pizzalar|Pizza Pollo": 12.5, "pizzalar|Sezar pizza": 14.0, "pizzalar|Pizza Pepperoni": 14.0, "pizzalar|Laliga özəl pizza": 16.0, "pastalar|Tagliatelle Alfredo": 15.0, "pastalar|Spagetti Bolonez": 14.0, "pastalar|Penne Da Vinçi": 11.0, "esas|Toyuq fajita": 17.0, "esas|Can əti fajita": 22.0, "esas|Göbələkli toyuq filesi": 15.0, "esas|Göbələkli toyuqlu krep": 12.0, "esas|Can əti Stroqanof": 25.0, "esas|Hellim pendirli can əti ruleti": 25.0, "esas|Toyuq şnitzel": 13.0, "esas|Toyuq ruleti": 14.0, "esas|Qızıl balıq steyk": 22.0, "esas|Səbzi plov": 16.0, "esas|Can əti medalyon": 25.0, "esas|Göbələkli ət qovurma": 18.0, "esas|Toyuq sacı (2 nəfərlik)": 27.0, "esas|Cücə tabaka": 22.0, "esas|Can əti sacı (2 nəfərlik)": 37.0, "desertler|Laliga özəl tort": 9.0, "desertler|Ballı tort": 9.0, "desertler|Çiyələkli çizkeyk": 9.0, "desertler|Dondurma (150 q)": 7.0, "cerezler|Xurma": 6.0, "cerezler|Plitka şokolad": 5.0, "cerezler|Çips": 5.0, "cerezler|Snickers": 3.5, "murebbeler|Ağ gilas": 6.0, "murebbeler|Qara gilas": 6.0, "murebbeler|Çiyələk": 6.0, "murebbeler|Bounty": 8.0, "murebbeler|Snickers": 8.0, "murebbeler|Albalı": 6.0, "murebbeler|Qoz ləpəsi": 8.0, "caylar|Qara çay": 8.0, "cay-desti|Bürünc çay seti": 21.0, "cay-desti|Gümüş çay seti": 39.0, "cay-desti|Qızıl çay seti": 59.0, "kokteyller|Enerji mohito": 12.0, "limonadlar|Çiyələk": 7.0, "limonadlar|Tərxun": 7.0, "limonadlar|Armud": 7.0, "limonadlar|Alma və kivi": 8.0, "limonadlar|Aqava": 7.0, "limonadlar|Giləmeyvə və vanil": 8.0, "limonadlar|Manqo və marakuya": 7.0, "limonadlar|Qreypfrut və aloe": 7.0, "limonadlar|Feyxoa və mohito": 7.0, "sireler|Alma / Portağal / Ananas": 3.0, "sireler|Albalı / Şaftalı / Qarışıq": 3.0, "sireler|Təzə portağal": 7.0, "sireler|Təzə alma": 6.0, "sireler|Təzə qreypfrut": 9.0, "sireler|Təzə ananas": 12.0, "soyuq-ickiler|Coca-Cola / Fanta / Sprite / Pepsi 0.33 l": 3.5, "soyuq-ickiler|Bizon 0.25 l": 3.0, "soyuq-ickiler|Limonad 0.5 l (Düşes, Tərxun)": 4.5, "soyuq-ickiler|Kompot 1 l": 6.0, "soyuq-ickiler|Sarıkız 0.25 l": 3.0, "soyuq-ickiler|Sirab 0.5 l": 3.0, "soyuq-ickiler|Meyvə şirəsi 1 l": 9.0, "soyuq-ickiler|Fuse Tea 0.33 l": 3.5, "soyuq-ickiler|Ayran": 3.0},
    hide: ["salatlar|Qızıl balıq salatı", "salatlar|Krevetli popkorn salatı", "salatlar|“Abşeron” salatı", "salatlar|Toyuqlu popkorn salatı", "qelyanaltilar|Şumadinski", "burgerler|Laliga özəl şaurma", "burgerler|Sezar roll", "pizzalar|Havay pizza", "pizzalar|Krevetli pizza", "pizzalar|Vegetarian pizza", "pizzalar|Qovurmalı pizza", "pastalar|Can əti ilə nudel", "esas|Güvəcdə krevetlər", "esas|Can əti güvəcdə", "esas|Tava kababı", "esas|“Övrüştə” kənd cücəsi ilə", "esas|Portağallı toyuq", "esas|Ət köftə", "desertler|Karamelli tort", "desertler|Qarağatlı çizkeyk", "cerezler|“Naxçıvan” sucuğu", "cerezler|Fındıq halvası", "murebbeler|Kokos", "murebbeler|Qoz", "murebbeler|Qarpız", "murebbeler|Zeytun", "murebbeler|Heyva", "murebbeler|Badam", "murebbeler|Armud", "murebbeler|Gavalı", "caylar|Samovarda çay"],
    pages: {"sorbalar": 4, "salatlar": 6, "qelyanaltilar": 9, "burgerler": 12, "pizzalar": 15, "pastalar": 18, "esas": 20, "qarnirler": 25, "desertler": 26, "cerezler": 28, "murebbeler": 29, "caylar": 30, "cay-desti": 32, "qehveler": 34, "seykler": 37, "kokteyller": 38, "limonadlar": 40, "soyuq-caylar": 43, "sireler": 44, "soyuq-ickiler": 45},
  },
  musabeyov: {
    price: {"sorbalar|Düşbərə": 7, "salatlar|Laliga can əti salatı": 22, "salatlar|Toyuqlu Kajun salatı": 12, "salatlar|Yunan salatı": 7.5, "salatlar|Tuna salatı": 12, "salatlar|Qızıl balıq salatı": 16, "salatlar|Krevetli popkorn salatı": 18, "salatlar|“Abşeron” salatı": 8.5, "salatlar|Toyuqlu popkorn salatı": 14, "qelyanaltilar|Qovurmalı yumurta": 10.5, "burgerler|Toyuq burger": 7.9, "burgerler|Klab sendviç": 10, "esas|Can əti fajita": 28, "esas|Can əti Stroqanof": 28, "esas|Qızıl balıq steyk": 28, "esas|Livansayağı toyuq filesi": 17, "esas|Can əti medalyon": 28, "esas|“Övrüştə” kənd cücəsi ilə": 20, "esas|Can əti sacı (2 nəfərlik)": 40, "cerezler|Meyvə assorti": 18, "cerezler|Püstə": 12, "sireler|Alma / Portağal / Ananas": 4, "sireler|Albalı / Şaftalı / Qarışıq": 4, "soyuq-ickiler|Kompot 1 l": 8, "soyuq-ickiler|Meyvə şirəsi 1 l": 11, "soyuq-ickiler|Ayran": 3},
    hide: ["sorbalar|Şabalıd şorbası", "salatlar|Kinoa salatı", "qelyanaltilar|Şumadinski", "pizzalar|Havay pizza", "pizzalar|Krevetli pizza", "pastalar|Can əti ilə nudel", "esas|Hellim pendirli can əti ruleti", "murebbeler|Kokos", "murebbeler|Zeytun", "murebbeler|Badam", "soyuq-ickiler|Bizon 0.25 l"],
    pages: {"pirojkiler": 4, "sorbalar": 5, "salatlar": 7, "qelyanaltilar": 10, "burgerler": 12, "pizzalar": 16, "pastalar": 20, "esas": 22, "qarnirler": 30, "desertler": 31, "cerezler": 33, "murebbeler": 34, "caylar": 35, "cay-desti": 37, "qehveler": 40, "seykler": 43, "kokteyller": 44, "limonadlar": 46, "soyuq-caylar": 49, "sireler": 50, "soyuq-ickiler": 51},
  },
}

/** categories only some branches have */
const EXTRA_CATS: Record<string, Omit<MenuCategory, 'items' | 'page'>> = {
  pirojkiler: { id: 'pirojkiler', az: 'Pirojkilər', en: 'Pirozhki', kind: 'food' },
}

type Extra = { cat: string; item: MenuItem }
const EXTRA: Partial<Record<MenuBranchId, Extra[]>> = {
  elmler: [
    { cat: 'qelyanaltilar', item: { az: 'Pakora', en: 'Pakora', price: 7.5, desc: 'Krep xəmiri, rəngli bibər, şirin qarğıdalı, toyuq filesi, qauda pendiri, şüyüd, cəfəri, çörək qırıntıları, xüsusi sous, ağ küncüt, qara küncüt, mikro göyərtilər' } },
    { cat: 'esas', item: { az: 'Göbələk souslu can əti', en: 'Tenderloin with Mushroom Sauce', price: 25, desc: 'Can əti, göbələk, qaymaq, brokoli, kök, gül kələm, pomidor, acı bibər, mikro göyərtilər' } },
    { cat: 'murebbeler', item: { az: 'Plombir', en: 'Plombir', price: 8 } },
    { cat: 'soyuq-ickiler', item: { az: 'Uludağ 0.25 l', en: 'Uludağ 0.25 l', price: 5 } },
  ],
  musabeyov: [
    { cat: 'pirojkiler', item: { az: 'Kartoflu pirojki', en: 'Potato Pirozhki', price: 2, desc: 'Pirojki xəmiri, kartof, soğan, kərə yağı, acika' } },
    { cat: 'pirojkiler', item: { az: 'Qarın pirojki', en: 'Tripe Pirozhki', price: 2, desc: 'Pirojki xəmiri, qarın əti, soğan, kərə yağı, acika' } },
    { cat: 'pirojkiler', item: { az: 'Ət pirojki', en: 'Veal Pirozhki', price: 2.6, desc: 'Pirojki xəmiri, dana əti, soğan, tərəvəzlər, kərə yağı, acika' } },
    { cat: 'pirojkiler', item: { az: 'Pendirli pirojki', en: 'Cheese Pirozhki', price: 2.6, desc: 'Pirojki xəmiri, ağ brınza pendiri, mozzarella pendiri, kərə yağı, acika' } },
    { cat: 'pastalar', item: { az: '“Mac and Cheese” toyuqla', en: '“Mac and Cheese” with Chicken', price: 14, desc: 'Toyuq filesi, Chifferini makaronu, çeddar sousu, kərə yağı, Parmezan pendiri, mikro göyərtilər' } },
    { cat: 'esas', item: { az: 'Albalılı dana qovurması', en: 'Veal Sauté with Cherries', price: 18, desc: 'Dana əti, albalı, şabalıd, kərə yağı, soğan, nar əzməsi, qarışıq göyərtilər' } },
    { cat: 'esas', item: { az: 'Teriyaki souslu dana sote', en: 'Veal Sauté with Teriyaki Sauce', price: 16, desc: 'Dana əti, rəngli bibər, yaşıl bibər, kərə yağı, soğan, yaşıl soğan, soya sousu, teriyaki sousu, ağ küncüt, kartof püresi' } },
    { cat: 'esas', item: { az: 'Asiyasayağı dana əti', en: 'Asian-Style Veal', price: 18, desc: 'Dana əti, zəncəfil, rəngli bibər, yaşıl bibər, kərə yağı, soğan, sarımsaq, kök, soya sousu, teriyaki sousu, ağ küncüt, düyü, xiyar, göbələk, yaşıl soğan, şirin çili sousu' } },
    { cat: 'esas', item: { az: 'Göbələk souslu toyuq', en: 'Chicken with Mushroom Sauce', price: 14, desc: 'Toyuq filesi, göbələk, qaymaq, kərə yağı, tərəvəz bulyonu, düyü, qarışıq salat, pomidor, acı bibər' } },
    { cat: 'soyuq-ickiler', item: { az: 'Efes “Zero” 0.33 l', en: 'Efes “Zero” 0.33 l', price: 6 } },
  ],
}

const cache = new Map<MenuBranchId, MenuCategory[]>()

/** the menu of one branch, in the same shape as the catalogue */
export function menuFor(id: MenuBranchId): MenuCategory[] {
  const hit = cache.get(id)
  if (hit) return hit
  const patch = PATCH[id]
  const extra = EXTRA[id] ?? []
  if (!patch && !extra.length) { cache.set(id, menu); return menu }
  const hide = new Set(patch?.hide ?? [])
  const cats: MenuCategory[] = menu.map((c) => ({
    ...c,
    page: patch?.pages[c.id] ?? c.page,
    items: c.items
      .filter((i) => !hide.has(`${c.id}|${i.az}`))
      .map((i) => {
        const p = patch?.price[`${c.id}|${i.az}`]
        return p === undefined ? i : { ...i, price: p }
      }),
  }))
  for (const e of extra) {
    let c = cats.find((x) => x.id === e.cat)
    if (!c) {
      const def = EXTRA_CATS[e.cat]
      if (!def) continue
      c = { ...def, page: patch?.pages[e.cat] ?? 1, items: [] }
      cats.push(c)
    }
    c.items.push(e.item)
  }
  const out = cats.filter((c) => c.items.length).sort((a, b) => a.page - b.page)
  cache.set(id, out)
  return out
}

const KEY = 'laliga.menuBranch'
export const lastMenuBranch = (): MenuBranchId | null => {
  try { const v = localStorage.getItem(KEY) ?? undefined; return isMenuBranch(v) ? v : null } catch { return null }
}
export const rememberMenuBranch = (id: MenuBranchId) => {
  try { localStorage.setItem(KEY, id) } catch { /* storage blocked */ }
}
