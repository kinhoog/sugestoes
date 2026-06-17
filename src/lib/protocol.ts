/**
 * Utilitários do protocolo `PRO-YYYY-XXXX` (ARQUITETURA §8).
 *
 * A geração do número sequencial é coordenada por transação Firestore sobre
 * `contadores/protocolos_YYYY`. No frontend usamos este helper para formatar
 * e validar a máscara pública do protocolo.
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
