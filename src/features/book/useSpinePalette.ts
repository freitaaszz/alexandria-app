import { useEffect } from 'react'
import { useLibrary } from '@/store/library'
import type { Book, SpinePalette } from '@/types/book'
import { loadCoverPixels } from './coverPixels'
import { extractPalette, fallbackPalette } from './palette'

/** Livros cuja capa já falhou nesta sessão (não tenta de novo a cada render). */
const failed = new Set<string>()
/** Livros com extração em andamento. */
const pending = new Set<string>()

/**
 * Cores da lombada de um livro.
 * Na primeira vez, lê a capa, calcula as cores e guarda no livro;
 * enquanto isso (ou se não houver capa), usa uma cor estável pelo id.
 */
export function useSpinePalette(book: Book): SpinePalette {
  const setSpinePalette = useLibrary((s) => s.setSpinePalette)
  const { id, coverUrl, spine } = book

  useEffect(() => {
    if (spine || !coverUrl || failed.has(id) || pending.has(id)) return
    pending.add(id)
    loadCoverPixels(coverUrl)
      .then((pixels) => {
        const palette = extractPalette(pixels)
        if (palette) setSpinePalette(id, palette)
        else failed.add(id)
      })
      .catch(() => failed.add(id))
      .finally(() => pending.delete(id))
  }, [id, coverUrl, spine, setSpinePalette])

  return spine ?? fallbackPalette(id)
}
