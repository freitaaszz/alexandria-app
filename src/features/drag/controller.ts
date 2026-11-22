import { animate } from 'motion/react'
import { slotId } from '@/features/shelf/config'
import { useLibrary } from '@/store/library'
import { useUi } from '@/store/ui'
import type { SlotPosition } from '@/types/library'
import { handX, handY, useDrag } from './dragStore'
import { arrange, isBlocked, slotIndexFromX } from './logic'

/** Mola do livro indo para o lugar ao soltar. */
const DROP_SPRING = { type: 'spring', stiffness: 460, damping: 36 } as const
/** Faixa da borda da tela que, no celular, leva para a estante vizinha (px). */
const EDGE = 36
/** Tempo parado na borda até trocar de estante (ms). */
const EDGE_DELAY = 550

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const samePosition = (a: SlotPosition | null, b: SlotPosition | null) =>
  a === b ||
  (!!a &&
    !!b &&
    a.bookcase === b.bookcase &&
    a.shelf === b.shelf &&
    a.slot === b.slot)

/**
 * Descobre o slot sob o ponteiro.
 * Procura a estante sob o ponto e, dentro dela, a prateleira mais próxima na
 * vertical (assim passar por cima da tábua não "perde" o destino).
 */
export function hitTest(x: number, y: number): SlotPosition | null {
  const bookcaseEl = document
    .elementFromPoint(x, y)
    ?.closest<HTMLElement>('[data-bookcase]')
  if (!bookcaseEl) return null

  const shelves = Array.from(
    bookcaseEl.querySelectorAll<HTMLElement>('[data-shelf]'),
  )
  let best: HTMLElement | null = null
  let bestDistance = Infinity
  for (const shelf of shelves) {
    const r = shelf.getBoundingClientRect()
    const distance = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0
    if (distance < bestDistance) {
      best = shelf
      bestDistance = distance
    }
  }
  if (!best) return null

  const [bookcase, shelf] = best.dataset.shelf!.split('-').map(Number)
  const first = best.firstElementChild!.getBoundingClientRect()
  const last = best.lastElementChild!.getBoundingClientRect()
  return {
    bookcase,
    shelf,
    slot: slotIndexFromX(x, first.left, last.right - first.left),
  }
}

/** Atualiza o destino (só se mudou, para não re-renderizar à toa). */
export function updateTarget(target: SlotPosition | null) {
  const state = useDrag.getState()
  if (!samePosition(state.target, target)) state.setTarget(target)
}

// --- Troca de estante pela borda da tela (celular) ---------------------------

let edgeTimer: number | undefined
let lastPointer = { x: 0, y: 0 }

export function trackEdge(x: number, y: number) {
  lastPointer = { x, y }
  const direction = x < EDGE ? -1 : x > window.innerWidth - EDGE ? 1 : 0
  if (direction === 0) {
    window.clearTimeout(edgeTimer)
    edgeTimer = undefined
    return
  }
  if (edgeTimer !== undefined) return
  edgeTimer = window.setTimeout(() => {
    edgeTimer = undefined
    if (!useDrag.getState().active) return
    useUi.getState().pageBookcase(direction)
    // Depois que a estante deslizar, recalcula o destino e, se o dedo
    // continuar na borda, agenda a próxima troca.
    window.setTimeout(() => {
      if (!useDrag.getState().active) return
      updateTarget(hitTest(lastPointer.x, lastPointer.y))
      trackEdge(lastPointer.x, lastPointer.y)
    }, 450)
  }, EDGE_DELAY)
}

export function stopEdgeTracking() {
  window.clearTimeout(edgeTimer)
  edgeTimer = undefined
}

// --- Soltar ------------------------------------------------------------------

/**
 * Termina o arraste.
 * commit=true e destino válido: o livro voa até o lugar e a mudança é salva.
 * Caso contrário: o livro volta para onde estava.
 */
export function finishDrag(commit: boolean) {
  stopEdgeTracking()
  const drag = useDrag.getState()
  const { active, target } = drag
  if (!active || drag.dropping) return

  const books = useLibrary.getState().books
  const valid =
    commit && target !== null && !isBlocked(books, active.bookId, target)
  if (!valid) drag.setTarget(null)
  drag.setDropping()

  const done = () => {
    if (valid) useLibrary.getState().moveBook(active.bookId, target)
    useDrag.getState().end()
  }

  if (active.mode === 'keyboard' || reducedMotion()) return done()

  // Espera a estante se rearrumar e mede o slot final.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const arranged = arrange(books, active.bookId, valid ? target : null)
      const final = arranged.find((b) => b.id === active.bookId)?.position
      const slot = final
        ? document.querySelector(`[data-slot="${slotId(final)}"]`)
        : null
      const r = slot?.getBoundingClientRect()
      if (!r) return done()
      Promise.all([
        animate(handX, r.x, DROP_SPRING),
        animate(handY, r.y, DROP_SPRING),
      ]).then(done)
    }),
  )
}
