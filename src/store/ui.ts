import { create } from 'zustand'

/** Retângulo na tela (de getBoundingClientRect). */
export type Rect = { x: number; y: number; width: number; height: number }

/** Um livro voando da busca até a estante. */
export type Flight = {
  bookId: string
  from: Rect
  coverUrl?: string
}

type UiState = {
  flight: Flight | null
  /** Livro que acabou de pousar (faz a animação de "assentar" na prateleira). */
  landedId: string | null
  /** Pedido para mostrar uma estante (no celular, rola até ela). */
  focusRequest: { bookcase: number; nonce: number } | null
  /** Pedido para deslizar para a estante vizinha (arrastando até a borda, no celular). */
  pageRequest: { direction: -1 | 1; nonce: number } | null
  /** Livro aberto no modal de detalhes. */
  selectedBookId: string | null

  startFlight: (flight: Flight) => void
  endFlight: () => void
  focusBookcase: (bookcase: number) => void
  pageBookcase: (direction: -1 | 1) => void
  openBook: (id: string) => void
  closeBook: () => void
}

/** Estado só da interface (não é salvo). */
export const useUi = create<UiState>()((set, get) => ({
  flight: null,
  landedId: null,
  focusRequest: null,
  pageRequest: null,
  selectedBookId: null,

  startFlight: (flight) => set({ flight, landedId: null }),
  endFlight: () =>
    set({ landedId: get().flight?.bookId ?? null, flight: null }),
  focusBookcase: (bookcase) =>
    set({ focusRequest: { bookcase, nonce: Date.now() } }),
  pageBookcase: (direction) =>
    set({ pageRequest: { direction, nonce: Date.now() } }),
  openBook: (id) => set({ selectedBookId: id }),
  closeBook: () => set({ selectedBookId: null }),
}))
