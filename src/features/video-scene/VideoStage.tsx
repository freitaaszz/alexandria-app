import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useDrag } from '@/features/drag/dragStore'
import { useUi } from '@/store/ui'
import { startFlickerSampler } from './lightMap'
import { focusFrame, pctX, pctY, type VideoScene } from './scene'

/** Margem extra para a compensação de zoom nunca mostrar borda. */
const OVERSCAN = 1.04
/** Quanto o cenário se desloca acompanhando o mouse (px), dando profundidade. */
const PARALLAX = 10

/** Espaço reservado em cima (cabeçalho) e embaixo (controles) no zoom, em px. */
const ZOOM_MARGIN_TOP = 110
const ZOOM_MARGIN_BOTTOM = 90

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Tamanho do "palco": o quadro do vídeo cobrindo a tela inteira (como object-fit: cover). */
function coverSize(width: number, height: number) {
  const k =
    Math.max(window.innerWidth / width, window.innerHeight / height) * OVERSCAN
  return { width: width * k, height: height * k }
}

function useCoverSize({ width, height }: VideoScene) {
  const [size, setSize] = useState(() => coverSize(width, height))
  useEffect(() => {
    const onResize = () => setSize(coverSize(width, height))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [width, height])
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
/** Troca de cenário: o VideoStage é montado de novo (key = id do cenário). */
export function VideoStage({
  scene,
  children,
}: {
  scene: VideoScene
  children: ReactNode
}) {
  const size = useCoverSize(scene)
  const focusedShelf = useUi((s) => s.focusedShelf)
  const focusedBookcase = useUi((s) => s.focusedBookcase)
  const zoomOut = useUi((s) => s.zoomOut)
  const frame = focusFrame(scene, focusedBookcase, focusedShelf)
  const focused = frame !== null

  // Zoom numa estante ou prateleira: escala o palco inteiro (vídeo + livros)
  // e centraliza o recorte na área livre da tela.
  let transform = 'translate(-50%, -50%) translate(var(--parallax, 0px, 0px))'
  if (frame) {
    const f = frame
    const fw = ((f.right - f.left) / scene.width) * size.width
    const fh = ((f.bottom - f.top) / scene.height) * size.height
    const availH = window.innerHeight - ZOOM_MARGIN_TOP - ZOOM_MARGIN_BOTTOM
    const scale = Math.min((window.innerWidth * 0.9) / fw, availH / fh)
    const cx = ((f.left + f.right) / 2 / scene.width - 0.5) * size.width
    const cy = ((f.top + f.bottom) / 2 / scene.height - 0.5) * size.height
    const shiftY = (ZOOM_MARGIN_TOP - ZOOM_MARGIN_BOTTOM) / 2
    // A câmera não passa da borda do vídeo (sem faixas pretas): perto da
    // beirada, o recorte fica um pouco fora do centro. O vídeo encolhe até
    // ~4% enquanto toca (compensação do zoom), por isso a folga.
    const clamp = (value: number, stage: number, screen: number) => {
      const room = Math.max(0, (stage * scale * 0.96 - screen) / 2)
      return Math.min(room, Math.max(-room, value))
    }
    const tx = clamp(-cx * scale, size.width, window.innerWidth)
    const ty = clamp(-cy * scale + shiftY, size.height, window.innerHeight)
    transform = `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale})`
  }
  // O último recorte em foco continua guardado para o holofote sumir suave
  const [lastFrame, setLastFrame] = useState(frame)
  if (frame && JSON.stringify(frame) !== JSON.stringify(lastFrame))
    setLastFrame(frame)
  const spot = frame ?? lastFrame

  const stageRef = useRef<HTMLDivElement>(null)
  const videoA = useRef<HTMLVideoElement>(null)
  const videoB = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videos = [videoA.current!, videoB.current!]
    const { zoom, loopCrossfade } = scene
    const origin = `${(zoom.centerX / scene.width) * 100}% ${
      (zoom.centerY / scene.height) * 100
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
      const ui = useUi.getState()
      if (
        useDrag.getState().active ||
        ui.focusedShelf ||
        ui.focusedBookcase !== null
      )
        return
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

    // Brilho das velas ao vivo para a luz dos livros
    const stopFlicker = startFlickerSampler(scene, () => videos[active])

    return () => {
      stopFlicker()
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [scene])

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-black">
      {/* key no cenário: a cada troca, o palco novo aparece saindo do escuro */}
      <div className="absolute inset-0 animate-[scene-in_700ms_ease-out]">
        <div
          ref={stageRef}
          className={`absolute top-1/2 left-1/2 transition-transform ${
            focused
              ? 'duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
              : 'duration-700 ease-out'
          }`}
          style={{ width: size.width, height: size.height, transform }}
        >
          <div className="absolute inset-0">
            {/* Dois vídeos iguais se revezam para o loop não ter pulo */}
            <video
              ref={videoA}
              src={scene.src}
              poster={scene.poster}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover"
            />
            <video
              ref={videoB}
              src={scene.src}
              poster={scene.poster}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
          {/*
          Holofote: com uma prateleira em foco, o resto escurece e a prateleira
          continua iluminada (uma sombra enorme em volta do recorte dela).
        */}
          {spot && (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute rounded-[3px] transition-[opacity,left,top,width,height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                focused ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${pctX(scene, spot.left)}%`,
                top: `${pctY(scene, spot.top)}%`,
                width: `${pctX(scene, spot.right - spot.left)}%`,
                height: `${pctY(scene, spot.bottom - spot.top)}%`,
                boxShadow:
                  '0 0 0 400vmax rgb(8 5 3 / 0.6), 0 0 8px 5px rgb(8 5 3 / 0.6)',
              }}
            />
          )}
          {/* Clique fora do recorte em foco: sobe um nível de zoom */}
          {focused && (
            <div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 cursor-zoom-out"
              onClick={zoomOut}
            />
          )}
          {/* Camada da aplicação, no mesmo sistema de coordenadas do vídeo */}
          <div className="absolute inset-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
