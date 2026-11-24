import { useState } from 'react'
import { BookFlight } from '@/features/add-book/BookFlight'
import { BookModal } from '@/features/book-details/BookModal'
import { DevTools } from '@/features/dev/DevTools'
import { DragAnnouncer, DragLayer } from '@/features/drag/DragLayer'
import { SearchDialog } from '@/features/search/SearchDialog'
import { FocusControls } from '@/features/video-scene/FocusControls'
import { VideoLibrary } from '@/features/video-scene/VideoLibrary'
import { useUi } from '@/store/ui'

export default function App() {
  // Modo debug: mostra os slots vazios (botão só no modo de desenvolvimento).
  const [debug, setDebug] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  // Com o modal do livro aberto, o resto da página não recebe foco nem cliques.
  const modalOpen = useUi((s) => s.selectedBookId !== null)

  return (
    <>
      <div
        inert={modalOpen}
        className="relative z-10 flex min-h-dvh flex-col gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-8"
      >
        {/* A sala em vídeo, cobrindo a tela, com as estantes do site encaixadas */}
        <VideoLibrary debug={debug} />
        {/* Sombra no topo para o título e os botões aparecerem bem sobre o vídeo */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/70 to-transparent"
        />
        <header className="relative z-30 flex flex-wrap items-center justify-between gap-2">
          <h1 className="bg-[linear-gradient(180deg,#f6e3ae,#c9993f_55%,#8f6526)] bg-clip-text font-display text-2xl font-semibold tracking-[0.12em] text-transparent drop-shadow-[0_2px_6px_rgb(0_0_0/0.8)] lg:text-3xl">
            Alexandria
          </h1>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {import.meta.env.DEV && (
              <DevTools debug={debug} onDebugChange={setDebug} />
            )}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden min-h-11 rounded-full border border-[#f3d993]/40 bg-[linear-gradient(180deg,#e8c77d,#b98a3a)] px-5 font-display text-sm font-semibold tracking-wider text-wood-950 shadow-[0_4px_18px_rgb(227_180_98/0.25),inset_0_1px_0_rgb(255_255_255/0.4)] transition-transform active:scale-95 lg:inline-flex lg:items-center"
            >
              + Adicionar livro
            </button>
          </div>
        </header>

        {/* Botão flutuante no celular, perto do polegar */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Adicionar livro"
          className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full border border-[#f3d993]/40 bg-[linear-gradient(180deg,#e8c77d,#b98a3a)] text-3xl leading-none text-wood-950 shadow-lg shadow-black/40 transition-transform active:scale-90 lg:hidden"
        >
          +
        </button>

        <FocusControls />
        <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
        <BookFlight />
        <DragLayer />
        <DragAnnouncer />
      </div>
      <BookModal />
    </>
  )
}
