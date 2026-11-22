import type { Book } from '@/types/book'

/** Cor estável a partir do id (o mesmo livro sempre tem a mesma cor). */
const hueFromId = (id: string) => {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return Math.abs(hash) % 360
}

/**
 * Lombada provisória: só para enxergar os livros nos slots.
 * A lombada de verdade (cor da capa, espessura, 3D) entra na etapa "lombada".
 */
export function SpinePlaceholder({ book }: { book: Book }) {
  return (
    <div
      title={`${book.title} (${book.authors.join(', ')})`}
      style={{ backgroundColor: `hsl(${hueFromId(book.id)} 35% 32%)` }}
      className="flex size-full items-center justify-center overflow-hidden rounded-[0.3cqw] shadow-[inset_-0.3cqw_0_0_rgb(0_0_0/0.3)]"
    >
      <span className="truncate text-[1.7cqw] leading-none text-parchment/85 [writing-mode:vertical-rl]">
        {book.title}
      </span>
    </div>
  )
}
