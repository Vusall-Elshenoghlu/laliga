/**
 * Games service — the single place the app gets its game list from.
 *
 * Today: returns STATIC_GAMES (the data below).
 * Later: set VITE_API_URL in .env and getGames() will call `GET {API_URL}/games` instead.
 * Only `GameDTO` and `mapGame()` need adjusting to match the real backend response —
 * components (DiscShelf, GameHall, Disc, TrailerModal) never touch the raw API.
 */
import type { Game } from '../types/game'
import { apiGet, hasApi } from './api'

export type { Game }

/* -------------------------------------------------------------------------- */
/*  API shape (edit to match the backend)                                     */
/* -------------------------------------------------------------------------- */

/** What the backend is expected to send for one game. Adjust field names here only. */
export type GameDTO = {
  id: string | number
  slug?: string
  title: string
  genre: { az: string; en: string; ru: string }
  mode: { az: string; en: string; ru: string }
  players: string
  description: { az: string; en: string; ru: string }
  trailer_youtube_id: string
  accent_color?: string
  cover_url?: string
  is_active?: boolean
  sort_order?: number
}

/** Backend DTO → UI model. */
export function mapGame(dto: GameDTO): Game {
  return {
    id: dto.slug ?? String(dto.id),
    title: dto.title,
    genre: dto.genre,
    mode: dto.mode,
    players: dto.players,
    blurb: dto.description,
    trailer: dto.trailer_youtube_id,
    accent: dto.accent_color ?? '#3ee6ff',
    cover: dto.cover_url,
  }
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

/** All games shown on the shelf and in the Game Hall, in display order. */
export async function getGames(): Promise<Game[]> {
  if (!hasApi()) return STATIC_GAMES
  const list = await apiGet<GameDTO[]>('/games')
  return list
    .filter((g) => g.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(mapGame)
}

/** One game by id/slug. */
export async function getGame(id: string): Promise<Game | undefined> {
  if (!hasApi()) return STATIC_GAMES.find((g) => g.id === id)
  return mapGame(await apiGet<GameDTO>(`/games/${encodeURIComponent(id)}`))
}

/* -------------------------------------------------------------------------- */
/*  Cover helpers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Box art: game.cover if the API provides one, otherwise /media/games/<id>.png
 * (run `npm run fetch:media` to pull those from laliga.az). If the local file is
 * missing, <Cover> falls back to coverRemote().
 */
export const coverSrc = (game: Pick<Game, 'id' | 'cover'>) => game.cover ?? `/media/games/${game.id}.png`
export const coverRemote = (game: Pick<Game, 'id'>) => `https://laliga.az/media/showcase/game-center/${game.id}.png`

/* -------------------------------------------------------------------------- */
/*  Static data (used until the API is connected)                             */
/* -------------------------------------------------------------------------- */

const STATIC_GAMES: Game[] = [
  {
    id: 'fc-fifa',
    title: 'EA SPORTS FC',
    genre: { az: 'Futbol', en: 'Football', ru: 'Футбол' },
    mode: { az: 'Üz-üzə', en: 'Head-to-head', ru: 'Один на один' },
    players: '1–4',
    blurb: {
      az: 'Filiallarda ən çox bron edilən oyun. Dostla tez bir matç da, bütün gecəlik turnir də olur — matçlar qısadır, qrup çox oyun dəyişə bilir.',
      en: 'The most-booked title in our branches. Great for a quick one-on-one or a full bracket night — matches are short, so a group can rotate through plenty.',
      ru: 'Самая бронируемая игра в филиалах. Подходит и для быстрого матча один на один, и для целого турнира — матчи короткие, компания успевает сыграть много.',
    },
    trailer: 'MOclJJ7IpSY',
    accent: '#3cf0a0',
  },
  {
    id: 'mortal-kombat',
    title: 'Mortal Kombat 1',
    genre: { az: 'Döyüş', en: 'Fighting', ru: 'Файтинг' },
    mode: { az: 'Üz-üzə', en: 'Head-to-head', ru: 'Один на один' },
    players: '1–2',
    blurb: {
      az: 'Sürətli raundlar, asan başlanğıc. Qrup “uduzan çıxır” oynamaq istəyəndə ilk seçim — pult otaqda dayanmadan dövr edir.',
      en: 'Fast rounds and an easy pick-up feel — the usual choice when a group wants a knockout ladder. The controller keeps moving around the room.',
      ru: 'Быстрые раунды и простой вход — обычный выбор, когда компания хочет играть на вылет. Геймпад не задерживается в одних руках.',
    },
    trailer: 'UZ6eFEjFfJ0',
    accent: '#ffb02e',
  },
  {
    id: 'tekken',
    title: 'Tekken 8',
    genre: { az: 'Döyüş', en: 'Fighting', ru: 'Файтинг' },
    mode: { az: 'Üz-üzə', en: 'Head-to-head', ru: 'Один на один' },
    players: '1–2',
    blurb: {
      az: 'Rəfdəki ən texniki döyüş oyunu. Dərin kombinasiyalar — davamlı gələn oyunçunu mükafatlandırır.',
      en: 'The most technical fighter on the shelf. Deep move sets reward players who keep coming back.',
      ru: 'Самый технический файтинг на полке. Глубокие комбо вознаграждают тех, кто возвращается снова.',
    },
    trailer: '_MM4clV2qjE',
    accent: '#ff4b4b',
  },
  {
    id: 'ufc',
    title: 'EA SPORTS UFC 5',
    genre: { az: 'Döyüş', en: 'Fighting', ru: 'Файтинг' },
    mode: { az: 'Üz-üzə', en: 'Head-to-head', ru: 'Один на один' },
    players: '1–2',
    blurb: {
      az: 'Oktaqonda bir-birinizə qarşı. Hər raund taktikadır — zərbə, güləş, yoxsa təslim?',
      en: 'Face each other in the octagon. Every round is tactics — strike, grapple or submit?',
      ru: 'Лицом к лицу в октагоне. Каждый раунд — тактика: удар, борьба или болевой?',
    },
    trailer: '1R4MdobS1nI',
    accent: '#e8e8e8',
  },
  {
    id: 'call-of-duty',
    title: 'Call of Duty',
    genre: { az: 'Atıcı', en: 'Shooter', ru: 'Шутер' },
    mode: { az: 'Komanda', en: 'Team', ru: 'Командный' },
    players: '1–4',
    blurb: {
      az: 'Split-screen və komanda rejimləri ilə dostlarla bir otaqda tam döyüş meydanı.',
      en: 'Split-screen and team modes turn one room into a full battlefield with friends.',
      ru: 'Сплит-скрин и командные режимы превращают одну комнату в поле боя с друзьями.',
    },
    trailer: 'h0uxvKUjsj4',
    accent: '#ff7a1a',
  },
  {
    id: 'need-for-speed',
    title: 'Need for Speed',
    genre: { az: 'Yarış', en: 'Racing', ru: 'Гонки' },
    mode: { az: 'Yarış', en: 'Racing', ru: 'Гонки' },
    players: '1–2',
    blurb: {
      az: 'Küçə yarışları, polis təqibi və tüninq. Gecə şəhərində qaz pedalını sona qədər bas.',
      en: 'Street races, police chases and tuning. Floor it through the city at night.',
      ru: 'Уличные гонки, погони и тюнинг. Газ в пол по ночному городу.',
    },
    trailer: 'H2Y8XCe7F9E',
    accent: '#33d6ff',
  },
  {
    id: 'gta-5',
    title: 'GTA V',
    genre: { az: 'Açıq dünya', en: 'Open world', ru: 'Открытый мир' },
    mode: { az: 'Macəra', en: 'Adventure', ru: 'Приключения' },
    players: '1',
    blurb: {
      az: 'Los Santos sizindir. Missiyalar, maşınlar və bitməyən açıq dünya — tək oyun üçün klassik.',
      en: 'Los Santos is yours. Missions, cars and an endless open world — a single-player classic.',
      ru: 'Лос-Сантос в вашем распоряжении. Миссии, машины и бесконечный открытый мир — классика.',
    },
    trailer: 'QkkoHAzjnUs',
    accent: '#7ee36a',
  },
  {
    id: 'god-of-war-ragnarok',
    title: 'God of War Ragnarök',
    genre: { az: 'Macəra', en: 'Adventure', ru: 'Приключения' },
    mode: { az: 'Hekayə', en: 'Story', ru: 'Сюжет' },
    players: '1',
    blurb: {
      az: 'Kratos və Atreus doqquz aləmdə. PS5-də böyük ekranda yaşanmalı epik hekayə.',
      en: 'Kratos and Atreus across the nine realms. An epic meant for a big screen on PS5.',
      ru: 'Кратос и Атрей в девяти мирах. Эпос, созданный для большого экрана PS5.',
    },
    trailer: 'g1wr0DfV73E',
    accent: '#7fb8ff',
  },
  {
    id: 'spider-man-2',
    title: "Marvel's Spider-Man 2",
    genre: { az: 'Macəra', en: 'Adventure', ru: 'Приключения' },
    mode: { az: 'Hekayə', en: 'Story', ru: 'Сюжет' },
    players: '1',
    blurb: {
      az: 'İki Hörümçək-adam, bir Nyu-York. Göydələnlər arasında uçuş PS5-də ən gözəl halında.',
      en: 'Two Spider-Men, one New York. Swinging between skyscrapers at its finest on PS5.',
      ru: 'Два Человека-паука, один Нью-Йорк. Полёты между небоскрёбами во всей красе на PS5.',
    },
    trailer: '9fVYKsEmuRo',
    accent: '#ff3b5c',
  },
  {
    id: 'elden-ring',
    title: 'Elden Ring',
    genre: { az: 'RPG', en: 'RPG', ru: 'RPG' },
    mode: { az: 'Hekayə', en: 'Story', ru: 'Сюжет' },
    players: '1',
    blurb: {
      az: 'Çətin, amma ədalətli. Hər boss bir imtahandır — yanınızda tamaşaçı olanda daha da maraqlı.',
      en: 'Hard but fair. Every boss is a test — even better with an audience behind you.',
      ru: 'Сложно, но честно. Каждый босс — испытание, а со зрителями ещё интереснее.',
    },
    trailer: 'E3Huy2cdih0',
    accent: '#e6c46a',
  },
  {
    id: 'horizon-forbidden-west',
    title: 'Horizon Forbidden West',
    genre: { az: 'Macəra', en: 'Adventure', ru: 'Приключения' },
    mode: { az: 'Hekayə', en: 'Story', ru: 'Сюжет' },
    players: '1',
    blurb: {
      az: 'Mexaniki heyvanlar və nəfəs kəsən təbiət. 4K ekranda görüntünün necə olduğunu görün.',
      en: 'Machine beasts and breathtaking nature. See what 4K really looks like.',
      ru: 'Механические звери и захватывающая природа. Посмотрите, как выглядит настоящий 4K.',
    },
    trailer: 'Lq594XmpPBg',
    accent: '#ff8f5a',
  },
  {
    id: 'hogwarts-legacy',
    title: 'Hogwarts Legacy',
    genre: { az: 'RPG', en: 'RPG', ru: 'RPG' },
    mode: { az: 'Hekayə', en: 'Story', ru: 'Сюжет' },
    players: '1',
    blurb: {
      az: 'Sehrbazlar dünyasında öz hekayəniz — dərslər, sehrlər və Hoqvartsın gizli dəhlizləri.',
      en: 'Your own story in the wizarding world — classes, spells and Hogwarts\' hidden corridors.',
      ru: 'Ваша история в мире волшебников — уроки, заклинания и тайные коридоры Хогвартса.',
    },
    trailer: 'BtyBjOW8sGY',
    accent: '#c9a2ff',
  },
  {
    id: 'gran-turismo-7',
    title: 'Gran Turismo 7',
    genre: { az: 'Yarış', en: 'Racing', ru: 'Гонки' },
    mode: { az: 'Simulyator', en: 'Simulator', ru: 'Симулятор' },
    players: '1–2',
    blurb: {
      az: 'Real sürüş simulyatoru. Trek, avtomobil və dəqiq dövrə vaxtı sevənlər üçün.',
      en: 'A true driving simulator for lovers of tracks, cars and the perfect lap time.',
      ru: 'Настоящий симулятор вождения для любителей трасс, машин и идеального круга.',
    },
    trailer: '1tBUsXIkG1A',
    accent: '#5ab0ff',
  },
  {
    id: 'f1-25',
    title: 'F1 25',
    genre: { az: 'Yarış', en: 'Racing', ru: 'Гонки' },
    mode: { az: 'Yarış', en: 'Racing', ru: 'Гонки' },
    players: '1–2',
    blurb: {
      az: 'Formula 1 bolidinin sükanı sizdədir. Bakı trekində dövrə vurmağı unutmayın.',
      en: 'Take the wheel of a Formula 1 car. Don\'t forget a lap of the Baku street circuit.',
      ru: 'Сядьте за руль болида Формулы-1. Не забудьте проехать круг по трассе Баку.',
    },
    trailer: 'u5rWBgBjDsc',
    accent: '#ff2d2d',
  },
  {
    id: 'street-fighter-6',
    title: 'Street Fighter 6',
    genre: { az: 'Döyüş', en: 'Fighting', ru: 'Файтинг' },
    mode: { az: 'Üz-üzə', en: 'Head-to-head', ru: 'Один на один' },
    players: '1–2',
    blurb: {
      az: 'Əfsanəvi seriya yeni görkəmdə. Hadouken-i dostunuza göstərmək vaxtıdır.',
      en: 'The legendary series in a new look. Time to show your friend that Hadouken.',
      ru: 'Легендарная серия в новом облике. Пора показать другу свой Хадокен.',
    },
    trailer: '4EnsDg6DCTE',
    accent: '#ffd23f',
  },
  {
    id: 'nba-2k',
    title: 'NBA 2K',
    genre: { az: 'Basketbol', en: 'Basketball', ru: 'Баскетбол' },
    mode: { az: 'Üz-üzə', en: 'Head-to-head', ru: 'Один на один' },
    players: '1–4',
    blurb: {
      az: 'Meydançada 1-ə 1 və ya komanda matçı. Son saniyə üçlüyü ilə qalib gəlin.',
      en: 'One-on-one on the court or a full team match. Win it with a buzzer-beater three.',
      ru: 'Один на один или командный матч. Победа трёхочковым на последней секунде.',
    },
    trailer: 'zY1dEu7nGKc',
    accent: '#ff8a3d',
  },
  {
    id: 'it-takes-two',
    title: 'It Takes Two',
    genre: { az: 'Co-op', en: 'Co-op', ru: 'Кооператив' },
    mode: { az: 'Birgə', en: 'Together', ru: 'Вместе' },
    players: '2',
    blurb: {
      az: 'Yalnız iki nəfərlə oynanılır. Cütlüklər və dostlar üçün ən gözəl birgə macəra.',
      en: 'Only playable as a pair. The best co-op adventure for couples and friends.',
      ru: 'Играется только вдвоём. Лучшее кооперативное приключение для пар и друзей.',
    },
    trailer: '2AysHTv7X8k',
    accent: '#ff7ac8',
  },
]
