import { describe, expect, it } from 'vitest'
import { formatLongDate, parsePageCount, stripHtml, todayIso } from './text'

describe('stripHtml', () => {
  it('remove tags e mantém parágrafos', () => {
    expect(stripHtml('<p>Um <b>livro</b>.</p><p>Outro&nbsp;trecho</p>')).toBe(
      'Um livro.\n\nOutro trecho',
    )
  })

  it('converte <br> em quebra de linha', () => {
    expect(stripHtml('a<br>b<br/>c')).toBe('a\nb\nc')
  })
})

describe('datas', () => {
  it('todayIso usa a data local', () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('formatLongDate escreve por extenso', () => {
    expect(formatLongDate('2024-03-15')).toBe('15 de março de 2024')
  })
})

describe('parsePageCount', () => {
  it('aceita números positivos', () => {
    expect(parsePageCount('434')).toBe(434)
  })

  it('vazio, zero, negativo ou absurdo vira undefined', () => {
    expect(parsePageCount('')).toBeUndefined()
    expect(parsePageCount('0')).toBeUndefined()
    expect(parsePageCount('-3')).toBeUndefined()
    expect(parsePageCount('999999')).toBeUndefined()
  })
})
