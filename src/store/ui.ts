import { create } from 'zustand'

/** Retângulo na tela (de getBoundingClientRect). */
export type Rect = { x: number; y: number; width: number; height: number }

/** Um livro voando da busca até a estante. */
export type Flight = {
  bookId: string
  from: Rect
  coverUrl?: string
  /** Espera antes de medir o destino (ex.: a câmera voltando do zoom). */
  delayMs?: number
}

type UiState = {
  flight: Flight | null
  /** Livro que acabou de pousar (faz a animação de "assentar" na prateleira). */
  landedId: string | null
  /** Pedido para mostrar uma estante (no celular, rola até ela). */
  focusRequest: { bookcase: number; nonce: number } | null
  /** Pedido para deslizar para a estante vizinha (arrastando até a borda, no celular). */
  pageRequest: { direction: -1 | 1; nonce: number } | null
  /**
   * Zoom em níveis: sala → estante → prateleira.
   * focusedBookcase: estante em foco (ela inteira ocupa a altura da tela).
   * focusedShelf: prateleira em foco dentro dela (ocupa a tela).
   */
  focusedBookcase: number | null
  focusedShelf: { bookcase: number; shelf: number } | null
  /** Livro aberto no modal de detalhes. */
  selectedBookId: string | null

  startFlight: (flight: Flight) => void
  endFlight: () => void
  focusBookcase: (bookcase: number) => void
  pageBookcase: (direction: -1 | 1) => void
  /** Foca uma estante (ou volta para a sala com null). */
  setFocusedBookcase: (bookcase: number | null) => void
  /** Foca uma prateleira; null volta para a estante dela. */
  setFocusedShelf: (shelf: { bookcase: number; shelf: number } | null) => void
  /** Sobe um nível de zoom (prateleira → estante → sala). */
  zoomOut: () => void
  /** Volta direto para a sala. */
  clearFocus: () => void
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
  focusedBookcase: null,
  focusedShelf: null,

  startFlight: (flight) => set({ flight, landedId: null }),
  endFlight: () =>
    set({ landedId: get().flight?.bookId ?? null, flight: null }),
  focusBookcase: (bookcase) =>
    set({ focusRequest: { bookcase, nonce: Date.now() } }),
  pageBookcase: (direction) =>
    set({ pageRequest: { direction, nonce: Date.now() } }),
  setFocusedBookcase: (focusedBookcase) =>
    set({ focusedBookcase, focusedShelf: null }),
  setFocusedShelf: (focusedShelf) =>
    set(
      focusedShelf
        ? { focusedShelf, focusedBookcase: focusedShelf.bookcase }
        : { focusedShelf: null },
    ),
  zoomOut: () =>
    set(
      get().focusedShelf
        ? { focusedShelf: null }
        : { focusedBookcase: null, focusedShelf: null },
    ),
  clearFocus: () => set({ focusedBookcase: null, focusedShelf: null }),
  openBook: (id) => set({ selectedBookId: id }),
  closeBook: () => set({ selectedBookId: null }),
}))
