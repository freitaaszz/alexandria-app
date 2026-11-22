import { useRef } from 'react'
import type { Rect } from '@/store/ui'
import type { BookInfo } from '@/types/book'

export type ResultAction = 'add' | 'on-shelf' | 'full'

type SearchResultProps = {
  book: BookInfo
  action: ResultAction
  /** Recebe a posição da capa na tela (ponto de partida do voo). */
  onAdd: (coverRect: Rect) => void
}

const ACTION_LABEL: Record<ResultAction, string> = {
  add: 'Adicionar',
  'on-shelf': 'Na estante',
  full: 'Estantes cheias',
}

/** Um livro na lista de resultados da busca. */
export function SearchResult({ book, action, onAdd }: SearchResultProps) {
  const coverRef = useRef<HTMLDivElement>(null)
  const year = book.publishedDate?.slice(0, 4)
  const details = [year, book.pageCount && `${book.pageCount} páginas`]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className="flex items-center gap-3 rounded-xl p-2 hover:bg-parchment/5">
      <div ref={coverRef} className="h-18 w-12 shrink-0">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-full rounded-sm bg-wood-700 object-cover shadow-md"
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid size-full place-items-center rounded-sm bg-wood-700 text-lg"
          >
            📖
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 leading-snug font-medium">{book.title}</p>
        {book.authors.length > 0 && (
          <p className="truncate text-sm text-parchment/60">
            {book.authors.join(', ')}
          </p>
        )}
        {details && <p className="text-xs text-parchment/40">{details}</p>}
      </div>

      <button
        type="button"
        onClick={() => {
          const r = coverRef.current?.getBoundingClientRect()
          onAdd({
            x: r?.x ?? 0,
            y: r?.y ?? 0,
            width: r?.width ?? 48,
            height: r?.height ?? 72,
          })
        }}
        disabled={action !== 'add'}
        aria-label={
          action === 'add' ? `Adicionar ${book.title} à estante` : undefined
        }
        className="min-h-11 shrink-0 rounded-full bg-ember px-4 text-sm font-medium text-wood-950 transition-transform active:scale-95 disabled:bg-parchment/10 disabled:text-parchment/50 disabled:active:scale-100"
      >
        {ACTION_LABEL[action]}
      </button>
    </li>
  )
}
