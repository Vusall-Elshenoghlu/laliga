import { useState, type ImgHTMLAttributes } from 'react'

type Props = ImgHTMLAttributes<HTMLImageElement> & { fallbacks?: string[] }

/** <img> that walks through fallback URLs when the primary source 404s. */
export default function SmartImg({ src, fallbacks = [], onError, ...rest }: Props) {
  const list = [src, ...fallbacks].filter(Boolean) as string[]
  const [i, setI] = useState(0)
  return (
    <img
      {...rest}
      src={list[i]}
      onError={(e) => {
        if (i < list.length - 1) setI(i + 1)
        else if (onError) onError(e)
        else (e.target as HTMLImageElement).style.visibility = 'hidden'
      }}
    />
  )
}

export const BRAND = {
  emblem: '/media/brand/laliga-emblem.png',
  emblemRemote: 'https://laliga.az/media/logos/laliga-emblem.png',
  /** last-resort placeholder if neither local nor remote logo loads */
  emblemSvg: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g stroke='%2305040a' stroke-width='3'><path d='M50 4 L74 28 L50 52 L26 28Z' fill='%232470e6'/><path d='M96 50 L72 74 L48 50 L72 26Z' fill='%23e8412f'/><path d='M50 96 L26 72 L50 48 L74 72Z' fill='%23f7c41c'/><path d='M4 50 L28 26 L52 50 L28 74Z' fill='%232cb24d'/></g><circle cx='50' cy='50' r='9' fill='%23f1f0f7'/></svg>",
  wordmark: '/media/brand/laliga-wordmark-white.png',
  wordmarkRemote: 'https://laliga.az/media/logos/laliga-wordmark-white.png',
}
