import { useMemo } from 'react'
import { useDrag } from '@/features/drag/dragStore'
import { arrange, isBlocked } from '@/features/drag/logic'
import { useLibrary } from '@/store/library'
import { LIBRARY, range } from './config'
import { Slot } from './Slot'

type ShelfProps = {
  bookcase: number
  shelf: number
  debug: boolean
}

/**
 * Uma prateleira: a fileira de slots apoiada numa tábua.
 * As medidas usam "cqw" (% da largura da estante), então tudo escala junto,
 * da estante em tela cheia até a miniatura da visão geral.
 *
 * Durante um arraste, mostra a prévia: o livro já no lugar onde cairia e os
 * vizinhos afastados (ver features/drag/logic.ts).
 */
export function Shelf({ bookcase, shelf, debug }: ShelfProps) {
  const books = useLibrary((s) => s.books)
  const activeId = useDrag((s) => s.active?.bookId)
  const target = useDrag((s) => s.target)

  const shelfBooks = useMemo(
    () =>
      arrange(books, activeId, target).filter(
        (b) => b.position.bookcase === bookcase && b.position.shelf === shelf,
      ),
    [books, activeId, target, bookcase, shelf],
  )

  const isTargetShelf = target?.bookcase === bookcase && target?.shelf === shelf
  const blocked =
    !!activeId &&
    !!target &&
    isTargetShelf &&
    isBlocked(books, activeId, target)

  return (
    <div>
      <div
        data-shelf={`${bookcase}-${shelf}`}
        className={`grid grid-cols-17 items-end gap-[0.4cqw] px-[2cqw] pt-[3cqw] transition-colors duration-200 ${
          blocked ? 'bg-red-700/25' : ''
        }`}
      >
        {range(LIBRARY.slotsPerShelf).map((slot) => (
          <Slot
            key={slot}
            position={{ bookcase, shelf, slot }}
            book={shelfBooks.find((b) => b.position.slot === slot)}
            debug={debug}
            dragging={!!activeId}
            isDropTarget={!!activeId && !blocked && isTargetShelf}
          />
        ))}
      </div>
      {/* Tábua da prateleira: fica na frente dos livros (z-index maior que o dos slots) */}
      <div
        className={`relative z-20 h-[2.5cqw] shadow-[0_0.8cqw_1.2cqw_rgb(0_0_0/0.45)] transition-colors duration-200 ${
          blocked ? 'bg-red-900' : 'bg-wood-700'
        }`}
      />
    </div>
  )
}
