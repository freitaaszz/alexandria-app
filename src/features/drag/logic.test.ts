import { describe, expect, it } from 'vitest'
import { LIBRARY } from '@/features/shelf/config'
import { arrange, isBlocked, keyboardStep, slotIndexFromX } from './logic'

const at = (id: string, slot: number, shelf = 0, bookcase = 0) => ({
  id,
  position: { bookcase, shelf, slot },
})
const pos = (slot: number, shelf = 0, bookcase = 0) => ({
  bookcase,
  shelf,
  slot,
})
const fullShelf = (shelf = 0) =>
  Array.from({ length: LIBRARY.slotsPerShelf }, (_, i) => at(`f${i}`, i, shelf))

describe('isBlocked', () => {
  it('bloqueia prateleira cheia vinda de outra prateleira', () => {
    const books = [...fullShelf(0), at('x', 0, 1)]
    expect(isBlocked(books, 'x', pos(3, 0))).toBe(true)
  })

  it('não bloqueia reorganizar dentro da própria prateleira cheia', () => {
    expect(isBlocked(fullShelf(0), 'f2', pos(10, 0))).toBe(false)
  })
})

describe('arrange', () => {
  it('mostra o livro no destino com os vizinhos afastados', () => {
    const books = [at('a', 0), at('b', 1), at('c', 2)]
    const r = arrange(books, 'c', pos(0))
    expect(r.find((b) => b.id === 'c')!.position.slot).toBe(0)
    expect(r.find((b) => b.id === 'a')!.position.slot).toBe(1)
  })

  it('sem destino ou bloqueado, nada muda', () => {
    const books = [...fullShelf(0), at('x', 0, 1)]
    expect(arrange(books, 'x', null)).toBe(books)
    expect(arrange(books, 'x', pos(3, 0))).toBe(books)
  })
})

describe('slotIndexFromX', () => {
  it('divide a prateleira em 17 partes', () => {
    expect(slotIndexFromX(0, 0, 170)).toBe(0)
    expect(slotIndexFromX(15, 0, 170)).toBe(1)
    expect(slotIndexFromX(169, 0, 170)).toBe(16)
  })

  it('fica dentro dos limites', () => {
    expect(slotIndexFromX(-50, 0, 170)).toBe(0)
    expect(slotIndexFromX(999, 0, 170)).toBe(16)
  })
})

describe('keyboardStep', () => {
  const books = [at('a', 0), at('b', 1), at('c', 2), at('d', 0, 1)]

  it('← e → andam na prateleira, sem passar do fim da fila', () => {
    expect(keyboardStep(books, 'a', pos(0), 'ArrowLeft')).toEqual(pos(0))
    expect(keyboardStep(books, 'a', pos(0), 'ArrowRight')).toEqual(pos(1))
    // sem contar o "a", sobram 2 livros: a última posição é 2
    expect(keyboardStep(books, 'a', pos(2), 'ArrowRight')).toEqual(pos(2))
  })

  it('↓ desce de prateleira e passa para a próxima estante', () => {
    expect(keyboardStep(books, 'a', pos(2, 0), 'ArrowDown')).toEqual(pos(1, 1))
    expect(keyboardStep(books, 'a', pos(0, 3, 0), 'ArrowDown')).toEqual(
      pos(0, 0, 1),
    )
  })

  it('↑ no topo da primeira estante não sai do lugar', () => {
    expect(keyboardStep(books, 'a', pos(0, 0, 0), 'ArrowUp')).toEqual(pos(0))
  })

  it('ignora outras teclas', () => {
    expect(keyboardStep(books, 'a', pos(0), 'KeyA')).toBeNull()
  })
})
