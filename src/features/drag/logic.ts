import { LIBRARY } from '@/features/shelf/config'
import { moveBook } from '@/lib/placement'
import type { SlotPosition } from '@/types/library'

/**
 * Regras do arrastar e soltar (funções puras, testáveis sem navegador).
 */

type Positioned = { id: string; position: SlotPosition }

const sameShelf = (a: SlotPosition, b: SlotPosition) =>
  a.bookcase === b.bookcase && a.shelf === b.shelf

/** Quantos livros há numa prateleira, sem contar o que está sendo arrastado. */
export function countOnShelf(
  books: Positioned[],
  target: SlotPosition,
  ignoreId?: string,
) {
  return books.filter((b) => b.id !== ignoreId && sameShelf(b.position, target))
    .length
}

/** A prateleira de destino está cheia para este livro? (Reorganizar na mesma pode.) */
export function isBlocked(
  books: Positioned[],
  id: string,
  target: SlotPosition,
) {
  const moving = books.find((b) => b.id === id)
  if (!moving || sameShelf(moving.position, target)) return false
  return countOnShelf(books, target, id) >= LIBRARY.slotsPerShelf
}

/**
 * Como a estante fica durante o arraste: o livro já aparece no lugar onde
 * cairia e os vizinhos abrem espaço. Sem destino (ou bloqueado), nada muda.
 */
export function arrange<T extends Positioned>(
  books: T[],
  id: string | undefined,
  target: SlotPosition | null,
): T[] {
  if (!id || !target || isBlocked(books, id, target)) return books
  const result = moveBook(books, id, target)
  return result.ok ? result.books : books
}

/** Qual slot fica sob a coordenada x de uma prateleira (0..16). */
export function slotIndexFromX(x: number, left: number, width: number) {
  const pitch = width / LIBRARY.slotsPerShelf
  const index = Math.floor((x - left) / pitch)
  return Math.min(LIBRARY.slotsPerShelf - 1, Math.max(0, index))
}

/** Prateleiras numeradas em sequência: estante 0 = 0..3, estante 1 = 4..7... */
const shelfNumber = ({ bookcase, shelf }: SlotPosition) =>
  bookcase * LIBRARY.shelvesPerBookcase + shelf

const fromShelfNumber = (n: number) => ({
  bookcase: Math.floor(n / LIBRARY.shelvesPerBookcase),
  shelf: n % LIBRARY.shelvesPerBookcase,
})

const TOTAL_SHELVES = LIBRARY.bookcases * LIBRARY.shelvesPerBookcase

/**
 * Movimento pelo teclado.
 * ←/→ andam na prateleira; ↑/↓ trocam de prateleira (passando de uma estante
 * para a próxima). A posição nunca passa do fim da fila de livros.
 */
export function keyboardStep(
  books: Positioned[],
  id: string,
  current: SlotPosition,
  key: string,
): SlotPosition | null {
  const lastIndex = (pos: SlotPosition) =>
    Math.min(countOnShelf(books, pos, id), LIBRARY.slotsPerShelf - 1)

  if (key === 'ArrowLeft')
    return { ...current, slot: Math.max(0, current.slot - 1) }
  if (key === 'ArrowRight')
    return { ...current, slot: Math.min(lastIndex(current), current.slot + 1) }

  if (key === 'ArrowUp' || key === 'ArrowDown') {
    const n = shelfNumber(current) + (key === 'ArrowUp' ? -1 : 1)
    if (n < 0 || n >= TOTAL_SHELVES) return current
    const next = { ...fromShelfNumber(n), slot: 0 }
    return { ...next, slot: Math.min(current.slot, lastIndex(next)) }
  }
  return null
}
