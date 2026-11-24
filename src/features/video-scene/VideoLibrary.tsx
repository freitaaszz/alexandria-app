import {
  startBookcasePointer,
  useBookcaseDrag,
} from '@/features/drag/bookcaseDrag'
import { justDragged } from '@/features/drag/dragStore'
import { Shelf } from '@/features/shelf/Shelf'
import { LIBRARY, range } from '@/features/shelf/config'
import { THEME } from '@/features/theme/themes'
import { useUi } from '@/store/ui'
import { SHELVES_BOTTOM, SHELVES_TOP, VIDEO_SCENE, pctX, pctY } from './scene'
import { VideoStage } from './VideoStage'

/**
 * As 3 estantes do vídeo com as prateleiras do site encaixadas por cima.
 * Cada estante do site ocupa a parte interna de uma estante do vídeo
 * ("@container": as medidas em cqw seguem a largura dela).
 *
 * Na sala: clicar numa estante aproxima a câmera nela; segurar e arrastar
 * muda a estante de lugar (com os livros).
 */
export function VideoLibrary({ debug }: { debug: boolean }) {
  const focusedBookcase = useUi((s) => s.focusedBookcase)
  const focusedShelf = useUi((s) => s.focusedShelf)
  const setFocusedBookcase = useUi((s) => s.setFocusedBookcase)
  const caseDragging = useBookcaseDrag((s) => s.from !== null)
  const inRoom = focusedBookcase === null && !focusedShelf

  return (
    <VideoStage>
      {VIDEO_SCENE.bookcases.map((box, index) => {
        const frame = VIDEO_SCENE.frames[index]
        const frameStyle = {
          left: `${pctX(frame.left)}%`,
          width: `${pctX(frame.right - frame.left)}%`,
          top: `${pctY(VIDEO_SCENE.framesTop)}%`,
          height: `${pctY(VIDEO_SCENE.framesBottom - VIDEO_SCENE.framesTop)}%`,
        }
        return (
          <div key={index} className="group/bookcase">
            {/* A estante inteira (madeira em volta das prateleiras): clicar ou arrastar */}
            <div
              data-bookcase-frame={index}
              aria-hidden="true"
              title={
                inRoom
                  ? 'Clique para aproximar · arraste para mudar de lugar'
                  : undefined
              }
              onPointerDown={(e) => startBookcasePointer(e, index)}
              onClick={() => {
                if (!justDragged() && focusedBookcase !== index)
                  setFocusedBookcase(index)
              }}
              className={`pointer-events-auto absolute ${
                focusedBookcase === index ? 'cursor-grab' : 'cursor-zoom-in'
              } active:cursor-grabbing`}
              style={frameStyle}
            />
            {/* Brilho ao passar o mouse na sala: "dá para aproximar / pegar" */}
            {inRoom && !caseDragging && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute rounded-[4px] opacity-0 shadow-[inset_0_0_0_2px_rgb(227_180_98/0.6),0_0_18px_rgb(227_180_98/0.35)] transition-opacity duration-200 group-hover/bookcase:opacity-100"
                style={frameStyle}
              />
            )}
            <section
              aria-label={`Estante ${index + 1}`}
              data-bookcase={index}
              onPointerDown={(e) => startBookcasePointer(e, index)}
              className="@container pointer-events-auto absolute"
              style={{
                left: `${pctX(box.left)}%`,
                width: `${pctX(box.right - box.left)}%`,
                top: `${pctY(SHELVES_TOP)}%`,
                height: `${pctY(SHELVES_BOTTOM - SHELVES_TOP)}%`,
              }}
            >
              {/* Teclado/leitor de tela: aproximar a estante */}
              {focusedBookcase !== index && (
                <button
                  type="button"
                  onClick={() => setFocusedBookcase(index)}
                  className="sr-only focus:not-sr-only focus:absolute focus:inset-0 focus:z-40 focus:rounded focus:ring-2 focus:ring-ember"
                >
                  Aproximar estante {index + 1}
                </button>
              )}
              {range(LIBRARY.shelvesPerBookcase).map((shelf) => (
                <Shelf
                  key={shelf}
                  bookcase={index}
                  shelf={shelf}
                  debug={debug}
                  area={THEME.bookcase.shelves[shelf]}
                />
              ))}
            </section>
          </div>
        )
      })}
    </VideoStage>
  )
}
