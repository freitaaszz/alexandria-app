import { useEffect, useRef, useState } from 'react'
import type { SearchErrorReason } from '@/lib/googleBooks'
import { LIBRARY } from '@/features/shelf/config'
import { useLibrary } from '@/store/library'
import { useUi, type Rect } from '@/store/ui'
import type { BookInfo } from '@/types/book'
import { SearchResult, type ResultAction } from './SearchResult'
import { useBookSearch } from './useBookSearch'

type SearchDialogProps = {
  open: boolean
  onClose: () => void
}

const ERROR_MESSAGE: Record<SearchErrorReason, string> = {
  quota: 'O limite de buscas foi atingido. Tente de novo mais tarde.',
  config:
    'A busca não está configurada. Confira a chave da Google Books no arquivo .env.',
  network: 'Sem conexão com a internet. Confira sua rede e tente de novo.',
  unknown: 'Algo deu errado na busca. Tente de novo.',
}

/**
 * Janela de busca de livros.
 * Celular: ocupa a tela toda. Desktop: janela centralizada.
 * Usa o <dialog> nativo: já prende o foco e fecha com Esc.
 */
export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const search = useBookSearch(query)

  const shelvedIds = useLibrary((s) => s.books.map((b) => b.googleId).join('|'))
  const addBook = useLibrary((s) => s.addBook)
  const startFlight = useUi((s) => s.startFlight)
  const focusBookcase = useUi((s) => s.focusBookcase)
  const libraryFull = useLibrary(
    (s) =>
      s.books.length >=
      LIBRARY.bookcases * LIBRARY.shelvesPerBookcase * LIBRARY.slotsPerShelf,
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const actionFor = (googleId: string): ResultAction => {
    if (shelvedIds.split('|').includes(googleId)) return 'on-shelf'
    if (libraryFull) return 'full'
    return 'add'
  }

  /** Coloca o livro na estante, fecha a busca e solta o voo até o slot. */
  const handleAdd = (book: BookInfo, coverRect: Rect) => {
    const result = addBook(book)
    if (!result.ok) return
    dialogRef.current?.close()
    focusBookcase(result.book.position.bookcase)
    startFlight({
      bookId: result.book.id,
      from: coverRect,
      coverUrl: book.coverUrl,
    })
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Clicar fora da janela (no fundo escuro) fecha
      onClick={(e) =>
        e.target === e.currentTarget && dialogRef.current?.close()
      }
      aria-labelledby="search-title"
      className="m-0 h-dvh max-h-none w-full max-w-none bg-wood-950 p-0 text-parchment backdrop:bg-black/70 lg:m-auto lg:h-[min(42rem,85dvh)] lg:max-w-xl lg:rounded-2xl lg:border lg:border-parchment/10 lg:shadow-2xl"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-parchment/10 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <h2 id="search-title" className="sr-only">
            Adicionar livro
          </h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome do livro ou do autor"
            aria-label="Buscar livro"
            enterKeyHint="search"
            autoComplete="off"
            autoFocus
            // 16px no mínimo: evita o zoom automático do iPhone ao focar
            className="min-h-11 flex-1 rounded-full bg-wood-900 px-4 text-base outline-none placeholder:text-parchment/40 focus-visible:ring-2 focus-visible:ring-ember"
          />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="min-h-11 rounded-full px-3 text-sm text-parchment/70"
          >
            Fechar
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto overscroll-contain px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          aria-live="polite"
          aria-busy={search.status === 'loading'}
        >
          {libraryFull && (
            <p
              role="status"
              className="m-2 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-parchment/90"
            >
              Suas 3 estantes estão cheias. Remova um livro para colocar outro.
            </p>
          )}

          {search.status === 'idle' && (
            <p className="px-4 py-10 text-center text-parchment/50">
              Digite o nome do livro ou do autor.
            </p>
          )}

          {search.status === 'loading' && (
            <ul aria-label="Carregando resultados">
              {[0, 1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="flex animate-pulse items-center gap-3 p-2"
                >
                  <div className="h-18 w-12 rounded-sm bg-parchment/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-parchment/10" />
                    <div className="h-3 w-1/2 rounded bg-parchment/10" />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {search.status === 'error' && (
            <p
              role="alert"
              className="px-4 py-10 text-center text-parchment/70"
            >
              {ERROR_MESSAGE[search.reason]}
            </p>
          )}

          {search.status === 'success' && search.results.length === 0 && (
            <p className="px-4 py-10 text-center text-parchment/50">
              Nenhum livro encontrado. Tente outro nome.
            </p>
          )}

          {search.status === 'success' && search.results.length > 0 && (
            <ul>
              {search.results.map((book) => (
                <SearchResult
                  key={book.googleId}
                  book={book}
                  action={actionFor(book.googleId)}
                  onAdd={(rect) => handleAdd(book, rect)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </dialog>
  )
}
