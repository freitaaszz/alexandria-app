import { LIBRARY } from '@/features/shelf/config'

/**
 * Medidas da estante 3D em metros, iguais às do modelo no Blender
 * (design/blender/escola-de-magia.blend).
 *
 * Eixos no Three.js (o glTF converte do Blender): X = direita, Y = cima,
 * Z = para fora da estante (na direção da câmera). A frente da estante fica em z = 0.
 */
export const BOOKCASE = {
  /** Distância entre os centros das estantes. */
  spacing: 1.42,
  /** Faixa horizontal dos 17 slots (entre as colunas). */
  slotsLeft: -0.5,
  slotsWidth: 1.0,
  /** Altura (y) onde os livros apoiam, de cima para baixo. */
  shelfFloors: [1.48, 1.045, 0.61, 0.175],
  /** Altura máxima de um livro. */
  bookMaxHeight: 0.34,
  /** Profundidade dos livros e quanto ficam recuados da frente. */
  bookDepth: 0.22,
  bookInset: 0.025,
} as const

export const SLOT_WIDTH = BOOKCASE.slotsWidth / LIBRARY.slotsPerShelf

/** Centro X de uma estante. */
export const bookcaseX = (bookcase: number) =>
  (bookcase - (LIBRARY.bookcases - 1) / 2) * BOOKCASE.spacing

/** Centro X de um slot dentro da cena. */
export const slotX = (bookcase: number, slot: number) =>
  bookcaseX(bookcase) + BOOKCASE.slotsLeft + SLOT_WIDTH * (slot + 0.5)
