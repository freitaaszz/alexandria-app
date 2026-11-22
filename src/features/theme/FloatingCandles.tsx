import type { CSSProperties } from 'react'
import { THEME } from './themes'

/**
 * Velas flutuando pela sala (vibe de escola de magia).
 * - Cada vela atravessa a tela bem devagar (de um lado para o outro) e balança.
 * - Profundidade: as de longe são menores, desfocadas e ficam ATRÁS das estantes;
 *   as de perto são maiores e passam na frente, só na parte de cima da tela.
 * - Tudo em CSS (transform/opacity): leve no celular. Sem movimento se a pessoa
 *   pediu "reduzir movimento" (ver index.css).
 */

type Candle = {
  /** Altura na tela (% do topo). */
  top: number
  /** Tamanho relativo (1 = perto). */
  scale: number
  /** Segundos para atravessar a tela. */
  duration: number
  /** Atraso negativo: a vela já começa no meio do caminho. */
  delay: number
  /** Direção: 1 = da esquerda para a direita. */
  direction: 1 | -1
  /** Na frente das estantes? */
  front: boolean
}

const CANDLES: Candle[] = [
  {
    top: 6,
    scale: 0.42,
    duration: 140,
    delay: -10,
    direction: 1,
    front: false,
  },
  {
    top: 14,
    scale: 0.5,
    duration: 120,
    delay: -70,
    direction: -1,
    front: false,
  },
  {
    top: 22,
    scale: 0.36,
    duration: 160,
    delay: -40,
    direction: 1,
    front: false,
  },
  { top: 9, scale: 0.6, duration: 110, delay: -95, direction: 1, front: false },
  {
    top: 30,
    scale: 0.4,
    duration: 150,
    delay: -120,
    direction: -1,
    front: false,
  },
  {
    top: 18,
    scale: 0.55,
    duration: 130,
    delay: -20,
    direction: -1,
    front: false,
  },
  { top: 4, scale: 0.85, duration: 95, delay: -50, direction: -1, front: true },
  { top: 12, scale: 1, duration: 85, delay: -15, direction: 1, front: true },
]

function FloatingCandle({ candle, index }: { candle: Candle; index: number }) {
  const depthBlur = candle.front ? 0 : (1 - candle.scale) * 3
  const style = {
    top: `${candle.top}%`,
    '--candle-scale': candle.scale,
    '--drift-duration': `${candle.duration}s`,
    '--drift-delay': `${candle.delay}s`,
    '--drift-from': candle.direction === 1 ? '-12vw' : '112vw',
    '--drift-to': candle.direction === 1 ? '112vw' : '-12vw',
    '--bob-duration': `${5 + (index % 4)}s`,
    '--flicker-duration': `${1.6 + (index % 3) * 0.35}s`,
    filter: depthBlur
      ? `blur(${depthBlur}px) brightness(${0.6 + candle.scale * 0.4})`
      : undefined,
  } as CSSProperties

  return (
    <div className="candle-drift absolute left-0" style={style}>
      <div className="candle-bob relative" style={{ scale: candle.scale }}>
        {/* Halo de luz em volta da chama */}
        <div className="candle-glow absolute top-[-2.2rem] left-1/2 size-28 -translate-x-1/2 rounded-full" />
        {/* Chama */}
        <div className="candle-flame absolute top-[-1.45rem] left-1/2 h-6 w-3 -translate-x-1/2" />
        {/* Corpo da vela (render do Blender) */}
        <img
          src={THEME.images.candle}
          alt=""
          draggable={false}
          className="block h-24 w-auto select-none"
        />
      </div>
    </div>
  )
}

/** Velas que passam atrás das estantes. */
export function CandlesBehind() {
  if (!THEME.floatingCandles) return null
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      {CANDLES.map((c, i) =>
        c.front ? null : <FloatingCandle key={i} candle={c} index={i} />,
      )}
    </div>
  )
}

/** Velas que passam na frente (só no alto da tela, sem cobrir os livros). */
export function CandlesFront() {
  if (!THEME.floatingCandles) return null
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
    >
      {CANDLES.map((c, i) =>
        c.front ? <FloatingCandle key={i} candle={c} index={i} /> : null,
      )}
    </div>
  )
}
