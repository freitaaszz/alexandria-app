import { useContext, type CSSProperties } from 'react'
import { LIBRARY } from '@/features/shelf/config'
import { SLOT_WIDTH_CQW } from '@/features/theme/themes'
import {
  ShelfLightContext,
  type ShelfLight,
} from '@/features/video-scene/lightMap'
import type { Book } from '@/types/book'
import { spineHeight, spineWidth } from './geometry'
import { useSpinePalette } from './useSpinePalette'

/** Profundidade do livro (da lombada até o fundo da estante). */
const DEPTH = '15cqw'

/** Couro: ruído gerado pelo navegador (sem emendas e sem baixar imagem). */
const LEATHER = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.6 -0.35'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`

/** Volume da lombada: bordas arredondadas mais escuras, brilho do verniz à esquerda. */
const SPINE_SHADING =
  'linear-gradient(90deg, rgb(0 0 0/0.55) 0%, rgb(0 0 0/0.12) 9%, rgb(255 236 200/0.16) 24%, rgb(255 236 200/0.05) 38%, rgb(0 0 0/0) 55%, rgb(0 0 0/0.18) 80%, rgb(0 0 0/0.6) 100%)'

/** Borda das páginas vista de cima (papel envelhecido). */
const PAGES =
  'repeating-linear-gradient(90deg, #e2d2ad 0 0.3cqw, #b9a47c 0.3cqw 0.38cqw)'

/** Ouro envelhecido para filetes e títulos. */
const GOLD = 'linear-gradient(180deg, #f3dc9a 0%, #c99a45 45%, #8a6424 100%)'
const GOLD_TEXT = '#e0bc72'

/** Retângulo em frações da prateleira (0–1). */
type ShelfRect = { left: number; top: number; width: number; height: number }

/**
 * Pedaço do mapa de luz que cai sobre `rect` (em frações da prateleira),
 * como fundo de um elemento do tamanho desse retângulo.
 */
function lightStyle(light: ShelfLight, rect: ShelfRect): CSSProperties {
  // Tamanho e origem do quadro inteiro, em frações da prateleira
  const imageW = light.sceneWidth / light.width
  const imageH = light.sceneHeight / light.height
  const originX = -light.left / light.width
  const originY = -light.top / light.height
  // Agora relativos ao elemento
  const sx = imageW / rect.width
  const sy = imageH / rect.height
  const offX = (originX - rect.left) / rect.width
  const offY = (originY - rect.top) / rect.height
  // background-position em %: deslocamento = p × (elemento − imagem)
  return {
    backgroundImage: `url("${light.url}")`,
    backgroundSize: `${sx * 100}% ${sy * 100}%`,
    backgroundPosition: `${(offX / (1 - sx)) * 100}% ${(offY / (1 - sy)) * 100}%`,
    filter: 'brightness(var(--scene-flicker, 1))',
  }
}

/** Multiplica a cor do que está embaixo pela luz do vídeo naquele ponto. */
function LightLayer({ style }: { style: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-multiply"
      style={style}
    />
  )
}

const SLOT_CENTER = (LIBRARY.slotsPerShelf - 1) / 2

/** Uma nervura em relevo (as "costelas" das lombadas antigas) com filetes dourados. */
function Band({ at }: { at: string }) {
  return (
    <div className="absolute inset-x-0 h-[1.4cqw]" style={{ top: at }}>
      <div
        className="absolute inset-x-0 top-0 h-[0.12cqw]"
        style={{ backgroundImage: GOLD }}
      />
      <div
        className="absolute inset-x-0 top-[0.3cqw] h-[0.8cqw]"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgb(255 240 210/0.28), rgb(0 0 0/0.05) 45%, rgb(0 0 0/0.55))',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[0.12cqw]"
        style={{ backgroundImage: GOLD }}
      />
    </div>
  )
}

/**
 * Um livro em pé na estante: lombada de couro com nervuras e título gravado,
 * capa e contracapa nas laterais e páginas no topo (aparecem levemente com a perspectiva).
 */
