import { createId } from '@/lib/id'
import { useLibrary } from '@/store/library'
import { SAMPLE_BOOKS } from './sampleBooks'

type DevToolsProps = {
  debug: boolean
  onDebugChange: (debug: boolean) => void
}

const buttonClass =
  'min-h-11 rounded-full border border-parchment/20 px-3 text-xs text-parchment/70 active:bg-parchment/10'

/** Ferramentas só do modo de desenvolvimento (não aparecem na versão final). */
export function DevTools({ debug, onDebugChange }: DevToolsProps) {
  const count = useLibrary((s) => s.books.length)
  const addBook = useLibrary((s) => s.addBook)
  const clear = useLibrary((s) => s.clear)

  const addSamples = () => {
    for (const sample of SAMPLE_BOOKS) {
      // googleId aleatório para poder adicionar o lote mais de uma vez
      const result = addBook({ ...sample, googleId: `exemplo-${createId()}` })
      if (!result.ok) break
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-xs text-parchment/50">
        {count} {count === 1 ? 'livro' : 'livros'}
      </span>
      <button type="button" onClick={addSamples} className={buttonClass}>
        + Livros de teste
      </button>
      <button type="button" onClick={clear} className={buttonClass}>
        Limpar
      </button>
      <button
        type="button"
        aria-pressed={debug}
        onClick={() => onDebugChange(!debug)}
        className={buttonClass}
      >
        Slots: {debug ? 'visíveis' : 'ocultos'}
      </button>
    </div>
  )
}
