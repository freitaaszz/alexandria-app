import { useContext, type CSSProperties } from 'react'
import { LIBRARY } from '@/features/shelf/config'
import { SLOT_WIDTH_CQW } from '@/features/theme/themes'
import {
  ShelfLightContext,
  type ShelfLight,
} from '@/features/video-scene/lightMap'
import type { Book } from '@/types/book'
import { hashString, spineHeight, spineTitle, spineWidth } from './geometry'
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
 * Tipos de lombada, escolhidos de forma estável para cada livro (como numa
 * estante real, onde quase nada combina):
 * - jacket: sobrecapa impressa (livro moderno), com a arte da capa;
 * - cloth: capa dura de tecido, fosca, título em serifa;
 * - leather: couro antigo com nervuras e ouro.
 */
type SpineKind = 'jacket' | 'cloth' | 'leather'

function spineKind(book: Book): SpineKind {
  const r = hashString(`${book.id}k`)
  if (r < 0.5 && book.coverUrl) return 'jacket'
  if (r < 0.8) return 'cloth'
  return 'leather'
}

/** Tecido: trama fina cruzada. */
const CLOTH =
  'repeating-linear-gradient(0deg, rgb(255 255 255/0.05) 0 0.08cqw, transparent 0.08cqw 0.2cqw), repeating-linear-gradient(90deg, rgb(0 0 0/0.08) 0 0.08cqw, transparent 0.08cqw 0.2cqw)'

/** Sobrecapa: brilho do papel plastificado, mais estreito que o do couro. */
const JACKET_SHEEN =
  'linear-gradient(90deg, rgb(0 0 0/0.4) 0%, rgb(0 0 0/0.05) 7%, rgb(255 255 255/0.14) 18%, rgb(255 255 255/0.03) 30%, transparent 60%, rgb(0 0 0/0.12) 88%, rgb(0 0 0/0.45) 100%)'

/**
 * Tamanho do título para caber inteiro na lombada (em cqw).
 * Título longo em lombada grossa quebra em duas linhas (como nos livros de
 * verdade), para a letra não ficar minúscula.
 */
function fitTitle(
  text: string,
  widthCqw: number,
  heightCqw: number,
  maxFromWidth: number,
  charWidth: number,
) {
  // Com folga: letras largas (M, W) ocupam mais que a média
  const length = Math.max(4, text.length * charWidth * 1.15)
  const oneLine = Math.min(widthCqw * maxFromWidth, heightCqw / length, 2.3)
  const twoLines = Math.min(
    widthCqw * 0.36,
    (2 * heightCqw * 0.9) / length,
    2.3,
  )
  const wrap = text.includes(' ') && twoLines > oneLine * 1.2
  return { size: Math.max(1, wrap ? twoLines : oneLine), wrap }
}

/** Classes do título: uma linha com reticências, ou quebrando em duas. */
const titleFlow = (wrap: boolean) =>
  wrap
    ? 'max-h-full overflow-hidden text-center [text-wrap:balance]'
    : 'max-h-full truncate'

/** No máximo duas linhas (na escrita vertical, a "largura" conta as linhas). */
const titleLines = (size: number, wrap: boolean) =>
  wrap ? { maxWidth: `${size * 2.3}cqw` } : {}

const lastName = (book: Book) => book.authors[0]?.split(' ').slice(-1)[0] ?? ''

type SpineFaceProps = {
  book: Book
  kind: SpineKind
  palette: { base: string; accent: string; text: string }
  widthCqw: number
  heightCqw: number
}

