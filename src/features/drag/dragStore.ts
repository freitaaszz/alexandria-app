import { motionValue } from 'motion/react'
import { create } from 'zustand'
import type { Rect } from '@/store/ui'
import type { SlotPosition } from '@/types/library'

export type DragMode = 'pointer' | 'keyboard'

export type ActiveDrag = {
  bookId: string
  mode: DragMode
  origin: SlotPosition
  /** Tamanho do slot e largura da estante no início (para desenhar o livro "na mão"). */
  slotRect: Rect
  bookcaseWidth: number
  /** Onde o ponteiro pegou o livro, relativo ao canto do slot. */
  grabOffset: { x: number; y: number }
}

type DragState = {
  active: ActiveDrag | null
  /** Onde o livro cairia se fosse solto agora. */
  target: SlotPosition | null
  /** Soltando: o livro está voando até o lugar final. */
  dropping: boolean
  /** Quando o último arraste terminou (para ignorar o "clique" que vem junto). */
  endedAt: number

  start: (active: ActiveDrag) => void
  setTarget: (target: SlotPosition | null) => void
  setDropping: () => void
  end: () => void
}

export const useDrag = create<DragState>()((set) => ({
  active: null,
  target: null,
  dropping: false,
  endedAt: 0,

  start: (active) => set({ active, target: active.origin, dropping: false }),
  setTarget: (target) => set({ target }),
  setDropping: () => set({ dropping: true }),
  end: () =>
    set({ active: null, target: null, dropping: false, endedAt: Date.now() }),
}))

/** Arraste acabou há pouco? Então o clique que o navegador manda junto é ignorado. */
export const justDragged = () => Date.now() - useDrag.getState().endedAt < 400

/**
 * Posição do livro "na mão" (canto superior esquerdo, em px da tela).
 * Fica fora do React para atualizar a 60fps sem re-renderizar nada.
 */
export const handX = motionValue(0)
export const handY = motionValue(0)
