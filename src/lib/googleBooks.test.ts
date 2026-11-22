import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BookSearchError,
  mapVolume,
  parseDimension,
  pickCover,
  searchBooks,
} from './googleBooks'

describe('parseDimension', () => {
  it('lê centímetros, polegadas e milímetros', () => {
    expect(parseDimension('24.00 cm')).toBe(24)
    expect(parseDimension('9.5 in')).toBe(24.13)
    expect(parseDimension('15 mm')).toBe(1.5)
    expect(parseDimension('3,2 cm')).toBe(3.2)
  })

  it('ignora valores inválidos', () => {
    expect(parseDimension(undefined)).toBeUndefined()
    expect(parseDimension('abc')).toBeUndefined()
    expect(parseDimension('0 cm')).toBeUndefined()
  })
})

describe('pickCover', () => {
  it('prefere a maior imagem, força https e remove a dobra', () => {
    expect(
      pickCover({
        thumbnail: 'http://books.google.com/x?id=1&zoom=1&edge=curl',
        small: 'http://books.google.com/x?id=1&zoom=2&edge=curl',
      }),
    ).toBe('https://books.google.com/x?id=1&zoom=2')
  })

  it('retorna undefined sem imagens', () => {
    expect(pickCover(undefined)).toBeUndefined()
  })
})

describe('mapVolume', () => {
  it('converte um volume completo', () => {
    expect(
      mapVolume({
        id: 'abc',
        volumeInfo: {
          title: 'Corte de espinhos e rosas',
          authors: ['Sarah J. Maas'],
          pageCount: 434,
          publishedDate: '2015',
          dimensions: { height: '23.00 cm' },
          imageLinks: { thumbnail: 'http://img/1' },
        },
      }),
    ).toEqual({
      googleId: 'abc',
      title: 'Corte de espinhos e rosas',
      authors: ['Sarah J. Maas'],
      description: undefined,
      coverUrl: 'https://img/1',
      pageCount: 434,
      publishedDate: '2015',
      dimensions: { height: 23, width: undefined, thickness: undefined },
    })
  })

  it('junta subtítulo e lida com campos faltando', () => {
    const book = mapVolume({
      id: 'x',
      volumeInfo: { title: 'Duna', subtitle: 'Edição de luxo', pageCount: 0 },
    })
    expect(book?.title).toBe('Duna: Edição de luxo')
    expect(book?.authors).toEqual([])
    expect(book?.pageCount).toBeUndefined()
    expect(book?.coverUrl).toBeUndefined()
    expect(book?.dimensions).toBeUndefined()
  })

  it('descarta volume sem título', () => {
    expect(mapVolume({ id: 'x', volumeInfo: {} })).toBeNull()
    expect(mapVolume({ id: 'x' })).toBeNull()
  })
})

describe('searchBooks', () => {
  afterEach(() => vi.unstubAllGlobals())

  const mockFetch = (status: number, body: unknown) =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(body), { status })),
    )

  it('retorna livros sem repetidos', async () => {
    const volume = { id: 'a', volumeInfo: { title: 'A' } }
    mockFetch(200, { items: [volume, volume, { id: 'b' }] })
    const books = await searchBooks('a')
    expect(books.map((b) => b.googleId)).toEqual(['a'])
  })

  it('retorna lista vazia quando não há resultados', async () => {
    mockFetch(200, {})
    expect(await searchBooks('zzzz')).toEqual([])
  })

  it('identifica limite de uso estourado', async () => {
    mockFetch(429, {})
    await expect(searchBooks('a')).rejects.toMatchObject({ reason: 'quota' })
  })

  it('identifica chave inválida ou API desativada', async () => {
    mockFetch(400, {})
    await expect(searchBooks('a')).rejects.toMatchObject({ reason: 'config' })
  })

  it('identifica falta de internet', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    await expect(searchBooks('a')).rejects.toBeInstanceOf(BookSearchError)
    await expect(searchBooks('a')).rejects.toMatchObject({ reason: 'network' })
  })
})
