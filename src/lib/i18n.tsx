import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'az' | 'en' | 'ru'
export type L = Record<Lang, string>
export const LANGS: Lang[] = ['az', 'en', 'ru']

const KEY = 'laliga.lang'

const readLang = (): Lang => {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'az' || v === 'en' || v === 'ru') return v
  } catch { /* storage blocked */ }
  return 'az'
}

/* -------------------------------------------------------------------------- */
/*  Dictionary                                                                */
/* -------------------------------------------------------------------------- */

const D = {
  // shared
  skip: { az: 'Məzmuna keç', en: 'Skip to content', ru: 'Перейти к содержимому' },
  back: { az: 'Geri qayıt', en: 'Go back', ru: 'Назад' },
  close: { az: 'Bağla', en: 'Close', ru: 'Закрыть' },
  prev: { az: 'Əvvəlki', en: 'Previous', ru: 'Назад' },
  next: { az: 'Növbəti', en: 'Next', ru: 'Далее' },
  langLabel: { az: 'Dil', en: 'Language', ru: 'Язык' },

  // nav
  'nav.home': { az: 'LaLiga — ana səhifə', en: 'LaLiga — home', ru: 'LaLiga — главная' },
  'nav.main': { az: 'Əsas menyu', en: 'Main menu', ru: 'Главное меню' },
  'nav.loyalty': { az: 'Loyallıq', en: 'Loyalty', ru: 'Лояльность' },
  'nav.contact': { az: 'Əlaqə', en: 'Contact', ru: 'Контакты' },
  'nav.shelf': { az: 'Oyun rəfi', en: 'Game shelf', ru: 'Полка игр' },
  'nav.how': { az: 'Necə işləyir', en: 'How it works', ru: 'Как это работает' },
  'nav.branches': { az: 'Filiallar', en: 'Branches', ru: 'Филиалы' },
  'nav.menu': { az: 'Menyu', en: 'Menu', ru: 'Меню' },
  'nav.rooms': { az: 'Otaqlar', en: 'Rooms', ru: 'Залы' },
  'nav.picks': { az: 'Seçilmişlər', en: "Chef's picks", ru: 'Выбор шефа' },
  'nav.book': { az: 'Bron et', en: 'Book now', ru: 'Забронировать' },
  'nav.bookTable': { az: 'Masa bron et', en: 'Reserve a table', ru: 'Забронировать стол' },
  'nav.openMenu': { az: 'Menyunu aç', en: 'Open menu', ru: 'Открыть меню' },

  // home
  'home.pick': { az: 'Məkan seçin', en: 'Choose a venue', ru: 'Выберите заведение' },
  'home.game.line': { az: 'PS5 stansiyaları, 50+ oyun və 8 filial. Tək, dostlarla, ya da turnir gecəsi.', en: 'PS5 stations, 50+ games and 8 branches. Solo, with friends or a tournament night.', ru: 'Станции PS5, 50+ игр и 8 филиалов. Одному, с друзьями или на турнире.' },
  'home.game.tags': { az: 'PS5|Qrup sessiyaları|Turnirlər', en: 'PS5|Group sessions|Tournaments', ru: 'PS5|Групповые сессии|Турниры' },
  'home.game.cta': { az: 'Oyuna gir', en: 'Enter the game', ru: 'Войти в игру' },
  'home.dining.line': { az: 'Zəngin menyu, 34 VIP kabinet, karaoke və Netflix. İki nəfərlik masadan şirkət gecəsinə qədər.', en: 'A rich menu, 34 VIP cabins, karaoke and Netflix. From a table for two to a company night.', ru: 'Богатое меню, 34 VIP-кабинки, караоке и Netflix. От столика на двоих до корпоратива.' },
  'home.dining.tags': { az: 'Menyu|VIP kabinetlər|Karaoke', en: 'Menu|VIP cabins|Karaoke', ru: 'Меню|VIP-кабинки|Караоке' },
  'home.dining.cta': { az: 'Masaya keç', en: 'Take a seat', ru: 'К столу' },
  'loyal.tagline': { az: 'Hər gəlişdə qazan', en: 'Earn on every visit', ru: 'Копите с каждым визитом' },
  'loyal.title': { az: 'Bir kart, iki dünya', en: 'One card, two worlds', ru: 'Одна карта, два мира' },
  'loyal.text': { az: 'Oyun sessiyası da, şam yeməyi də eyni kartla keşbek qazandırır. Kartı istənilən filialda bir dəqiqəyə ala bilərsiniz.', en: 'Gaming sessions and dinners earn cashback on the same card. Pick one up at any branch in a minute.', ru: 'Игровые сессии и ужины приносят кешбэк на одну карту. Оформите её в любом филиале за минуту.' },
  'loyal.1t': { az: 'Keşbek', en: 'Cashback', ru: 'Кешбэк' },
  'loyal.1d': { az: 'Hər oyun sessiyası, masa və qeyd etmədən.', en: 'Every gaming session, table and celebration.', ru: 'Каждая игра, стол и праздник.' },
  'loyal.2t': { az: 'Bütün filiallarda', en: 'Every branch', ru: 'Во всех филиалах' },
  'loyal.2d': { az: 'Game Center və Dining & Lounge — 11 ünvan.', en: 'Game Center and Dining & Lounge — 11 locations.', ru: 'Game Center и Dining & Lounge — 11 адресов.' },
  'loyal.3t': { az: 'Rəqəmsal pul kisəsi', en: 'Digital wallet', ru: 'Цифровой кошелёк' },
  'loyal.3d': { az: 'Apple Wallet və Google Wallet-də saxlayın.', en: 'Keep it in Apple Wallet or Google Wallet.', ru: 'Храните в Apple Wallet или Google Wallet.' },
  'loyal.4t': { az: 'Üzvlərə özəl', en: 'Members only', ru: 'Только для участников' },
  'loyal.4d': { az: 'Prioritet bron, turnir girişi, ad günü sürprizləri.', en: 'Priority booking, tournament entry, birthday perks.', ru: 'Приоритетная бронь, вход на турниры, подарки ко дню рождения.' },

  // game center
  'gc.title1': { az: 'Növbəti level', en: 'Your next level', ru: 'Твой новый уровень' },
  'gc.title2': { az: 'buradan başlayır', en: 'starts here', ru: 'начинается здесь' },
  'gc.sub': { az: '8 filial, PS5 və 50+ oyun. Bakının hər yerində, 7/24.', en: '8 branches, PS5 and 50+ games. All over Baku, 24/7.', ru: '8 филиалов, PS5 и 50+ игр. По всему Баку, 24/7.' },
  'gc.bookStation': { az: 'Stansiya bron et', en: 'Book a station', ru: 'Забронировать станцию' },
  'gc.hint': { az: 'Diski çıxarmaq üçün aşağı sürüşdür', en: 'Scroll down to take the disc out', ru: 'Листайте вниз, чтобы достать диск' },
  'gc.beat1': { az: 'Qutunu seç.', en: 'Pick the case.', ru: 'Выбери коробку.' },
  'gc.beat2': { az: 'Qapağı aç.', en: 'Open the lid.', ru: 'Открой крышку.' },
  'gc.beat3': { az: 'Diski götür — oyun səni gözləyir.', en: 'Take the disc — the game is waiting.', ru: 'Возьми диск — игра ждёт.' },
  'gc.hallText': { az: 'Pult sizin əlinizdə. Ekranda oyunları vərəqləyin, ✕ düyməsi ilə treyleri işə salın, ilan və tetris oynayın, START ilə yerinizi bron edin.', en: 'The controller is yours. Flip through games on screen, press ✕ for the trailer, play Snake or Tetris, and hit START to book.', ru: 'Геймпад в ваших руках. Листайте игры на экране, ✕ — трейлер, играйте в Змейку и Тетрис, START — бронь.' },
  'gc.hallCta': { az: 'Pultu götür', en: 'Pick up the controller', ru: 'Взять геймпад' },
  'gc.hallAlt': { az: 'LaLiga Game Hall pultu', en: 'LaLiga Game Hall controller', ru: 'Геймпад LaLiga Game Hall' },
  'how.title': { az: 'Bron necə işləyir', en: 'How booking works', ru: 'Как забронировать' },
  'how.1t': { az: 'Filialı seç', en: 'Pick a branch', ru: 'Выберите филиал' },
  'how.1d': { az: 'Sizə ən yaxın olanı — 8 ünvandan birini.', en: 'The closest one of our 8 locations.', ru: 'Ближайший из 8 адресов.' },
  'how.2t': { az: 'Vaxtı yaz', en: 'Tell us when', ru: 'Укажите время' },
  'how.2d': { az: 'Nə vaxt, neçə nəfər, tək oyun, yoxsa turnir.', en: 'When, how many people, casual or tournament.', ru: 'Когда, сколько человек, игра или турнир.' },
  'how.3t': { az: 'Təsdiq al', en: 'Get confirmed', ru: 'Получите подтверждение' },
  'how.3d': { az: 'Komanda stansiyanı və saatı təsdiqləyib yazır.', en: 'The team confirms the station and time.', ru: 'Команда подтвердит станцию и время.' },
  'how.4t': { az: 'Gəl, oyna', en: 'Come and play', ru: 'Приходите и играйте' },
  'how.4d': { az: 'Pult hazırdır, oyun yüklənib, sizi gözləyir.', en: 'Controller charged, game loaded, waiting for you.', ru: 'Геймпад заряжен, игра загружена.' },
  'facts.branches': { az: 'filial', en: 'branches', ru: 'филиалов' },
  'facts.games': { az: 'oyun', en: 'games', ru: 'игр' },
  'facts.hw': { az: 'avadanlıq', en: 'hardware', ru: 'железо' },
  'facts.open': { az: 'açıq', en: 'open', ru: 'открыто' },
  'gc.branchesTitle': { az: 'Ən yaxın filialı tap', en: 'Find your nearest branch', ru: 'Найдите ближайший филиал' },

  // shelf
  'shelf.title': { az: 'Oyun rəfi', en: 'Game shelf', ru: 'Полка игр' },
  'shelf.sub': { az: 'Qutunu seç, diski çıxart, treylerə bax. Rəfdə 50+ oyun var — burada ən çox oynanılanlar.', en: 'Pick a case, take out the disc, watch the trailer. 50+ games on the shelf — here are the favourites.', ru: 'Выберите коробку, достаньте диск, смотрите трейлер. На полке 50+ игр — вот самые популярные.' },
  'shelf.players': { az: 'oyunçu', en: 'players', ru: 'игроков' },
  'shelf.play': { az: 'Treyleri oynat', en: 'Play trailer', ru: 'Смотреть трейлер' },
  'shelf.prev': { az: 'Əvvəlki oyun', en: 'Previous game', ru: 'Предыдущая игра' },
  'shelf.next': { az: 'Növbəti oyun', en: 'Next game', ru: 'Следующая игра' },
  'shelf.games': { az: 'Oyunlar', en: 'Games', ru: 'Игры' },
  'shelf.loading': { az: 'Disk yüklənir…', en: 'Loading disc…', ru: 'Загрузка диска…' },
  'shelf.error': { az: 'Oyunları yükləmək alınmadı. Səhifəni yeniləyin.', en: 'Could not load the games. Please refresh the page.', ru: 'Не удалось загрузить игры. Обновите страницу.' },
  'shelf.onScreen': { az: 'Ekranda', en: 'On screen', ru: 'На экране' },
  'shelf.case': { az: 'qutusu', en: 'case', ru: 'коробка' },
  'trailer.label': { az: 'treyleri', en: 'trailer', ru: 'трейлер' },
  'trailer.close': { az: 'Treyleri bağla', en: 'Close trailer', ru: 'Закрыть трейлер' },
  'trailer.official': { az: 'rəsmi treyler', en: 'official trailer', ru: 'официальный трейлер' },

  // hall
  'hall.lead': { az: 'Pultu götür. Oxlar oyunu dəyişir, ✕ treyleri ekranda oynadır, ○ geri qaytarır. Aşağıdakı kartriclərlə ilan, tetris və kərpic oynaya bilərsiniz.', en: 'Grab the controller. Arrows switch games, ✕ plays the trailer on screen, ○ goes back. Use the cartridges below to play Snake, Tetris and Breakout.', ru: 'Возьмите геймпад. Стрелки меняют игру, ✕ запускает трейлер, ○ — назад. Картриджи ниже — Змейка, Тетрис и Арканоид.' },
  'hall.grab': { az: 'Pultu götür', en: 'Pick it up', ru: 'Взять геймпад' },
  'hall.play': { az: 'Treyleri oynat', en: 'Play trailer', ru: 'Смотреть трейлер' },
  'hall.shelf': { az: 'Rəf', en: 'Shelf', ru: 'Полка' },
  'hall.hint.game': { az: 'oyun', en: 'game', ru: 'игра' },
  'hall.hint.info': { az: 'məlumat', en: 'info', ru: 'инфо' },
  'hall.hint.random': { az: 'təsadüfi', en: 'random', ru: 'случайно' },
  'hall.hint.list': { az: 'siyahı', en: 'list', ru: 'список' },
  'hall.hint.book': { az: 'bron', en: 'book', ru: 'бронь' },
  'hall.hint.back': { az: 'geri', en: 'back', ru: 'назад' },
  'hall.carts': { az: 'Pultda oyna', en: 'Play on the controller', ru: 'Играть на геймпаде' },
  'hall.snake': { az: 'İlan', en: 'Snake', ru: 'Змейка' },
  'hall.tetris': { az: 'Tetris', en: 'Tetris', ru: 'Тетрис' },
  'hall.breakout': { az: 'Kərpic', en: 'Breakout', ru: 'Арканоид' },
  'hall.score': { az: 'Xal', en: 'Score', ru: 'Очки' },
  'hall.best': { az: 'Rekord', en: 'Best', ru: 'Рекорд' },
  'hall.over': { az: 'Oyun bitdi', en: 'Game over', ru: 'Игра окончена' },
  'hall.again': { az: '✕ yenidən  ○ çıxış', en: '✕ again  ○ exit', ru: '✕ заново  ○ выход' },
  'hall.paused': { az: 'Fasilə', en: 'Paused', ru: 'Пауза' },
  'hall.start': { az: '✕ ilə başla', en: 'Press ✕ to start', ru: 'Нажмите ✕' },
  'hall.ctrl.snake': { az: 'Oxlar — istiqamət', en: 'Arrows — steer', ru: 'Стрелки — направление' },
  'hall.ctrl.tetris': { az: '◀ ▶ hərəkət, ▲ / ✕ fırlat, ▼ sürətli', en: '◀ ▶ move, ▲ / ✕ rotate, ▼ drop', ru: '◀ ▶ движение, ▲ / ✕ поворот, ▼ вниз' },
  'hall.ctrl.breakout': { az: '◀ ▶ altlığı hərəkət etdir', en: '◀ ▶ move the paddle', ru: '◀ ▶ двигать платформу' },
  'hall.keys.switch': { az: 'oyunu dəyiş', en: 'switch game', ru: 'сменить игру' },
  'hall.keys.cross': { az: 'treyler / təsdiq', en: 'trailer / confirm', ru: 'трейлер / ок' },
  'hall.keys.circle': { az: 'geri', en: 'back', ru: 'назад' },
  'hall.keys.square': { az: 'təsadüfi oyun', en: 'random game', ru: 'случайная игра' },
  'hall.keys.triangle': { az: 'oyun haqqında', en: 'about the game', ru: 'об игре' },
  'hall.keys.select': { az: 'bütün rəf', en: 'whole shelf', ru: 'вся полка' },
  'hall.keys.start': { az: 'bron et', en: 'book', ru: 'бронь' },
  'hall.btn.up': { az: 'Yuxarı', en: 'Up', ru: 'Вверх' },
  'hall.btn.down': { az: 'Aşağı', en: 'Down', ru: 'Вниз' },
  'hall.btn.left': { az: 'Sol', en: 'Left', ru: 'Влево' },
  'hall.btn.right': { az: 'Sağ', en: 'Right', ru: 'Вправо' },
  'hall.btn.ls': { az: 'Sol stik — əvvəlki', en: 'Left stick — previous', ru: 'Левый стик — назад' },
  'hall.btn.rs': { az: 'Sağ stik — növbəti', en: 'Right stick — next', ru: 'Правый стик — далее' },

  // dining
  'dn.title1': { az: 'Masanız', en: 'Your table', ru: 'Ваш стол' },
  'dn.title2': { az: 'hazırdır', en: 'is ready', ru: 'готов' },
  'dn.sub': { az: 'Bakıda 3 filial, 34 VIP kabinet və hər gün, 7/24 açıq mətbəx.', en: '3 branches in Baku, 34 VIP cabins and a kitchen open every day, 24/7.', ru: '3 филиала в Баку, 34 VIP-кабинки и кухня, открытая 24/7.' },
  'dn.beat': { az: 'Şam yanır, steyk isti, yeriniz hazırdır.', en: 'Candles lit, steak hot, your seat is waiting.', ru: 'Свечи горят, стейк горячий, место ждёт.' },
  'dn.endTitle': { az: 'Bu axşam nə yeyirik?', en: "What's for dinner tonight?", ru: 'Что на ужин сегодня?' },
  'dn.endText': { az: 'Menyunu restoranda olduğu kimi vərəqləyin — səhifə-səhifə.', en: 'Leaf through the menu just like at the table — page by page.', ru: 'Листайте меню как в ресторане — страница за страницей.' },
  'dn.menuCta': { az: 'Menyu ilə tanış ol', en: 'Explore the menu', ru: 'Посмотреть меню' },
  'dn.roomsTitle': { az: 'Hər axşam üçün bir otaq', en: 'A room for every evening', ru: 'Зал для любого вечера' },
  'dn.roomsSub': { az: 'Hər filialda eyni yeddi məkan. Açarı seçin, qalanını biz hazırlayaq.', en: 'The same seven spaces in every branch. Pick a key, we will handle the rest.', ru: 'Одни и те же семь пространств в каждом филиале. Выберите ключ — остальное за нами.' },
  'dn.teaserTitle': { az: '56 səhifəlik menyu', en: 'A 56-page menu', ru: 'Меню на 56 страниц' },
  'dn.teaserText': { az: 'Şorbalardan çay dəstgahına qədər {n}-dən çox təam və içki. Səhifələri sürüşdürərək çevirin, ya da siyahıda axtarın.', en: 'More than {n} dishes and drinks, from soups to tea sets. Scroll to turn the pages, or search the list.', ru: 'Более {n} блюд и напитков — от супов до чайных сетов. Листайте страницы или ищите в списке.' },
  'dn.picksTitle': { az: 'Şefin seçdikləri', en: "Chef's picks", ru: 'Выбор шефа' },
  'dn.fullMenu': { az: 'Bütün menyu', en: 'Full menu', ru: 'Всё меню' },
  'dn.branchesTitle': { az: 'Sizi gözləyən üç ünvan', en: 'Three addresses waiting for you', ru: 'Три адреса ждут вас' },

  // menu
  'menu.view': { az: 'Menyu görünüşü', en: 'Menu view', ru: 'Вид меню' },
  'menu.book': { az: 'Kitab', en: 'Book', ru: 'Книга' },
  'menu.list': { az: 'Siyahı', en: 'List', ru: 'Список' },
  'menu.title': { az: 'Menyu', en: 'Menu', ru: 'Меню' },
  'menu.hint': { az: 'Aşağı sürüşdürün — səhifələr çevrilsin. Səhifəyə toxunsanız böyüdə bilərsiniz.', en: 'Scroll down to turn the pages. Tap a page to enlarge it.', ru: 'Листайте вниз — страницы перевернутся. Нажмите на страницу, чтобы увеличить.' },
  'menu.cover': { az: 'Üz qabığı', en: 'Front cover', ru: 'Обложка' },
  'menu.backCover': { az: 'Arxa qabıq', en: 'Back cover', ru: 'Задняя обложка' },
  'menu.page': { az: 'Səhifə', en: 'Page', ru: 'Страница' },
  'menu.sections': { az: 'Menyu bölmələri', en: 'Menu sections', ru: 'Разделы меню' },
  'menu.enlarge': { az: 'böyüt', en: 'enlarge', ru: 'увеличить' },
  'menu.search': { az: 'Axtar: plov, pizza, çay…', en: 'Search: pilaf, pizza, tea…', ru: 'Поиск: плов, пицца, чай…' },
  'menu.searchLabel': { az: 'Menyuda axtar', en: 'Search the menu', ru: 'Поиск по меню' },
  'menu.all': { az: 'Hamısı', en: 'All', ru: 'Все' },
  'menu.empty': { az: '“{q}” üzrə heç nə tapılmadı. Başqa söz yoxlayın və ya “Hamısı”nı seçin.', en: 'Nothing found for “{q}”. Try another word or choose “All”.', ru: 'По запросу «{q}» ничего не найдено. Попробуйте другое слово или выберите «Все».' },
  'menu.service': { az: 'Hesabınıza 10% xidmət haqqı əlavə olunur.', en: 'A 10% service charge is added to your bill.', ru: 'К счёту добавляется 10% за обслуживание.' },
  'menu.soundOn': { az: 'Vərəqləmə səsini aç', en: 'Turn page sound on', ru: 'Включить звук страниц' },
  'menu.soundOff': { az: 'Vərəqləmə səsini bağla', en: 'Turn page sound off', ru: 'Выключить звук страниц' },
  'menu.backTo': { az: 'Dining-ə qayıt', en: 'Back to Dining', ru: 'Назад в Dining' },
  'menu.aria': { az: 'Menyu kitabı', en: 'Menu book', ru: 'Книга меню' },

  // branches
  'br.text': { az: 'Dəqiq saat və boş yer üçün filiala birbaşa yazın. Hamısı 7/24 açıqdır.', en: 'Message the branch directly for exact availability. All open 24/7.', ru: 'Пишите в филиал напрямую, чтобы уточнить наличие мест. Все открыты 24/7.' },
  'br.open': { az: 'Açıqdır', en: 'Open', ru: 'Открыто' },
  'br.map': { az: 'Xəritə', en: 'Map', ru: 'Карта' },
  'br.msgGame': { az: 'Salam! LaLiga Game Center {b} filialında stansiya bron etmək istəyirəm.', en: 'Hi! I would like to book a station at LaLiga Game Center {b}.', ru: 'Здравствуйте! Хочу забронировать станцию в LaLiga Game Center {b}.' },
  'br.msgDining': { az: 'Salam! LaLiga Dining & Lounge {b} filialında masa bron etmək istəyirəm.', en: 'Hi! I would like to reserve a table at LaLiga Dining & Lounge {b}.', ru: 'Здравствуйте! Хочу забронировать стол в LaLiga Dining & Lounge {b}.' },

  // reserve
  'rs.title': { az: 'Bron et', en: 'Book', ru: 'Бронь' },
  'rs.venue': { az: 'Məkan', en: 'Venue', ru: 'Заведение' },
  'rs.branch': { az: 'Filial', en: 'Branch', ru: 'Филиал' },
  'rs.date': { az: 'Tarix', en: 'Date', ru: 'Дата' },
  'rs.time': { az: 'Saat', en: 'Time', ru: 'Время' },
  'rs.people': { az: 'Nəfər sayı', en: 'Guests', ru: 'Гостей' },
  'rs.less': { az: 'Azalt', en: 'Fewer', ru: 'Меньше' },
  'rs.more': { az: 'Artır', en: 'More', ru: 'Больше' },
  'rs.station': { az: 'oyun stansiyası', en: 'gaming station', ru: 'игровую станцию' },
  'rs.table': { az: 'masa', en: 'table', ru: 'стол' },
  'rs.msg': { az: 'Salam! LaLiga {b} filialında {p} nəfərlik {w} bron etmək istəyirəm{d}, saat {t}.', en: 'Hi! I would like to book a {w} for {p} at LaLiga {b}{d}, at {t}.', ru: 'Здравствуйте! Хочу забронировать {w} на {p} чел. в LaLiga {b}{d}, в {t}.' },
  'rs.send': { az: 'WhatsApp ilə göndər', en: 'Send via WhatsApp', ru: 'Отправить в WhatsApp' },
  'rs.call': { az: 'və ya zəng edin', en: 'or call', ru: 'или позвоните' },
  'rs.note': { az: 'Filial komandası vaxtı və yeri təsdiqləyib sizə yazacaq.', en: 'The branch team will confirm the time and spot.', ru: 'Команда филиала подтвердит время и место.' },

  // footer
  'ft.tagline': { az: 'Bir brend, iki dünya. 2016-dan bəri Bakıda oyun gecələri və səmimi süfrələr.', en: 'One brand, two worlds. Game nights and warm tables in Baku since 2016.', ru: 'Один бренд, два мира. Игровые вечера и душевные застолья в Баку с 2016 года.' },
  'ft.venues': { az: 'Məkanlar', en: 'Venues', ru: 'Заведения' },
  'ft.branches': { az: 'Filiallar', en: 'Branches', ru: 'Филиалы' },
  'ft.follow': { az: 'Bizi izləyin', en: 'Follow us', ru: 'Мы в соцсетях' },
  'ft.gcBranches': { az: 'Game Center — 8 filial', en: 'Game Center — 8 branches', ru: 'Game Center — 8 филиалов' },
  'ft.dnBranches': { az: 'Dining — 3 filial', en: 'Dining — 3 branches', ru: 'Dining — 3 филиала' },
  'ft.copy': { az: '© 2026 LaLiga — Improve Group, Bakı', en: '© 2026 LaLiga — Improve Group, Baku', ru: '© 2026 LaLiga — Improve Group, Баку' },
  'ft.hours': { az: 'Hər gün, 7/24', en: 'Every day, 24/7', ru: 'Каждый день, 24/7' },

  // titles
  'title.home': { az: 'LaLiga · Game Center & Dining Lounge', en: 'LaLiga · Game Center & Dining Lounge', ru: 'LaLiga · Game Center & Dining Lounge' },
  'title.menu': { az: 'Menyu · LaLiga Dining & Lounge', en: 'Menu · LaLiga Dining & Lounge', ru: 'Меню · LaLiga Dining & Lounge' },
} satisfies Record<string, L>

export type Key = keyof typeof D

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (k: Key, vars?: Record<string, string | number>) => string
  tr: (l: L) => string
}

const I18n = createContext<Ctx>({ lang: 'az', setLang: () => {}, t: (k) => D[k].az, tr: (l) => l.az })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(KEY, l) } catch { /* storage blocked */ }
  }, [])

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang,
    t: (k, vars) => {
      let s: string = D[k]?.[lang] ?? D[k]?.az ?? k
      if (vars) for (const [a, b] of Object.entries(vars)) s = s.replaceAll(`{${a}}`, String(b))
      return s
    },
    tr: (l) => l[lang] ?? l.az,
  }), [lang, setLang])

  return <I18n.Provider value={value}>{children}</I18n.Provider>
}

export const useI18n = () => useContext(I18n)
