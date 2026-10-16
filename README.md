# LaLiga — Game Center & Dining Lounge (konsept)

React + TypeScript + Vite, animasiyalar GSAP (ScrollTrigger) və Lenis (yumşaq scroll) ilə.

## İşə salmaq

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ qovluğuna production build
```

`npm run dev` və `npm run build` əvvəlcə `scripts/fetch-media.mjs`-i işə salır: LaLiga loqosunu və oyun qutularının şəkillərini
laliga.az-dan `public/media/brand` və `public/media/games` qovluqlarına yükləyir (bir dəfə). İnternet yoxdursa, sayt avtomatik olaraq
canlı laliga.az linklərinə, o da olmasa sadə placeholder-ə keçir.

## Səhifələr (route-lar)

| Route | Nə var |
|---|---|
| `/` | Yan-yana iki panel: solda Game Center, sağda Dining & Lounge. Əvvəl şəkil, hover-də video oynayır. Klikdə panel bütün ekranı tutur və uyğun route açılır. Altda loyallıq kartı bölməsi. |
| `/game-center` | Scroll ilə idarə olunan hero: disk qutusu yaxınlaşır, qapaq açılır, disk çıxır (281 kadr, canvas). Sonra **Oyun rəfi** — disk slider (ox düymələri, sürüşdürmə, klaviatura ←/→), hər diskdə **Treyleri oynat** (YouTube, rəsmi treyler). Game Hall təqdimatı, bron addımları, 8 filial. |
| `/game-center/hall` | Konsol şəkli: oyunlar konsolun ekranında. D-pad / stiklər oyunu dəyişir, **A** treyleri ekranda oynadır, **B** geri, **X** təsadüfi oyun, **Y** məlumat, **SELECT** bütün rəf (grid), **START** bron. Klaviatura ilə də işləyir. |
| `/dining` | Scroll hero (restoran videosu kadr-kadr), sonda **Menyu ilə tanış ol** düyməsi. Otaqlar (otel açarı stilində), şefin seçdikləri, 3 filial. |
| `/dining/menu` | **Kitab** rejimi: scroll etdikcə menyu kitabı açılır, səhifələr 3D çevrilir (56 səhifə, real PDF-dən). Sağda bölmələr — klikdə həmin səhifəyə keçir; səhifəyə toxunanda böyüyür. **Siyahı** rejimi: axtarış + kateqoriyalar + yeməklərin şəkilləri. |

Navbar hər iki dünyada eyni quruluşdadır, amma linklər, şrift və rəng dünyaya görə dəyişir (Game: oyun rəfi / Game Hall / filiallar; Dining: menyu / otaqlar / filiallar). "Bron et" düyməsi filial seçib WhatsApp-a hazır mesaj göndərir.

## v2 yenilikləri

- **Dil dəyişməsi (AZ / EN / RU)** — navbarda. Seçim brauzerdə yadda qalır. Mətnlər `src/lib/i18n.tsx`-dədir; menyu adlarının rusca tərcüməsi və tərkiblərin lüğəti `src/data/menu-i18n.ts`-dədir.
- **Oyun rəfi** — aşağıdakı disklər düz dayanan PS5 tipli qutulardadır. Qutuya klik edəndə qutu qalxır, qapağı açılır, disk düz yuxarı çıxır və qapaq bağlanır; disk ortaya uçur, əvvəlki disk öz qutusuna qayıdıb içinə düşür. "Treyleri oynat" basanda konsol çıxır, disk yuvaya girir, işıq yanır, sonra treyler açılır; bağlayanda disk geri çıxır.
- **Pultu götür** — Game Center səhifəsində düyməyə basanda iki əl həmin pultu tutub ekranın ortasına qaldırır, sonra Game Hall açılır (Game Hall-da əl yoxdur).
- **Game Hall** — Düymələr PlayStation stilindədir (△ ○ ✕ □), d-pad hover-i oxun formasındadır. Pultun gövdəsindəki kartriclərlə ekranda **İlan, Tetris, Kərpic** oynamaq olar. Yuxarıda "Geri qayıt".
- **Menyu** səhifəsində "Dining-ə qayıt" düyməsi.

## Məlumatlar və servislər

Oyunlar artıq servis qatından gəlir — komponentlər birbaşa data faylını oxumur:

```
src/
  types/game.ts        Game tipi (UI-ın istifadə etdiyi forma)
  services/api.ts      fetch köməkçisi; baza URL-i .env-dəki VITE_API_URL
  services/games.ts    getGames(), getGame(id), GameDTO + mapGame(), statik oyun siyahısı
  hooks/useGames.ts    komponentlər üçün hook (loading / error / cache)
```

**Dinamikləşdirmək üçün:** `.env.example`-i `.env` kimi kopyalayın və `VITE_API_URL=https://api...` yazın.
`getGames()` onda `GET {VITE_API_URL}/games` çağıracaq. Backend cavabının sahə adları fərqlidirsə, yalnız
`services/games.ts`-dəki `GameDTO` tipini və `mapGame()` funksiyasını dəyişin — `DiscShelf`, `GameHall`,
`Disc`, `TrailerModal` toxunulmaz qalır. `VITE_API_URL` boş olanda statik siyahı işləyir.

- `src/data/branches.ts` — filiallar və telefonlar (laliga.az-dan).
- `src/data/menu.ts` — bütün menyu (PDF-dən köçürülüb), qiymətlər, yemək şəkilləri.

## Media (public/media)

- `home/` — hover videoları (sıxılmış) və posterlər
- `game/seq/` və `dining/seq/` — scroll animasiyası üçün kadrlar (webp)
- `game/console.webp` — Game Hall konsolu
- `menu/` — menyu PDF-nin səhifələri, `dishes/` — PDF-dən çıxarılmış yemək şəkilləri

Kadrları yenidən yaratmaq üçün (ffmpeg):

```bash
ffmpeg -i video1.mp4 -i video2.mp4 -filter_complex "[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24[a];[1:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24[b];[a][b]concat=n=2:v=1[v]" -map "[v]" -c:v libwebp -quality 70 -start_number 0 public/media/game/seq/f_%03d.webp
```

Kadr sayı dəyişsə, `src/pages/GameCenter.tsx`-də `FRAMES` dəyərini yeniləyin.
