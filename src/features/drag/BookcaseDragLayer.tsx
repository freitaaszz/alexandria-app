import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { useEffect, useRef } from 'react'
import {
  shelvesBottom,
  shelvesTop,
  useScene,
} from '@/features/video-scene/scene'
import { caseX, caseY, useBookcaseDrag } from './bookcaseDrag'

const TILT_SPRING = { stiffness: 200, damping: 20, mass: 0.8 }

/**
 * A estante "na mão": o recorte dela no quadro do vídeo, com os livros por
 * cima, seguindo o mouse. Inclina um pouco para o lado em que está indo.
 */
export function BookcaseDragLayer() {
  const from = useBookcaseDrag((s) => s.from)
  const dropping = useBookcaseDrag((s) => s.dropping)
  const size = useBookcaseDrag((s) => s.size)
  const grab = useBookcaseDrag((s) => s.grab)
  const startScale = useBookcaseDrag((s) => s.startScale)
  const clone = useBookcaseDrag((s) => s.clone)
  const reduceMotion = useReducedMotion()
  const booksRef = useRef<HTMLDivElement>(null)
  const scene = useScene()

  const lean = useSpring(
    useTransform(useVelocity(caseX), [-2400, 0, 2400], [-4, 0, 4], {
      clamp: true,
    }),
    TILT_SPRING,
  )

  useEffect(() => {
    const holder = booksRef.current
    if (!holder || !clone) return
    holder.replaceChildren(clone)
    return () => holder.replaceChildren()
  }, [clone, from])

  if (from === null) return null

  // Recorte da estante no quadro do vídeo (px de referência → px da tela)
  const boxTop = shelvesTop(scene)
  const boxBottom = shelvesBottom(scene)
  const frame = scene.frames[from]
  const box = scene.bookcases[from]
  const refW = frame.right - frame.left
  const refH = scene.framesBottom - scene.framesTop
  const k = size.width / refW
  const lifted = !dropping && !reduceMotion

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40"
      aria-hidden="true"
      inert
    >
      <motion.div
        className="absolute top-0 left-0"
        style={{
          x: caseX,
          y: caseY,
          width: size.width,
          height: size.height,
          rotate: reduceMotion ? 0 : lean,
          transformOrigin: `${grab.x * 100}% ${grab.y * 100}%`,
        }}
        initial={{ scale: startScale }}
        animate={{ scale: lifted ? 1.04 : 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        {/* Sombra no chão */}
        <motion.div
          className="absolute -bottom-[3%] left-1/2 h-[7%] w-[105%] -translate-x-1/2 rounded-[50%] bg-black blur-xl"
          animate={{ opacity: lifted ? 0.55 : 0.2 }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${scene.poster}")`,
            backgroundSize: `${scene.width * k}px ${scene.height * k}px`,
            backgroundPosition: `${-frame.left * k}px ${-scene.framesTop * k}px`,
          }}
        />
        <div
          ref={booksRef}
          className="absolute"
          style={{
            left: `${((box.left - frame.left) / refW) * 100}%`,
            width: `${((box.right - box.left) / refW) * 100}%`,
            top: `${((boxTop - scene.framesTop) / refH) * 100}%`,
            height: `${((boxBottom - boxTop) / refH) * 100}%`,
          }}
        />
      </motion.div>
    </div>
  )
}
