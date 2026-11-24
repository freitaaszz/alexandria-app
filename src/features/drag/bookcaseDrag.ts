import { animate, motionValue } from 'motion/react'
import { create } from 'zustand'
import { bookcaseOrder } from '@/lib/placement'
import { useLibrary } from '@/store/library'
import { useUi } from '@/store/ui'
import { useDrag } from './dragStore'

/**
 * Arrastar uma estante inteira (com os livros) para outro lugar.
 * Mesma mecânica do livro: a estante sai do lugar e segue o mouse, as outras
 * andam para abrir espaço e, ao soltar, ela "assenta" na nova posição.
 *
 * As estantes do vídeo não se mexem; o que muda de lugar são os livros. A
 * estante "na mão" é uma cópia: o recorte dela no quadro do vídeo (poster)
 * com os livros clonados por cima.
 */

/** Com mouse, o arraste começa depois de mover isso (px); menos é clique. */
const SLOP = 6
const DROP_SPRING = { type: 'spring', stiffness: 320, damping: 32 } as const

type Size = { width: number; height: number }

export type BookcaseDragState = {
  /** Estante pega (índice de antes do arraste). */
  from: number | null
  /** Posição onde ela cairia agora. */
  target: number | null
  dropping: boolean
  /** Tamanho da estante na sala (sem zoom), para desenhar a cópia. */
  size: Size
  /** Ponto onde o mouse segurou, em fração da estante (0–1). */
  grab: { x: number; y: number }
  /** Escala inicial da cópia (com zoom, ela começa maior e encolhe). */
  startScale: number
  /** Livros clonados da estante pega. */
  clone: HTMLElement | null
}

export const useBookcaseDrag = create<BookcaseDragState>()(() => ({
  from: null,
  target: null,
  dropping: false,
  size: { width: 0, height: 0 },
  grab: { x: 0, y: 0 },
  startScale: 1,
  clone: null,
}))

/** Canto superior esquerdo da estante "na mão" (px da tela). */
export const caseX = motionValue(0)
export const caseY = motionValue(0)

/**
 * Qual estante (de antes) aparece na posição `index` durante o arraste.
 * null: a posição está vazia (é onde a estante "na mão" vai cair).
 */
export function sourceBookcase(
  state: Pick<BookcaseDragState, 'from' | 'target'>,
  index: number,
): number | null {
  if (state.from === null) return index
  const order = bookcaseOrder(state.from, state.target ?? state.from)
  const source = order[index]
  return source === state.from ? null : source
}

const frameEl = (index: number) =>
  document.querySelector<HTMLElement>(`[data-bookcase-frame="${index}"]`)

/** Retângulo da estante na sala, sem zoom (calculado a partir do palco). */
function roomRect(index: number, zoomedStage: boolean) {
  const el = frameEl(index)!
  if (!zoomedStage) return el.getBoundingClientRect()
  // Com zoom, mede a estante como ela fica na sala: posição em % do palco,
  // palco centralizado na tela.
  const stage = el.offsetParent as HTMLElement
  const w = stage.offsetWidth
  const h = stage.offsetHeight
  const left = (window.innerWidth - w) / 2 + el.offsetLeft
  const top = (window.innerHeight - h) / 2 + el.offsetTop
  return new DOMRect(left, top, el.offsetWidth, el.offsetHeight)
}

/** Estante (posição) mais perto do centro da cópia. */
function nearestBookcase(centerX: number) {
  let best = 0
  let bestDistance = Infinity
  document
    .querySelectorAll<HTMLElement>('[data-bookcase-frame]')
    .forEach((el) => {
      const r = el.getBoundingClientRect()
      const d = Math.abs(r.left + r.width / 2 - centerX)
      if (d < bestDistance) {
        bestDistance = d
        best = Number(el.dataset.bookcaseFrame)
      }
    })
  return best
}

