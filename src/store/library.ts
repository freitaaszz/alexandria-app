import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { createId } from '@/lib/id'
import {
  findFirstFreeSlot,
  isInBounds,
  moveBook,
  normalize,
  removeBook,
  type MoveResult,
} from '@/lib/placement'
import type { Book, BookInfo, BookPatch, SpinePalette } from '@/types/book'
import type { SlotPosition } from '@/types/library'

export type AddResult =
  { ok: true; book: Book } | { ok: false; reason: 'duplicate' | 'library-full' }

type LibraryState = {
  books: Book[]
  /** Coloca um livro no primeiro slot livre. */
  addBook: (info: BookInfo) => AddResult
  /** Edita os dados de leitura (data, nota, resenha, páginas). */
  updateBook: (id: string, patch: BookPatch) => void
  removeBook: (id: string) => void
  /** Guarda as cores da lombada calculadas a partir da capa. */
  setSpinePalette: (id: string, spine: SpinePalette) => void
  /** Move para uma posição; o resto da prateleira anda (ver lib/placement). */
  moveBook: (id: string, to: SlotPosition) => MoveResult<Book>
  /** Esvazia a biblioteca (usado nas ferramentas de desenvolvimento). */
  clear: () => void
}

/** Garante nota inteira de 1 a 5, ou nenhuma. */
const sanitizeRating = (rating: number | undefined) =>
  rating === undefined
    ? undefined
    : Math.min(5, Math.max(1, Math.round(rating)))

export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => ({
      books: [],

      addBook: (info) => {
        const { books } = get()
        if (books.some((b) => b.googleId === info.googleId)) {
          return { ok: false, reason: 'duplicate' }
        }
        const position = findFirstFreeSlot(books)
        if (!position) return { ok: false, reason: 'library-full' }

        const book: Book = {
          ...info,
          id: createId(),
          addedAt: new Date().toISOString(),
          position,
        }
        set({ books: [...books, book] })
        return { ok: true, book }
      },

      updateBook: (id, patch) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.id === id
              ? {
                  ...b,
                  ...patch,
                  rating:
                    'rating' in patch ? sanitizeRating(patch.rating) : b.rating,
                }
              : b,
          ),
        })),

      removeBook: (id) =>
        set((state) => ({ books: removeBook(state.books, id) })),

      setSpinePalette: (id, spine) =>
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? { ...b, spine } : b)),
        })),

      moveBook: (id, to) => {
        const result = moveBook(get().books, id, to)
        if (result.ok) set({ books: result.books })
        return result
      },

      clear: () => set({ books: [] }),
    }),
    {
      name: 'alexandria:biblioteca',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ books: state.books }),
      // Ignora dados corrompidos ou de posições que não existem mais.
      merge: (persisted, current) => {
        const saved = (persisted as Partial<LibraryState> | undefined)?.books
        const books = Array.isArray(saved)
          ? normalize(
              saved.filter(
                (b) => b?.id && b.position && isInBounds(b.position),
              ),
            )
          : []
        return { ...current, books }
      },
    },
  ),
)

/** Livros de uma prateleira, indexados pelo número do slot. */
export const useShelfBooks = (bookcase: number, shelf: number) =>
  useLibrary(
    useShallow((state) =>
      state.books.filter(
        (b) => b.position.bookcase === bookcase && b.position.shelf === shelf,
      ),
    ),
  )
