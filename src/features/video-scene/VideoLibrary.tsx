import { Shelf } from '@/features/shelf/Shelf'
import { LIBRARY, range } from '@/features/shelf/config'
import { THEME } from '@/features/theme/themes'
import { SHELVES_BOTTOM, SHELVES_TOP, VIDEO_SCENE, pctX, pctY } from './scene'
import { VideoStage } from './VideoStage'

/**
 * As 3 estantes do vídeo com as prateleiras do site encaixadas por cima.
 * Cada estante do site ocupa a parte interna de uma estante do vídeo
 * ("@container": as medidas em cqw seguem a largura dela).
 */
export function VideoLibrary({ debug }: { debug: boolean }) {
  return (
    <VideoStage>
      {VIDEO_SCENE.bookcases.map((box, index) => (
        <section
          key={index}
          aria-label={`Estante ${index + 1}`}
          data-bookcase={index}
          className="@container pointer-events-auto absolute"
          style={{
            left: `${pctX(box.left)}%`,
            width: `${pctX(box.right - box.left)}%`,
            top: `${pctY(SHELVES_TOP)}%`,
            height: `${pctY(SHELVES_BOTTOM - SHELVES_TOP)}%`,
          }}
        >
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
      ))}
    </VideoStage>
  )
}
