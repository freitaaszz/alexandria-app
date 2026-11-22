import { SpinePlaceholder } from '@/features/book/SpinePlaceholder'
import type { Book } from '@/types/book'
import type { SlotPosition } from '@/types/library'
import { slotId } from './config'

type SlotProps = {
  position: SlotPosition
  book?: Book
  debug: boolean
}

/**
 * Um lugar para um livro. A proporção (2:11) é a de uma lombada.
 * No modo debug, o slot vazio aparece pontilhado.
 */
export function Slot({ position, book, debug }: SlotProps) {
  const showOutline = debug && !book
  return (
    <div
      data-slot={slotId(position)}
      className={`aspect-[2/11] rounded-[0.3cqw] ${
        showOutline
          ? 'outline-1 -outline-offset-1 outline-parchment/25 outline-dashed'
          : ''
      }`}
    >
      {book && <SpinePlaceholder book={book} />}
    </div>
  )
}
