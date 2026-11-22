import { describe, expect, it } from 'vitest'
import { LIBRARY } from '@/features/shelf/config'
import { findFirstFreeSlot, moveBook, normalize, removeBook } from './placement'

const at = (id: string, slot: number, shelf = 0, bookcase = 0) => ({
  id,
  position: { bookcase, shelf, slot },
})
const pos = (slot: number, shelf = 0, bookcase = 0) => ({
  bookcase,
  shelf,
  slot,
})

type B = ReturnType<typeof at>

/** Ordem dos livros numa prateleira, ex.: "a b c". */
const order = (books: B[], shelf = 0, bookcase = 0) =>
  books
    .filter(
      (b) => b.position.shelf === shelf && b.position.bookcase === bookcase,
    )
    .sort((a, b) => a.position.slot - b.position.slot)
    .map((b) => b.id)
    .join(' ')

/** Confere que toda prateleira usa os slots 0..n-1, sem buracos nem repetição. */
const expectPacked = (books: B[]) => {
  const byShelf = new Map<string, number[]>()
  for (const b of books) {
    const k = `${b.position.bookcase}-${b.position.shelf}`
    byShelf.set(k, [...(byShelf.get(k) ?? []), b.position.slot])
  }
  for (const slots of byShelf.values()) {
    expect(slots.sort((a, b) => a - b)).toEqual(slots.map((_, i) => i))
  }
}

const shelfOf = (n: number, prefix = 'b', shelf = 0) =>
  Array.from({ length: n }, (_, i) => at(`${prefix}${i}`, i, shelf))

describe('findFirstFreeSlot', () => {
  it('começa pelo primeiro slot', () => {
    expect(findFirstFreeSlot([])).toEqual(pos(0))
  })

  it('coloca no fim da prateleira, junto dos outros', () => {
    expect(findFirstFreeSlot(shelfOf(3))).toEqual(pos(3))
  })

  it('pula para a próxima prateleira quando a atual está cheia', () => {
    expect(findFirstFreeSlot(shelfOf(LIBRARY.slotsPerShelf))).toEqual(pos(0, 1))
  })

  it('retorna null quando a biblioteca está cheia', () => {
    const all = []
    for (let bc = 0; bc < LIBRARY.bookcases; bc++)
      for (let sh = 0; sh < LIBRARY.shelvesPerBookcase; sh++)
        for (let s = 0; s < LIBRARY.slotsPerShelf; s++)
          all.push(at(`${bc}-${sh}-${s}`, s, sh, bc))
    expect(findFirstFreeSlot(all)).toBeNull()
  })
})

describe('moveBook', () => {
  it('coloca em primeiro e o resto anda', () => {
    const r = moveBook([at('a', 0), at('b', 1), at('c', 2)], 'c', pos(0))
    expect(r.ok && order(r.books)).toBe('c a b')
  })

  it('coloca no meio de outros livros', () => {
    const r = moveBook(shelfOf(4, ''), '0', pos(2))
    expect(r.ok && order(r.books)).toBe('1 2 0 3')
  })

  it('soltar depois do último livro deixa ele no fim, sem buraco', () => {
    const r = moveBook([at('a', 0), at('b', 1), at('x', 0, 1)], 'x', pos(15))
    expect(r.ok && order(r.books)).toBe('a b x')
    expect(r.ok && r.books.find((b) => b.id === 'x')!.position.slot).toBe(2)
  })

  it('a prateleira de origem fecha o buraco', () => {
    const books = [at('a', 0), at('b', 1), at('c', 2), at('x', 0, 1)]
    const r = moveBook(books, 'b', pos(0, 1))
    expect(r.ok && order(r.books, 0)).toBe('a c')
    expect(r.ok && order(r.books, 1)).toBe('b x')
    if (r.ok) expectPacked(r.books)
  })

  it('move entre estantes', () => {
    const r = moveBook([at('a', 0), at('b', 1)], 'a', pos(0, 3, 2))
    expect(r.ok && order(r.books, 3, 2)).toBe('a')
    expect(r.ok && order(r.books, 0, 0)).toBe('b')
  })

  it('recusa prateleira cheia vinda de fora', () => {
    const books = [...shelfOf(LIBRARY.slotsPerShelf), at('x', 0, 1)]
    expect(moveBook(books, 'x', pos(4))).toEqual({
      ok: false,
      reason: 'shelf-full',
    })
  })

  it('permite reorganizar dentro de uma prateleira cheia', () => {
    const r = moveBook(shelfOf(LIBRARY.slotsPerShelf), 'b16', pos(0))
    expect(r.ok && order(r.books).startsWith('b16 b0 b1')).toBe(true)
  })

  it('recusa posição fora da biblioteca e livro inexistente', () => {
    expect(moveBook([at('a', 0)], 'a', pos(17)).ok).toBe(false)
    expect(moveBook([at('a', 0)], 'zzz', pos(1)).ok).toBe(false)
  })

  it('sempre mantém as prateleiras juntas, em qualquer movimento', () => {
    const books = [...shelfOf(5, 'a', 0), ...shelfOf(3, 'c', 1)]
    for (const b of books)
      for (let shelf = 0; shelf < 2; shelf++)
        for (let slot = 0; slot < LIBRARY.slotsPerShelf; slot++) {
          const r = moveBook(books, b.id, pos(slot, shelf))
          expect(r.ok).toBe(true)
          if (r.ok) {
            expectPacked(r.books)
            expect(r.books).toHaveLength(books.length)
          }
        }
  })
})

describe('removeBook', () => {
  it('fecha o buraco ao remover', () => {
    const r = removeBook([at('a', 0), at('b', 1), at('c', 2)], 'a')
    expect(order(r)).toBe('b c')
    expectPacked(r)
  })
})

describe('normalize', () => {
  it('junta livros com buracos à esquerda, mantendo a ordem', () => {
    const r = normalize([at('a', 3), at('b', 9), at('c', 0)])
    expect(order(r)).toBe('c a b')
    expectPacked(r)
  })
})
