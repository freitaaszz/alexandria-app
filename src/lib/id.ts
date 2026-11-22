/**
 * Gera um id único.
 * crypto.randomUUID só existe em "contexto seguro" (https ou localhost). Ao abrir
 * pelo celular via IP da rede (http://192.168...), ele não existe, daí o plano B.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
