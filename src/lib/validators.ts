/**
 * Validações síncronas reutilizáveis (frontend).
 */
import {
  EMAIL_DOMINIO_PERMITIDO,
  MAX_ANEXOS,
  MAX_TAMANHO_ANEXO_BYTES,
} from './constants';

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

export interface ValidacaoAnexos {
  valido: boolean;
  erro?: string;
}

/** Valida quantidade e tamanho dos anexos (ARQUITETURA §11). */
export function validarAnexos(arquivos: readonly File[]): ValidacaoAnexos {
  if (arquivos.length > MAX_ANEXOS) {
    return { valido: false, erro: `Máximo de ${MAX_ANEXOS} arquivos por solicitação.` };
  }
  const excede = arquivos.find((f) => f.size > MAX_TAMANHO_ANEXO_BYTES);
  if (excede) {
    return {
      valido: false,
      erro: `O arquivo "${excede.name}" excede o limite de 10 MB.`,
    };
  }
  return { valido: true };
}
