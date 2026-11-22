import type { SpinePalette } from '@/types/book'

/**
 * Extração de cores da capa para pintar a lombada.
 * Funções puras: recebem os pixels (RGBA) e devolvem a paleta.
 */

type RGB = [number, number, number]

const toHex = ([r, g, b]: RGB) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

/** Luminância relativa (0 = preto, 1 = branco), padrão WCAG. */
export function luminance([r, g, b]: RGB) {
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const saturation = ([r, g, b]: RGB) => {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return max === 0 ? 0 : (max - min) / max
}

const distance = (a: RGB, b: RGB) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

/** Texto claro ou escuro, o que tiver mais contraste com o fundo. */
export const textColorFor = (base: RGB) =>
  luminance(base) > 0.35 ? '#1a120c' : '#f3e9d7'

/**
 * Cor dominante + cor de destaque.
 * Agrupa pixels parecidos (16 tons por canal), a dominante é o grupo maior
 * e o destaque é o grupo forte mais diferente dela.
 */
export function extractPalette(pixels: Uint8ClampedArray): SpinePalette | null {
  const buckets = new Map<number, { sum: RGB; count: number }>()

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 200) continue // ignora transparência
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
    const bucket = buckets.get(key) ?? { sum: [0, 0, 0], count: 0 }
    bucket.sum[0] += r
    bucket.sum[1] += g
    bucket.sum[2] += b
    bucket.count++
    buckets.set(key, bucket)
  }
  if (buckets.size === 0) return null

  const colors = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ sum, count }) => ({
      rgb: sum.map((v) => v / count) as RGB,
      count,
    }))

  const base = colors[0].rgb
  const accent =
    colors
      .slice(1, 12)
      .filter((c) => distance(c.rgb, base) > 90)
      .sort(
        (a, b) => saturation(b.rgb) * b.count - saturation(a.rgb) * a.count,
      )[0]?.rgb ?? shade(base, luminance(base) > 0.35 ? -0.35 : 0.45)

  return { base: toHex(base), accent: toHex(accent), text: textColorFor(base) }
}

/** Clareia (amount > 0) ou escurece (amount < 0) uma cor. */
function shade([r, g, b]: RGB, amount: number): RGB {
  const target = amount > 0 ? 255 : 0
  const t = Math.abs(amount)
  return [r + (target - r) * t, g + (target - g) * t, b + (target - b) * t]
}

/** Paleta para livros sem capa: cor estável derivada do id. */
export function fallbackPalette(seed: string): SpinePalette {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0
  const hue = Math.abs(hash) % 360
  return {
    base: `hsl(${hue} 38% 30%)`,
    accent: `hsl(${(hue + 35) % 360} 55% 62%)`,
    text: '#f3e9d7',
  }
}
