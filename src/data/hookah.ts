import type { L } from '../lib/i18n'

/**
 * Hookah — the chef's tobacco picks shown under "Chef's picks" on the Dining page.
 * PLACEHOLDER flavours for the concept — replace with the real hookah menu.
 */
export type Hookah = { id: string; name: L; notes: L; strength: 1 | 2 | 3; tags: string[] }

export const HOOKAHS: Hookah[] = [
  { id: 'double-apple', strength: 2, tags: ['#c43b2f', '#e9c46a'],
    name: { az: 'Qoşa alma', en: 'Double apple', ru: 'Двойное яблоко' },
    notes: { az: 'Anis və şirin alma — klassik Şərq dadı.', en: 'Anise and sweet apple — the classic of the East.', ru: 'Анис и сладкое яблоко — восточная классика.' } },
  { id: 'mint-lemon', strength: 1, tags: ['#5ad18b', '#f2e05b'],
    name: { az: 'Nanə və limon', en: 'Mint & lemon', ru: 'Мята и лимон' },
    notes: { az: 'Sərin, təravətli və yüngül.', en: 'Cool, fresh and light.', ru: 'Свежо, прохладно и легко.' } },
  { id: 'berry', strength: 2, tags: ['#8b2c6e', '#c44569'],
    name: { az: 'Giləmeyvə qarışığı', en: 'Berry mix', ru: 'Ягодный микс' },
    notes: { az: 'Moruq, qaragilə və bir az turşluq.', en: 'Raspberry, blueberry and a hint of tartness.', ru: 'Малина, черника и лёгкая кислинка.' } },
  { id: 'watermelon-mint', strength: 1, tags: ['#e85d75', '#5ad18b'],
    name: { az: 'Qarpız və nanə', en: 'Watermelon & mint', ru: 'Арбуз и мята' },
    notes: { az: 'Yay axşamlarının dadı.', en: 'The taste of summer evenings.', ru: 'Вкус летних вечеров.' } },
  { id: 'grape-ice', strength: 2, tags: ['#6c4ccc', '#9cf0ff'],
    name: { az: 'Buzlu üzüm', en: 'Iced grape', ru: 'Ледяной виноград' },
    notes: { az: 'Şirəli üzüm, sərin buz effekti.', en: 'Juicy grape with an icy finish.', ru: 'Сочный виноград с ледяным послевкусием.' } },
  { id: 'chef', strength: 3, tags: ['#c9a25c', '#7a1f2e'],
    name: { az: 'Şefin qarışığı', en: 'Chef’s blend', ru: 'Смесь от шефа' },
    notes: { az: 'Hər ay dəyişən xüsusi qarışıq — ofisiantdan soruşun.', en: 'A special blend that changes every month — ask your waiter.', ru: 'Особый микс, меняется каждый месяц — спросите официанта.' } },
]
