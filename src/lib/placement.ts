import { LIBRARY } from '@/features/shelf/config'
import type { SlotPosition } from '@/types/library'

/**
 * Regras de posicionamento dos livros.
 * Os livros de uma prateleira ficam SEMPRE juntos, a partir da esquerda (slots 0, 1, 2...).
 * Colocar um livro no meio empurra o resto; tirar um fecha o buraco.
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

const shelfKey = ({ bookcase, shelf }: SlotPosition) => `${bookcase}-${shelf}`

/** Agrupa os livros por prateleira, na ordem em que estão. */
function groupByShelf<T extends Positioned>(books: T[]) {
  const shelves = new Map<string, T[]>()
  for (const book of books) {
    const key = shelfKey(book.position)
    shelves.set(key, [...(shelves.get(key) ?? []), book])
  }
  for (const list of shelves.values()) {
    list.sort((a, b) => a.position.slot - b.position.slot)
  }
  return shelves
}

/** Renumera os slots de uma prateleira para 0, 1, 2... (sem buracos). */
const packShelf = <T extends Positioned>(
  list: T[],
  bookcase: number,
  shelf: number,
): T[] =>
  list.map((book, slot) =>
    book.position.bookcase === bookcase &&
    book.position.shelf === shelf &&
    book.position.slot === slot
      ? book
      : { ...book, position: { bookcase, shelf, slot } },
  )

/** Junta os livros à esquerda em todas as prateleiras (corrige buracos). */
export function normalize<T extends Positioned>(books: T[]): T[] {
  const result: T[] = []
  for (const list of groupByShelf(books).values()) {
    const { bookcase, shelf } = list[0].position
    result.push(...packShelf(list, bookcase, shelf))
  }
  return result
}

/** Onde entra um livro novo: no fim da primeira prateleira que tiver espaço. */
export function findFirstFreeSlot(books: Positioned[]): SlotPosition | null {
  const counts = new Map<string, number>()
  for (const b of books)
    counts.set(
      shelfKey(b.position),
      (counts.get(shelfKey(b.position)) ?? 0) + 1,
    )

  for (let bookcase = 0; bookcase < LIBRARY.bookcases; bookcase++) {
    for (let shelf = 0; shelf < LIBRARY.shelvesPerBookcase; shelf++) {
      const count = counts.get(`${bookcase}-${shelf}`) ?? 0
      if (count < LIBRARY.slotsPerShelf) return { bookcase, shelf, slot: count }
    }
  }
  return null
}

/**
 * Move um livro para uma posição.
 * - O livro entra na posição pedida e o resto da prateleira anda para a direita.
 * - Se a posição estiver depois do último livro, ele fica no fim (junto dos outros).
 * - A prateleira de onde ele saiu fecha o buraco.
 * - Prateleira cheia: recusa livro vindo de outra prateleira ("shelf-full").
 */
export function moveBook<T extends Positioned>(
  books: T[],
  id: string,
  to: SlotPosition,
): MoveResult<T> {
  if (!isInBounds(to)) return { ok: false, reason: 'out-of-bounds' }
  const moving = books.find((b) => b.id === id)
  if (!moving) return { ok: false, reason: 'not-found' }

  const from = moving.position
  const shelves = groupByShelf(books.filter((b) => b.id !== id))

  const target = shelves.get(shelfKey(to)) ?? []
  if (target.length >= LIBRARY.slotsPerShelf) {
    return { ok: false, reason: 'shelf-full' }
  }

  const index = Math.min(to.slot, target.length)
  shelves.set(shelfKey(to), [
    ...target.slice(0, index),
    moving,
    ...target.slice(index),
  ])

  const changed = new Map<string, T>()
  for (const { bookcase, shelf } of [from, to]) {
    const list = shelves.get(shelfKey({ bookcase, shelf, slot: 0 })) ?? []
    for (const book of packShelf(list, bookcase, shelf))
      changed.set(book.id, book)
  }

  return { ok: true, books: books.map((b) => changed.get(b.id) ?? b) }
}

/** Remove um livro e fecha o buraco na prateleira. */
export function removeBook<T extends Positioned>(books: T[], id: string): T[] {
  const removed = books.find((b) => b.id === id)
  if (!removed) return books
  const { bookcase, shelf } = removed.position
  const rest = books.filter((b) => b.id !== id)
  const sameShelf = rest
    .filter(
      (b) => b.position.bookcase === bookcase && b.position.shelf === shelf,
    )
    .sort((a, b) => a.position.slot - b.position.slot)
  const packed = new Map(
    packShelf(sameShelf, bookcase, shelf).map((b) => [b.id, b]),
  )
  return rest.map((b) => packed.get(b.id) ?? b)
}
