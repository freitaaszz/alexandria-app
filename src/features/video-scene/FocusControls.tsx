import { useEffect } from 'react'
import { useDrag } from '@/features/drag/dragStore'
import { LIBRARY } from '@/features/shelf/config'
import { useUi } from '@/store/ui'

const TOTAL = LIBRARY.bookcases * LIBRARY.shelvesPerBookcase

/** Prateleiras em sequência: estante 1 de cima a baixo, depois a estante 2... */
const toIndex = (f: { bookcase: number; shelf: number }) =>
  f.bookcase * LIBRARY.shelvesPerBookcase + f.shelf
const fromIndex = (i: number) => ({
  bookcase: Math.floor(i / LIBRARY.shelvesPerBookcase),
  shelf: i % LIBRARY.shelvesPerBookcase,
})

const arrowClass =
  'pointer-events-auto grid size-14 place-items-center rounded-full border border-gold/30 bg-black/45 text-2xl text-parchment/90 backdrop-blur-md transition hover:bg-black/65 active:scale-95 disabled:opacity-25'

/**
 * Controles com uma prateleira em foco:
 * "Voltar à sala", setas para a prateleira anterior/seguinte e atalhos
 * (Esc volta; ← → trocam de prateleira).
 */
export function FocusControls() {
  const focused = useUi((s) => s.focusedShelf)
  const setFocusedShelf = useUi((s) => s.setFocusedShelf)

  useEffect(() => {
    if (!focused) return
    const onKey = (e: KeyboardEvent) => {
      // Não atrapalha o modal, a busca, campos de texto nem o arrastar pelo teclado
      const ui = useUi.getState()
      if (ui.selectedBookId || useDrag.getState().active) return
      if (document.querySelector('dialog[open]')) return
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select')) return
      const i = toIndex(focused)
      if (e.key === 'Escape') setFocusedShelf(null)
      else if (e.key === 'ArrowLeft' && i > 0) setFocusedShelf(fromIndex(i - 1))
      else if (e.key === 'ArrowRight' && i < TOTAL - 1)
        setFocusedShelf(fromIndex(i + 1))
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focused, setFocusedShelf])

  if (!focused) return null
  const i = toIndex(focused)

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <div className="absolute top-20 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <button
          type="button"
          onClick={() => setFocusedShelf(null)}
          className="pointer-events-auto min-h-11 rounded-full border border-gold/30 bg-black/50 px-5 font-display text-sm tracking-wider text-parchment backdrop-blur-md transition hover:bg-black/70"
        >
          ← Voltar à sala
        </button>
        <span className="rounded-full bg-black/40 px-4 py-2 font-display text-xs tracking-widest text-parchment/70 uppercase backdrop-blur-md">
          Estante {focused.bookcase + 1} · Prateleira {focused.shelf + 1}
        </span>
      </div>
      <div className="absolute top-1/2 left-5 -translate-y-1/2">
        <button
          type="button"
          aria-label="Prateleira anterior"
          disabled={i === 0}
          onClick={() => setFocusedShelf(fromIndex(i - 1))}
          className={arrowClass}
        >
          ‹
        </button>
      </div>
      <div className="absolute top-1/2 right-5 -translate-y-1/2">
        <button
          type="button"
          aria-label="Próxima prateleira"
          disabled={i === TOTAL - 1}
          onClick={() => setFocusedShelf(fromIndex(i + 1))}
          className={arrowClass}
        >
          ›
        </button>
      </div>
    </div>
  )
}