/** Copia os livros da estante, sem nada que o resto do site procure. */
function cloneBooks(index: number) {
  const section = document.querySelector<HTMLElement>(
    `[data-bookcase="${index}"]`,
  )
  if (!section) return null
  const clone = section.cloneNode(true) as HTMLElement
  for (const el of [clone, ...clone.querySelectorAll<HTMLElement>('*')]) {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith('data-') || attr.name === 'id')
        el.removeAttribute(attr.name)
    }
  }
  clone.style.left = clone.style.top = '0'
  clone.style.width = clone.style.height = '100%'
  clone.classList.remove('pointer-events-auto')
  // Nada fica apagado na cópia
  clone
    .querySelectorAll('.opacity-35')
    .forEach((el) => el.classList.remove('opacity-35'))
  return clone
}

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Liga o arrastar a um pointerdown na estante `index`.
 * Só começa depois de mover alguns pixels; antes disso continua sendo clique.
 */
export function startBookcasePointer(e: React.PointerEvent, index: number) {
  if (e.button !== 0 || e.pointerType !== 'mouse') return
  if (useDrag.getState().active || useBookcaseDrag.getState().from !== null)
    return
  if ((e.target as HTMLElement).closest('[data-open-book]')) return
  // Com uma prateleira em foco, arrastar fica para os livros
  if (useUi.getState().focusedShelf) return

  const start = { x: e.clientX, y: e.clientY }
  let started = false

  const begin = () => {
    started = true
    const ui = useUi.getState()
    const zoomed = ui.focusedBookcase !== null
    const now = frameEl(index)!.getBoundingClientRect()
    const room = roomRect(index, zoomed)
    const grab = {
      x: (start.x - now.left) / now.width,
      y: (start.y - now.top) / now.height,
    }
    caseX.jump(start.x - grab.x * room.width)
    caseY.jump(start.y - grab.y * room.height)
    useBookcaseDrag.setState({
      from: index,
      target: index,
      dropping: false,
      size: { width: room.width, height: room.height },
      grab,
      startScale: now.width / room.width,
      clone: cloneBooks(index),
    })
    // Com zoom, a câmera volta para a sala para mostrar onde soltar
    if (zoomed) ui.clearFocus()
  }

  const onMove = (ev: PointerEvent) => {
    if (!started) {
      if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < SLOP) return
      begin()
    }
    const { size, grab } = useBookcaseDrag.getState()
    caseX.set(ev.clientX - grab.x * size.width)
    caseY.set(ev.clientY - grab.y * size.height)
    const target = nearestBookcase(caseX.get() + size.width / 2)
    if (target !== useBookcaseDrag.getState().target)
      useBookcaseDrag.setState({ target })
  }

  const finish = (commit: boolean) => {
    cleanup()
    if (!started) return
    const state = useBookcaseDrag.getState()
    const to = commit ? (state.target ?? state.from!) : state.from!
    useBookcaseDrag.setState({ target: to, dropping: true })
    const done = () => {
      if (to !== state.from) useLibrary.getState().moveBookcase(state.from!, to)
      useBookcaseDrag.setState({
        from: null,
        target: null,
        dropping: false,
        clone: null,
      })
      // O clique que o navegador manda junto não deve aproximar a estante
      useDrag.setState({ endedAt: Date.now() })
    }
    if (reducedMotion()) return done()
    const r = frameEl(to)!.getBoundingClientRect()
    Promise.all([
      animate(caseX, r.left, DROP_SPRING),
      animate(caseY, r.top, DROP_SPRING),
    ]).then(done)
  }

  const onUp = () => finish(true)
  const onCancel = () => finish(false)
  const onKey = (ev: KeyboardEvent) => {
    if (started && ev.key === 'Escape') {
      ev.stopPropagation()
      finish(false)
    }
  }

  function cleanup() {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onCancel)
    window.removeEventListener('keydown', onKey, true)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onCancel)
  window.addEventListener('keydown', onKey, true)
}
