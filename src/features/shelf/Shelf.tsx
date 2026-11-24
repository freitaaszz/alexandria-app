import { useMemo } from 'react'
import { sourceBookcase, useBookcaseDrag } from '@/features/drag/bookcaseDrag'
import { justDragged, useDrag } from '@/features/drag/dragStore'
import { arrange, isBlocked } from '@/features/drag/logic'
import { THEME, type ShelfArea } from '@/features/theme/themes'
import {
  ShelfLightContext,
  type ShelfLight,
} from '@/features/video-scene/lightMap'
import { useLibrary } from '@/store/library'
import { useUi } from '@/store/ui'
import { LIBRARY, range } from './config'
import { Slot } from './Slot'

type ShelfProps = {
  bookcase: number
  shelf: number
  debug: boolean
  /** Onde esta prateleira fica na imagem da estante. */
  area: ShelfArea
  /** Visual do cenário: faixa dos slots, luz e fundo de madeira. */
  look?: ShelfLook
  /** Mapa de luz do vídeo para os livros (cenários com prateleiras vazias). */
  light?: ShelfLight | null
}

export type ShelfLook = {
  /** Faixa horizontal dos slots, em % da largura da estante. */
  slotsLeft: number
  slotsWidth: number
  light: { warm: string; shadow: string }
  backdrop?: boolean
}

/** Padrão: o tema em imagem (caminho antigo). */
const DEFAULT_LOOK: ShelfLook = {
  slotsLeft: THEME.bookcase.slotsLeft,
  slotsWidth: THEME.bookcase.slotsWidth,
  light: THEME.light,
  backdrop: THEME.shelfBackdrop,
}

/**
 * Uma prateleira: a fileira de slots apoiada numa tábua.
 * As medidas usam "cqw" (% da largura da estante), então tudo escala junto,
 * da estante em tela cheia até a miniatura da visão geral.
 *
 * Durante um arraste, mostra a prévia: o livro já no lugar onde cairia e os
 * vizinhos afastados (ver features/drag/logic.ts).
 */
export function Shelf({
  bookcase,
  shelf,
  debug,
  area,
  look = DEFAULT_LOOK,
  light = null,
}: ShelfProps) {
  const books = useLibrary((s) => s.books)
  const activeId = useDrag((s) => s.active?.bookId)
  const target = useDrag((s) => s.target)

  // Arrastando uma estante: aqui aparecem os livros da estante que vai ficar
  // neste lugar (ou nada, onde a estante "na mão" vai cair)
  const source = useBookcaseDrag((s) => sourceBookcase(s, bookcase))

  const shelfBooks = useMemo(
    () =>
      arrange(books, activeId, target).filter(
        (b) => b.position.bookcase === source && b.position.shelf === shelf,
      ),
    [books, activeId, target, source, shelf],
  )

  const isTargetShelf = target?.bookcase === bookcase && target?.shelf === shelf
  const blocked =
    !!activeId &&
    !!target &&
    isTargetShelf &&
    isBlocked(books, activeId, target)

  const focused = useUi((s) => s.focusedShelf)
  const focusedBookcase = useUi((s) => s.focusedBookcase)
  const setFocusedShelf = useUi((s) => s.setFocusedShelf)
  const setFocusedBookcase = useUi((s) => s.setFocusedBookcase)
  const isFocused = focused?.bookcase === bookcase && focused?.shelf === shelf
  // Já dentro desta estante: clicar aproxima a prateleira
  const inBookcase = focusedBookcase === bookcase
  // Fora do recorte em foco, a prateleira fica apagada no fundo
  const dimmed = focused ? !isFocused : focusedBookcase !== null && !inBookcase

  /**
   * Clicar num espaço da prateleira (fora de um livro) aproxima a câmera:
   * da sala para a estante; da estante para a prateleira.
   */
  const handleClick = (e: React.MouseEvent) => {
    if (isFocused || justDragged()) return
    if ((e.target as HTMLElement).closest('[data-open-book]')) return
    if (inBookcase) setFocusedShelf({ bookcase, shelf })
    else setFocusedBookcase(bookcase)
  }

  return (
    <div
      onClick={handleClick}
      className={`group/shelf absolute transition-opacity duration-700 ${
        isFocused ? 'z-10' : 'cursor-zoom-in'
      } ${dimmed ? 'opacity-35' : ''}`}
      style={{
        left: `${look.slotsLeft}%`,
        width: `${look.slotsWidth}%`,
        top: `${area.top}%`,
        height: `${area.bottom - area.top}%`,
      }}
    >
      {/* Teclado/leitor de tela: dentro da estante, botão para aproximar a prateleira */}
      {inBookcase && !isFocused && (
        <button
          type="button"
          onClick={() => setFocusedShelf({ bookcase, shelf })}
          className="sr-only focus:not-sr-only focus:absolute focus:inset-0 focus:z-40 focus:rounded focus:ring-2 focus:ring-ember"
        >
          Aproximar prateleira {shelf + 1}
        </button>
      )}
      {/* Fundo de madeira escura (cobre os livros que já vêm no vídeo) */}
      {look.backdrop && (
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
      <ShelfLightContext.Provider value={light}>
        <div
          data-shelf={`${bookcase}-${shelf}`}
          className="grid h-full items-end gap-[0.12cqw]"
          style={{
            gridTemplateColumns: `repeat(${LIBRARY.slotsPerShelf}, minmax(0, 1fr))`,
          }}
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
      </ShelfLightContext.Provider>

      {/*
        Sem mapa de luz (cenário em imagem ou prateleiras do vídeo com livros):
        luz genérica por cima da prateleira. Com mapa, cada livro recebe a luz
        do vídeo e a própria sombra (ver Book3D).
      */}
      {!light && (
        <>
          {/*
        Luz da cena sobre os livros (por cima deles, sem bloquear cliques):
        sombra da tábua de cima, penumbra nas pontas e sombra de contato embaixo.
      */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-[8%] bottom-0 z-30 mix-blend-multiply"
            style={{
              backgroundImage: [
                `linear-gradient(180deg, ${look.light.shadow} 0%, rgb(12 6 3 / 0.55) 9%, transparent 34%)`,
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
              backgroundImage: `radial-gradient(120% 90% at 15% 30%, ${look.light.warm}, transparent 70%)`,
            }}
          />
        </>
      )}
      {/* Cenário em vídeo: luz baixa e quente de vela sobre os livros, igual à do vídeo */}
      {look.backdrop && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 mix-blend-multiply"
          style={{
            backgroundImage:
              'radial-gradient(130% 110% at 50% 85%, rgb(205 160 120), rgb(120 90 70))',
          }}
        />
      )}
      {/* Brilho suave ao passar o mouse: "dá para aproximar" */}
      {inBookcase && !focused && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[1.5%] z-30 rounded-[0.6cqw] opacity-0 shadow-[inset_0_0_0_0.35cqw_rgb(227_180_98/0.55),0_0_3cqw_rgb(227_180_98/0.25)] transition-opacity duration-200 group-hover/shelf:opacity-100"
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
