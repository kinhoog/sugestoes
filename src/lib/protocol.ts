/**
 * Utilitários do protocolo `PRO-YYYY-XXXX` (ARQUITETURA §8).
 *
 * A geração é feita nativamente no PostgreSQL (trigger). No frontend usamos
 * apenas para validação e formatação de exibição.
 */
export const PROTOCOLO_PREFIXO = 'PRO';

/** Aceita 4+ dígitos no sequencial (zero-padded a 4), suportando volumes altos. */
export const PROTOCOLO_REGEX = /^PRO-\d{4}-\d{4,}$/;

export function isProtocoloValido(protocolo: string): boolean {
  return PROTOCOLO_REGEX.test(protocolo.trim());
}

/** Monta um protocolo a partir do ano e do sequencial (uso em testes/exibição). */
export function formatarProtocolo(ano: number, sequencial: number): string {
  return `${PROTOCOLO_PREFIXO}-${ano}-${String(sequencial).padStart(4, '0')}`;
}
