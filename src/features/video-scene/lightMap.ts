import { createContext, useEffect, useState } from 'react'
import type { VideoScene } from './scene'

/**
 * Luz do vídeo sobre os livros.
 *
 * As prateleiras do vídeo estão vazias, então o próprio quadro já mostra como
 * a luz cai em cada ponto: o spot no meio, as pontas escuras, a cor. O "mapa
 * de luz" é esse quadro em tons claros (normalizado para o ponto mais claro
 * das prateleiras virar branco) e desfocado (para a veia da madeira não
 * aparecer nos livros). Cada lombada multiplica a cor dela pelo pedaço do mapa
 * onde está, e assim fica iluminada igual à cena.
 */

/** Largura do mapa (px). Ele é desfocado, então não precisa ser grande. */
const MAP_WIDTH = 640
/** Quanto da cor original o mapa mantém (0 = cinza, 1 = cor da madeira). */
const KEEP_COLOR = 0.3
/** Nem o canto mais escuro apaga o livro por completo. */
const FLOOR = 0.2

const cache = new Map<string, string>()

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function buildLightMap(scene: VideoScene) {
  const img = await loadImage(scene.poster)
  const w = MAP_WIDTH
  const h = Math.round((MAP_WIDTH * img.height) / img.width)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.filter = `blur(${w / 260}px)`
  ctx.drawImage(img, 0, 0, w, h)
  ctx.filter = 'none'

  const data = ctx.getImageData(0, 0, w, h)
  const px = data.data
  const luma = (i: number) =>
    0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]

  // O "branco" é o ponto mais claro das prateleiras (percentil 97)
  const sx = w / scene.width
  const sy = h / scene.height
  const samples: number[] = []
  for (const box of scene.bookcases) {
    for (const row of scene.shelves) {
      for (let y = Math.round(row.top * sy); y < row.bottom * sy; y += 2) {
        for (let x = Math.round(box.left * sx); x < box.right * sx; x += 2) {
          samples.push(luma((y * w + x) * 4))
        }
      }
    }
  }
  samples.sort((a, b) => a - b)
  const white = Math.max(samples[Math.floor(samples.length * 0.97)] ?? 255, 1)

  for (let i = 0; i < px.length; i += 4) {
    const l = luma(i)
    for (let c = 0; c < 3; c++) {
      // Curva suave: os cantos escuros escurecem sem apagar os livros
      const v = ((l + (px[i + c] - l) * KEEP_COLOR) / white) ** 0.6
      px[i + c] = Math.round(Math.min(1, Math.max(FLOOR, v)) * 255)
    }
  }
  ctx.putImageData(data, 0, 0)
  return canvas.toDataURL('image/webp', 0.85)
}

/** Mapa de luz do cenário (data URL), ou null enquanto é gerado. */
export function useLightMap(scene: VideoScene) {
  // Só serve para re-renderizar quando um mapa novo fica pronto
  const [, setReady] = useState(0)
  useEffect(() => {
    if (!scene.lightMap || cache.has(scene.id)) return
    let alive = true
    buildLightMap(scene)
      .then((url) => {
        cache.set(scene.id, url)
        if (alive) setReady((n) => n + 1)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [scene])
  return scene.lightMap ? (cache.get(scene.id) ?? null) : null
}

/**
 * O que uma lombada precisa para achar o pedaço dela no mapa de luz:
 * a prateleira (em px de referência do vídeo) e o mapa.
 */
export type ShelfLight = {
  url: string
  sceneWidth: number
  sceneHeight: number
  /** Caixa da prateleira no vídeo (px de referência). */
  left: number
  top: number
  width: number
  height: number
}

/** Dado por cada prateleira; o livro "na mão" fica sem (null). */
export const ShelfLightContext = createContext<ShelfLight | null>(null)

/**
 * Brilho das velas ao vivo: compara o brilho das estantes no vídeo com o do
 * 1º quadro, algumas vezes por segundo, e guarda em --scene-flicker
 * (1 = igual ao 1º quadro). As lombadas usam esse valor no mapa de luz.
 */
export function startFlickerSampler(
  scene: VideoScene,
  current: () => HTMLVideoElement,
) {
  if (!scene.lightMap) return () => {}
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 36
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const sx = 64 / scene.width
  const sy = 36 / scene.height
  const first = scene.frames[0]
  const last = scene.frames[scene.frames.length - 1]
  const x = Math.floor(first.left * sx)
  const y = Math.floor(scene.framesTop * sy)
  const w = Math.max(1, Math.ceil((last.right - first.left) * sx))
  const h = Math.max(1, Math.ceil((scene.framesBottom - scene.framesTop) * sy))
  const root = document.documentElement
  let base = 0
  let smooth = 1

  const brightness = () => {
    const px = ctx.getImageData(x, y, w, h).data
    let sum = 0
    for (let i = 0; i < px.length; i += 4) sum += px[i] + px[i + 1] + px[i + 2]
    return sum / (px.length / 4)
  }

  const timer = window.setInterval(() => {
    const video = current()
    if (video.readyState < 2 || document.hidden) return
    ctx.drawImage(video, 0, 0, 64, 36)
    const b = brightness()
    if (!base) base = b
    // Suaviza para não "piscar" com ruído de compressão
    const target = Math.min(1.25, Math.max(0.8, b / base))
    smooth += (target - smooth) * 0.5
    root.style.setProperty('--scene-flicker', smooth.toFixed(3))
  }, 90)

  return () => {
    window.clearInterval(timer)
    root.style.removeProperty('--scene-flicker')
  }
}
