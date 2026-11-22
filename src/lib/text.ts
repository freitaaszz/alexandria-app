/** Converte a sinopse da Google (às vezes com <p>, <br>, <b>) em texto puro. */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Data de hoje no fuso da pessoa, no formato "AAAA-MM-DD" (para <input type="date">). */
export function todayIso(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "2024-03-15" -> "15 de março de 2024" */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Lê um número de páginas digitado: vazio ou inválido vira undefined. */
export function parsePageCount(value: string): number | undefined {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 && n <= 20000 ? n : undefined
}
