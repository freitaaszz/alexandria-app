import { useId, useState } from 'react'
import { useSpinePalette } from '@/features/book/useSpinePalette'
import { parsePageCount, stripHtml, todayIso } from '@/lib/text'
import { useLibrary } from '@/store/library'
import type { Book } from '@/types/book'
import { StarRating } from './StarRating'

type BookDetailsProps = {
  book: Book
  titleId: string
  onRemove: () => void
}

const REVIEW_MAX = 2000
/** Sinopses maiores que isso começam recolhidas, com "Ler mais". */
const SYNOPSIS_PREVIEW = 280

const label =
  'mb-2 block text-xs font-medium tracking-widest text-parchment/50 uppercase'
const field =
  'min-h-11 w-full rounded-xl bg-wood-900 px-4 text-base text-parchment outline-none placeholder:text-parchment/30 focus-visible:ring-2 focus-visible:ring-ember'

/** Conteúdo do modal: informações do livro e dados da leitura (salvos na hora). */
export function BookDetails({ book, titleId, onRemove }: BookDetailsProps) {
  const updateBook = useLibrary((s) => s.updateBook)
  const palette = useSpinePalette(book)
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const [synopsisOpen, setSynopsisOpen] = useState(false)
  const ids = { date: useId(), pages: useId(), review: useId() }

  const synopsis = book.description ? stripHtml(book.description) : ''
  const synopsisIsLong = synopsis.length > SYNOPSIS_PREVIEW
  const year = book.publishedDate?.slice(0, 4)
  const update = (patch: Parameters<typeof updateBook>[1]) =>
    updateBook(book.id, patch)

  return (
    <div className="flex flex-col gap-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {/* Topo: capa e título, com a cor do livro ao fundo */}
      <div
        className="flex gap-4 px-5 pt-2 pb-5 lg:pt-6"
        style={{
          backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${palette.base} 45%, transparent), transparent)`,
        }}
      >
        <div
          className="aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-md shadow-xl shadow-black/50 lg:w-28"
          style={{ backgroundColor: palette.base }}
        >
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={`Capa de ${book.title}`}
              referrerPolicy="no-referrer"
              className="size-full object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center text-3xl">📖</div>
          )}
        </div>
        <div className="min-w-0 self-end pr-10">
          <h2
            id={titleId}
            className="font-display text-xl leading-tight text-balance lg:text-2xl"
          >
            {book.title}
          </h2>
          {book.authors.length > 0 && (
            <p className="mt-1 text-parchment/70">{book.authors.join(', ')}</p>
          )}
          {year && <p className="mt-1 text-sm text-parchment/45">{year}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5">
        {/* Nota */}
        <section>
          <span className={label}>Sua nota</span>
          <div className="flex items-center gap-3">
            <StarRating
              value={book.rating}
              onChange={(rating) => update({ rating })}
            />
            <span className="text-sm text-parchment/50">
              {book.rating ? `${book.rating} de 5` : 'Sem nota'}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          {/* Data */}
          <section>
            <label htmlFor={ids.date} className={label}>
              Lido em
            </label>
            <input
              id={ids.date}
              type="date"
              value={book.readAt ?? ''}
              max={todayIso()}
              onChange={(e) => update({ readAt: e.target.value || undefined })}
              className={`${field} [color-scheme:dark]`}
            />
          </section>

          {/* Páginas */}
          <section>
            <label htmlFor={ids.pages} className={label}>
              Páginas
            </label>
            <input
              id={ids.pages}
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="—"
              value={book.pageCount ?? ''}
              onChange={(e) =>
                update({ pageCount: parsePageCount(e.target.value) })
              }
              className={field}
            />
          </section>
        </div>

        {/* Resenha */}
        <section>
          <label htmlFor={ids.review} className={label}>
            Sua resenha
          </label>
          <textarea
            id={ids.review}
            rows={4}
            maxLength={REVIEW_MAX}
            placeholder="O que você achou do livro?"
            value={book.review ?? ''}
            onChange={(e) => update({ review: e.target.value || undefined })}
            className={`${field} resize-none py-3 leading-relaxed`}
          />
          <p className="mt-1 text-right text-xs text-parchment/35">
            {(book.review ?? '').length}/{REVIEW_MAX} · salvo automaticamente
          </p>
        </section>

        {/* Sinopse */}
        {synopsis && (
          <section>
            <span className={label}>Sinopse</span>
            <p
              className={`text-sm leading-relaxed whitespace-pre-line text-parchment/75 ${
                synopsisOpen || !synopsisIsLong ? '' : 'line-clamp-5'
              }`}
            >
              {synopsis}
            </p>
            {synopsisIsLong && (
              <button
                type="button"
                onClick={() => setSynopsisOpen((open) => !open)}
                aria-expanded={synopsisOpen}
                className="mt-1 min-h-11 text-sm font-medium text-ember"
              >
                {synopsisOpen ? 'Mostrar menos' : 'Ler mais'}
              </button>
            )}
          </section>
        )}

        {/* Remover */}
        <section className="border-t border-parchment/10 pt-4">
          {confirmingRemove ? (
            <div role="group" aria-label="Confirmar remoção">
              <p className="mb-3 text-sm text-parchment/80">
                Tirar <strong>{book.title}</strong> da estante? A nota e a
                resenha também serão apagadas.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirmingRemove(false)}
                  className="min-h-11 flex-1 rounded-full border border-parchment/20 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className="min-h-11 flex-1 rounded-full bg-red-800 text-sm font-medium text-parchment"
                >
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              className="min-h-11 text-sm text-red-300/80"
            >
              Remover da estante
            </button>
          )}
        </section>
      </div>
    </div>
  )
}
