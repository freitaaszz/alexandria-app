import type { CSSProperties } from 'react'
import { useDrag } from '@/features/drag/dragStore'
import type { Book } from '@/types/book'
import type { SlotPosition } from '@/types/library'
import { LIBRARY, VIEW, slotId } from './config'
import { ShelvedBook } from './ShelvedBook'

type SlotProps = {
  position: SlotPosition
  book?: Book
  debug: boolean
  /** Algum livro está sendo arrastado: os slots aparecem. */
  dragging: boolean
  /** Esta prateleira é o destino atual (e aceita o livro). */
  isDropTarget: boolean
}

const CENTER = (LIBRARY.slotsPerShelf - 1) / 2

/**
 * Perspectiva de cada slot, apontada para o mesmo "olho" (centro da estante).
 * Livros à esquerda do olho mostram um pouco da capa; à direita, da contracapa;
 * nas prateleiras de baixo aparece o topo das páginas.
 * A ordem de empilhamento faz o vizinho mais perto do centro cobrir a lateral.
 */
function perspectiveStyle({ shelf, slot }: SlotPosition): CSSProperties {
  return {
    perspective: VIEW.perspective,
    perspectiveOrigin: `${50 + (CENTER - slot) * VIEW.slotPitch}% ${
      50 + (VIEW.eyeShelf - shelf) * VIEW.shelfPitch
    }%`,
    zIndex: Math.round(LIBRARY.slotsPerShelf - Math.abs(slot - CENTER) * 2),
  }
}

/**
 * Um lugar para um livro. A proporção (2:11) é a de uma lombada grossa.
 * - Vazio: pontilhado no modo debug ou durante um arraste ("os slots aparecem").
 * - Destino do arraste: brilha onde o livro vai cair.
 */
export function Slot({
  position,
  book,
  debug,
  dragging,
  isDropTarget,
}: SlotProps) {
  const holdsDragged = useDrag(
    (s) => !!book && s.active?.bookId === book.id && !s.dropping,
  )

  const outline = holdsDragged
    ? isDropTarget
      ? 'outline-2 -outline-offset-2 outline-ember bg-ember/15 shadow-[0_0_2.5cqw_rgb(232_180_90/0.45)]'
      : ''
    : !book && dragging
      ? 'outline-1 -outline-offset-1 outline-parchment/45 outline-dashed'
      : !book && debug
        ? 'outline-1 -outline-offset-1 outline-parchment/25 outline-dashed'
        : ''

  return (
    <div
      data-slot={slotId(position)}
      style={perspectiveStyle(position)}
      className={`group relative flex h-full items-end justify-center rounded-[0.3cqw] transition-[background-color,box-shadow] duration-150 ${outline}`}
    >
      {book && <ShelvedBook book={book} />}
    </div>
  )
}
