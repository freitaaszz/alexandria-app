import { useState } from 'react'
import { Library } from '@/features/shelf/Library'

export default function App() {
  // Modo debug: mostra os slots vazios. Ligado por padrão enquanto não há livros.
  const [debug, setDebug] = useState(true)

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-8">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-wide lg:text-3xl">
          Alexandria
        </h1>
        {import.meta.env.DEV && (
          <button
            type="button"
            aria-pressed={debug}
            onClick={() => setDebug((d) => !d)}
            className="min-h-11 rounded-full border border-parchment/20 px-4 text-xs text-parchment/70"
          >
            Slots: {debug ? 'visíveis' : 'ocultos'}
          </button>
        )}
      </header>

      <main className="flex flex-1 flex-col">
        <Library debug={debug} />
      </main>
    </div>
  )
}
