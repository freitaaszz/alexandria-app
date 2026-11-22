/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Chave da Google Books API (arquivo .env). */
  readonly VITE_GOOGLE_BOOKS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
