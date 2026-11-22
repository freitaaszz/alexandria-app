import type { Book } from '@/types/book'
import { spineHeight, spineWidth } from './geometry'
import { useSpinePalette } from './useSpinePalette'

/** Profundidade do livro (da lombada até o fundo da estante). */
const DEPTH = '15cqw'
/** Largura aproximada de um slot, em cqw (ver Shelf). Usada para o tamanho do texto. */
const SLOT_WIDTH_CQW = 4.9

/** Sombreado que dá volume à lombada (bordas mais escuras, brilho à esquerda). */
const SPINE_SHADING =
  'linear-gradient(90deg, rgb(0 0 0/0.4) 0%, rgb(255 255 255/0.12) 16%, rgb(255 255 255/0) 42%, rgb(0 0 0/0.12) 78%, rgb(0 0 0/0.45) 100%)'

/** Borda das páginas vista de cima. */
const PAGES =
  'repeating-linear-gradient(90deg, #efe6d2 0 0.35cqw, #d9cdb3 0.35cqw 0.45cqw)'

/**
 * Um livro em pé na estante, com profundidade leve.
 * - Frente: a lombada (cor da capa, título e autor).
 * - Lado direito: a capa; lado esquerdo: a contracapa; topo: as páginas.
 * Os lados aparecem conforme a posição do livro em relação ao "olho" (ver Slot).
 */
export function Book3D({ book }: { book: Book }) {
  const palette = useSpinePalette(book)
  const width = spineWidth(book)
  const height = spineHeight(book)

  const bookWidthCqw = (SLOT_WIDTH_CQW * width) / 100
  const titleSize = Math.min(2.1, bookWidthCqw * 0.55)
  const showAuthor = width >= 68 && book.authors.length > 0

  return (
    <div
      data-book-id={book.id}
      className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d] group-hover:[@media(hover:hover)]:-translate-y-[2.5%]"
      style={{ width: `${width}%`, height: `${height}%` }}
    >
      {/* Lombada */}
      <div
        className="absolute inset-0 overflow-hidden rounded-[0.25cqw] [backface-visibility:hidden]"
        style={{ backgroundColor: palette.base, color: palette.text }}
      >
        {/* Faixas decorativas */}
        <div
          className="absolute inset-x-0 top-[6%] h-[1.1cqw] opacity-90"
          style={{ backgroundColor: palette.accent }}
        />
        <div
          className="absolute inset-x-0 top-[9.5%] h-[0.3cqw] opacity-70"
          style={{ backgroundColor: palette.accent }}
        />
        <div
          className="absolute inset-x-0 bottom-[5%] h-[1.1cqw] opacity-90"
          style={{ backgroundColor: palette.accent }}
        />

        {/* Título */}
        <div className="absolute inset-x-0 top-[13%] bottom-[22%] flex items-center justify-center">
          <span
            className="max-h-full truncate font-display leading-none font-semibold tracking-wide [writing-mode:vertical-rl]"
            style={{ fontSize: `${titleSize}cqw` }}
          >
            {book.title}
          </span>
        </div>

        {/* Autor */}
        {showAuthor && (
          <div className="absolute inset-x-0 bottom-[8.5%] flex h-[12%] justify-center">
            <span
              className="max-h-full truncate leading-none opacity-80 [writing-mode:vertical-rl]"
              style={{ fontSize: `${titleSize * 0.62}cqw` }}
            >
              {book.authors[0]}
            </span>
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: SPINE_SHADING }}
        />
      </div>

      {/* Capa (lado direito) */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-full h-full origin-left [backface-visibility:hidden]"
        style={{
          width: DEPTH,
          transform: 'rotateY(90deg)',
          backgroundColor: palette.base,
          backgroundImage: book.coverUrl
            ? `linear-gradient(90deg, rgb(0 0 0/0.45), rgb(0 0 0/0.15)), url("${book.coverUrl}")`
            : 'linear-gradient(90deg, rgb(0 0 0/0.45), rgb(0 0 0/0.2))',
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
        }}
      />

      {/* Contracapa (lado esquerdo) */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-full h-full origin-right [backface-visibility:hidden]"
        style={{
          width: DEPTH,
          transform: 'rotateY(-90deg)',
          backgroundColor: palette.base,
          backgroundImage:
            'linear-gradient(270deg, rgb(0 0 0/0.5), rgb(0 0 0/0.25))',
        }}
      />

      {/* Páginas (topo) */}
      <div
        aria-hidden="true"
        className="absolute bottom-full left-0 w-full origin-bottom [backface-visibility:hidden]"
        style={{
          height: DEPTH,
          transform: 'rotateX(90deg)',
          backgroundImage: `linear-gradient(0deg, rgb(0 0 0/0) 40%, rgb(0 0 0/0.5)), ${PAGES}`,
        }}
      />
    </div>
  )
}
