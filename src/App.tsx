import { useState } from 'react'
import { DevTools } from '@/features/dev/DevTools'
import { Library } from '@/features/shelf/Library'

export default function App() {
  // Modo debug: mostra os slots vazios. Ligado por padrão enquanto não há design.
  const [debug, setDebug] = useState(true)

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl tracking-wide lg:text-3xl">
          Alexandria
        </h1>
        {import.meta.env.DEV && (
          <DevTools debug={debug} onDebugChange={setDebug} />
        )}
      </header>

      <main className="flex flex-1 flex-col">
        <Library debug={debug} />
      </main>
    </div>
  )
}
