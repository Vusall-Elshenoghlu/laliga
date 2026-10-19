/**
 * Team & careers — static data for now (same pattern as games / branches).
 *
 * Later: set VITE_API_URL and getTeam() / getJobs() call `GET {API_URL}/team` and `/jobs`.
 *
 * NOTE: the departments, numbers and job openings below are PLACEHOLDERS for the concept —
 * replace them with LaLiga's real team structure and vacancies before going live.
 * HR_PHONE is where applications are sent on WhatsApp — set the real HR number.
 */
import type { L } from '../lib/i18n'
import { apiGet, hasApi } from './api'

export type Venue = 'game' | 'dining'

export type Department = {
  id: string
  venue: Venue
  icon: 'pad' | 'host' | 'tech' | 'chef' | 'waiter' | 'bar' | 'event' | 'office'
  name: L
  text: L
  /** headcount shown on the card, e.g. "40+" */
  size: string
}

export type Job = {
  id: string
  venue: Venue | 'both'
  title: L
  type: L
  shift: L
  about: L
  needs: L[]
}

export const HR_PHONE = '+994 55 861 61 61' // TODO: real HR WhatsApp number

export const DEPARTMENTS: Department[] = [
  { id: 'hosts', venue: 'game', icon: 'pad', size: '40+',
    name: { az: 'Zal operatorları', en: 'Hall operators', ru: 'Операторы залов' },
    text: { az: 'Stansiyanı hazırlayır, oyunu açır, gecə boyu yanınızda olurlar.', en: 'They set up your station, launch the game and stay with you all night.', ru: 'Готовят станцию, запускают игру и остаются рядом всю ночь.' } },
  { id: 'admins', venue: 'game', icon: 'host', size: '16',
    name: { az: 'Filial administratorları', en: 'Branch managers', ru: 'Администраторы филиалов' },
    text: { az: 'Bron, növbələr və hər filialın 7/24 rahat işləməsi onlardadır.', en: 'Bookings, shifts and keeping every branch running 24/7.', ru: 'Бронь, смены и бесперебойная работа каждого филиала 24/7.' } },
  { id: 'tech', venue: 'game', icon: 'tech', size: '8',
    name: { az: 'Texniki komanda', en: 'Tech team', ru: 'Техническая команда' },
    text: { az: 'Konsollar, pultlar, ekranlar və oyun kitabxanası həmişə hazırdır.', en: 'Consoles, controllers, screens and the game library — always ready.', ru: 'Консоли, геймпады, экраны и библиотека игр — всегда наготове.' } },
  { id: 'events-g', venue: 'game', icon: 'event', size: '6',
    name: { az: 'Turnir və tədbirlər', en: 'Tournaments & events', ru: 'Турниры и события' },
    text: { az: 'FC turnirləri, ad günləri və korporativ oyun gecələri.', en: 'FC tournaments, birthdays and corporate game nights.', ru: 'Турниры по FC, дни рождения и корпоративные игровые вечера.' } },
  { id: 'kitchen', venue: 'dining', icon: 'chef', size: '30+',
    name: { az: 'Mətbəx', en: 'Kitchen', ru: 'Кухня' },
    text: { az: 'Aşpazlar hər gün menyunun 200-dən çox yeməyini təzə hazırlayır.', en: 'Our chefs cook 200+ dishes on the menu fresh every day.', ru: 'Повара каждый день свежо готовят более 200 блюд меню.' } },
  { id: 'hall', venue: 'dining', icon: 'waiter', size: '45+',
    name: { az: 'Zal komandası', en: 'Floor team', ru: 'Команда зала' },
    text: { az: 'Ofisiantlar və hostess — süfrəniz başdan sona onların əlindədir.', en: 'Waiters and hosts — your table is in their hands from start to finish.', ru: 'Официанты и хостес — ваш стол в их руках от начала до конца.' } },
  { id: 'bar', venue: 'dining', icon: 'bar', size: '12',
    name: { az: 'Bar və çay', en: 'Bar & tea', ru: 'Бар и чай' },
    text: { az: 'Kokteyllər, limonadlar, qəhvə və məşhur çay dəstgahı.', en: 'Mocktails, lemonades, coffee and the famous tea sets.', ru: 'Коктейли, лимонады, кофе и знаменитая чайная церемония.' } },
  { id: 'events-d', venue: 'dining', icon: 'event', size: '5',
    name: { az: 'Tədbir menecerləri', en: 'Event managers', ru: 'Менеджеры событий' },
    text: { az: 'Ad günləri, nişanlar və korporativ gecələri sizinlə planlayırlar.', en: 'They plan birthdays, engagements and corporate nights with you.', ru: 'Планируют с вами дни рождения, помолвки и корпоративы.' } },
]

