/**
 * Página provisória da etapa "fundacao".
 * Só confirma que o projeto está no ar; as estantes entram na etapa "estrutura-estantes".
 */
export default function App() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center">
      <div className="flex flex-col items-center gap-4">
        <span aria-hidden="true" className="text-5xl">
          📚
        </span>
        <h1 className="font-display text-4xl tracking-wide text-balance sm:text-6xl">
          Alexandria
        </h1>
        <p className="max-w-sm text-pretty text-parchment/70 sm:text-lg">
          Sua biblioteca pessoal está sendo construída. Em breve, as estantes.
        </p>
      </div>
    </main>
  )
}
