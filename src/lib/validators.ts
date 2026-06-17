/**
 * Validações síncronas reutilizáveis (frontend).
 */
import { EMAIL_DOMINIO_PERMITIDO } from './constants';

/** Valida formato básico de e-mail. */
const EMAIL_FORMATO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailFormatoValido(email: string): boolean {
  return EMAIL_FORMATO.test(email.trim());
}

/** E-mail deve ter formato válido e terminar com o domínio corporativo. */
export function isEmailCorporativoValido(email: string): boolean {
  const normalizado = email.trim().toLowerCase();
  return isEmailFormatoValido(normalizado) && normalizado.endsWith(EMAIL_DOMINIO_PERMITIDO);
}

export function isPreenchido(valor: string | null | undefined): boolean {
  return typeof valor === 'string' && valor.trim().length > 0;
}

export function normalizarReferenciaEvidencia(valor: string | null | undefined): string | null {
  const normalizado = valor?.trim();
  return normalizado ? normalizado : null;
}
