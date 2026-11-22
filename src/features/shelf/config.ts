import type { SlotPosition } from '@/types/library'

/** Tamanho da biblioteca. Mudar aqui muda o layout inteiro. */
export const LIBRARY = {
  bookcases: 3,
  shelvesPerBookcase: 4,
  slotsPerShelf: 17,
} as const

/** Gera [0, 1, ..., n-1] para renderizar listas de tamanho fixo. */
export const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Id estável de um slot, ex.: "0-2-16". Será usado pelo arrastar e soltar. */
export const slotId = ({ bookcase, shelf, slot }: SlotPosition) =>
  `${bookcase}-${shelf}-${slot}`
