import {
  SHELVES_BOTTOM,
  SHELVES_TOP,
  VIDEO_SCENE,
} from '@/features/video-scene/scene'

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
    /** Faixa horizontal onde ficam os 17 slots, em % da largura. */
    slotsLeft: number
    slotsWidth: number
    /** As 4 prateleiras, de cima para baixo. */
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
 * Sala em vídeo (gerada no PixVerse). Aqui a "estante" do site é a parte interna
 * de cada estante do vídeo: os slots ocupam toda a largura e as prateleiras são
 * medidas em % da altura dessa caixa (ver features/video-scene/scene.ts).
 */
const shelfBoxHeight = SHELVES_BOTTOM - SHELVES_TOP
export const SALA_VIDEO: Theme = {
  id: 'sala-video',
  name: 'Biblioteca do Castelo',
  images: ESCOLA_DE_MAGIA.images,
  bookcase: {
    width: VIDEO_SCENE.bookcases[0].right - VIDEO_SCENE.bookcases[0].left,
    height: shelfBoxHeight,
    slotsLeft: 0,
    slotsWidth: 100,
    shelves: VIDEO_SCENE.shelves.map((row) => ({
      top: ((row.top - SHELVES_TOP) / shelfBoxHeight) * 100,
      bottom: ((row.bottom - SHELVES_TOP) / shelfBoxHeight) * 100,
    })),
  },
  light: {
    warm: 'rgb(255 175 95)',
    shadow: 'rgb(10 6 4)',
  },
  floatingCandles: false,
  shelfBackdrop: true,
}

/** Tema em uso. (A troca de temas pela pessoa vem depois.) */
export const THEME = SALA_VIDEO

/** Largura de um slot em "cqw" (% da largura da estante). */
export const SLOT_WIDTH_CQW = THEME.bookcase.slotsWidth / 17
