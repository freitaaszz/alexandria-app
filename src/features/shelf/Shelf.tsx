import { LIBRARY, range } from './config'
import { Slot } from './Slot'

type ShelfProps = {
  bookcase: number
  shelf: number
  debug: boolean
}

/**
 * Uma prateleira: a fileira de slots apoiada numa tábua.
 * As medidas usam "cqw" (% da largura da estante), então tudo escala junto,
 * da estante em tela cheia até a miniatura da visão geral.
 */
export function Shelf({ bookcase, shelf, debug }: ShelfProps) {
  return (
    <div>
      <div className="grid grid-cols-17 items-end gap-[0.4cqw] px-[2cqw] pt-[3cqw]">
        {range(LIBRARY.slotsPerShelf).map((slot) => (
          <Slot key={slot} position={{ bookcase, shelf, slot }} debug={debug} />
        ))}
      </div>
      {/* Tábua da prateleira */}
      <div className="h-[2.5cqw] bg-wood-700 shadow-[0_0.8cqw_1.2cqw_rgb(0_0_0/0.45)]" />
    </div>
  )
}