export const JOBS: Job[] = [
  { id: 'operator', venue: 'game',
    title: { az: 'Oyun zalı operatoru', en: 'Game hall operator', ru: 'Оператор игрового зала' },
    type: { az: 'Tam ştat', en: 'Full time', ru: 'Полная занятость' },
    shift: { az: 'Növbəli · gecə növbəsi var', en: 'Shifts · night shifts', ru: 'Сменный · есть ночные смены' },
    about: { az: 'Qonaqları qarşılayır, stansiyaları hazırlayır və oyun gecəsinin rahat keçməsini təmin edirsiniz.', en: 'Welcome guests, prepare stations and make sure every game night runs smoothly.', ru: 'Встречаете гостей, готовите станции и следите, чтобы игровой вечер прошёл гладко.' },
    needs: [
      { az: 'PlayStation oyunlarını sevmək və tanımaq', en: 'Love and know PlayStation games', ru: 'Любить и знать игры PlayStation' },
      { az: 'Ünsiyyətcil və səbirli olmaq', en: 'Friendly and patient', ru: 'Общительность и терпение' },
      { az: 'Azərbaycan və rus dili', en: 'Azerbaijani and Russian', ru: 'Азербайджанский и русский языки' },
    ] },
  { id: 'admin', venue: 'game',
    title: { az: 'Filial administratoru', en: 'Branch administrator', ru: 'Администратор филиала' },
    type: { az: 'Tam ştat', en: 'Full time', ru: 'Полная занятость' },
    shift: { az: '2/2 növbə', en: '2/2 shifts', ru: 'График 2/2' },
    about: { az: 'Bronları, komandanı və filialın gündəlik işini idarə edirsiniz.', en: 'Run bookings, the team and the day-to-day of a branch.', ru: 'Управляете бронями, командой и ежедневной работой филиала.' },
    needs: [
      { az: 'Xidmət sahəsində 1 il təcrübə', en: '1 year in hospitality or service', ru: 'Опыт в сфере обслуживания от 1 года' },
      { az: 'Komanda ilə işləmək bacarığı', en: 'Team leadership', ru: 'Умение руководить командой' },
      { az: 'Kompüter bilikləri', en: 'Computer skills', ru: 'Уверенный пользователь ПК' },
    ] },
  { id: 'chef', venue: 'dining',
    title: { az: 'Aşpaz köməkçisi', en: 'Commis chef', ru: 'Помощник повара' },
    type: { az: 'Tam ştat', en: 'Full time', ru: 'Полная занятость' },
    shift: { az: 'Növbəli', en: 'Shifts', ru: 'Сменный график' },
    about: { az: 'Mətbəx komandası ilə birlikdə menyunun yeməklərini hazırlayırsınız.', en: 'Prepare the menu’s dishes together with the kitchen team.', ru: 'Готовите блюда меню вместе с командой кухни.' },
    needs: [
      { az: 'Mətbəxdə təcrübə üstünlükdür', en: 'Kitchen experience is a plus', ru: 'Опыт на кухне приветствуется' },
      { az: 'Səliqə və sürət', en: 'Clean and fast', ru: 'Аккуратность и скорость' },
      { az: 'Öyrənməyə həvəs', en: 'Eager to learn', ru: 'Желание учиться' },
    ] },
  { id: 'waiter', venue: 'dining',
    title: { az: 'Ofisiant', en: 'Waiter', ru: 'Официант' },
    type: { az: 'Tam və yarım ştat', en: 'Full or part time', ru: 'Полная или частичная занятость' },
    shift: { az: 'Axşam növbələri', en: 'Evening shifts', ru: 'Вечерние смены' },
    about: { az: 'Qonaqları qarşılayır, menyunu tövsiyə edir və süfrənin qayğısına qalırsınız.', en: 'Welcome guests, recommend from the menu and look after the table.', ru: 'Встречаете гостей, советуете блюда и заботитесь о столе.' },
    needs: [
      { az: 'Gülərüz və diqqətli olmaq', en: 'Warm and attentive', ru: 'Доброжелательность и внимательность' },
      { az: 'Rus və ya ingilis dili üstünlükdür', en: 'Russian or English is a plus', ru: 'Русский или английский — плюс' },
      { az: 'Təcrübəsiz də müraciət edə bilərsiniz — öyrədirik', en: 'No experience? We train you', ru: 'Без опыта — научим' },
    ] },
  { id: 'barista', venue: 'dining',
    title: { az: 'Barista / barmen', en: 'Barista / bartender', ru: 'Бариста / бармен' },
    type: { az: 'Tam ştat', en: 'Full time', ru: 'Полная занятость' },
    shift: { az: 'Növbəli', en: 'Shifts', ru: 'Сменный график' },
    about: { az: 'Qəhvə, kokteyl və çay dəstgahı — barın sahibi siz olursunuz.', en: 'Coffee, mocktails and tea sets — the bar is yours.', ru: 'Кофе, коктейли и чайные сеты — бар в ваших руках.' },
    needs: [
      { az: 'Qəhvə hazırlamaq bacarığı', en: 'Coffee skills', ru: 'Навыки приготовления кофе' },
      { az: 'Yaradıcılıq', en: 'Creativity', ru: 'Креативность' },
      { az: 'Səliqə', en: 'Neat and organised', ru: 'Аккуратность' },
    ] },
  { id: 'smm', venue: 'both',
    title: { az: 'SMM və kontent mütəxəssisi', en: 'SMM & content specialist', ru: 'SMM и контент-специалист' },
    type: { az: 'Tam ştat · ofis', en: 'Full time · office', ru: 'Полная занятость · офис' },
    shift: { az: '5/2, gündüz', en: '5/2, daytime', ru: '5/2, дневной график' },
    about: { az: 'LaLiga-nın hər iki dünyasının sosial mediasını və çəkilişlərini idarə edirsiniz.', en: 'Run social media and shoots for both LaLiga worlds.', ru: 'Ведёте соцсети и съёмки обоих миров LaLiga.' },
    needs: [
      { az: 'Instagram və TikTok təcrübəsi', en: 'Instagram and TikTok experience', ru: 'Опыт в Instagram и TikTok' },
      { az: 'Mobil çəkiliş və montaj', en: 'Mobile shooting and editing', ru: 'Мобильная съёмка и монтаж' },
      { az: 'Oyun və yemək mədəniyyətinə maraq', en: 'Into gaming and food culture', ru: 'Интерес к играм и гастрономии' },
    ] },
]

