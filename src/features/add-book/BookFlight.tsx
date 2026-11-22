import { motion, useReducedMotion } from 'motion/react'
import { useLayoutEffect, useState } from 'react'
import { useUi, type Rect } from '@/store/ui'

/** Quanto a capa sobe no meio do caminho (o "arco" do voo), em px. */
const ARC_LIFT = 120
const DURATION = 0.85

/**
 * O voo do livro: a capa sai do resultado da busca, faz um arco até o slot
 * e vai girando de lado (como quem guarda um livro) até virar a lombada.
 * No fim, o livro de verdade aparece e "assenta" na prateleira (ver Slot).
 */
export function BookFlight() {
  const flight = useUi((s) => s.flight)
  const endFlight = useUi((s) => s.endFlight)
  const reduceMotion = useReducedMotion()
  const [target, setTarget] = useState<Rect | null>(null)

  // Mede onde o livro vai ficar, depois que a estante certa está na tela.
  useLayoutEffect(() => {
    if (!flight) return
    if (reduceMotion) {
      endFlight()
      return
    }
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const el = document.querySelector(`[data-book-id="${flight.bookId}"]`)
        if (!el) return endFlight()
        const r = el.getBoundingClientRect()
        setTarget({ x: r.x, y: r.y, width: r.width, height: r.height })
      })
    })
    return () => {
      cancelAnimationFrame(frame)
      setTarget(null)
    }
  }, [flight, reduceMotion, endFlight])

  if (!flight || !target) return null

  const { from } = flight
  const dx = target.x + target.width / 2 - (from.x + from.width / 2)
  const dy = target.y + target.height / 2 - (from.y + from.height / 2)
  const scale = target.height / from.height
  // O topo do arco não pode sair da tela (no celular a busca começa lá em cima).
  const peak = Math.max(Math.min(0, dy) - ARC_LIFT, 12 - from.y)

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      <motion.div
        className="absolute overflow-hidden rounded-sm shadow-2xl shadow-black/60"
        style={{
          left: from.x,
          top: from.y,
          width: from.width,
          height: from.height,
          transformPerspective: 900,
          backgroundColor: '#5a3e2b',
          backgroundImage: flight.coverUrl
            ? `url("${flight.coverUrl}")`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        initial={{ x: 0, y: 0, scale: 1, rotateY: 0, rotateZ: 0, opacity: 1 }}
        animate={{
          x: [0, dx * 0.45, dx],
          y: [0, peak * 0.9, dy],
          scale: [1, Math.max(scale, 1) * 1.15, scale],
          rotateZ: [0, -8, 0],
          rotateY: [0, 15, 82],
          opacity: [1, 1, 0.9],
        }}
        transition={{
          duration: DURATION,
          times: [0, 0.45, 1],
          ease: ['easeOut', [0.55, 0, 0.75, 0.2]],
        }}
        onAnimationComplete={endFlight}
      />
    </div>
  )
}
