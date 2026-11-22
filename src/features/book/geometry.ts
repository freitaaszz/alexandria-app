import type { Book } from '@/types/book'

/**
 * Tamanho do livro dentro do slot, em % da largura/altura do slot.
 * O slot tem a proporção de um livro grosso (2:11); livros finos ocupam menos.
 */

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

const lerp = (from: number, to: number, t: number) => from + (to - from) * t

/** Hash simples para variações estáveis (o mesmo livro sempre igual). */
export function hashString(value: string) {
  let hash = 2166136261
  for (const char of value)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return (hash >>> 0) / 4294967295 // 0..1
}

export const MIN_WIDTH = 45
export const MAX_WIDTH = 100
export const MIN_HEIGHT = 80
export const MAX_HEIGHT = 100

type Shape = Pick<Book, 'id' | 'pageCount' | 'dimensions'>

/** Largura (espessura) em % do slot: pela espessura real ou pelo nº de páginas. */
export function spineWidth({ id, pageCount, dimensions }: Shape) {
  if (dimensions?.thickness) {
    // 0,6 cm (bem fino) até 5 cm (tijolão)
    const t = clamp((dimensions.thickness - 0.6) / (5 - 0.6), 0, 1)
    return Math.round(lerp(MIN_WIDTH, MAX_WIDTH, t))
  }
  if (pageCount) {
    // 80 páginas até 900+ páginas
    const t = clamp((pageCount - 80) / (900 - 80), 0, 1)
    return Math.round(lerp(MIN_WIDTH, MAX_WIDTH, t))
  }
  return Math.round(lerp(60, 80, hashString(`${id}w`)))
}

/** Altura em % do slot: pela altura real ou uma variação leve. */
export function spineHeight({ id, dimensions }: Shape) {
  if (dimensions?.height) {
    // 17 cm (bolso) até 28 cm (grande)
    const t = clamp((dimensions.height - 17) / (28 - 17), 0, 1)
    return Math.round(lerp(MIN_HEIGHT, MAX_HEIGHT, t))
  }
  return Math.round(lerp(86, 97, hashString(`${id}h`)))
}
