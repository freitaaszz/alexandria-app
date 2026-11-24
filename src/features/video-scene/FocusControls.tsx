import { useEffect } from 'react'
import { useBookcaseDrag } from '@/features/drag/bookcaseDrag'
import { useDrag } from '@/features/drag/dragStore'
import { LIBRARY } from '@/features/shelf/config'
import { useLibrary } from '@/store/library'
import { useUi } from '@/store/ui'

const TOTAL_SHELVES = LIBRARY.bookcases * LIBRARY.shelvesPerBookcase

/** Prateleiras em sequência: estante 1 de cima a baixo, depois a estante 2... */
const toIndex = (f: { bookcase: number; shelf: number }) =>
  f.bookcase * LIBRARY.shelvesPerBookcase + f.shelf
const fromIndex = (i: number) => ({
  bookcase: Math.floor(i / LIBRARY.shelvesPerBookcase),
  shelf: i % LIBRARY.shelvesPerBookcase,
})

const pill =
  'pointer-events-auto min-h-11 rounded-full border border-gold/30 bg-black/50 px-5 font-display text-sm tracking-wider text-parchment backdrop-blur-md transition hover:bg-black/70 disabled:opacity-30 disabled:hover:bg-black/50'
const arrowClass =
  'pointer-events-auto grid size-14 place-items-center rounded-full border border-gold/30 bg-black/45 text-2xl text-parchment/90 backdrop-blur-md transition hover:bg-black/65 active:scale-95 disabled:opacity-25'

/**
 * Controles do zoom (sala → estante → prateleira):
 * - "Voltar" sobe um nível; Esc também.
 * - ‹ › e ← → trocam de estante (na estante) ou de prateleira (na prateleira).
 * - Na estante: botões para mudar a estante de lugar (o mesmo que arrastar).
 */
export function FocusControls() {
  const shelf = useUi((s) => s.focusedShelf)
  const bookcase = useUi((s) => s.focusedBookcase)
  const setFocusedShelf = useUi((s) => s.setFocusedShelf)
  const setFocusedBookcase = useUi((s) => s.setFocusedBookcase)
  const zoomOut = useUi((s) => s.zoomOut)
  const moveBookcase = useLibrary((s) => s.moveBookcase)

  const level = shelf ? 'shelf' : bookcase !== null ? 'bookcase' : null

  // Anterior/próximo no nível atual (null = não tem)
  const step = (dir: -1 | 1) => {
    if (shelf) {
      const i = toIndex(shelf) + dir
      return i >= 0 && i < TOTAL_SHELVES
        ? () => setFocusedShelf(fromIndex(i))
        : null
    }
    if (bookcase !== null) {
      const i = bookcase + dir
      return i >= 0 && i < LIBRARY.bookcases
        ? () => setFocusedBookcase(i)
        : null
    }
    return null
  }

  /** Leva a estante em foco para o lado, e a câmera vai junto. */
  const shiftBookcase = (dir: -1 | 1) => {
    if (bookcase === null) return null
    const to = bookcase + dir
    if (to < 0 || to >= LIBRARY.bookcases) return null
    return () => {
      moveBookcase(bookcase, to)
      setFocusedBookcase(to)
    }
  }

  useEffect(() => {
    if (!level) return
    const onKey = (e: KeyboardEvent) => {
      // Não atrapalha o modal, a busca, campos de texto nem os arrastes
      const ui = useUi.getState()
      if (ui.selectedBookId || useDrag.getState().active) return
      if (useBookcaseDrag.getState().from !== null) return
      if (document.querySelector('dialog[open]')) return
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select')) return
      if (e.key === 'Escape') zoomOut()
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const go = step(e.key === 'ArrowLeft' ? -1 : 1)
        if (!go) return
        go()
      } else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!level) return null
  const prev = step(-1)
  const next = step(1)
  const shiftLeft = shiftBookcase(-1)
  const shiftRight = shiftBookcase(1)
  const what = level === 'shelf' ? 'prateleira' : 'estante'

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <div className="absolute top-20 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <button type="button" onClick={zoomOut} className={pill}>
          ← {level === 'shelf' ? 'Voltar à estante' : 'Voltar à sala'}
        </button>
        <span className="rounded-full bg-black/40 px-4 py-2 font-display text-xs tracking-widest whitespace-nowrap text-parchment/70 uppercase backdrop-blur-md">
          Estante {(shelf?.bookcase ?? bookcase!) + 1}
          {shelf && ` · Prateleira ${shelf.shelf + 1}`}
        </span>
      </div>

      {level === 'bookcase' && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <button
            type="button"
            disabled={!shiftLeft}
            onClick={shiftLeft ?? undefined}
            className={pill}
          >
            ⇠ Mover para a esquerda
          </button>
          <button
            type="button"
            disabled={!shiftRight}
            onClick={shiftRight ?? undefined}
            className={pill}
          >
            Mover para a direita ⇢
          </button>
        </div>
      )}

      <div className="absolute top-1/2 left-5 -translate-y-1/2">
        <button
          type="button"
          aria-label={`${what} anterior`}
          disabled={!prev}
          onClick={prev ?? undefined}
          className={arrowClass}
        >
          ‹
        </button>
      </div>
      <div className="absolute top-1/2 right-5 -translate-y-1/2">
        <button
          type="button"
          aria-label={`Próxima ${what}`}
          disabled={!next}
          onClick={next ?? undefined}
          className={arrowClass}
        >
          ›
        </button>
      </div>
    </div>
  )
}
