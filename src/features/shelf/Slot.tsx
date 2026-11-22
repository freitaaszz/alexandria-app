import type { SlotPosition } from '@/types/library'
import { slotId } from './config'

type SlotProps = {
  position: SlotPosition
  debug: boolean
}

/**
 * Um lugar para um livro. A proporção (2:11) é a de uma lombada.
 * No modo debug, o slot vazio aparece pontilhado.
 */
export function Slot({ position, debug }: SlotProps) {
  return (
    <div
      data-slot={slotId(position)}
      aria-hidden="true"
      className={`aspect-[2/11] rounded-[0.3cqw] ${
        debug
          ? 'outline-1 -outline-offset-1 outline-parchment/25 outline-dashed'
          : ''
      }`}
    />
  )
}
