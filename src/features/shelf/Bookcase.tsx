import { THEME } from '@/features/theme/themes'
import { LIBRARY, range } from './config'
import { Shelf } from './Shelf'

type BookcaseProps = {
  index: number
  debug: boolean
}

const { bookcase } = THEME

/**
 * Uma estante: a imagem renderizada no Blender com as prateleiras por cima,
 * posicionadas exatamente sobre as tábuas da imagem (medidas em THEME).
 * "@container" faz as medidas internas em cqw se basearem na largura desta estante.
 */
export function Bookcase({ index, debug }: BookcaseProps) {
  return (
    <section
      aria-label={`Estante ${index + 1}`}
      data-bookcase={index}
      className="@container relative w-full"
      style={{ aspectRatio: `${bookcase.width} / ${bookcase.height}` }}
    >
      {/* Sombra de contato no chão */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[-4%] bottom-[-1.5%] h-[4%] rounded-[50%] bg-black/80 blur-[3cqw]"
      />
      <img
        src={THEME.images.bookcase}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full brightness-[0.8] saturate-[0.92] select-none"
      />
      {range(LIBRARY.shelvesPerBookcase).map((shelf) => (
        <Shelf
          key={shelf}
          bookcase={index}
          shelf={shelf}
          debug={debug}
          area={bookcase.shelves[shelf]}
        />
      ))}
    </section>
  )
}
