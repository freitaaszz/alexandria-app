import { useMemo } from 'react'
import { useDrag } from '@/features/drag/dragStore'
import { arrange, isBlocked } from '@/features/drag/logic'
import { THEME, type ShelfArea } from '@/features/theme/themes'
import { useLibrary } from '@/store/library'
import { LIBRARY, range } from './config'
import { Slot } from './Slot'

type ShelfProps = {
  bookcase: number
  shelf: number
  debug: boolean
  /** Onde esta prateleira fica na imagem da estante. */
  area: ShelfArea
}

/**
 * Uma prateleira: a fileira de slots apoiada numa tábua.
 * As medidas usam "cqw" (% da largura da estante), então tudo escala junto,
 * da estante em tela cheia até a miniatura da visão geral.
 *
 * Durante um arraste, mostra a prévia: o livro já no lugar onde cairia e os
 * vizinhos afastados (ver features/drag/logic.ts).
 */
export function Shelf({ bookcase, shelf, debug, area }: ShelfProps) {
  const books = useLibrary((s) => s.books)
  const activeId = useDrag((s) => s.active?.bookId)
  const target = useDrag((s) => s.target)

  const shelfBooks = useMemo(
    () =>
      arrange(books, activeId, target).filter(
        (b) => b.position.bookcase === bookcase && b.position.shelf === shelf,
      ),
    [books, activeId, target, bookcase, shelf],
  )

  const isTargetShelf = target?.bookcase === bookcase && target?.shelf === shelf
  const blocked =
    !!activeId &&
    !!target &&
    isTargetShelf &&
    isBlocked(books, activeId, target)

  return (
    <div
      className="absolute"
      style={{
        left: `${THEME.bookcase.slotsLeft}%`,
        width: `${THEME.bookcase.slotsWidth}%`,
        top: `${area.top}%`,
        height: `${area.bottom - area.top}%`,
      }}
    >
      {/* Fundo de madeira escura (cobre os livros que já vêm no vídeo) */}
      {THEME.shelfBackdrop && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-[1.5%] -top-[6%] bottom-0"
          style={{
            backgroundColor: '#1d120b',
            backgroundImage: [
              'linear-gradient(180deg, rgb(6 3 2) 0%, rgb(6 3 2 / 0.55) 14%, transparent 45%)',
              'linear-gradient(90deg, rgb(0 0 0 / 0.55), transparent 10%, transparent 90%, rgb(0 0 0 / 0.55))',
              'repeating-linear-gradient(90deg, rgb(60 36 20 / 0.35) 0 0.5cqw, rgb(30 18 10 / 0.35) 0.5cqw 1.6cqw)',
              'radial-gradient(90% 120% at 50% 100%, rgb(110 64 30 / 0.55), transparent 70%)',
            ].join(', '),
          }}
        />
      )}
      <div
        data-shelf={`${bookcase}-${shelf}`}
        className="grid h-full grid-cols-17 items-end gap-[0.12cqw]"
      >
        {range(LIBRARY.slotsPerShelf).map((slot) => (
          <Slot
            key={slot}
            position={{ bookcase, shelf, slot }}
            book={shelfBooks.find((b) => b.position.slot === slot)}
            debug={debug}
            dragging={!!activeId}
            isDropTarget={!!activeId && !blocked && isTargetShelf}
          />
        ))}
      </div>

      {/*
        Luz da cena sobre os livros (por cima deles, sem bloquear cliques):
        sombra da tábua de cima, penumbra nas pontas e sombra de contato embaixo.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[8%] bottom-0 z-30 mix-blend-multiply"
        style={{
          backgroundImage: [
            `linear-gradient(180deg, ${THEME.light.shadow} 0%, rgb(12 6 3 / 0.55) 9%, transparent 34%)`,
            'linear-gradient(90deg, rgb(12 6 3 / 0.5), transparent 12%, transparent 80%, rgb(12 6 3 / 0.55))',
            'linear-gradient(0deg, rgb(12 6 3 / 0.6), transparent 4%)',
          ].join(', '),
        }}
      />
      {/* Brilho quente das velas vindo do alto à esquerda */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 opacity-40 mix-blend-soft-light"
        style={{
          backgroundImage: `radial-gradient(120% 90% at 15% 30%, ${THEME.light.warm}, transparent 70%)`,
        }}
      />
      {/* Cenário em vídeo: luz baixa e quente de vela sobre os livros, igual à do vídeo */}
      {THEME.shelfBackdrop && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 mix-blend-multiply"
          style={{
            backgroundImage:
              'radial-gradient(130% 110% at 50% 85%, rgb(205 160 120), rgb(120 90 70))',
          }}
        />
      )}
      {/* Prateleira cheia durante um arraste */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-30 rounded-[0.5cqw] bg-red-700/30 shadow-[inset_0_0_0_0.3cqw_rgb(220_60_60/0.7)] transition-opacity duration-200 ${
          blocked ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