export function Book3D({ book }: { book: Book }) {
  const palette = useSpinePalette(book)
  const width = spineWidth(book)
  const height = spineHeight(book)

  // Luz do vídeo (só na prateleira; o livro "na mão" fica sem)
  const light = useContext(ShelfLightContext)
  const slot = book.position.slot
  const n = LIBRARY.slotsPerShelf
  const spineRect: ShelfRect = {
    left: (slot + (1 - width / 100) / 2) / n,
    top: 1 - height / 100,
    width: width / 100 / n,
    height: height / 100,
  }
  const spineLight = light && lightStyle(light, spineRect)
  // As páginas (topo) recebem a luz logo acima da lombada
  const pagesLight =
    light &&
    lightStyle(light, {
      ...spineRect,
      top: spineRect.top - 0.06,
      height: 0.06,
    })
  // A sombra no fundo da estante vai para longe do centro (a luz vem do meio)
  const shadowSide = (slot - SLOT_CENTER) / SLOT_CENTER

  const bookWidthCqw = (SLOT_WIDTH_CQW * width) / 100
  const titleSize = Math.min(1.9, bookWidthCqw * 0.5)
  const showAuthor = width >= 68 && book.authors.length > 0
  // Livro escuro: título em ouro. Livro claro: título em tinta escura.
  const darkSpine = palette.text !== '#1a120c'
  const titleColor = darkSpine ? GOLD_TEXT : '#2a1a0e'
  const titleShadow = darkSpine
    ? '0 0.08cqw 0 rgb(0 0 0/0.8), 0 -0.05cqw 0 rgb(255 230 170/0.25)'
    : '0 0.06cqw 0 rgb(255 255 255/0.35)'

  return (
    <div
      data-book-id={book.id}
      className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d] group-hover:[@media(hover:hover)]:-translate-y-[2.5%]"
      style={{ width: `${width}%`, height: `${height}%` }}
    >
      {light && (
        <>
          {/* Sombra no fundo da estante, atrás do livro */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[0.4cqw] bg-black"
            style={{
              transform: `translateZ(calc(${DEPTH} * -1)) translateX(${shadowSide * 18}%) translateY(4%)`,
              filter: 'blur(0.9cqw)',
              opacity: 0.6,
            }}
          />
          {/* Sombra de contato na tábua */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-[35%] -bottom-[2.5%] h-[6%]"
            style={{
              backgroundImage:
                'radial-gradient(50% 50% at 50% 50%, rgb(0 0 0 / 0.75), transparent)',
            }}
          />
        </>
      )}

      {/* Lombada */}
      <div
        className="absolute inset-0 overflow-hidden rounded-[0.35cqw] [backface-visibility:hidden]"
        style={{ backgroundColor: palette.base }}
      >
        {/* Textura de couro */}
        <div
          className="absolute inset-0 opacity-60 mix-blend-overlay"
          style={{ backgroundImage: LEATHER, backgroundSize: '12cqw' }}
        />
        {/* Faixa de cor de destaque atrás do título (rótulo) */}
        <div
          className="absolute inset-x-[12%] top-[19%] bottom-[24%] rounded-[0.2cqw] opacity-25 mix-blend-luminosity"
          style={{ backgroundColor: palette.accent }}
        />

        <Band at="5%" />
        <Band at="11.5%" />
        <Band at="83%" />
        <Band at="89.5%" />

        {/* Título */}
        <div className="absolute inset-x-0 top-[18%] bottom-[25%] flex items-center justify-center">
          <span
            className="max-h-full truncate font-display leading-none font-semibold tracking-[0.06em] uppercase [writing-mode:vertical-rl]"
            style={{
              fontSize: `${titleSize}cqw`,
              color: titleColor,
              textShadow: titleShadow,
            }}
          >
            {book.title}
          </span>
        </div>

        {/* Autor */}
        {showAuthor && (
          <div className="absolute inset-x-0 top-[76%] flex h-[6.5%] justify-center">
            <span
              className="max-h-full truncate font-serif leading-none italic [writing-mode:vertical-rl]"
              style={{
                fontSize: `${titleSize * 0.66}cqw`,
                color: titleColor,
                opacity: 0.85,
                textShadow: titleShadow,
              }}
            >
              {book.authors[0].split(' ').slice(-1)[0]}
            </span>
          </div>
        )}

        {/* Volume, verniz e sujeira nas pontas */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `${SPINE_SHADING}, linear-gradient(180deg, rgb(0 0 0/0.35), transparent 6%, transparent 94%, rgb(0 0 0/0.45))`,
          }}
        />
        {spineLight && <LightLayer style={spineLight} />}
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
            ? `linear-gradient(90deg, rgb(0 0 0/0.6), rgb(0 0 0/0.3)), url("${book.coverUrl}")`
            : 'linear-gradient(90deg, rgb(0 0 0/0.6), rgb(0 0 0/0.35))',
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
        }}
      >
        {spineLight && <LightLayer style={spineLight} />}
      </div>

      {/* Contracapa (lado esquerdo) */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-full h-full origin-right [backface-visibility:hidden]"
        style={{
          width: DEPTH,
          transform: 'rotateY(-90deg)',
          backgroundColor: palette.base,
          backgroundImage:
            'linear-gradient(270deg, rgb(0 0 0/0.65), rgb(0 0 0/0.4))',
        }}
      >
        {spineLight && <LightLayer style={spineLight} />}
      </div>

      {/* Páginas (topo) */}
      <div
        aria-hidden="true"
        className="absolute bottom-full left-0 w-full origin-bottom [backface-visibility:hidden]"
        style={{
          height: DEPTH,
          transform: 'rotateX(90deg)',
          backgroundImage: `linear-gradient(0deg, rgb(0 0 0/0.1) 30%, rgb(0 0 0/0.75)), ${PAGES}`,
        }}
      >
        {pagesLight && <LightLayer style={pagesLight} />}
      </div>
    </div>
  )
}
