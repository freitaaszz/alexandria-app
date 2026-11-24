import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Cenários em vídeo: um vídeo gerado por IA roda em loop no fundo e a
 * aplicação fica por cima, com os livros encaixados nas prateleiras do vídeo.
 *
 * Todas as medidas estão em "pixels de referência" do quadro original de cada
 * vídeo (width × height), medidas no 1º quadro, e viram % do quadro na tela.
 * Por isso o arquivo pode ter qualquer resolução com a mesma proporção: os
 * arquivos atuais são versões melhoradas por IA (Real-ESRGAN 4×).
 *
 * Todos os cenários têm 3 estantes × 5 prateleiras (ver LIBRARY).
 */

export type Box = { left: number; right: number }
export type Row = { top: number; bottom: number }

export type VideoScene = {
  id: string
  /** Nome no seletor de tema. */
  name: string
  src: string
  /** 1º quadro do vídeo (aparece antes de ele carregar e na estante arrastada). */
  poster: string
  width: number
  height: number
  /**
   * Zoom da câmera do vídeo (por segundo), compensado pelo site para o
   * cenário ficar parado. perSecond 0 = câmera parada.
   */
  zoom: { centerX: number; centerY: number; perSecond: number }
  /** Segundos de transição suave entre o fim e o começo do loop. */
  loopCrossfade: number
  /** Parte interna de cada estante (entre as laterais de madeira). */
  bookcases: readonly Box[]
  /** Contorno de cada estante inteira (cornija até a base). */
  frames: readonly Box[]
  framesTop: number
  framesBottom: number
  /** As 5 prateleiras: topo do vão e superfície da tábua. */
  shelves: readonly Row[]
  /** Luz sobre os livros: cor quente e cor da sombra. */
  light: { warm: string; shadow: string }
  /**
   * Fundo de madeira atrás dos livros: necessário quando as prateleiras do
   * vídeo já vêm com livros (cobre os livros do vídeo).
   */
  shelfBackdrop?: boolean
}

/** Biblioteca do castelo (PixVerse). As prateleiras do vídeo têm livros. */
const CASTELO: VideoScene = {
  id: 'castelo',
  name: 'Biblioteca do Castelo',
  src: '/cenarios/castelo/castelo.mp4',
  poster: '/cenarios/castelo/poster.webp',
  width: 848,
  height: 478,
  zoom: { centerX: 424, centerY: 268, perSecond: 0.0028 },
  loopCrossfade: 1.2,
  bookcases: [
    { left: 286, right: 364 },
    { left: 384, right: 464 },
    { left: 484, right: 561 },
  ],
  frames: [
    { left: 280, right: 373 },
    { left: 373, right: 474 },
    { left: 474, right: 572 },
  ],
  framesTop: 160,
  framesBottom: 395,
  shelves: [
    { top: 181, bottom: 218.5 },
    { top: 222, bottom: 260 },
    { top: 263.5, bottom: 301 },
    { top: 305, bottom: 344 },
    { top: 348, bottom: 386 },
  ],
  light: { warm: 'rgb(255 175 95)', shadow: 'rgb(10 6 4)' },
  shelfBackdrop: true,
}

/** Acampamento ao entardecer (Gemini), prateleiras vazias. */
const ACAMPAMENTO: VideoScene = {
  id: 'acampamento',
  name: 'Acampamento ao Entardecer',
  src: '/cenarios/acampamento/acampamento.mp4',
  poster: '/cenarios/acampamento/poster.webp',
  width: 1280,
  height: 720,
  zoom: { centerX: 708, centerY: 353, perSecond: 0.0036 },
  loopCrossfade: 1.2,
  bookcases: [
    { left: 293, right: 494 },
    { left: 530, right: 733 },
    { left: 767, right: 978 },
  ],
  frames: [
    { left: 278, right: 511 },
    { left: 511, right: 749 },
    { left: 749, right: 995 },
  ],
  framesTop: 208,
  framesBottom: 642,
  shelves: [
    { top: 258, bottom: 317 },
    { top: 323, bottom: 392 },
    { top: 399, bottom: 462 },
    { top: 470, bottom: 528 },
    { top: 540, bottom: 600 },
  ],
  light: { warm: 'rgb(255 196 110)', shadow: 'rgb(48 28 14)' },
}

