/**
 * Cenário em vídeo: o acampamento ao entardecer (gerado por IA) roda em loop
 * no fundo e a aplicação fica por cima, com os livros encaixados nas
 * prateleiras vazias do vídeo.
 *
 * Todas as medidas estão em "pixels de referência" do quadro original
 * (1280 × 720), medidas no 1º quadro, e viram % do quadro na tela. Por isso o
 * arquivo pode ter qualquer resolução com a mesma proporção (16:9): o atual
 * é a versão melhorada por IA (Real-ESRGAN 4× → 1920 × 1080).
 */

export type Box = { left: number; right: number }
export type Row = { top: number; bottom: number }

export const VIDEO_SCENE = {
  src: '/cenarios/acampamento/acampamento.mp4',
  width: 1280,
  height: 720,

  /**
   * A câmera do vídeo se aproxima devagar (~3,5% em 10 s). O site compensa
   * diminuindo o vídeo na mesma proporção enquanto ele toca, então na tela o
   * cenário fica parado. O centro foi achado comparando o 1º e o último quadro.
   */
  zoom: { centerX: 708, centerY: 353, perSecond: 0.0036 },

  /** Segundos de transição suave entre o fim e o começo do loop. */
  loopCrossfade: 1.2,

  /** Parte interna de cada estante (entre as laterais de madeira). */
  bookcases: [
    { left: 293, right: 494 },
    { left: 530, right: 733 },
    { left: 767, right: 978 },
  ] satisfies Box[],

  /** As 5 prateleiras: topo do vão e superfície da tábua. */
  shelves: [
    { top: 258, bottom: 317 },
    { top: 323, bottom: 392 },
    { top: 399, bottom: 462 },
    { top: 470, bottom: 528 },
    { top: 540, bottom: 600 },
  ] satisfies Row[],
} as const

/** Faixa vertical que contém as prateleiras (a "caixa" de cada estante no site). */
export const SHELVES_TOP = VIDEO_SCENE.shelves[0].top - 4
export const SHELVES_BOTTOM =
  VIDEO_SCENE.shelves[VIDEO_SCENE.shelves.length - 1].bottom + 3

/** Converte pixels do vídeo em % do quadro. */
export const pctX = (px: number) => (px / VIDEO_SCENE.width) * 100
export const pctY = (px: number) => (px / VIDEO_SCENE.height) * 100

/**
 * Enquadramento de uma prateleira para o zoom (em px de referência):
 * a área dos livros com uma folga para mostrar a madeira em volta.
 */
export function shelfFrame(bookcase: number, shelf: number) {
  const box = VIDEO_SCENE.bookcases[bookcase]
  const row = VIDEO_SCENE.shelves[shelf]
  return {
    left: box.left - 10,
    right: box.right + 10,
    top: row.top - 7,
    bottom: row.bottom + 6,
  }
}
