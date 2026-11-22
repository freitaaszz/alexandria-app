import { motion, useReducedMotion } from 'motion/react'
import { Book3D } from '@/features/book/Book3D'
import { justDragged, useDrag } from '@/features/drag/dragStore'
import { useBookDrag } from '@/features/drag/useBookDrag'
import { useUi } from '@/store/ui'
import type { Book } from '@/types/book'

/** Mola dos vizinhos abrindo espaço durante o arraste. */
const LAYOUT_SPRING = { type: 'spring', stiffness: 500, damping: 40 } as const

/**
 * O livro dentro do slot. É um botão:
 * - tocar/clicar abre os detalhes (ver BookModal);
 * - segurar e arrastar move o livro (ver features/drag).
 * Animações:
 * - "layoutId": quando o livro troca de slot, ele desliza até o novo lugar;
 * - escondido enquanto voa da busca (BookFlight) ou está "na mão" (DragLayer);
 * - ao pousar da busca, desce e "assenta" na prateleira com uma mola.
 */
export function ShelvedBook({ book }: { book: Book }) {
  const flying = useUi((s) => s.flight?.bookId === book.id)
  const landed = useUi((s) => s.landedId === book.id)
  const openBook = useUi((s) => s.openBook)
  const dragMode = useDrag((s) =>
    s.active?.bookId === book.id ? s.active.mode : null,
  )
  const reduceMotion = useReducedMotion()
  const { onPointerDown, onKeyDown } = useBookDrag(book)

  const author = book.authors[0] ? `, de ${book.authors[0]}` : ''
  const inHand = dragMode === 'pointer'
  const movingByKeyboard = dragMode === 'keyboard'

  return (
    <motion.button
      type="button"
      data-open-book={book.id}
      aria-label={`${book.title}${author}. Enter abre os detalhes; Espaço pega o livro para mover`}
      onClick={() => {
        if (dragMode || justDragged()) return
        openBook(book.id)
      }}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      layoutId={reduceMotion ? undefined : `book-${book.id}`}
      // A key muda ao pousar, para a animação de assentar começar do zero.
      key={landed ? 'landed' : 'idle'}
      className={`absolute inset-0 flex cursor-grab touch-manipulation items-end justify-center rounded-[0.3cqw] outline-none select-none [-webkit-touch-callout:none] [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-ember ${
        movingByKeyboard ? 'z-10 ring-2 ring-ember' : ''
      }`}
      style={{ opacity: flying || inHand ? 0 : 1 }}
      initial={
        landed && !reduceMotion
          ? { y: '-7%', scaleY: 1.04, scaleX: 0.96 }
          : false
      }
      animate={{
        y: movingByKeyboard ? '-5%' : '0%',
        scaleY: 1,
        scaleX: 1,
      }}
      transition={{
        default: { type: 'spring', stiffness: 520, damping: 18, mass: 0.7 },
        layout: LAYOUT_SPRING,
      }}
    >
      <Book3D book={book} />
    </motion.button>
  )
}
