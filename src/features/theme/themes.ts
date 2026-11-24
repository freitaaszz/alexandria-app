import { LIBRARY } from '@/features/shelf/config'

/**
 * Temas (cenários). Cada tema define as imagens renderizadas no Blender,
 * onde ficam as prateleiras dentro da imagem da estante e o clima da luz.
 *
 * Fontes 3D: design/blender/<tema>.blend
 */

export type ShelfArea = {
  /** Topo da área dos livros, em % da altura da imagem da estante. */
  top: number
  /** Onde os livros apoiam (superfície da tábua), em % da altura. */
  bottom: number
}

export type Theme = {
  id: string
  name: string
  images: {
    bookcase: string
    backgroundDesktop: string
    backgroundMobile: string
    candle?: string
  }
  bookcase: {
    /** Tamanho da imagem renderizada (px). */
    width: number
    height: number
    /** Faixa horizontal onde ficam os slots, em % da largura. */
    slotsLeft: number
    slotsWidth: number
    /** As prateleiras, de cima para baixo. */
    shelves: ShelfArea[]
  }
  /** Clima: cor da luz principal e da sombra sobre os livros. */
  light: {
    warm: string
    shadow: string
  }
  /** Velas flutuando pela sala. */
  floatingCandles: boolean
  /**
   * Fundo de madeira atrás dos livros. Necessário no cenário em vídeo, cujas
   * estantes já vêm cheias de livros: o fundo cobre esses livros do vídeo.
   */
  shelfBackdrop?: boolean
}

export const ESCOLA_DE_MAGIA: Theme = {
  id: 'escola-de-magia',
  name: 'Escola de Magia',
  images: {
    bookcase: '/cenarios/escola-de-magia/estante.webp',
    backgroundDesktop: '/cenarios/escola-de-magia/fundo-desktop.webp',
    backgroundMobile: '/cenarios/escola-de-magia/fundo-celular.webp',
    candle: '/cenarios/escola-de-magia/vela.webp',
  },
  // Medidas exportadas do Blender (câmera ortográfica, 900 px por metro).
  bookcase: {
    width: 1206,
    height: 2394,
    slotsLeft: 12.687,
    slotsWidth: 74.627,
    shelves: [
      { top: 30.075, bottom: 43.609 },
      { top: 46.429, bottom: 59.962 },
      { top: 62.782, bottom: 76.316 },
      { top: 79.135, bottom: 92.669 },
    ],
  },
  light: {
    warm: 'rgb(255 170 90)',
    shadow: 'rgb(12 6 3)',
  },
  floatingCandles: true,
}

/**
 * Tema da versão em imagem (Blender). O site hoje usa os cenários em vídeo
 * (features/video-scene/scene.ts); este fica para o caminho em imagem.
 */
export const THEME = ESCOLA_DE_MAGIA

/** Largura de um slot em "cqw" (% da largura da estante). */
// Nos cenários em vídeo os slots ocupam toda a largura da estante.
export const SLOT_WIDTH_CQW = 100 / LIBRARY.slotsPerShelf
