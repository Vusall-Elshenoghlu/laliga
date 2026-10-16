/**
 * LaLiga Dining & Lounge menu — transcribed from "yeni menu dining" (PDF, 56 pages).
 * `page` is the PDF page number where the category starts; the flip-book jumps there.
 * `img` is a slug in /public/media/dishes (photos extracted from the same PDF).
 */
export type MenuItem = { az: string; en: string; desc?: string; price: number; img?: string }
export type MenuCategory = { id: string; az: string; en: string; page: number; kind: 'food' | 'drink'; items: MenuItem[] }

type Row = [az: string, en: string, price: number, desc?: string, img?: string]
const rows = (r: Row[]): MenuItem[] => r.map(([az, en, price, desc, img]) => ({ az, en, price, desc, img }))

export const SERVICE_NOTE = 'Hesabınıza 10% xidmət haqqı əlavə olunur.'

export const menu: MenuCategory[] = [
  {
    id: 'sorbalar', az: 'Şorbalar', en: 'Soups', page: 4, kind: 'food',
    items: rows([
      ['Mərci şorbası', 'Lentil Soup', 5, 'Qırmızı mərcimək, kök, kərə yağı, nanə, limon, suxarı', 'merci'],
      ['Şabalıd şorbası', 'Chestnut Soup', 9, 'Şabalıd, qaymaq, soğan, kartof, kərə yağı', 'sabalid'],
      ['Göbələk şorbası', 'Mushroom Soup', 6, 'Göbələk, kartof, soğan, qaymaq, suxarı', 'gobelek-sorbasi'],
      ['Pomidor şorbası', 'Tomato Soup', 6, 'Pomidor, qaymaq, kök, soğan, suxarı, qauda pendiri', 'pomidor-sorbasi'],
      ['Düşbərə', 'Dushbara', 6.9, 'Düşbərə xəmiri, dana əti, sirkə, nanə, suxarı', 'dusbere'],
      ['Toyuq şorbası', 'Chicken Soup', 6, 'Kənd çolpası, kartof, düyü, şüyüd, kərə yağı', 'toyuq-sorbasi'],
    ]),
  },
  {
    id: 'salatlar', az: 'Salatlar', en: 'Salads', page: 6, kind: 'food',
    items: rows([
      ['Toyuqlu Sezar salatı', 'Chicken Caesar Salad', 12, 'Toyuq filesi, çerri pomidoru, aysberq, parmezan, sezar sousu, suxarı', 'toyuqlu-sezar'],
      ['Krevetli Sezar salatı', 'Prawns Caesar Salad', 18, 'Krevet, çerri pomidoru, aysberq, parmezan, sezar sousu, suxarı', 'krevetli-sezar'],
      ['Kinoa salatı', 'Quinoa Salad', 8.5, 'Kinoa, kahı, alma, portağal, qoz, şirin qarğıdalı, küncüt, rukola', 'kinoa'],
      ['Laliga can əti salatı', 'Laliga Tenderloin Salad', 18, 'Can əti, qarışıq göyərti, rəngli bibər, qırmızı lobya, şirin çili sousu', 'can-eti-salati'],
      ['Xırçıltılı badımcan salatı', 'Crunchy Eggplant Salad', 8, 'Badımcan, kahı, lolorossa, çerri pomidoru, küncüt, şirin çili sousu', 'badimcan-salati'],
      ['Toyuqlu Kajun salatı', 'Cajun Chicken Salad', 11, 'Toyuq filesi, kajun ədviyyatı, aysberq, çerri, xiyar, kajun sousu', 'kajun'],
      ['Çoban salatı', 'Shepherd’s Salad', 6, 'Xiyar, pomidor, zeytun yağı, qarışıq göyərti, limon', 'coban'],
      ['Yunan salatı', 'Greek Salad', 7, 'Ağ pendir, pomidor, xiyar, rəngli bibər, qara zeytun, qırmızı soğan', 'yunan'],
      ['Tuna salatı', 'Tuna Salad', 9.5, 'Tuna, kahı, aysberq, qırmızı soğan, şirin qarğıdalı, çerri, xiyar', 'tuna'],
      ['Qızıl balıq salatı', 'Salmon Salad', 22, 'Qızıl balıq filesi, portağal, çerri, qarğıdalı, aysberq, narşərab', 'qizil-baliq-salati'],
      ['Krevetli popkorn salatı', 'Prawns Popcorn Salad', 15, 'Krevet, kahı, çerri, qarğıdalı, manqo sousu, parmezan', 'krevet-popkorn'],
      ['“Abşeron” salatı', '“Absheron” Salad', 8, 'Pomidor, zoğal əzməsi, albalı, ağ reyhan, ağ küncüt', 'abseron'],
      ['Toyuqlu popkorn salatı', 'Chicken Popcorn Salad', 11, 'Toyuq filesi, kahı, çerri, qarğıdalı, manqo sousu, parmezan', 'toyuq-popkorn'],
    ]),
  },
  {
    id: 'qelyanaltilar', az: 'Qəlyanaltılar', en: 'Appetizers', page: 11, kind: 'food',
    items: rows([
      ['Turşu çeşidləri', 'Assorted Pickles', 7, 'Qırmızı və ağ kələm, pomidor, xiyar, badımcan turşusu', 'tursu'],
      ['Pendir çeşidləri', 'Assorted Cheese', 12, 'Qauda, çeddar, ağ pendir, mozzarella, bal, qoz, ərik qurusu', 'pendir'],
      ['Toyuq naqqetsləri', 'Chicken Nuggets', 7.5, 'Toyuq filesi, özəl sous, çörək qırıntıları', 'naqqets'],
      ['Xırçıltılı badımcan', 'Crispy Eggplant', 5.5, 'Badımcan, qarğıdalı nişastası, şirin çili sousu', 'badimcan'],
      ['Mozzarella çubuqları', 'Mozzarella Sticks', 7.5, 'Mozzarella, çörək qırıntıları, şirin çili sousu', 'mozzarella'],
      ['Krevet tempura', 'Prawn Tempura', 15, 'Krevet, lolorossa, özəl sous, mikro göyərti', 'tempura'],
      ['Qovurmalı yumurta', 'Eggs Scrambled with Veal', 9.5, 'Dana əti, yumurta, kərə yağı', 'qovurmali-yumurta'],
      ['Sacda pomidor-yumurta (2 nəfərlik)', 'Eggs with Tomato on Iron Plate', 15, 'Pomidor, yumurta, kərə yağı', 'pomidor-yumurta'],
      ['Şumadinski', 'Shumadian-style Pancake', 11, 'Krep, toyuq filesi, göbələk, soğan, qaymaq, xama', 'sumadinski'],
    ]),
  },
  {
    id: 'burgerler', az: 'Sendviç və burgerlər', en: 'Sandwiches & Burgers', page: 14, kind: 'food',
    items: rows([
      ['Çizburger', 'Cheese Burger', 11.5, 'Dana əti, çeddar, pomidor, aysberq, özəl burger sousu', 'cizburger'],
      ['Laliga özəl burger', 'Laliga Special Burger', 13, 'Dana əti, karamelizə soğan, göbələk, şefdən özəl sous', 'ozel-burger'],
      ['Mini burger', 'Mini Burger', 12, 'Dana əti, pomidor, turşu xiyar, kahı, özəl sous', 'mini-burger'],
      ['Toyuq burger', 'Chicken Burger', 7.5, 'Toyuq filesi, pomidor, turşu xiyar, aysberq, kartof çipsi', 'toyuq-burger'],
      ['Şaurma', 'Shawarma', 6.5, 'Tortilla, toyuq filesi, turşu xiyar, özəl sous, kartof fri', 'saurma'],
      ['Laliga özəl şaurma', 'Laliga Special Shawarma', 6.5, 'Toyuq, kartof fri, mozzarella, ballı xardal, şirin çili sousu', 'ozel-saurma'],
      ['Sezar roll', 'Caesar Roll', 7.5, 'Toyuq filesi, aysberq, pomidor, sezar sousu, parmezan, lavaş', 'sezar-roll'],
      ['Klab sendviç', 'Club Sandwich', 9.5, 'Tost, toyuq filesi, yumurta, qauda, vetçina, mayonez', 'klab'],
      ['Laliga sendviç', 'Laliga Sandwich', 7.5, 'Tost, toyuq filesi, pomidor, qauda, vetçina, mayonez', 'laliga-sendvic'],
    ]),
  },
  {
    id: 'pizzalar', az: 'Pizzalar', en: 'Pizzas', page: 18, kind: 'food',
    items: rows([
      ['Barbekyu pizza', 'BBQ Pizza', 14, 'Toyuq filesi, pomidor, qara zeytun, mozzarella, barbekyu sousu', 'bbq'],
      ['Pizza Marqarita', 'Pizza Margherita', 9.9, 'Mozzarella, pizza sousu, aioli', 'marqarita'],
      ['Pizza Pollo', 'Pizza Pollo', 13.5, 'Toyuq filesi, göbələk, mozzarella, şirin qarğıdalı, pomidor', 'pollo'],
      ['Sezar pizza', 'Caesar Pizza', 15, 'Toyuq, sezar sousu, aysberq, parmezan, mozzarella, zeytun', 'sezar-pizza'],
      ['Pizza Pepperoni', 'Pizza Pepperoni', 15, 'Pepperoni, mozzarella, pizza sousu, aioli', 'pepperoni'],
      ['Laliga özəl pizza', 'Laliga Special Pizza', 17, 'Toyuq, pepperoni, qarğıdalı, zeytun, göbələk, rəngli bibər', 'ozel-pizza'],
      ['Havay pizza', 'Hawaiian Pizza', 15, 'Mozzarella, ananas, vetçina, jalapeno, sarımsaq', 'hawaii'],
      ['Krevetli pizza', 'Prawns Pizza', 16, 'Mozzarella, krevet, jalapeno, sarımsaq, aioli', 'krevet-pizza'],
      ['Vegetarian pizza', 'Vegetarian Pizza', 15, 'Pomidor, zeytun, rəngli bibər, göbələk, marinad qarğıdalı', 'vegetarian'],
      ['Qovurmalı pizza', 'Sautéed Veal Pizza', 18, 'Dana qovurması, qırmızı soğan, sarımsaq, jalapeno', 'qovurmali-pizza'],
    ]),
  },
  {
    id: 'pastalar', az: 'Pastalar', en: 'Pastas', page: 23, kind: 'food',
    items: rows([
      ['Tagliatelle Alfredo', 'Tagliatelle Alfredo', 16, 'Toyuq, göbələk, qaymaq, pesto, parmezan, ağ reyhan', 'alfredo'],
      ['Spagetti Bolonez', 'Spaghetti Bolognese', 15, 'Dana qiyməsi, bolonez sousu, parmezan', 'bolonez'],
      ['Penne Da Vinçi', 'Penne Da Vinci', 13, 'Toyuq, göbələk, rəngli bibər, pesto, qaymaq, parmezan', 'da-vinci'],
      ['Penne Arabiata', 'Penne Arrabbiata', 9.5, 'Özəl arabiata sousu, parmezan', 'arabiata'],
      ['Can əti ilə nudel', 'Noodles with Tenderloin', 25, 'Can əti, nudel, zəncəfil, teriyaki, soya və şirin çili sousu', 'nudel'],
    ]),
  },
  {
    id: 'esas', az: 'Əsas yeməklər', en: 'Main Courses', page: 25, kind: 'food',
    items: rows([
      ['Cordon Bleu', 'Cordon Bleu', 14, 'Toyuq filesi, vetçina, qauda, göbələk, özəl sous', 'cordon'],
      ['Toyuq fajita', 'Chicken Fajita', 18, 'Toyuq, rəngli bibər, ədviyyat, xama, lavaş', 'toyuq-fajita'],
      ['Can əti fajita', 'Tenderloin Fajita', 24, 'Can əti, rəngli bibər, ədviyyat, xama, lavaş', 'can-fajita'],
      ['Göbələkli toyuq filesi', 'Chicken Fillet with Mushroom', 17, 'Göbələk sousu, xırda kartof, şabalıd', 'gobelekli-toyuq'],
      ['Göbələkli toyuqlu krep', 'Mushroom Chicken Crepe', 14, 'Krep, toyuq, göbələk, qaymaq, mozzarella', 'krep'],
      ['Can əti Stroqanof', 'Tenderloin Stroganoff', 26, 'Can əti, göbələk, qaymaq, kəndsayağı kartof', 'stroqanof'],
      ['Hellim pendirli can əti ruleti', 'Tenderloin Rolls with Halloumi', 26, 'Can əti, hellim, ispanaq, brokoli, gül kələm', 'hellim'],
      ['Toyuq şnitzel', 'Chicken Schnitzel', 14, 'Toyuq filesi, kartof fri, şirin çili sousu', 'snitzel'],
      ['Laliga özəl plov', 'Laliga Special Pilaf', 15, 'Dana əti, tərəvəzli düyü, rəngli bibər, kərə yağı', 'plov'],
      ['Toyuq ruleti', 'Chicken Roll', 15, 'Toyuq, qoz, zirinc, nar turşusu, düyü', 'toyuq-ruleti'],
      ['Qızıl balıq steyk', 'Salmon Steak', 25, 'Qızıl balıq, kartof püresi, demiqlas sousu', 'salmon'],
      ['Livansayağı toyuq filesi', 'Lebanese Chicken', 15, 'Toyuq, qauda, tərəvəzli düyü, brokoli', 'livan'],
      ['Səbzi plov', 'Sabzi Pilaf', 14, 'Dana əti, düyü, albuxara, göyərti, zirinc', 'sebzi'],
      ['Can əti medalyon', 'Medallion of Tenderloin', 26, 'Can əti, demiqlas sousu, xırda kartof, şabalıd', 'medalyon'],
      ['Göbələkli ət qovurma', 'Roasted Veal with Mushroom', 20, 'Dana əti, göbələk, kartof, demiqlas sousu', 'qovurma'],
      ['Güvəcdə krevetlər', 'Baked Prawns in Clay Pot', 18, 'Krevet, rəngli bibər, sarımsaq, soya sousu', 'guvec-krevet'],
      ['Can əti güvəcdə', 'Baked Tenderloin in Clay Pot', 28, 'Can əti, nar əzməsi, göbələk, qoz, mozzarella', 'guvec-can'],
      ['Tava kababı', 'Pan-Fried Kebab', 13.5, 'Dana əti, quzu quyruğu, badımcan, pomidor, yumurta', 'tava'],
      ['“Övrüştə” kənd cücəsi ilə', '“Ovrushte” with Village Chicken', 18, 'Kənd çolpası, şabalıd, soğan, nar əzməsi', 'ovruste'],
      ['Portağallı toyuq', 'Chicken with Orange', 12, 'Toyuq filesi, portağal, düyü, kərə yağı', 'portagal'],
      ['Ət köftə', 'Veal Meatball', 15, 'Dana əti, kimyon, qırmızı lobya, düyü, acı bibər', 'kofte'],
      ['Toyuq sacı (2 nəfərlik)', 'Chicken Saj (2-person)', 20, 'Toyuq, göbələk, badımcan, kartof, pomidor, lavaş', 'toyuq-saci'],
      ['Cücə tabaka', 'Grilled Chicken', 20, 'Kənd çolpası, kəndsayağı kartof, xüsusi sous', 'tabaka'],
      ['Can əti sacı (2 nəfərlik)', 'Tenderloin Saj (2-person)', 32, 'Can əti, göbələk, badımcan, kartof, pomidor, lavaş', 'can-saci'],
    ]),
  },
  {
    id: 'qarnirler', az: 'Qarnirlər', en: 'Garnishes', page: 32, kind: 'food',
    items: rows([
      ['Kartof fri', 'French Fries', 4, 'Ketçup, mayonez', 'fri'],
      ['Düyü', 'Boiled Rice', 3, 'Qaynadılmış uzun düyü', 'duyu'],
      ['Almadilim kartof', 'Potato Wedges', 5, 'Ketçup, mayonez', 'wedges'],
    ]),
  },
  {
    id: 'desertler', az: 'Desertlər', en: 'Desserts', page: 33, kind: 'food',
    items: rows([
      ['Karamelli tort', 'Caramel Cake', 8.5, 'Karamel, biskvit, banan, qaymaq', 'karamel'],
      ['Laliga özəl tort', 'Laliga Special Cake', 8.5, 'Beze, qoz, qaymaq, xüsusi biskvit', 'ozel-tort'],
      ['Ballı tort', 'Honey Cake', 8.5, 'Bal, alman qaymağı, xama', 'balli'],
      ['Çiyələkli çizkeyk', 'Strawberry Cheesecake', 8.5, 'Kremette pendiri, vanil, çiyələk siropu', 'ciyelek-cizkeyk'],
      ['Dondurma (150 q)', 'Ice-Cream (150 g)', 6, undefined, 'dondurma'],
      ['Qarağatlı çizkeyk', 'Currant Cheesecake', 8.5, 'Kremette pendiri, vanil, qarağat siropu', 'qaragat'],
    ]),
  },
  {
    id: 'cerezler', az: 'Çərəzlər', en: 'Snacks', page: 35, kind: 'food',
    items: rows([
      ['Badam', 'Almond', 10], ['Qarışıq ləbləbi', 'Mixed Nuts', 12], ['Qara kişmiş', 'Black Raisins', 6],
      ['Qarışıq quru meyvələr', 'Mixed Dried Fruits', 12], ['Meyvə assorti', 'Mixed Fruits', 15], ['“Naxçıvan” sucuğu', '“Nakhchivan” Sweet Sujuk', 7],
      ['Xurma', 'Dates', 8], ['Fındıq halvası', 'Hazelnut Halva', 8], ['Plitka şokolad', 'Chocolate Bar', 6], ['Püstə', 'Pistachios', 10],
      ['Çips', 'Chips', 6], ['Fındıq', 'Hazelnuts', 8], ['Günəbaxan tumu', 'Sunflower Seeds', 5], ['Qoz ləpəsi', 'Walnuts', 8], ['Snickers', 'Snickers', 4],
    ]),
  },
  {
    id: 'murebbeler', az: 'Mürəbbələr', en: 'Jams', page: 36, kind: 'food',
    items: rows([
      ['Laliga özəl', 'Laliga Special', 8], ['Ağ gilas', 'White Cherry', 7], ['Qara gilas', 'Red Cherry', 7], ['Çiyələk', 'Strawberry', 7],
      ['Bounty', 'Bounty', 9], ['Snickers', 'Snickers', 9], ['Kokos', 'Coconut', 9], ['Albalı', 'Cherry', 7], ['Qoz ləpəsi', 'Walnut Kernels', 9],
      ['Qoz', 'Walnut', 9], ['Qarpız', 'Watermelon', 7], ['Zeytun', 'Olive', 7], ['Heyva', 'Quince', 7], ['Badam', 'Almond', 9], ['Armud', 'Pear', 9], ['Gavalı', 'Plum', 7],
    ]),
  },
  {
    id: 'caylar', az: 'Çaylar', en: 'Teas', page: 37, kind: 'drink',
    items: rows([
      ['Qara çay', 'Black Tea', 7], ['Lənkəran çayı', 'Lankaran Tea', 10], ['Jasmin çayı', 'Jasmine Tea', 10],
      ['Barbaris çayı', 'Barbaris Tea', 10], ['Samovarda çay', 'Samovar Tea', 20],
      ['Çaytikanı və marakuya', 'Sea Buckthorn & Passion Fruit', 12, 'İsti çay kokteyli'],
      ['Mərakeş çayı', 'Moroccan Tea', 12, 'Darçın, mixək, badyan, təzə nanə, yaşıl çay'],
      ['Zəncəfil və nanə', 'Ginger & Mint Tea', 12, 'Təzə zəncəfil, təzə nanə, yaşıl çay'],
      ['Giləmeyvə çayı', 'Berries Tea', 12, 'Qarışıq giləmeyvə, yaşıl çay, limon'],
    ]),
  },
  {
    id: 'cay-desti', az: 'Çay dəstgahları', en: 'Tea Sets', page: 39, kind: 'drink',
    items: rows([
      ['Bürünc çay seti', '“Bronze” Tea Set', 23, 'İki çaynik çay, iki növ mürəbbə, limon, nabat, snickers'],
      ['Gümüş çay seti', '“Silver” Tea Set', 41, 'Üç çaynik çay, iki növ mürəbbə, ləbləbi, quru meyvə, fındıq halvası'],
      ['Qızıl çay seti', '“Gold” Tea Set', 65, 'Samovarda çay, mürəbbə, quru meyvə, tort və şirniyyat, “Naxçıvan” sucuğu'],
    ]),
  },
  {
    id: 'qehveler', az: 'Qəhvələr', en: 'Coffees', page: 42, kind: 'drink',
    items: rows([
      ['Espresso', 'Espresso', 3], ['İkiqat espresso', 'Double Espresso', 5], ['Amerikano', 'Americano', 5], ['Kappuçino', 'Cappuccino', 6],
      ['Latte', 'Coffee Latte', 7], ['Makiato', 'Macchiato', 7], ['Raf kofe', 'Raf Coffee', 7], ['“Şəkərbura” kofe', '“Shekerbura” Coffee', 8, 'Əzilmiş fındıq, qaymaq, hil siropu'],
      ['“Makadamia” raf', '“Macadamia” Raf', 8], ['İsti şokolad', 'Hot Chocolate', 8], ['Qlisse', 'Glisse', 8], ['Soyuq Amaretto', 'Cold Amaretto', 8], ['Soyuq qəhvə', 'Iced Coffee', 7],
    ]),
  },
  {
    id: 'seykler', az: 'Südlü şeyklər', en: 'Milkshakes', page: 45, kind: 'drink',
    items: rows([['Bananlı', 'Banana', 9], ['Şokoladlı', 'Chocolate', 9], ['Marakuya', 'Passion Fruit', 9], ['Çiyələkli', 'Strawberry', 9], ['Vanilli', 'Vanilla', 9]]),
  },
  {
    id: 'kokteyller', az: 'Kokteyllər', en: 'Cocktails', page: 46, kind: 'drink',
    items: rows([
      ['Sweet Bite', 'Sweet Bite', 9, 'Təzə çiyələk, ananas, manqo siropu'], ['Laliga Fruktum', 'Laliga Fructum', 9, 'Xiyar, aloe, marakuya, qırmızı qarağat'],
      ['Malum Uvam', 'Malum Uvam', 9, 'Feyxoa, vanil, alma şirəsi'], ['Mohito', 'Mojito', 8], ['Çiyələkli mohito', 'Strawberry Mojito', 9], ['Enerji mohito', 'Mojito Energy', 14, 'Red Bull ilə'],
    ]),
  },
  {
    id: 'limonadlar', az: 'Evsayağı limonadlar', en: 'Homemade Lemonades', page: 48, kind: 'drink',
    items: rows([
      ['Çiyələk', 'Strawberry', 8], ['Tərxun', 'Tarragon', 8], ['Armud', 'Pear', 8], ['Alma və kivi', 'Apple & Kiwi', 9], ['Aqava', 'Agave', 8],
      ['Giləmeyvə və vanil', 'Berry & Vanilla', 9], ['Manqo və marakuya', 'Mango & Passion Fruit', 8], ['Qreypfrut və aloe', 'Grapefruit & Aloe', 8], ['Feyxoa və mohito', 'Feijoa & Mojito', 8],
    ]),
  },
  {
    id: 'soyuq-caylar', az: 'Evsayağı soyuq çaylar', en: 'Homemade Iced Teas', page: 51, kind: 'drink',
    items: rows([['Limon', 'Lemon', 6.5], ['Şaftalı', 'Peach', 6.5], ['Manqo', 'Mango', 6.5], ['Moruq-quarana', 'Raspberry Guarana', 8], ['Manqo və marakuya', 'Mango & Passion Fruit', 8]]),
  },
  {
    id: 'sireler', az: 'Meyvə şirələri', en: 'Juices', page: 52, kind: 'drink',
    items: rows([
      ['Alma / Portağal / Ananas', 'Apple / Orange / Pineapple', 3.5], ['Albalı / Şaftalı / Qarışıq', 'Cherry / Peach / Mixed', 3.5],
      ['Təzə portağal', 'Fresh Orange', 8], ['Təzə alma', 'Fresh Apple', 7], ['Təzə qreypfrut', 'Fresh Grapefruit', 10], ['Təzə ananas', 'Fresh Pineapple', 15], ['Təzə kök', 'Fresh Carrot', 5],
    ]),
  },
  {
    id: 'soyuq-ickiler', az: 'Soyuq içkilər', en: 'Soft Drinks', page: 53, kind: 'drink',
    items: rows([
      ['Coca-Cola / Fanta / Sprite / Pepsi 0.33 l', 'Soft drink 0.33 l', 4], ['Bizon 0.25 l', 'Bizon 0.25 l', 4], ['Red Bull 0.25 l', 'Red Bull 0.25 l', 8],
      ['Limonad 0.5 l (Düşes, Tərxun)', 'Lemonade 0.5 l', 5], ['Kompot 1 l', 'Compote 1 l', 7], ['Sarıkız 0.25 l', 'Sarıkız 0.25 l', 4],
      ['Sirab 0.5 l', 'Sirab 0.5 l', 3.5], ['Meyvə şirəsi 1 l', 'Fruit Juice 1 l', 10], ['Fuse Tea 0.33 l', 'Fuse Tea 0.33 l', 4], ['Ayran', 'Ayran', 2.5],
    ]),
  },
]

export const MENU_PAGES = 56
export const pageSrc = (n: number) => `/media/menu/p${String(n).padStart(2, '0')}.webp`
export const thumbSrc = (n: number) => `/media/menu/thumbs/p${String(n).padStart(2, '0')}.webp`
export const dishSrc = (slug: string) => `/media/dishes/${slug}.webp`
export const fmtPrice = (p: number) => `${p.toFixed(2).replace(/\.00$/, '')} ₼`
