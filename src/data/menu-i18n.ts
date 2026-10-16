/**
 * Translations for the menu: Russian dish names (keyed by the Azerbaijani name)
 * and an ingredient dictionary used to translate the comma-separated descriptions.
 * Any word missing here simply stays in Azerbaijani.
 */
import type { Lang } from '../lib/i18n'

export const CATEGORY_RU: Record<string, string> = {
  sorbalar: 'Супы', salatlar: 'Салаты', qelyanaltilar: 'Закуски', burgerler: 'Сэндвичи и бургеры', pizzalar: 'Пиццы',
  pastalar: 'Паста', esas: 'Основные блюда', qarnirler: 'Гарниры', desertler: 'Десерты', cerezler: 'Снеки', murebbeler: 'Варенье',
  caylar: 'Чай', 'cay-desti': 'Чайные сеты', qehveler: 'Кофе', seykler: 'Молочные коктейли', kokteyller: 'Коктейли',
  limonadlar: 'Домашние лимонады', 'soyuq-caylar': 'Домашний холодный чай', sireler: 'Соки', 'soyuq-ickiler': 'Прохладительные напитки',
}

export const NAME_RU: Record<string, string> = {
  'Mərci şorbası': 'Чечевичный суп', 'Şabalıd şorbası': 'Каштановый суп', 'Göbələk şorbası': 'Грибной суп', 'Pomidor şorbası': 'Томатный суп',
  'Düşbərə': 'Дюшбара', 'Toyuq şorbası': 'Куриный суп',
  'Toyuqlu Sezar salatı': 'Цезарь с курицей', 'Krevetli Sezar salatı': 'Цезарь с креветками', 'Kinoa salatı': 'Салат с киноа',
  'Laliga can əti salatı': 'Салат Laliga с вырезкой', 'Xırçıltılı badımcan salatı': 'Салат с хрустящими баклажанами', 'Toyuqlu Kajun salatı': 'Салат каджун с курицей',
  'Çoban salatı': 'Пастуший салат', 'Yunan salatı': 'Греческий салат', 'Tuna salatı': 'Салат с тунцом', 'Qızıl balıq salatı': 'Салат с лососем',
  'Krevetli popkorn salatı': 'Салат с креветками попкорн', '“Abşeron” salatı': 'Салат «Абшерон»', 'Toyuqlu popkorn salatı': 'Салат с курицей попкорн',
  'Turşu çeşidləri': 'Ассорти соленьев', 'Pendir çeşidləri': 'Сырное ассорти', 'Toyuq naqqetsləri': 'Куриные наггетсы', 'Xırçıltılı badımcan': 'Хрустящие баклажаны',
  'Mozzarella çubuqları': 'Сырные палочки моцарелла', 'Krevet tempura': 'Креветки темпура', 'Qovurmalı yumurta': 'Яичница с говядиной',
  'Sacda pomidor-yumurta (2 nəfərlik)': 'Яичница с помидорами на садже (на 2)', 'Şumadinski': 'Шумадийский блин',
  'Çizburger': 'Чизбургер', 'Laliga özəl burger': 'Фирменный бургер Laliga', 'Mini burger': 'Мини-бургер', 'Toyuq burger': 'Куриный бургер', 'Şaurma': 'Шаурма',
  'Laliga özəl şaurma': 'Фирменная шаурма Laliga', 'Sezar roll': 'Цезарь ролл', 'Klab sendviç': 'Клаб-сэндвич', 'Laliga sendviç': 'Сэндвич Laliga',
  'Barbekyu pizza': 'Пицца барбекю', 'Pizza Marqarita': 'Пицца Маргарита', 'Pizza Pollo': 'Пицца Полло', 'Sezar pizza': 'Пицца Цезарь', 'Pizza Pepperoni': 'Пицца Пепперони',
  'Laliga özəl pizza': 'Фирменная пицца Laliga', 'Havay pizza': 'Гавайская пицца', 'Krevetli pizza': 'Пицца с креветками', 'Vegetarian pizza': 'Вегетарианская пицца',
  'Qovurmalı pizza': 'Пицца с жареной говядиной',
  'Tagliatelle Alfredo': 'Тальятелле Альфредо', 'Spagetti Bolonez': 'Спагетти Болоньезе', 'Penne Da Vinçi': 'Пенне Да Винчи', 'Penne Arabiata': 'Пенне Арабьята',
  'Can əti ilə nudel': 'Лапша с вырезкой',
  'Cordon Bleu': 'Кордон блю', 'Toyuq fajita': 'Фахитас с курицей', 'Can əti fajita': 'Фахитас с вырезкой', 'Göbələkli toyuq filesi': 'Куриное филе с грибами',
  'Göbələkli toyuqlu krep': 'Блин с курицей и грибами', 'Can əti Stroqanof': 'Бефстроганов из вырезки', 'Hellim pendirli can əti ruleti': 'Рулеты из вырезки с халлуми',
  'Toyuq şnitzel': 'Куриный шницель', 'Laliga özəl plov': 'Фирменный плов Laliga', 'Toyuq ruleti': 'Куриный рулет', 'Qızıl balıq steyk': 'Стейк из лосося',
  'Livansayağı toyuq filesi': 'Куриное филе по-ливански', 'Səbzi plov': 'Сабзи плов', 'Can əti medalyon': 'Медальоны из вырезки', 'Göbələkli ət qovurma': 'Жаркое из говядины с грибами',
  'Güvəcdə krevetlər': 'Креветки в горшочке', 'Can əti güvəcdə': 'Вырезка в горшочке', 'Tava kababı': 'Тава кебаб', '“Övrüştə” kənd cücəsi ilə': '«Оврушта» с деревенской курицей',
  'Portağallı toyuq': 'Курица с апельсином', 'Ət köftə': 'Мясные тефтели', 'Toyuq sacı (2 nəfərlik)': 'Садж с курицей (на 2)', 'Cücə tabaka': 'Цыплёнок табака',
  'Can əti sacı (2 nəfərlik)': 'Садж с вырезкой (на 2)',
  'Kartof fri': 'Картофель фри', 'Düyü': 'Рис', 'Almadilim kartof': 'Картофель дольками',
  'Karamelli tort': 'Карамельный торт', 'Laliga özəl tort': 'Фирменный торт Laliga', 'Ballı tort': 'Медовик', 'Çiyələkli çizkeyk': 'Клубничный чизкейк',
  'Dondurma (150 q)': 'Мороженое (150 г)', 'Qarağatlı çizkeyk': 'Смородиновый чизкейк',
  'Badam': 'Миндаль', 'Qarışıq ləbləbi': 'Ассорти орехов', 'Qara kişmiş': 'Чёрный изюм', 'Qarışıq quru meyvələr': 'Ассорти сухофруктов', 'Meyvə assorti': 'Фруктовое ассорти',
  '“Naxçıvan” sucuğu': 'Нахчыванский суджук', 'Xurma': 'Финики', 'Fındıq halvası': 'Ореховая халва', 'Plitka şokolad': 'Плитка шоколада', 'Püstə': 'Фисташки',
  'Çips': 'Чипсы', 'Fındıq': 'Фундук', 'Günəbaxan tumu': 'Семечки', 'Qoz ləpəsi': 'Грецкий орех', 'Snickers': 'Snickers',
  'Laliga özəl': 'Фирменное Laliga', 'Ağ gilas': 'Белая черешня', 'Qara gilas': 'Чёрная черешня', 'Çiyələk': 'Клубника', 'Bounty': 'Bounty', 'Kokos': 'Кокос',
  'Albalı': 'Вишня', 'Qoz': 'Грецкий орех', 'Qarpız': 'Арбуз', 'Zeytun': 'Оливка', 'Heyva': 'Айва', 'Armud': 'Груша', 'Gavalı': 'Слива',
  'Qara çay': 'Чёрный чай', 'Lənkəran çayı': 'Ленкоранский чай', 'Jasmin çayı': 'Жасминовый чай', 'Barbaris çayı': 'Барбарисовый чай', 'Samovarda çay': 'Чай в самоваре',
  'Çaytikanı və marakuya': 'Облепиха и маракуйя', 'Mərakeş çayı': 'Марокканский чай', 'Zəncəfil və nanə': 'Имбирь и мята', 'Giləmeyvə çayı': 'Ягодный чай',
  'Bürünc çay seti': 'Чайный сет «Бронза»', 'Gümüş çay seti': 'Чайный сет «Серебро»', 'Qızıl çay seti': 'Чайный сет «Золото»',
  'Espresso': 'Эспрессо', 'İkiqat espresso': 'Двойной эспрессо', 'Amerikano': 'Американо', 'Kappuçino': 'Капучино', 'Latte': 'Латте', 'Makiato': 'Макиато',
  'Raf kofe': 'Раф', '“Şəkərbura” kofe': 'Кофе «Шекербура»', '“Makadamia” raf': 'Раф «Макадамия»', 'İsti şokolad': 'Горячий шоколад', 'Qlisse': 'Глясе',
  'Soyuq Amaretto': 'Холодный амаретто', 'Soyuq qəhvə': 'Холодный кофе',
  'Bananlı': 'Банановый', 'Şokoladlı': 'Шоколадный', 'Marakuya': 'Маракуйя', 'Çiyələkli': 'Клубничный', 'Vanilli': 'Ванильный',
  'Sweet Bite': 'Sweet Bite', 'Laliga Fruktum': 'Laliga Фруктум', 'Malum Uvam': 'Malum Uvam', 'Mohito': 'Мохито', 'Çiyələkli mohito': 'Клубничный мохито', 'Enerji mohito': 'Энерджи мохито',
  'Tərxun': 'Тархун', 'Alma və kivi': 'Яблоко и киви', 'Aqava': 'Агава', 'Giləmeyvə və vanil': 'Ягоды и ваниль', 'Manqo və marakuya': 'Манго и маракуйя',
  'Qreypfrut və aloe': 'Грейпфрут и алоэ', 'Feyxoa və mohito': 'Фейхоа и мохито',
  'Limon': 'Лимон', 'Şaftalı': 'Персик', 'Manqo': 'Манго', 'Moruq-quarana': 'Малина-гуарана',
  'Alma / Portağal / Ananas': 'Яблоко / Апельсин / Ананас', 'Albalı / Şaftalı / Qarışıq': 'Вишня / Персик / Мультифрукт', 'Təzə portağal': 'Свежий апельсин',
  'Təzə alma': 'Свежее яблоко', 'Təzə qreypfrut': 'Свежий грейпфрут', 'Təzə ananas': 'Свежий ананас', 'Təzə kök': 'Свежая морковь',
  'Coca-Cola / Fanta / Sprite / Pepsi 0.33 l': 'Coca-Cola / Fanta / Sprite / Pepsi 0,33 л', 'Bizon 0.25 l': 'Bizon 0,25 л', 'Red Bull 0.25 l': 'Red Bull 0,25 л',
  'Limonad 0.5 l (Düşes, Tərxun)': 'Лимонад 0,5 л (Дюшес, Тархун)', 'Kompot 1 l': 'Компот 1 л', 'Sarıkız 0.25 l': 'Sarıkız 0,25 л', 'Sirab 0.5 l': 'Sirab 0,5 л',
  'Meyvə şirəsi 1 l': 'Сок 1 л', 'Fuse Tea 0.33 l': 'Fuse Tea 0,33 л', 'Ayran': 'Айран',
}

