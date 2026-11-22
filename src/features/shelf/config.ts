import type { SlotPosition } from '@/types/library'

/** Tamanho da biblioteca. Mudar aqui muda o layout inteiro. */
export const LIBRARY = {
  bookcases: 3,
  shelvesPerBookcase: 4,
  slotsPerShelf: 17,
} as const

/**
 * Ponto de vista do 3D dos livros (ajuste fino do "3D mas não tanto").
 * - perspective: maior = 3D mais sutil.
 * - eyeShelf: altura do olho, em prateleiras (0 = topo; 1.5 = entre a 2ª e a 3ª).
 * - slotPitch / shelfPitch: distância entre slots / prateleiras, em % do tamanho do slot.
 */
export const VIEW = {
  perspective: '260cqw',
  eyeShelf: 1.5,
  slotPitch: 108,
  shelfPitch: 120,
} as const

/** Gera [0, 1, ..., n-1] para renderizar listas de tamanho fixo. */
export const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Id estável de um slot, ex.: "0-2-16". Será usado pelo arrastar e soltar. */
export const slotId = ({ bookcase, shelf, slot }: SlotPosition) =>
  `${bookcase}-${shelf}-${slot}`
