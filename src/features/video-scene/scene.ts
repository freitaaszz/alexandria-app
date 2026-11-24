/**
 * Cenário em vídeo: a sala gerada por IA (PixVerse) roda em loop no fundo e
 * a aplicação fica por cima, com os livros encaixados nas prateleiras do vídeo.
 *
 * Todas as medidas estão em "pixels de referência" do quadro original
 * (848 × 478), medidas no 1º quadro, e viram % do quadro na tela. Por isso o
 * arquivo pode ter qualquer resolução com a mesma proporção: o atual é a
 * versão melhorada por IA (Real-ESRGAN 4× → 1920 × 1082).
 */

export type Box = { left: number; right: number }
export type Row = { top: number; bottom: number }

export const VIDEO_SCENE = {
  src: '/cenarios/sala-video/sala.mp4',
  width: 848,
  height: 478,

  /**
   * A câmera do vídeo se aproxima devagar (~2,8% em 10 s), em direção ao
   * centro das estantes. O site compensa diminuindo o vídeo na mesma
   * proporção enquanto ele toca, então na tela a sala fica parada.
   */
  zoom: { centerX: 424, centerY: 268, perSecond: 0.0028 },

  /** Segundos de transição suave entre o fim e o começo do loop. */
  loopCrossfade: 1.2,

  /** Parte interna de cada estante (entre as laterais de madeira). */
  bookcases: [
    { left: 286, right: 364 },
    { left: 384, right: 464 },
    { left: 484, right: 561 },
  ] satisfies Box[],

  /** As 4 prateleiras de cima: topo do vão e superfície da tábua. */
  shelves: [
    { top: 181, bottom: 218.5 },
    { top: 222, bottom: 260 },
    { top: 263.5, bottom: 301 },
    { top: 305, bottom: 344 },
  ] satisfies Row[],
} as const

/** Faixa vertical que contém as 4 prateleiras (a "caixa" de cada estante no site). */
export const SHELVES_TOP = VIDEO_SCENE.shelves[0].top - 3
export const SHELVES_BOTTOM =
  VIDEO_SCENE.shelves[VIDEO_SCENE.shelves.length - 1].bottom + 2

/** Converte pixels do vídeo em % do quadro. */
export const pctX = (px: number) => (px / VIDEO_SCENE.width) * 100
export const pctY = (px: number) => (px / VIDEO_SCENE.height) * 100
