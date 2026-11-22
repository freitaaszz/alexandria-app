import { useEffect, useState } from 'react'
import {
  BookSearchError,
  searchBooks,
  type SearchErrorReason,
} from '@/lib/googleBooks'
import type { BookInfo } from '@/types/book'

/** Espera a pessoa parar de digitar antes de buscar. */
const DEBOUNCE_MS = 400
const MIN_LENGTH = 2

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; results: BookInfo[] }
  | { status: 'error'; reason: SearchErrorReason }

/** Resultados já buscados nesta sessão (evita gastar a cota repetindo a mesma busca). */
const cache = new Map<string, BookInfo[]>()

export function useBookSearch(query: string): SearchState {
  const term = query.trim().toLowerCase()
  const tooShort = term.length < MIN_LENGTH
  const cached = tooShort ? undefined : cache.get(term)

  const [state, setState] = useState<SearchState>({ status: 'idle' })

  useEffect(() => {
    if (tooShort || cached) return
    const controller = new AbortController()

    const timer = window.setTimeout(async () => {
      setState({ status: 'loading' })
      try {
        const results = await searchBooks(term, { signal: controller.signal })
        cache.set(term, results)
        setState({ status: 'success', results })
      } catch (error) {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          reason: error instanceof BookSearchError ? error.reason : 'unknown',
        })
      }
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [term, tooShort, cached])

  if (tooShort) return { status: 'idle' }
  if (cached) return { status: 'success', results: cached }
  return state
}
