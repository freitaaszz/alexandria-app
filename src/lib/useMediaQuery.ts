import { useSyncExternalStore } from 'react'

/** true enquanto a media query bater (ex.: "(min-width: 64rem)"). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** A partir desta largura (Tailwind "lg") o layout é de desktop. */
export const DESKTOP_QUERY = '(min-width: 64rem)'
