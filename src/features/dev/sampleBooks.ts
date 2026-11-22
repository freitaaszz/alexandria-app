import type { BookInfo } from '@/types/book'

/** Livros de exemplo para testar a estante antes da busca existir. */
export const SAMPLE_BOOKS: Omit<BookInfo, 'googleId'>[] = [
  { title: 'Dom Casmurro', authors: ['Machado de Assis'], pageCount: 256 },
  { title: 'O Hobbit', authors: ['J. R. R. Tolkien'], pageCount: 336 },
  {
    title: 'Corte de Espinhos e Rosas',
    authors: ['Sarah J. Maas'],
    pageCount: 434,
  },
  {
    title: 'Corte de Névoa e Fúria',
    authors: ['Sarah J. Maas'],
    pageCount: 658,
  },
  {
    title: 'O Pequeno Príncipe',
    authors: ['Antoine de Saint-Exupéry'],
    pageCount: 96,
  },
  { title: '1984', authors: ['George Orwell'], pageCount: 416 },
  { title: 'A Hora da Estrela', authors: ['Clarice Lispector'], pageCount: 88 },
  { title: 'Duna', authors: ['Frank Herbert'], pageCount: 680 },
  { title: 'Orgulho e Preconceito', authors: ['Jane Austen'], pageCount: 424 },
  {
    title: 'Cem Anos de Solidão',
    authors: ['Gabriel García Márquez'],
    pageCount: 448,
  },
]
