import { describe, expect, it } from 'vitest'
import { LIBRARY } from '@/features/shelf/config'
import { findFirstFreeSlot, moveBook } from './placement'

const at = (id: string, slot: number, shelf = 0, bookcase = 0) => ({
  id,
  position: { bookcase, shelf, slot },
})

/** Slot de cada livro, para comparar fácil: { a: 0, b: 1 } */
const slots = (books: ReturnType<typeof at>[]) =>
  Object.fromEntries(books.map((b) => [b.id, b.position.slot]))

/** Prateleira 0 cheia, com livros "b0".."b16". */
const fullShelf = () =>
  Array.from({ length: LIBRARY.slotsPerShelf }, (_, i) => at(`b${i}`, i))

describe('findFirstFreeSlot', () => {
  it('começa pelo primeiro slot da primeira estante', () => {
    expect(findFirstFreeSlot([])).toEqual({ bookcase: 0, shelf: 0, slot: 0 })
  })

  it('preenche buracos antes de seguir em frente', () => {
    expect(findFirstFreeSlot([at('a', 0), at('b', 2)])).toEqual({
      bookcase: 0,
      shelf: 0,
      slot: 1,
    })
  })

  it('pula para a próxima prateleira quando a atual está cheia', () => {
    expect(findFirstFreeSlot(fullShelf())).toEqual({
      bookcase: 0,
      shelf: 1,
      slot: 0,
    })
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
  it('move para um slot vazio', () => {
    const r = moveBook([at('a', 0)], 'a', { bookcase: 0, shelf: 0, slot: 5 })
    expect(r.ok && slots(r.books)).toEqual({ a: 5 })
  })

  it('coloca em primeiro empurrando os outros para a direita', () => {
    const r = moveBook([at('a', 0), at('b', 1), at('c', 2)], 'c', {
      bookcase: 0,
      shelf: 0,
      slot: 0,
    })
    expect(r.ok && slots(r.books)).toEqual({ c: 0, a: 1, b: 2 })
  })

  it('coloca no meio de outros livros', () => {
    const r = moveBook([at('a', 0), at('b', 1), at('c', 2), at('d', 3)], 'a', {
      bookcase: 0,
      shelf: 0,
      slot: 2,
    })
    expect(r.ok && slots(r.books)).toEqual({ b: 1, a: 2, c: 3, d: 4 })
  })

  it('só empurra até o primeiro buraco', () => {
    const r = moveBook(
      [at('a', 0), at('b', 1), at('c', 5), at('x', 0, 1)],
      'x',
      {
        bookcase: 0,
        shelf: 0,
        slot: 0,
      },
    )
    expect(r.ok && slots(r.books)).toEqual({ x: 0, a: 1, b: 2, c: 5 })
  })

  it('empurra para a esquerda quando não há espaço à direita', () => {
    const books = fullShelf().filter((b) => b.id !== 'b0') // buraco só no slot 0
    books.push(at('x', 0, 1))
    const r = moveBook(books, 'x', { bookcase: 0, shelf: 0, slot: 16 })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const s = slots(r.books)
    expect(s.x).toBe(16)
    expect(s.b1).toBe(0)
    expect(s.b16).toBe(15)
  })

  it('move entre estantes', () => {
    const r = moveBook([at('a', 3)], 'a', { bookcase: 2, shelf: 3, slot: 16 })
    expect(r.ok && r.books[0].position).toEqual({
      bookcase: 2,
      shelf: 3,
      slot: 16,
    })
  })

  it('recusa prateleira cheia vinda de fora', () => {
    const books = [...fullShelf(), at('x', 0, 1)]
    expect(moveBook(books, 'x', { bookcase: 0, shelf: 0, slot: 4 })).toEqual({
      ok: false,
      reason: 'shelf-full',
    })
  })

  it('permite reorganizar dentro de uma prateleira cheia', () => {
    const r = moveBook(fullShelf(), 'b16', { bookcase: 0, shelf: 0, slot: 0 })
    expect(r.ok && slots(r.books).b16).toBe(0)
    expect(r.ok && slots(r.books).b0).toBe(1)
  })

  it('recusa posição fora da biblioteca e livro inexistente', () => {
    expect(
      moveBook([at('a', 0)], 'a', { bookcase: 0, shelf: 0, slot: 17 }).ok,
    ).toBe(false)
    expect(
      moveBook([at('a', 0)], 'zzz', { bookcase: 0, shelf: 0, slot: 1 }).ok,
    ).toBe(false)
  })

  it('nunca deixa dois livros no mesmo slot', () => {
    const books = [
      at('a', 0),
      at('b', 1),
      at('c', 2),
      at('d', 4),
      at('e', 0, 1),
    ]
    for (let target = 0; target < LIBRARY.slotsPerShelf; target++) {
      const r = moveBook(books, 'e', { bookcase: 0, shelf: 0, slot: target })
      if (!r.ok) continue
      const keys = r.books.map(
        (b) => `${b.position.bookcase}-${b.position.shelf}-${b.position.slot}`,
      )
      expect(new Set(keys).size).toBe(keys.length)
    }
  })
})