/** A frente da lombada, conforme o tipo. */
function SpineFace({
  book,
  kind,
  palette,
  widthCqw,
  heightCqw,
}: SpineFaceProps) {
  const darkSpine = palette.text !== '#1a120c'
  const ink = darkSpine ? '#efe6d6' : '#1d140d'
  const author = lastName(book)
  const title = spineTitle(book.title)

  if (kind === 'jacket') {
    const { size, wrap } = fitTitle(
      title,
      widthCqw,
      heightCqw * 0.62,
      0.64,
      0.46,
    )
    return (
      <>
        {/* Arte da capa como textura (sem dar para ler o texto dela) */}
        <div
          className="absolute inset-0 opacity-55 mix-blend-soft-light"
          style={{
            backgroundImage: `url("${book.coverUrl}")`,
            backgroundSize: 'auto 100%',
            backgroundPosition: `${Math.round(hashString(`${book.id}x`) * 100)}% center`,
            filter: 'blur(0.15cqw)',
          }}
        />
        {/* Autor em cima */}
        {author && (
          <div className="absolute inset-x-0 top-[4%] flex h-[20%] justify-center">
            <span
              className="max-h-full truncate font-spine leading-none tracking-[0.08em] uppercase [writing-mode:vertical-rl]"
              style={{ fontSize: `${size * 0.62}cqw`, color: palette.accent }}
            >
              {author}
            </span>
          </div>
        )}
        {/* Título */}
        <div className="absolute inset-x-0 top-[26%] bottom-[12%] flex items-center justify-center">
          <span
            className={`${titleFlow(wrap)} font-spine leading-[1.05] font-medium [writing-mode:vertical-rl]`}
            style={{
              ...titleLines(size, wrap),
              fontSize: `${size}cqw`,
              color: ink,
              textShadow: darkSpine
                ? '0 0.06cqw 0.1cqw rgb(0 0 0/0.7)'
                : 'none',
            }}
          >
            {title}
          </span>
        </div>
        {/* Marca da editora embaixo */}
        <div
          className="absolute bottom-[3.5%] left-1/2 aspect-square w-[34%] -translate-x-1/2 rounded-full opacity-70"
          style={{ boxShadow: `inset 0 0 0 0.1cqw ${ink}` }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: JACKET_SHEEN }}
        />
      </>
    )
  }

  if (kind === 'cloth') {
    const { size, wrap } = fitTitle(title, widthCqw, heightCqw * 0.55, 0.6, 0.5)
    const stamp = darkSpine ? '#ecc983' : '#24170d'
    return (
      <>
        <div className="absolute inset-0" style={{ backgroundImage: CLOTH }} />
        {/* Desbotado pelo sol no topo */}
        <div
          className="absolute inset-x-0 top-0 h-[30%] opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgb(255 240 210/0.35), transparent)',
          }}
        />
        {/* Filetes finos */}
        {['7%', '8.6%', '91.4%', '93%'].map((at) => (
          <div
            key={at}
            className="absolute inset-x-[8%] h-[0.1cqw] opacity-80"
            style={{ top: at, backgroundColor: stamp }}
          />
        ))}
        <div className="absolute inset-x-0 top-[13%] bottom-[22%] flex items-center justify-center">
          <span
            className={`${titleFlow(wrap)} font-serif leading-[1.05] font-bold [writing-mode:vertical-rl]`}
            style={{
              ...titleLines(size, wrap),
              fontSize: `${size}cqw`,
              color: stamp,
              textShadow: darkSpine
                ? '0 0.06cqw 0.08cqw rgb(0 0 0/0.75)'
                : 'none',
            }}
          >
            {title}
          </span>
        </div>
        {author && (
          <div className="absolute inset-x-0 top-[80%] flex h-[9%] justify-center">
            <span
              className="max-h-full truncate font-serif leading-none italic [writing-mode:vertical-rl]"
              style={{
                fontSize: `${size * 0.7}cqw`,
                color: stamp,
                opacity: 0.85,
              }}
            >
              {author}
            </span>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `${SPINE_SHADING}, linear-gradient(180deg, rgb(0 0 0/0.3), transparent 5%, transparent 95%, rgb(0 0 0/0.4))`,
            opacity: 0.75,
          }}
        />
      </>
    )
  }

  // Couro antigo
  const { size, wrap } = fitTitle(title, widthCqw, heightCqw * 0.5, 0.58, 0.6)
  const titleColor = darkSpine ? GOLD_TEXT : '#2a1a0e'
  const titleShadow = darkSpine
    ? '0 0.08cqw 0 rgb(0 0 0/0.8), 0 -0.05cqw 0 rgb(255 230 170/0.25)'
    : '0 0.06cqw 0 rgb(255 255 255/0.35)'
  return (
    <>
      <div
        className="absolute inset-0 opacity-60 mix-blend-overlay"
        style={{ backgroundImage: LEATHER, backgroundSize: '12cqw' }}
      />
      <Band at="8%" />
      <Band at="86%" />
      <div className="absolute inset-x-0 top-[18%] bottom-[22%] flex items-center justify-center">
        <span
          className={`${titleFlow(wrap)} font-display leading-[1.1] font-semibold tracking-[0.04em] uppercase [writing-mode:vertical-rl]`}
          style={{
            ...titleLines(size, wrap),
            fontSize: `${size}cqw`,
            color: titleColor,
            textShadow: titleShadow,
          }}
        >
          {title}
        </span>
      </div>
      {/* Couro gasto nas pontas */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `${SPINE_SHADING}, linear-gradient(180deg, rgb(255 230 190/0.12), rgb(0 0 0/0.35) 3%, transparent 8%, transparent 93%, rgb(0 0 0/0.4) 97%, rgb(255 230 190/0.1))`,
        }}
      />
    </>
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
  // Altura da lombada em cqw (a prateleira tem a proporção do vídeo)
  const shelfHeightCqw = light ? (light.height / light.width) * 100 : 30
  const spineHeightCqw = (shelfHeightCqw * height) / 100
  const kind = spineKind(book)

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
        className="absolute inset-0 overflow-hidden rounded-[0.3cqw] [backface-visibility:hidden]"
        style={{ backgroundColor: palette.base, filter: 'saturate(0.82)' }}
      >
        <SpineFace
          book={book}
          kind={kind}
          palette={palette}
          widthCqw={bookWidthCqw}
          heightCqw={spineHeightCqw}
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
