import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { Book3D } from '@/features/book/Book3D'
import { useLibrary } from '@/store/library'
import { handX, handY, useDrag } from './dragStore'
import { isBlocked } from './logic'

/** Mola das inclinações: segue a velocidade com um leve atraso, como algo pesado. */
const TILT_SPRING = { stiffness: 240, damping: 18, mass: 0.6 }

/**
 * O livro "na mão": segue o ponteiro 1:1 por cima de tudo.
 * Inclina para o lado em que está indo (quanto mais rápido, mais inclina)
 * e gira um pouco no próprio eixo, mostrando a capa ou a contracapa.
 */
export function DragLayer() {
  const active = useDrag((s) => s.active)
  const dropping = useDrag((s) => s.dropping)
  const book = useLibrary((s) => s.books.find((b) => b.id === active?.bookId))
  const reduceMotion = useReducedMotion()

  const velocityX = useVelocity(handX)
  const lean = useSpring(
    useTransform(velocityX, [-2400, 0, 2400], [-14, 0, 14], { clamp: true }),
    TILT_SPRING,
  )
  const turn = useSpring(
    useTransform(velocityX, [-2400, 0, 2400], [-28, 0, 28], { clamp: true }),
    TILT_SPRING,
  )

  if (!active || active.mode !== 'pointer' || !book) return null
  const { slotRect, bookcaseWidth, grabOffset } = active
  const lifted = !dropping && !reduceMotion

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      {/* Largura da estante: mantém as medidas "cqw" do livro iguais às da prateleira */}
      <motion.div
        className="absolute top-0 left-0"
        style={{
          x: handX,
          y: handY,
          width: bookcaseWidth,
          height: slotRect.height,
          containerType: 'inline-size',
        }}
      >
        <motion.div
          className="relative flex items-end justify-center [transform-style:preserve-3d]"
          style={{
            width: slotRect.width,
            height: slotRect.height,
            rotate: reduceMotion ? 0 : lean,
            rotateY: reduceMotion ? 0 : turn,
            transformPerspective: 700,
            // Gira em torno do ponto onde o dedo/mouse está segurando
            transformOrigin: `${grabOffset.x}px ${grabOffset.y}px`,
          }}
          initial={{ scale: 1, y: 0 }}
          animate={{ scale: lifted ? 1.14 : 1, y: lifted ? -8 : 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 30 }}
        >
          {/* Sombra no "chão": cresce e fica mais suave com o livro levantado */}
          <motion.div
            className="absolute -bottom-[6%] left-1/2 h-[8%] w-[140%] -translate-x-1/2 rounded-[50%] bg-black blur-md"
            animate={{
              opacity: lifted ? 0.45 : 0.15,
              scale: lifted ? 1.2 : 0.8,
            }}
          />
          <Book3D book={book} />
        </motion.div>
      </motion.div>
    </div>
  )
}

/**
 * Avisos para leitores de tela: onde o livro está e se pode ser solto ali.
 * Fica fora do overlay, que é aria-hidden.
 */
export function DragAnnouncer() {
  const message = useDrag((s) => {
    if (!s.active || !s.target) return ''
    const books = useLibrary.getState().books
    const book = books.find((b) => b.id === s.active!.bookId)
    if (!book) return ''
    if (isBlocked(books, book.id, s.target))
      return `Prateleira cheia. ${book.title} não cabe aqui.`
    const { bookcase, shelf, slot } = s.target
    return `${book.title}: estante ${bookcase + 1}, prateleira ${shelf + 1}, posição ${slot + 1}.`
  })
  return (
    <p className="sr-only" aria-live="assertive">
      {message}
    </p>
  )
}