/** Castelo à noite (Kling), prateleiras vazias com spots de luz. */
const CASTELO_NOITE: VideoScene = {
  id: 'castelo-noite',
  name: 'Castelo à Noite',
  src: '/cenarios/castelo-noite/castelo-noite.mp4',
  poster: '/cenarios/castelo-noite/poster.webp',
  width: 1280,
  height: 720,
  zoom: { centerX: 640, centerY: 360, perSecond: 0 },
  loopCrossfade: 1,
  bookcases: [
    { left: 282, right: 497 },
    { left: 527, right: 740 },
    { left: 772, right: 985 },
  ],
  frames: [
    { left: 263, right: 512 },
    { left: 512, right: 757 },
    { left: 757, right: 1004 },
  ],
  framesTop: 309,
  framesBottom: 614,
  shelves: [
    { top: 338, bottom: 383 },
    { top: 388, bottom: 433 },
    { top: 438, bottom: 482 },
    { top: 487, bottom: 532 },
    { top: 537, bottom: 582 },
  ],
  light: { warm: 'rgb(255 180 110)', shadow: 'rgb(8 5 4)' },
}

export const SCENES = [CASTELO_NOITE, ACAMPAMENTO, CASTELO] as const

/** Cenário escolhido (salvo no navegador). */
export const useSceneStore = create<{
  sceneId: string
  setScene: (id: string) => void
}>()(
  persist(
    (set) => ({
      sceneId: SCENES[0].id,
      setScene: (sceneId) => set({ sceneId }),
    }),
    {
      name: 'alexandria:cenario',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

const findScene = (id: string) => SCENES.find((s) => s.id === id) ?? SCENES[0]

/** Cenário atual (dentro de componentes React). */
export const useScene = () => findScene(useSceneStore((s) => s.sceneId))
/** Cenário atual (fora do React). */
export const getScene = () => findScene(useSceneStore.getState().sceneId)

/** Faixa vertical que contém as prateleiras (a "caixa" de cada estante no site). */
export const shelvesTop = (scene: VideoScene) => scene.shelves[0].top - 4
export const shelvesBottom = (scene: VideoScene) =>
  scene.shelves[scene.shelves.length - 1].bottom + 3

/** Converte pixels do vídeo em % do quadro. */
export const pctX = (scene: VideoScene, px: number) => (px / scene.width) * 100
export const pctY = (scene: VideoScene, px: number) => (px / scene.height) * 100

/**
 * Onde cada prateleira fica dentro da caixa da estante, em % da altura
 * (topo do vão e superfície da tábua).
 */
export function shelfAreas(scene: VideoScene) {
  const top = shelvesTop(scene)
  const height = shelvesBottom(scene) - top
  return scene.shelves.map((row) => ({
    top: ((row.top - top) / height) * 100,
    bottom: ((row.bottom - top) / height) * 100,
  }))
}

/**
 * Enquadramento de uma prateleira para o zoom (em px de referência):
 * a área dos livros com uma folga para mostrar a madeira em volta.
 */
export function shelfFrame(scene: VideoScene, bookcase: number, shelf: number) {
  const box = scene.bookcases[bookcase]
  const row = scene.shelves[shelf]
  const k = scene.width / 1280
  return {
    left: box.left - 10 * k,
    right: box.right + 10 * k,
    top: row.top - 7 * k,
    bottom: row.bottom + 6 * k,
  }
}

/** Enquadramento de uma estante inteira para o zoom (em px de referência). */
export function bookcaseFrame(scene: VideoScene, bookcase: number) {
  const box = scene.frames[bookcase]
  return {
    left: box.left - 2,
    right: box.right + 2,
    top: scene.framesTop - 2,
    bottom: scene.framesBottom + 2,
  }
}

/** O que a câmera enquadra agora: uma prateleira, uma estante ou nada (a sala). */
export function focusFrame(
  scene: VideoScene,
  bookcase: number | null,
  shelf: { bookcase: number; shelf: number } | null,
) {
  if (shelf) return shelfFrame(scene, shelf.bookcase, shelf.shelf)
  if (bookcase !== null) return bookcaseFrame(scene, bookcase)
  return null
}
