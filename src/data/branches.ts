export type Branch = {
  id: string
  name: string
  street: string
  landmark: string
  phone: string
}

/** laliga.az/brands/laliga-game-center/branches */
export const gameBranches: Branch[] = [
  { id: 'genclik', name: 'Gənclik', street: 'Fətəli Xan Xoyski 85', landmark: 'Gənclik m/st yaxınlığı', phone: '+994 55 861 61 61' },
  { id: 'politexnik', name: 'Politexnik', street: 'Hüseyn Cavid 528', landmark: 'Texniki Universitetin qarşısı', phone: '+994 55 844 64 64' },
  { id: 'tibb', name: 'Tibb', street: 'Səməd Vurğun 192', landmark: 'Tibb Universitetinin yaxınlığı', phone: '+994 55 522 64 64' },
  { id: 'nizami', name: 'Nizami', street: 'Şıxəli Qurbanov 2', landmark: 'Nizami m/st, 5-ci mərtəbə', phone: '+994 55 865 64 64' },
  { id: 'tarqovi', name: 'Tarqovı', street: 'Nizami 66', landmark: 'Fəvvarələr meydanı', phone: '+994 55 532 64 64' },
  { id: 'icerisheher', name: 'İçərişəhər', street: 'Şeyx Şamil 3', landmark: 'İçərişəhər m/st yaxınlığı', phone: '+994 55 974 64 64' },
  { id: 'xalqlar', name: 'Xalqlar', street: 'Məhəmməd Hadi 136A', landmark: 'Xalqlar m/st yaxınlığı', phone: '+994 50 668 64 64' },
  { id: 'nerimanov', name: 'Nərimanov', street: 'Əhməd Rəcəbli 3V', landmark: 'Nərimanov m/st yaxınlığı', phone: '+994 55 441 64 64' },
]

/** laliga.az/brands/laliga-dining/branches */
export const diningBranches: Branch[] = [
  { id: 'elmler', name: 'Elmlər', street: 'Zahid Xəlilov 25B', landmark: 'Elmlər Akademiyası m/st yaxınlığı', phone: '+994 50 293 93 93' },
  { id: 'ehmedli', name: 'Əhmədli', street: 'Məhəmməd Hadi 9E', landmark: 'Əhmədli m/st yaxınlığı', phone: '+994 50 600 93 93' },
  { id: 'musabeyov', name: 'Musabəyov', street: 'Abdurrəhim bəy Haqverdiyev 62', landmark: 'Q. Musabəyov parkı', phone: '+994 50 300 93 93' },
]

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`

export const waHref = (phone: string, text: string) =>
  `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`

export const mapHref = (b: Branch) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`LaLiga ${b.street}, Bakı`)}`
