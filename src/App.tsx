import { useState } from 'react'
import { DevTools } from '@/features/dev/DevTools'
import { SearchDialog } from '@/features/search/SearchDialog'
import { Library } from '@/features/shelf/Library'

export default function App() {
  // Modo debug: mostra os slots vazios. Ligado por padrão enquanto não há design.
  const [debug, setDebug] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl tracking-wide lg:text-3xl">
          Alexandria
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {import.meta.env.DEV && (
            <DevTools debug={debug} onDebugChange={setDebug} />
          )}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden min-h-11 rounded-full bg-ember px-5 font-medium text-wood-950 transition-transform active:scale-95 lg:inline-flex lg:items-center"
          >
            + Adicionar livro
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Library debug={debug} />
      </main>

      {/* Botão flutuante no celular, perto do polegar */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Adicionar livro"
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 grid size-14 place-items-center rounded-full bg-ember text-3xl leading-none text-wood-950 shadow-lg shadow-black/40 transition-transform active:scale-90 lg:hidden"
      >
        +
      </button>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
