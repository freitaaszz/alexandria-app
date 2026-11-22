/** Endereço de um slot na biblioteca. Todos os índices começam em 0. */
export type SlotPosition = {
  bookcase: number
  shelf: number
  slot: number
}

/** Como as estantes aparecem no celular. No desktop, sempre aparecem todas. */
export type ViewMode = 'single' | 'overview'
