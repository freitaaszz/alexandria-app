import { motion, useReducedMotion } from 'motion/react'
import { Book3D } from '@/features/book/Book3D'
import { useUi } from '@/store/ui'
import type { Book } from '@/types/book'

/**
 * O livro dentro do slot, com as animações de chegada:
 * - escondido enquanto a capa está voando até aqui (ver BookFlight);
 * - ao pousar, desce e "assenta" na prateleira com uma mola.
 */
export function ShelvedBook({ book }: { book: Book }) {
  const flying = useUi((s) => s.flight?.bookId === book.id)
  const landed = useUi((s) => s.landedId === book.id)
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      // A key muda ao pousar, para a animação de assentar começar do zero.
      key={landed ? 'landed' : 'idle'}
      className="absolute inset-0 flex items-end justify-center [transform-style:preserve-3d]"
      style={{ opacity: flying ? 0 : 1 }}
      initial={
        landed && !reduceMotion
          ? { y: '-7%', scaleY: 1.04, scaleX: 0.96 }
          : false
      }
      animate={{ y: '0%', scaleY: 1, scaleX: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 18, mass: 0.7 }}
    >
      <Book3D book={book} />
    </motion.div>
  )
}
