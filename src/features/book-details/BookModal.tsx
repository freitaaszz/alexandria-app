import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
} from 'motion/react'
import { useEffect, useId, useRef } from 'react'
import { DESKTOP_QUERY, useMediaQuery } from '@/lib/useMediaQuery'
import { useLibrary } from '@/store/library'
import { useUi } from '@/store/ui'
import { BookDetails } from './BookDetails'

/** Arrastar a folha para baixo além disso (px) ou rápido assim (px/s) fecha. */
const DISMISS_OFFSET = 120
const DISMISS_VELOCITY = 600

const SPRING = { type: 'spring', stiffness: 420, damping: 38 } as const

/**
 * Modal de detalhes do livro.
 * - Desktop: cartão no centro, aparece com um leve zoom.
 * - Celular: folha que sobe de baixo; arrastar a alça para baixo fecha.
 * Esc, clique fora ou o "×" fecham. O resto da página fica inerte enquanto ele está aberto.
 */
export function BookModal() {
  const selectedId = useUi((s) => s.selectedBookId)
  const closeBook = useUi((s) => s.closeBook)
  const book = useLibrary((s) => s.books.find((b) => b.id === selectedId))
  const removeBook = useLibrary((s) => s.removeBook)

  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const reduceMotion = useReducedMotion()
  const dragControls = useDragControls()
  const titleId = useId()

  /** Livro a remover quando a animação de fechar terminar. */
  const pendingRemoval = useRef<string | null>(null)
  /** Livro que estava aberto, para devolver o foco a ele ao fechar. */
  const lastOpened = useRef<string | null>(null)

  useEffect(() => {
    if (selectedId) lastOpened.current = selectedId
  }, [selectedId])

  useEffect(() => {
    if (!selectedId) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeBook()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, closeBook])

  const handleExitComplete = () => {
    const id = pendingRemoval.current
    pendingRemoval.current = null
    if (id) {
      removeBook(id)
      return
    }
    // Devolve o foco ao livro que estava aberto (navegação por teclado)
    document
      .querySelector<HTMLElement>(`[data-open-book="${lastOpened.current}"]`)
      ?.focus({ preventScroll: true })
  }

  const hidden = reduceMotion
    ? { opacity: 0 }
    : isDesktop
      ? { opacity: 0, scale: 0.96, y: 16 }
      : { y: '100%' }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {book && (
        <div
          key="book-modal"
          className="fixed inset-0 z-40 flex items-end justify-center lg:items-center lg:p-6"
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-black/65"
            onClick={closeBook}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-parchment/10 bg-wood-950 shadow-2xl shadow-black lg:max-w-lg lg:rounded-3xl lg:border"
            initial={hidden}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={hidden}
            transition={SPRING}
            drag={isDesktop ? false : 'y'}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (
                info.offset.y > DISMISS_OFFSET ||
                info.velocity.y > DISMISS_VELOCITY
              )
                closeBook()
            }}
          >
            {/* Alça para arrastar (só celular) */}
            <div
              aria-hidden="true"
              onPointerDown={(e) => dragControls.start(e)}
              className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-1 lg:hidden"
            >
              <span className="h-1.5 w-10 rounded-full bg-parchment/25" />
            </div>

            <button
              type="button"
              onClick={closeBook}
              aria-label="Fechar"
              autoFocus
              className="absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-full bg-black/30 text-xl text-parchment/80 backdrop-blur-sm lg:top-4 lg:right-4"
            >
              ×
            </button>

            <div className="overflow-y-auto overscroll-contain">
              <BookDetails
                book={book}
                titleId={titleId}
                onRemove={() => {
                  pendingRemoval.current = book.id
                  closeBook()
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
