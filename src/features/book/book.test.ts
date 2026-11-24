import { describe, expect, it } from 'vitest'
import {
  MAX_WIDTH,
  MIN_WIDTH,
  hashString,
  spineHeight,
  spineTitle,
  spineWidth,
} from './geometry'
import { extractPalette, fallbackPalette, textColorFor } from './palette'
import { proxiedCoverUrl } from './coverPixels'

/** Cria pixels RGBA a partir de [cor, quantidade]. */
const pixels = (...groups: [[number, number, number], number][]) => {
  const out: number[] = []
  for (const [[r, g, b], n] of groups)
    for (let i = 0; i < n; i++) out.push(r, g, b, 255)
  return new Uint8ClampedArray(out)
}

describe('extractPalette', () => {
  it('a cor dominante vira a base da lombada', () => {
    const p = extractPalette(pixels([[180, 30, 40], 80], [[240, 220, 200], 20]))
    expect(p?.base).toBe('#b41e28')
  })

  it('escolhe um destaque bem diferente da base', () => {
    const p = extractPalette(pixels([[20, 40, 90], 70], [[230, 180, 40], 30]))
    expect(p?.accent).toBe('#e6b428')
  })

  it('gera um destaque mesmo com capa de uma cor só', () => {
    const p = extractPalette(pixels([[30, 90, 60], 100]))
    expect(p?.accent).toBeDefined()
    expect(p?.accent).not.toBe(p?.base)
  })

  it('texto claro em fundo escuro e escuro em fundo claro', () => {
    expect(textColorFor([20, 20, 30])).toBe('#f3e9d7')
    expect(textColorFor([240, 235, 220])).toBe('#1a120c')
  })

  it('ignora pixels transparentes e imagem vazia', () => {
    expect(extractPalette(new Uint8ClampedArray([255, 0, 0, 0]))).toBeNull()
  })
})

describe('fallbackPalette', () => {
  it('é estável para o mesmo livro', () => {
    expect(fallbackPalette('abc')).toEqual(fallbackPalette('abc'))
  })
})

describe('geometria da lombada', () => {
  it('mais páginas = livro mais grosso', () => {
    const fino = spineWidth({ id: 'a', pageCount: 96 })
    const grosso = spineWidth({ id: 'a', pageCount: 658 })
    expect(grosso).toBeGreaterThan(fino)
    expect(fino).toBeGreaterThanOrEqual(MIN_WIDTH)
    expect(spineWidth({ id: 'a', pageCount: 5000 })).toBe(MAX_WIDTH)
  })

  it('prefere a espessura real quando existe', () => {
    expect(
      spineWidth({ id: 'a', pageCount: 100, dimensions: { thickness: 5 } }),
    ).toBe(MAX_WIDTH)
  })

  it('altura pela medida real ou variação estável', () => {
    expect(spineHeight({ id: 'a', dimensions: { height: 28 } })).toBe(100)
    expect(spineHeight({ id: 'x' })).toBe(spineHeight({ id: 'x' }))
  })

  it('hash fica entre 0 e 1', () => {
    for (const s of ['', 'a', 'livro longo'])
      expect(hashString(s)).toBeGreaterThanOrEqual(0)
  })
})

describe('proxiedCoverUrl', () => {
  it('passa as capas da Google pelo proxy do próprio site', () => {
    expect(
      proxiedCoverUrl('https://books.google.com/books/content?id=1&zoom=1'),
    ).toBe('/capas/books/content?id=1&zoom=1')
  })

  it('não mexe em outros endereços', () => {
    expect(proxiedCoverUrl('https://exemplo.com/a.jpg')).toBeNull()
  })
})

describe('spineTitle', () => {
  it('tira o subtítulo, como nas lombadas de verdade', () => {
    expect(spineTitle('Sapiens: Uma breve história da humanidade')).toBe(
      'Sapiens',
    )
    expect(spineTitle('Duna (Crônicas de Duna, #1)')).toBe('Duna')
    expect(spineTitle('O Hobbit - edição de bolso')).toBe('O Hobbit')
    expect(spineTitle('Cem Anos de Solidão')).toBe('Cem Anos de Solidão')
  })
})
