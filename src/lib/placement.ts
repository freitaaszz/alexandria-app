import { LIBRARY } from '@/features/shelf/config'
import type { SlotPosition } from '@/types/library'

/**
 * Regras de posicionamento dos livros nos slots.
 * Funções puras (sem React, sem salvamento) para poderem ser testadas sozinhas.
 */

type Positioned = { id: string; position: SlotPosition }

export type MoveResult<T> =
  | { ok: true; books: T[] }
  | { ok: false; reason: 'not-found' | 'out-of-bounds' | 'shelf-full' }

export const isInBounds = ({ bookcase, shelf, slot }: SlotPosition) =>
  Number.isInteger(bookcase) &&
  Number.isInteger(shelf) &&
  Number.isInteger(slot) &&
  bookcase >= 0 &&
  bookcase < LIBRARY.bookcases &&
  shelf >= 0 &&
  shelf < LIBRARY.shelvesPerBookcase &&
  slot >= 0 &&
  slot < LIBRARY.slotsPerShelf

const sameShelf = (a: SlotPosition, b: SlotPosition) =>
  a.bookcase === b.bookcase && a.shelf === b.shelf

/** Primeiro slot livre, lendo estante por estante, de cima para baixo, da esquerda para a direita. */
export function findFirstFreeSlot(books: Positioned[]): SlotPosition | null {
  const taken = new Set(
    books.map(
      (b) => `${b.position.bookcase}-${b.position.shelf}-${b.position.slot}`,
    ),
  )
  for (let bookcase = 0; bookcase < LIBRARY.bookcases; bookcase++) {
    for (let shelf = 0; shelf < LIBRARY.shelvesPerBookcase; shelf++) {
      for (let slot = 0; slot < LIBRARY.slotsPerShelf; slot++) {
        if (!taken.has(`${bookcase}-${shelf}-${slot}`))
          return { bookcase, shelf, slot }
      }
    }
  }
  return null
}

/**
 * Move um livro para um slot.
 * - Slot vazio: o livro vai direto para lá.
 * - Slot ocupado: o livro entra ali e os vizinhos andam um lugar para a direita
 *   até o primeiro buraco. Se não houver buraco à direita, andam para a esquerda.
 * - Prateleira sem nenhum buraco: recusa ("shelf-full").
 */
export function moveBook<T extends Positioned>(
  books: T[],
  id: string,
  to: SlotPosition,
): MoveResult<T> {
  if (!isInBounds(to)) return { ok: false, reason: 'out-of-bounds' }
  const moving = books.find((b) => b.id === id)
  if (!moving) return { ok: false, reason: 'not-found' }

  // Tira o livro do lugar antigo antes de calcular o novo (assim, dentro da mesma
  // prateleira, o lugar que ele deixou já conta como buraco).
  const others = books.filter((b) => b.id !== id)
  const occupied = new Map<number, T>()
  for (const b of others)
    if (sameShelf(b.position, to)) occupied.set(b.position.slot, b)

  const shifts = new Map<string, number>() // id do vizinho -> novo slot

  if (occupied.has(to.slot)) {
    let gap = -1
    for (let s = to.slot + 1; s < LIBRARY.slotsPerShelf; s++) {
      if (!occupied.has(s)) {
        gap = s
        break
      }
    }
    if (gap !== -1) {
      for (let s = to.slot; s < gap; s++) shifts.set(occupied.get(s)!.id, s + 1)
    } else {
      for (let s = to.slot - 1; s >= 0; s--) {
        if (!occupied.has(s)) {
          gap = s
          break
        }
      }
      if (gap === -1) return { ok: false, reason: 'shelf-full' }
      for (let s = gap + 1; s <= to.slot; s++)
        shifts.set(occupied.get(s)!.id, s - 1)
    }
  }

  return {
    ok: true,
    books: books.map((b) => {
      if (b.id === id) return { ...b, position: { ...to } }
      const slot = shifts.get(b.id)
      return slot === undefined
        ? b
        : { ...b, position: { ...b.position, slot } }
    }),
  }
}
