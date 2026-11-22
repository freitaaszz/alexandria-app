import type { BookDimensions, BookInfo } from '@/types/book'

/**
 * Cliente da Google Books API.
 * Docs: https://developers.google.com/books/docs/v1/using
 */

const ENDPOINT = 'https://www.googleapis.com/books/v1/volumes'

/** Só os campos que usamos: resposta menor e mais rápida no celular. */
const FIELDS =
  'items(id,volumeInfo(title,subtitle,authors,description,pageCount,publishedDate,dimensions,imageLinks))'

/**
 * quota: limite de buscas estourado (429)
 * config: chave inválida ou API não ativada no Google Cloud (400/403)
 * network: sem internet
 */
export type SearchErrorReason = 'quota' | 'config' | 'network' | 'unknown'

export class BookSearchError extends Error {
  readonly reason: SearchErrorReason
  constructor(reason: SearchErrorReason, message?: string) {
    super(message ?? reason)
    this.name = 'BookSearchError'
    this.reason = reason
  }
}

/** Formato (parcial) de um volume na resposta da API. */
export type GoogleVolume = {
  id: string
  volumeInfo?: {
    title?: string
    subtitle?: string
    authors?: string[]
    description?: string
    pageCount?: number
    publishedDate?: string
    dimensions?: { height?: string; width?: string; thickness?: string }
    imageLinks?: Record<string, string | undefined>
  }
}

/** "24.00 cm" -> 24 ; "9.5 in" -> 24.13 ; inválido -> undefined */
export function parseDimension(value?: string): number | undefined {
  const match = value?.trim().match(/^([\d.,]+)\s*(cm|in|mm)?/i)
  if (!match) return undefined
  const n = Number.parseFloat(match[1].replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return undefined
  const unit = match[2]?.toLowerCase()
  const cm = unit === 'in' ? n * 2.54 : unit === 'mm' ? n / 10 : n
  return Math.round(cm * 100) / 100
}

/**
 * Melhor capa disponível, sempre em https e sem o efeito de "página dobrada"
 * que a Google às vezes adiciona (edge=curl).
 */
export function pickCover(links?: Record<string, string | undefined>) {
  const url =
    links?.extraLarge ??
    links?.large ??
    links?.medium ??
    links?.small ??
    links?.thumbnail ??
    links?.smallThumbnail
  if (!url) return undefined
  return url.replace(/^http:/, 'https:').replace(/&edge=curl/g, '')
}

/** Converte um volume da API no nosso formato. Retorna null se não der para usar. */
export function mapVolume(volume: GoogleVolume): BookInfo | null {
  const info = volume.volumeInfo
  const title = info?.title?.trim()
  if (!volume.id || !info || !title) return null

  const dimensions: BookDimensions = {
    height: parseDimension(info.dimensions?.height),
    width: parseDimension(info.dimensions?.width),
    thickness: parseDimension(info.dimensions?.thickness),
  }
  const hasDimensions = Object.values(dimensions).some((v) => v !== undefined)

  return {
    googleId: volume.id,
    title: info.subtitle ? `${title}: ${info.subtitle.trim()}` : title,
    authors: info.authors?.filter(Boolean) ?? [],
    description: info.description,
    coverUrl: pickCover(info.imageLinks),
    pageCount:
      info.pageCount && info.pageCount > 0 ? info.pageCount : undefined,
    publishedDate: info.publishedDate,
    dimensions: hasDimensions ? dimensions : undefined,
  }
}

/** Busca livros por texto (título, autor...). */
export async function searchBooks(
  query: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<BookInfo[]> {
  const params = new URLSearchParams({
    q: query,
    printType: 'books',
    maxResults: '20',
    fields: FIELDS,
  })
  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
  if (key) params.set('key', key)

  let response: Response
  try {
    response = await fetch(`${ENDPOINT}?${params}`, { signal })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new BookSearchError('network')
  }

  if (response.status === 429) throw new BookSearchError('quota')
  if (response.status === 400 || response.status === 403) {
    throw new BookSearchError('config')
  }
  if (!response.ok)
    throw new BookSearchError('unknown', `HTTP ${response.status}`)

  const data = (await response.json()) as { items?: GoogleVolume[] }
  const seen = new Set<string>()
  const books: BookInfo[] = []
  for (const volume of data.items ?? []) {
    const book = mapVolume(volume)
    if (book && !seen.has(book.googleId)) {
      seen.add(book.googleId)
      books.push(book)
    }
  }
  return books
}
