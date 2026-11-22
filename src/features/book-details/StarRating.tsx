import { useState } from 'react'

type StarRatingProps = {
  value?: number
  onChange: (value: number | undefined) => void
}

const STARS = [1, 2, 3, 4, 5]

/**
 * Nota de 1 a 5 estrelas.
 * Tocar na estrela que já está marcada tira a nota.
 * No teclado: setas mudam a nota (padrão de "radiogroup").
 */
export function StarRating({ value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value ?? 0

  return (
    <div
      role="radiogroup"
      aria-label="Nota"
      className="flex gap-1"
      onPointerLeave={() => setHover(null)}
      onKeyDown={(e) => {
        const current = value ?? 0
        let next: number | undefined
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          next = Math.min(5, current + 1)
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          next = current <= 1 ? undefined : current - 1
        } else return
        e.preventDefault()
        onChange(next)
        // O foco acompanha a estrela escolhida
        const buttons = e.currentTarget.querySelectorAll('button')
        buttons[(next ?? 1) - 1]?.focus()
      }}
    >
      {STARS.map((star) => {
        const filled = star <= shown
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
            // Só a estrela marcada (ou a primeira) recebe Tab; o resto é pelas setas.
            tabIndex={(value ?? 1) === star ? 0 : -1}
            // Pré-visualização só com mouse: no toque, o "hover" ficaria grudado.
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(star)}
            onClick={() => onChange(value === star ? undefined : star)}
            className="grid size-11 place-items-center rounded-full transition-transform active:scale-90"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`size-8 transition-colors duration-150 ${
                filled
                  ? 'fill-ember stroke-ember'
                  : 'fill-transparent stroke-parchment/35'
              }`}
              strokeWidth={1.5}
              strokeLinejoin="round"
            >
              <path d="M12 2.8l2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.36l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
