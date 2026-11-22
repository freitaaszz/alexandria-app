import { useLayoutEffect, useRef, useState } from 'react'
import type { ViewMode } from '@/types/library'
import { Bookcase } from './Bookcase'
import { LIBRARY, range } from './config'

/** A partir desta largura (Tailwind "lg") as 3 estantes aparecem sempre lado a lado. */
const DESKTOP_QUERY = '(min-width: 64rem)'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

type LibraryProps = {
  debug: boolean
}

/**
 * A biblioteca com as 3 estantes.
 * - Desktop: as 3 lado a lado.
 * - Celular, modo "single": uma estante por vez, deslizando para o lado.
 * - Celular, modo "overview": as 3 em miniatura; tocar numa leva até ela.
 */
export function Library({ debug }: LibraryProps) {
  const [mode, setMode] = useState<ViewMode>('single')
  const [active, setActive] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)
  /** Estante para onde rolar assim que o modo "single" aparecer na tela. */
  const pendingScroll = useRef<number | null>(null)

  const scrollToBookcase = (index: number, behavior: ScrollBehavior) => {
    const scroller = scrollerRef.current
    const target = scroller?.children[index] as HTMLElement | undefined
    if (!scroller || !target) return
    scroller.scrollTo({ left: target.offsetLeft, behavior })
  }

  // Ao sair da visão geral, já abre na estante tocada (sem animação de rolagem).
  useLayoutEffect(() => {
    if (mode !== 'single' || pendingScroll.current === null) return
    scrollToBookcase(pendingScroll.current, 'instant')
    pendingScroll.current = null
  }, [mode])

  /** Descobre qual estante está mais visível enquanto a pessoa desliza. */
  const handleScroll = () => {
    const scroller = scrollerRef.current
    if (!scroller || mode !== 'single') return
    const children = Array.from(scroller.children) as HTMLElement[]
    let nearest = 0
    children.forEach((child, i) => {
      const distance = Math.abs(child.offsetLeft - scroller.scrollLeft)
      const best = Math.abs(children[nearest].offsetLeft - scroller.scrollLeft)
      if (distance < best) nearest = i
    })
    setActive(nearest)
  }

  const openBookcase = (index: number) => {
    if (window.matchMedia(DESKTOP_QUERY).matches) return
    pendingScroll.current = index
    setActive(index)
    setMode('single')
  }

  const goTo = (index: number) =>
    scrollToBookcase(index, prefersReducedMotion() ? 'instant' : 'smooth')

  const isSingle = mode === 'single'

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-4 lg:max-w-[min(90rem,calc((100dvh-9rem)*1.8))] lg:justify-center">
      {/* Alternar visualização (só no celular) */}
      <div
        role="group"
        aria-label="Visualização"
        className="mx-auto flex rounded-full bg-wood-900 p-1 text-sm lg:hidden"
      >
        {(
          [
            ['single', 'Estante'],
            ['overview', 'Biblioteca inteira'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => {
              if (value === 'single') pendingScroll.current = active
              setMode(value)
            }}
            className={`min-h-11 rounded-full px-4 transition-colors ${
              mode === value
                ? 'bg-wood-700 text-parchment'
                : 'text-parchment/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Estantes + indicador, centralizados na altura que sobra */}
      <div className="flex flex-1 flex-col justify-center gap-4">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className={`relative lg:grid lg:grid-cols-3 lg:items-end lg:gap-8 lg:overflow-visible ${
            isSingle
              ? 'flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden'
              : 'grid grid-cols-3 items-end gap-2'
          }`}
        >
          {range(LIBRARY.bookcases).map((index) =>
            isSingle ? (
              <div
                key={index}
                className="w-full shrink-0 snap-start snap-always"
              >
                {/* Limita a largura para a estante caber na altura da tela */}
                <div className="mx-auto max-w-[calc((100dvh-12rem)*0.6)] lg:max-w-none">
                  <Bookcase index={index} debug={debug} />
                </div>
              </div>
            ) : (
              <button
                key={index}
                type="button"
                onClick={() => openBookcase(index)}
                aria-label={`Abrir estante ${index + 1}`}
                className="rounded-lg transition-transform active:scale-[0.97] lg:cursor-default lg:active:scale-100"
              >
                <Bookcase index={index} debug={debug} />
              </button>
            ),
          )}
        </div>

        {/* Indicador de qual estante está na tela (só no celular, modo single) */}
        {isSingle && (
          <div className="flex justify-center gap-1 lg:hidden">
            {range(LIBRARY.bookcases).map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ir para a estante ${index + 1}`}
                aria-current={active === index}
                className="grid size-11 place-items-center"
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    active === index ? 'w-6 bg-ember' : 'w-2 bg-parchment/30'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