export async function getDepartments(): Promise<Department[]> {
  return hasApi() ? apiGet<Department[]>('/team') : DEPARTMENTS
}
export async function getJobs(): Promise<Job[]> {
  return hasApi() ? apiGet<Job[]>('/jobs') : JOBS
}

/* -------------------------------------------------------------------------- */
/*  Team detail pages (/komanda/game, /komanda/dining)                        */
/* -------------------------------------------------------------------------- */

/**
 * Real team photos go here (put the files in /public/media/team/).
 * While a list is empty, the page simply doesn't show the photo section.
 * Example: { src: '/media/team/game-1.webp', caption: { az: 'Gənclik filialı', en: 'Ganjlik branch', ru: 'Филиал Гянджлик' } }
 */
export const TEAM_PHOTOS: Record<Venue, { src: string; caption?: L }[]> = {
  game: [],
  dining: [],
}

/** venue mood images used behind the hero of each team page */
export const TEAM_COVER: Record<Venue, string> = {
  game: '/media/branches/game-7.webp',
  dining: '/media/branches/dining-5.webp',
}

export type ShiftStep = { time: string; title: L; text: L }

export const SHIFT: Record<Venue, ShiftStep[]> = {
  game: [
    { time: '09:00', title: { az: 'Növbə təhvili', en: 'Shift handover', ru: 'Передача смены' }, text: { az: 'Gecə növbəsi stansiyaları, bronları və qeydləri səhər komandasına təhvil verir.', en: 'The night shift hands stations, bookings and notes over to the morning team.', ru: 'Ночная смена передаёт утренней станции, брони и заметки.' } },
    { time: '10:00', title: { az: 'Texniki yoxlama', en: 'Tech check', ru: 'Техпроверка' }, text: { az: 'Hər konsol, pult və ekran yoxlanılır, oyunlar yenilənir.', en: 'Every console, controller and screen is checked, games are updated.', ru: 'Проверяем каждую консоль, геймпад и экран, обновляем игры.' } },
    { time: '18:00', title: { az: 'Pik saatlar', en: 'Peak hours', ru: 'Часы пик' }, text: { az: 'Dostlar, turnirlər, ad günləri — zal dolur, operatorlar hər stansiyanın yanındadır.', en: 'Friends, tournaments, birthdays — the hall fills up and operators look after every station.', ru: 'Друзья, турниры, дни рождения — зал полон, операторы у каждой станции.' } },
    { time: '21:00', title: { az: 'FC turniri', en: 'FC tournament', ru: 'Турнир по FC' }, text: { az: 'Həftəlik turnir gecələrini tədbir komandası aparır.', en: 'The events team runs the weekly tournament nights.', ru: 'Еженедельные турниры ведёт команда событий.' } },
    { time: '03:00', title: { az: 'Gecə növbəsi', en: 'Night shift', ru: 'Ночная смена' }, text: { az: '7/24 açığıq — gecə komandası səhərə qədər oyunun davam etməsini təmin edir.', en: 'We are open 24/7 — the night team keeps the game going till morning.', ru: 'Мы открыты 24/7 — ночная команда держит игру до утра.' } },
  ],
  dining: [
    { time: '08:00', title: { az: 'Bazar və hazırlıq', en: 'Market & prep', ru: 'Закупка и заготовка' }, text: { az: 'Təzə məhsullar gəlir, mətbəx günün hazırlığına başlayır.', en: 'Fresh produce arrives and the kitchen starts the day’s prep.', ru: 'Приходят свежие продукты, кухня начинает заготовки.' } },
    { time: '11:00', title: { az: 'Brifinq', en: 'Briefing', ru: 'Брифинг' }, text: { az: 'Zal və mətbəx günün bronlarını, tədbirləri və yeni yeməkləri birlikdə keçir.', en: 'Floor and kitchen go through the day’s bookings, events and new dishes together.', ru: 'Зал и кухня вместе разбирают брони, события и новые блюда дня.' } },
    { time: '13:00', title: { az: 'Nahar', en: 'Lunch', ru: 'Обед' }, text: { az: 'Gündəlik süfrələr və işgüzar naharlar.', en: 'Everyday tables and business lunches.', ru: 'Повседневные столы и бизнес-ланчи.' } },
    { time: '19:00', title: { az: 'Axşam süfrəsi', en: 'Dinner service', ru: 'Ужин' }, text: { az: 'Ən qələbəlik vaxt — VIP kabinetlər, Netflix və karaoke otaqları dolur.', en: 'The busiest time — VIP cabins, Netflix and karaoke rooms fill up.', ru: 'Самое людное время — заполняются VIP-кабинки, Netflix и караоке.' } },
    { time: '22:00', title: { az: 'Çay dəstgahı', en: 'Tea time', ru: 'Чайная церемония' }, text: { az: 'Gecəni çay, desert və söhbətlə bağlayırıq.', en: 'We close the night with tea, dessert and good talk.', ru: 'Завершаем вечер чаем, десертом и беседой.' } },
  ],
}
