import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useLibrary } from '@/store/library'
import { useUi } from '@/store/ui'
import type { Book } from '@/types/book'
import {
  finishDrag,
  hitTest,
  stopEdgeTracking,
  trackEdge,
  updateTarget,
} from './controller'
import { handX, handY, useDrag } from './dragStore'
import { keyboardStep } from './logic'

/** Toque longo para pegar o livro no celular (ms). */
const LONG_PRESS = 320
/** Mexer mais que isso antes do toque longo = a pessoa está rolando a tela (px). */
const TOUCH_SLOP = 10
/** Com mouse, o arraste começa depois de mover isso (px); menos que isso é clique. */
const MOUSE_SLOP = 5

/**
 * Liga um livro da estante ao arrastar e soltar.
 * Mouse: segurar e mover. Toque: segurar parado (toque longo). Teclado: Espaço.
 */
export function useBookDrag(book: Book) {
  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || useDrag.getState().active) return

    const slotEl = e.currentTarget.closest<HTMLElement>('[data-slot]')
    const bookcaseEl = e.currentTarget.closest<HTMLElement>('[data-bookcase]')
    if (!slotEl || !bookcaseEl) return

    const pointerId = e.pointerId
    const isTouch = e.pointerType === 'touch'
    const start = { x: e.clientX, y: e.clientY }
    let started = false
    let longPressTimer: number | undefined

    const begin = (x: number, y: number) => {
      started = true
      const r = slotEl.getBoundingClientRect()
      const grabOffset = { x: start.x - r.x, y: start.y - r.y }
      handX.jump(x - grabOffset.x)
      handY.jump(y - grabOffset.y)
      useDrag.getState().start({
        bookId: book.id,
        mode: 'pointer',
        origin: book.position,
        slotRect: { x: r.x, y: r.y, width: r.width, height: r.height },
        bookcaseWidth: bookcaseEl.getBoundingClientRect().width,
        grabOffset,
      })
      if (isTouch) navigator.vibrate?.(12)
    }

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      if (!started) {
        const distance = Math.hypot(ev.clientX - start.x, ev.clientY - start.y)
        if (isTouch) {
          if (distance > TOUCH_SLOP) cleanup() // é rolagem, não arraste
          return
        }
        if (distance < MOUSE_SLOP) return
        begin(ev.clientX, ev.clientY)
      }
      const { grabOffset } = useDrag.getState().active!
      handX.set(ev.clientX - grabOffset.x)
      handY.set(ev.clientY - grabOffset.y)
      updateTarget(hitTest(ev.clientX, ev.clientY))
      trackEdge(ev.clientX, ev.clientY)
    }

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      cleanup()
      if (started) finishDrag(true)
    }

    const onCancel = () => {
      cleanup()
      if (started) finishDrag(false)
    }

    const onKey = (ev: globalThis.KeyboardEvent) => {
      if (started && ev.key === 'Escape') onCancel()
    }

    // Depois de pegar o livro, o dedo não pode mais rolar a página.
    const blockScroll = (ev: TouchEvent) => {
      if (started) ev.preventDefault()
    }
    // Toque longo abre o menu do navegador em alguns celulares.
    const blockMenu = (ev: Event) => {
      if (started || isTouch) ev.preventDefault()
    }

    function cleanup() {
      window.clearTimeout(longPressTimer)
      stopEdgeTracking()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('touchmove', blockScroll)
      window.removeEventListener('contextmenu', blockMenu)
      window.removeEventListener('keydown', onKey)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('touchmove', blockScroll, { passive: false })
    window.addEventListener('contextmenu', blockMenu)
    window.addEventListener('keydown', onKey)

    if (isTouch) {
      longPressTimer = window.setTimeout(
        () => begin(start.x, start.y),
        LONG_PRESS,
      )
    }
  }

  /** Espaço pega o livro; depois as setas movem (ver startKeyboardDrag). */
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== ' ' || useDrag.getState().active) return
    e.preventDefault()
    startKeyboardDrag(book, e.currentTarget)
  }

  return { onPointerDown, onKeyDown }
}

/** Mantém o foco no livro (ele troca de slot enquanto anda pelo teclado). */
const refocus = (id: string) =>
  requestAnimationFrame(() =>
    document
      .querySelector<HTMLElement>(`[data-open-book="${id}"]`)
      ?.focus({ preventScroll: true }),
  )

function startKeyboardDrag(book: Book, element: HTMLElement) {
  const slotEl = element.closest<HTMLElement>('[data-slot]')
  const bookcaseEl = element.closest<HTMLElement>('[data-bookcase]')
  if (!slotEl || !bookcaseEl) return
  const r = slotEl.getBoundingClientRect()

  useDrag.getState().start({
    bookId: book.id,
    mode: 'keyboard',
    origin: book.position,
    slotRect: { x: r.x, y: r.y, width: r.width, height: r.height },
    bookcaseWidth: bookcaseEl.getBoundingClientRect().width,
    grabOffset: { x: 0, y: 0 },
  })

  const onKey = (ev: globalThis.KeyboardEvent) => {
    const { target } = useDrag.getState()
    if (!target) return
    const stop = () => {
      ev.preventDefault()
      ev.stopPropagation()
    }

    if (ev.key === ' ' || ev.key === 'Enter' || ev.key === 'Escape') {
      stop()
      window.removeEventListener('keydown', onKey, true)
      finishDrag(ev.key !== 'Escape')
      refocus(book.id)
      return
    }

    const next = keyboardStep(
      useLibrary.getState().books,
      book.id,
      target,
      ev.key,
    )
    if (!next) return
    stop()
    updateTarget(next)
    useUi.getState().focusBookcase(next.bookcase)
    refocus(book.id)
  }

  // Captura: as teclas não chegam ao botão (Enter não abre o modal).
  window.addEventListener('keydown', onKey, true)
}
