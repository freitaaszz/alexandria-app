/**
 * As capas da Google não liberam a leitura dos pixels para outros sites (CORS).
 * Por isso elas passam por um proxy no mesmo endereço do site: "/capas/...".
 * - Desenvolvimento: configurado em vite.config.ts.
 * - Produção: precisa de uma regra igual na plataforma de deploy (ex.: rewrite na Vercel).
 */
const GOOGLE_COVER_HOSTS = ['books.google.com', 'books.googleusercontent.com']

export function proxiedCoverUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!GOOGLE_COVER_HOSTS.includes(parsed.hostname)) return null
    return `/capas${parsed.pathname}${parsed.search}`
  } catch {
    return null
  }
}

/** Tamanho da miniatura analisada: pequena é suficiente e rápida. */
const SAMPLE_WIDTH = 32
const SAMPLE_HEIGHT = 48

/** Baixa a capa (pelo proxy) e devolve os pixels de uma miniatura dela. */
export async function loadCoverPixels(url: string): Promise<Uint8ClampedArray> {
  const proxied = proxiedCoverUrl(url)
  if (!proxied) throw new Error('Capa fora do proxy')

  const image = new Image()
  image.decoding = 'async'
  image.src = proxied
  await image.decode()

  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_WIDTH
  canvas.height = SAMPLE_HEIGHT
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas indisponível')
  context.drawImage(image, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT)
  return context.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT).data
}
