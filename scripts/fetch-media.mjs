// Pulls brand logos and game box-art from the live laliga.az into /public/media.
// Usage: npm run fetch:media   (runs automatically before `npm run dev` if files are missing)
import { mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'media')
const BASE = 'https://laliga.az/media'
const games = ['fc-fifa','mortal-kombat','tekken','ufc','call-of-duty','need-for-speed','gta-5','god-of-war-ragnarok','spider-man-2','elden-ring','horizon-forbidden-west','hogwarts-legacy','gran-turismo-7','f1-25','street-fighter-6','nba-2k','it-takes-two']
const jobs = [
  ['logos/laliga-emblem.png', 'brand/laliga-emblem.png'],
  ['logos/laliga-wordmark-white.png', 'brand/laliga-wordmark-white.png'],
  ...games.map((g) => [`showcase/game-center/${g}.png`, `games/${g}.png`]),
]

const exists = (p) => access(p).then(() => true, () => false)
let ok = 0, skipped = 0, failed = 0
for (const [src, dst] of jobs) {
  const out = join(root, dst)
  if (await exists(out)) { skipped++; continue }
  try {
    const res = await fetch(`${BASE}/${src}`)
    if (!res.ok) throw new Error(res.status)
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, Buffer.from(await res.arrayBuffer()))
    ok++
  } catch (e) {
    failed++
    console.warn(`  ✗ ${src} (${e.message}) — the site will fall back to the live URL`)
  }
}
console.log(`fetch:media — ${ok} downloaded, ${skipped} already present, ${failed} failed`)
