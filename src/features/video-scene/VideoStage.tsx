import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useDrag } from '@/features/drag/dragStore'
import { VIDEO_SCENE } from './scene'

/** Margem extra para a compensação de zoom nunca mostrar borda. */
const OVERSCAN = 1.04
/** Quanto o cenário se desloca acompanhando o mouse (px), dando profundidade. */
const PARALLAX = 10

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Tamanho do "palco": o quadro do vídeo cobrindo a tela inteira (como object-fit: cover). */
function useCoverSize() {
  const compute = () => {
    const k =
      Math.max(
        window.innerWidth / VIDEO_SCENE.width,
        window.innerHeight / VIDEO_SCENE.height,
      ) * OVERSCAN
    return { width: VIDEO_SCENE.width * k, height: VIDEO_SCENE.height * k }
  }
  const [size, setSize] = useState(compute)
  useEffect(() => {
    const onResize = () => setSize(compute())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

/**
 * O vídeo da sala em loop, cobrindo a tela, com a aplicação por cima.
 *
 * - Zoom compensado: a câmera do vídeo se aproxima um pouco; o vídeo é
 *   diminuído na mesma proporção enquanto toca, então a sala fica parada
 *   e os livros (por cima) continuam encaixados nas prateleiras.
 * - Loop sem pulo: dois vídeos iguais se revezam com uma transição suave
 *   no fim de cada volta.
 * - Parallax leve: o palco acompanha o mouse alguns pixels.
 *
 * `children` são posicionados em % do quadro do vídeo (ver scene.ts).
 */
export function VideoStage({ children }: { children: ReactNode }) {
  const size = useCoverSize()
  const stageRef = useRef<HTMLDivElement>(null)
  const videoA = useRef<HTMLVideoElement>(null)
  const videoB = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videos = [videoA.current!, videoB.current!]
    const { zoom, loopCrossfade } = VIDEO_SCENE
    const origin = `${(zoom.centerX / VIDEO_SCENE.width) * 100}% ${
      (zoom.centerY / VIDEO_SCENE.height) * 100
    }%`
    let active = 0
    let fading = false
    let frame = 0

    for (const v of videos) {
      v.style.transformOrigin = origin
      v.muted = true
    }
    videos[0].style.opacity = '1'
    videos[1].style.opacity = '0'
    void videos[0].play().catch(() => {})

    const tick = () => {
      for (const v of videos) {
        const scale = 1 / (1 + zoom.perSecond * v.currentTime)
        v.style.transform = `scale(${scale})`
      }
      const current = videos[active]
      const next = videos[1 - active]
      const remaining = current.duration - current.currentTime
      if (!fading && Number.isFinite(remaining) && remaining < loopCrossfade) {
        fading = true
        next.currentTime = 0
        void next.play().catch(() => {})
        next.style.transition = `opacity ${loopCrossfade}s linear`
        next.style.opacity = '1'
        window.setTimeout(() => {
          current.pause()
          current.style.transition = 'none'
          current.style.opacity = '0'
          active = 1 - active
          fading = false
        }, loopCrossfade * 1000)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    // Parallax com o mouse (desligado para quem pediu menos movimento)
    const onMove = (e: PointerEvent) => {
      if (prefersReducedMotion() || e.pointerType !== 'mouse') return
      // Durante um arraste a sala fica parada, para o alvo não "fugir" do livro
      if (useDrag.getState().active) return
      const dx = (e.clientX / window.innerWidth - 0.5) * -2 * PARALLAX
      const dy = (e.clientY / window.innerHeight - 0.5) * -2 * PARALLAX * 0.6
      stageRef.current?.style.setProperty('--parallax', `${dx}px, ${dy}px`)
    }
    window.addEventListener('pointermove', onMove)

    // Economiza bateria/CPU com a aba escondida
    const onVisibility = () => {
      if (document.hidden) videos.forEach((v) => v.pause())
      else void videos[active].play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-black">
      <div
        ref={stageRef}
        className="absolute top-1/2 left-1/2 transition-transform duration-700 ease-out"
        style={{
          width: size.width,
          height: size.height,
          transform:
            'translate(-50%, -50%) translate(var(--parallax, 0px, 0px))',
        }}
      >
        {/* Dois vídeos iguais se revezam para o loop não ter pulo */}
        <video
          ref={videoA}
          src={VIDEO_SCENE.src}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
        />
        <video
          ref={videoB}
          src={VIDEO_SCENE.src}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
        />
        {/* Camada da aplicação, no mesmo sistema de coordenadas do vídeo */}
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  )
}
