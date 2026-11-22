import type { CSSProperties } from 'react'
import type { Book } from '@/types/book'
import type { SlotPosition } from '@/types/library'
import { LIBRARY, VIEW, slotId } from './config'
import { ShelvedBook } from './ShelvedBook'

type SlotProps = {
  position: SlotPosition
  book?: Book
  debug: boolean
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
 * No modo debug, o slot vazio aparece pontilhado.
 */
export function Slot({ position, book, debug }: SlotProps) {
  const showOutline = debug && !book
  return (
    <div
      data-slot={slotId(position)}
      style={perspectiveStyle(position)}
      className={`group relative flex aspect-[2/11] items-end justify-center rounded-[0.3cqw] ${
        showOutline
          ? 'outline-1 -outline-offset-1 outline-parchment/25 outline-dashed'
          : ''
      }`}
    >
      {book && <ShelvedBook book={book} />}
    </div>
  )
}
