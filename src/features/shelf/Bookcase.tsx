import { LIBRARY, range } from './config'
import { Shelf } from './Shelf'

type BookcaseProps = {
  index: number
  debug: boolean
}

/**
 * Uma estante (rascunho). O visual final vem com o tema na etapa "primeiro-cenario".
 * "@container" faz as medidas internas em cqw se basearem na largura desta estante.
 */
export function Bookcase({ index, debug }: BookcaseProps) {
  return (
    <section
      aria-label={`Estante ${index + 1}`}
      data-bookcase={index}
      className="@container w-full"
    >
      {/* Topo arqueado com ponta, inspirado no esboço */}
      <svg
        viewBox="0 0 100 22"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="block aspect-[100/22] w-full fill-wood-700"
      >
        <path d="M0 22 V15 C0 9 8 8 18 7.5 C30 7 39 5.5 45 2 L50 0 L55 2 C61 5.5 70 7 82 7.5 C92 8 100 9 100 15 V22 Z" />
      </svg>

      {/* Corpo: laterais + fundo escuro + prateleiras */}
      <div className="border-x-[3cqw] border-wood-700 bg-wood-900 shadow-[inset_0_0_6cqw_rgb(0_0_0/0.6)]">
        {range(LIBRARY.shelvesPerBookcase).map((shelf) => (
          <Shelf key={shelf} bookcase={index} shelf={shelf} debug={debug} />
        ))}
      </div>

      {/* Base */}
      <div className="h-[4cqw] rounded-b-[1cqw] bg-wood-700" />
    </section>
  )
}
