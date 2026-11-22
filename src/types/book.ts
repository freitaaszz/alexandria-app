import type { SlotPosition } from './library'

/** Dimensões físicas em centímetros (quando a API fornecer). */
export type BookDimensions = {
  height?: number
  width?: number
  thickness?: number
}

/** Dados que vêm da API (Google Books). */
export type BookInfo = {
  /** Id do volume na Google Books, usado para evitar livros repetidos. */
  googleId: string
  title: string
  authors: string[]
  description?: string
  coverUrl?: string
  pageCount?: number
  publishedDate?: string
  dimensions?: BookDimensions
}

/** O que a pessoa preenche sobre a leitura. */
export type ReadingDetails = {
  /** Data em que terminou de ler, no formato "AAAA-MM-DD". */
  readAt?: string
  /** Nota de 1 a 5 estrelas. */
  rating?: number
  review?: string
}

/** Um livro na estante. */
export type Book = BookInfo &
  ReadingDetails & {
    /** Id local, único na biblioteca. */
    id: string
    /** Quando foi colocado na estante (ISO). */
    addedAt: string
    position: SlotPosition
  }

/** Campos que a pessoa pode editar no modal do livro. */
export type BookPatch = ReadingDetails & Pick<BookInfo, 'pageCount'>
