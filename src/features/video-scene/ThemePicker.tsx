import { useEffect, useRef, useState } from 'react'
import { useUi } from '@/store/ui'
import { SCENES, useSceneStore } from './scene'

/**
 * Botão "Tema" no topo: abre uma lista com os cenários (miniatura + nome).
 * Escolher um troca o cenário na hora; os livros continuam nos mesmos lugares.
 */
export function ThemePicker() {
  const [open, setOpen] = useState(false)
  const sceneId = useSceneStore((s) => s.sceneId)
  const setScene = useSceneStore((s) => s.setScene)
  const rootRef = useRef<HTMLDivElement>(null)

  // Fecha com Esc ou clicando fora
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  const choose = (id: string) => {
    setOpen(false)
    if (id === sceneId) return
    useUi.getState().clearFocus()
    setScene(id)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/30 bg-black/45 px-4 font-display text-sm tracking-wider text-parchment backdrop-blur-md transition hover:bg-black/65"
      >
        <span aria-hidden="true">✦</span> Tema
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Escolher tema"
          className="absolute top-full right-0 mt-2 w-72 origin-top-right animate-[menu-in_160ms_ease-out] rounded-2xl border border-gold/25 bg-black/75 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl"
        >
          {SCENES.map((scene) => {
            const active = scene.id === sceneId
            return (
              <button
                key={scene.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => choose(scene.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
                  active
                    ? 'bg-gold/15 ring-1 ring-gold/50'
                    : 'hover:bg-parchment/10'
                }`}
              >
                <img
                  src={scene.poster}
                  alt=""
                  className="h-14 w-24 shrink-0 rounded-lg object-cover"
                />
                <span className="font-display text-sm tracking-wide text-parchment">
                  {scene.name}
                </span>
                {active && (
                  <span aria-hidden="true" className="ml-auto text-gold">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