/** az ingredient (lower-case) → [en, ru] */
const ING: Record<string, [string, string]> = {
  'ağ pendir': ['white cheese', 'брынза'], 'badımcan': ['eggplant', 'баклажан'], 'bal': ['honey', 'мёд'], 'beze': ['meringue', 'безе'], 'can əti': ['tenderloin', 'вырезка'],
  'dana qiyməsi': ['veal mince', 'говяжий фарш'], 'dana qovurması': ['sautéed veal', 'жареная говядина'], 'dana əti': ['veal', 'говядина'], 'darçın': ['cinnamon', 'корица'],
  'düşbərə xəmiri': ['dushbara dough', 'тесто дюшбара'], 'feyxoa': ['feijoa', 'фейхоа'], 'göbələk': ['mushrooms', 'грибы'], 'göbələk sousu': ['mushroom sauce', 'грибной соус'],
  'karamel': ['caramel', 'карамель'], 'ketçup': ['ketchup', 'кетчуп'], 'kinoa': ['quinoa', 'киноа'], 'kremette pendiri': ['cremette cheese', 'сыр креметте'], 'krep': ['crepe', 'блин'],
  'krevet': ['prawns', 'креветки'], 'kənd çolpası': ['village chicken', 'деревенская курица'], 'mozzarella': ['mozzarella', 'моцарелла'], 'pepperoni': ['pepperoni', 'пепперони'],
  'pomidor': ['tomato', 'помидор'], 'qarışıq giləmeyvə': ['mixed berries', 'ягодный микс'], 'qauda': ['gouda', 'гауда'], 'qaynadılmış uzun düyü': ['boiled long-grain rice', 'отварной длиннозёрный рис'],
  'qırmızı mərcimək': ['red lentils', 'красная чечевица'], 'qırmızı və ağ kələm': ['red and white cabbage', 'красная и белая капуста'], 'qızıl balıq': ['salmon', 'лосось'],
  'qızıl balıq filesi': ['salmon fillet', 'филе лосося'], 'red bull ilə': ['with Red Bull', 'с Red Bull'], 'samovarda çay': ['tea in a samovar', 'чай в самоваре'], 'tortilla': ['tortilla', 'тортилья'],
  'tost': ['toast', 'тост'], 'toyuq': ['chicken', 'курица'], 'toyuq filesi': ['chicken fillet', 'куриное филе'], 'tuna': ['tuna', 'тунец'], 'təzə zəncəfil': ['fresh ginger', 'свежий имбирь'],
  'təzə çiyələk': ['fresh strawberries', 'свежая клубника'], 'xiyar': ['cucumber', 'огурец'], 'acı bibər': ['hot pepper', 'острый перец'], 'aioli': ['aioli', 'айоли'], 'albalı': ['cherry', 'вишня'],
  'albuxara': ['plum', 'алыча'], 'alma': ['apple', 'яблоко'], 'alma şirəsi': ['apple juice', 'яблочный сок'], 'alman qaymağı': ['German cream', 'немецкий крем'], 'aloe': ['aloe', 'алоэ'],
  'ananas': ['pineapple', 'ананас'], 'aysberq': ['iceberg', 'айсберг'], 'ağ küncüt': ['white sesame', 'белый кунжут'], 'ağ reyhan': ['white basil', 'белый базилик'], 'badyan': ['star anise', 'бадьян'],
  'badımcan turşusu': ['pickled eggplant', 'маринованный баклажан'], 'ballı xardal': ['honey mustard', 'медовая горчица'], 'banan': ['banana', 'банан'], 'barbekyu sousu': ['BBQ sauce', 'соус барбекю'],
  'biskvit': ['sponge', 'бисквит'], 'bolonez sousu': ['Bolognese sauce', 'соус болоньезе'], 'brokoli': ['broccoli', 'брокколи'], 'demiqlas sousu': ['demi-glace', 'демиглас'], 'düyü': ['rice', 'рис'],
  'fındıq halvası': ['hazelnut halva', 'ореховая халва'], 'göyərti': ['greens', 'зелень'], 'gül kələm': ['cauliflower', 'цветная капуста'], 'hellim': ['halloumi', 'халлуми'],
  'hil siropu': ['cardamom syrup', 'кардамоновый сироп'], 'iki növ mürəbbə': ['two kinds of jam', 'два вида варенья'], 'ispanaq': ['spinach', 'шпинат'], 'jalapeno': ['jalapeño', 'халапеньо'],
  'kahı': ['lettuce', 'салат'], 'kajun sousu': ['cajun sauce', 'соус каджун'], 'kajun ədviyyatı': ['cajun spice', 'специи каджун'], 'karamelizə soğan': ['caramelised onion', 'карамелизованный лук'],
  'kartof': ['potato', 'картофель'], 'kartof fri': ['french fries', 'картофель фри'], 'kartof püresi': ['mashed potato', 'картофельное пюре'], 'kartof çipsi': ['potato chips', 'чипсы'],
  'kimyon': ['cumin', 'зира'], 'kök': ['carrot', 'морковь'], 'küncüt': ['sesame', 'кунжут'], 'kəndsayağı kartof': ['potato wedges', 'картофель по-деревенски'], 'kərə yağı': ['butter', 'сливочное масло'],
  'lavaş': ['lavash', 'лаваш'], 'limon': ['lemon', 'лимон'], 'lolorossa': ['lollo rosso', 'лолло россо'], 'ləbləbi': ['nuts', 'орехи'], 'manqo siropu': ['mango syrup', 'сироп манго'],
  'manqo sousu': ['mango sauce', 'соус манго'], 'marakuya': ['passion fruit', 'маракуйя'], 'marinad qarğıdalı': ['marinated corn', 'маринованная кукуруза'], 'mayonez': ['mayonnaise', 'майонез'],
  'mikro göyərti': ['microgreens', 'микрозелень'], 'mixək': ['cloves', 'гвоздика'], 'mürəbbə': ['jam', 'варенье'], 'nabat': ['rock candy', 'набат'], 'nanə': ['mint', 'мята'],
  'nar turşusu': ['pomegranate pickle', 'гранатовый соус'], 'nar əzməsi': ['pomegranate paste', 'гранатовая паста'], 'narşərab': ['pomegranate syrup', 'наршараб'], 'nudel': ['noodles', 'лапша'],
  'parmezan': ['parmesan', 'пармезан'], 'pesto': ['pesto', 'песто'], 'pizza sousu': ['pizza sauce', 'соус для пиццы'], 'portağal': ['orange', 'апельсин'], 'qara zeytun': ['black olives', 'маслины'],
  'qarağat siropu': ['currant syrup', 'смородиновый сироп'], 'qarğıdalı': ['corn', 'кукуруза'], 'qarğıdalı nişastası': ['cornstarch', 'кукурузный крахмал'], 'qarışıq göyərti': ['mixed greens', 'микс зелени'],
  'qauda pendiri': ['gouda cheese', 'сыр гауда'], 'qaymaq': ['cream', 'сливки'], 'qoz': ['walnuts', 'грецкий орех'], 'quru meyvə': ['dried fruit', 'сухофрукты'], 'quzu quyruğu': ['lamb tail fat', 'курдюк'],
  'qırmızı lobya': ['red beans', 'красная фасоль'], 'qırmızı qarağat': ['red currant', 'красная смородина'], 'qırmızı soğan': ['red onion', 'красный лук'], 'rukola': ['arugula', 'руккола'],
  'rəngli bibər': ['bell pepper', 'болгарский перец'], 'sarımsaq': ['garlic', 'чеснок'], 'sezar sousu': ['Caesar sauce', 'соус цезарь'], 'sirkə': ['vinegar', 'уксус'], 'snickers': ['Snickers', 'Snickers'],
  'soya sousu': ['soy sauce', 'соевый соус'], 'soya və şirin çili sousu': ['soy and sweet chili sauce', 'соевый и сладкий чили соус'], 'soğan': ['onion', 'лук'], 'suxarı': ['croutons', 'сухарики'],
  'teriyaki': ['teriyaki', 'терияки'], 'tort və şirniyyat': ['cake and sweets', 'торт и сладости'], 'turşu xiyar': ['pickled cucumber', 'маринованный огурец'], 'tərəvəzli düyü': ['vegetable rice', 'рис с овощами'],
  'təzə nanə': ['fresh mint', 'свежая мята'], 'vanil': ['vanilla', 'ваниль'], 'vetçina': ['turkey ham', 'ветчина из индейки'], 'xama': ['sour cream', 'сметана'], 'xüsusi biskvit': ['special sponge', 'особый бисквит'],
  'xüsusi sous': ['special sauce', 'особый соус'], 'xırda kartof': ['diced potato', 'мелкий картофель'], 'yaşıl çay': ['green tea', 'зелёный чай'], 'yumurta': ['egg', 'яйцо'], 'zeytun': ['olives', 'оливки'],
  'zeytun yağı': ['olive oil', 'оливковое масло'], 'zirinc': ['barberry', 'барбарис'], 'zoğal əzməsi': ['cornelian cherry paste', 'кизиловая паста'], 'zəncəfil': ['ginger', 'имбирь'],
  'özəl arabiata sousu': ['house arrabbiata sauce', 'фирменный соус арабьята'], 'üç çaynik çay': ['three teapots of tea', 'три чайника чая'], 'çeddar': ['cheddar', 'чеддер'], 'çerri': ['cherry tomatoes', 'черри'],
  'çerri pomidoru': ['cherry tomatoes', 'помидоры черри'], 'çiyələk siropu': ['strawberry syrup', 'клубничный сироп'], 'çörək qırıntıları': ['breadcrumbs', 'панировка'], 'özəl burger sousu': ['house burger sauce', 'фирменный бургер-соус'],
  'özəl sous': ['house sauce', 'фирменный соус'], 'iki çaynik çay': ['two teapots of tea', 'два чайника чая'], 'isti çay kokteyli': ['hot tea cocktail', 'горячий чайный коктейль'], 'şabalıd': ['chestnut', 'каштан'],
  'şefdən özəl sous': ["chef's special sauce", 'соус от шефа'], 'şirin qarğıdalı': ['sweet corn', 'сладкая кукуруза'], 'şirin çili sousu': ['sweet chili sauce', 'сладкий чили соус'], 'şüyüd': ['dill', 'укроп'],
  'əzilmiş fındıq': ['crushed hazelnuts', 'дроблёный фундук'], 'ədviyyat': ['spices', 'специи'], 'ərik qurusu': ['dried apricots', 'курага'], '“naxçıvan” sucuğu': ['Nakhchivan sujuk', 'нахчыванский суджук'],
}

export function translateDesc(desc: string, lang: Lang): string {
  if (lang === 'az') return desc
  const i = lang === 'en' ? 0 : 1
  const parts = desc.split(', ').map((p) => ING[p.trim().toLocaleLowerCase('az')]?.[i] ?? p)
  const s = parts.join(', ')
  return s.charAt(0).toLocaleUpperCase() + s.slice(1)
}

export function itemName(i: { az: string; en: string }, lang: Lang) {
  if (lang === 'az') return i.az
  if (lang === 'en') return i.en
  return NAME_RU[i.az] ?? i.en
}

export function catName(c: { id: string; az: string; en: string }, lang: Lang) {
  if (lang === 'az') return c.az
  if (lang === 'en') return c.en
  return CATEGORY_RU[c.id] ?? c.en
}

/** secondary line under a dish name: the name in another language */
export function itemAlt(i: { az: string; en: string }, lang: Lang) {
  return lang === 'az' ? i.en : i.az
}
