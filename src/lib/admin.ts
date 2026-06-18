import {
  ADMIN_EMAILS,
  CARGOS_POR_SETOR,
  SETORES_OPCOES,
  type SetorOpcaoId,
} from './constants';
import { formatarDataHora } from './formatters';

interface TimestampLike {
  toDate: () => Date;
}

function normalizarEmailAdmin(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(normalizarEmailAdmin(email) as (typeof ADMIN_EMAILS)[number]);
}

function isTimestampLike(value: unknown): value is TimestampLike {
  if (!value || typeof value !== 'object' || !('toDate' in value)) {
    return false;
  }

  return typeof (value as { toDate?: unknown }).toDate === 'function';
}

function isSetorOpcaoId(value: string): value is SetorOpcaoId {
  return SETORES_OPCOES.some((setor) => setor.id === value);
}

export function dataAdminParaDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (isTimestampLike(value)) {
    return value.toDate();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function formatarDataHoraAdmin(value: unknown): string {
  const date = dataAdminParaDate(value);
  return date ? formatarDataHora(date) : '—';
}

export function getSetorNomeAdmin(setorId: string | null | undefined): string {
  if (!setorId) {
    return 'Não informado';
  }

  return SETORES_OPCOES.find((setor) => setor.id === setorId)?.nome ?? setorId;
}

export function getCargoNomeAdmin(
  cargoId: string | null | undefined,
  setorId?: string | null,
): string {
  if (!cargoId) {
    return 'Não informado';
  }

  if (setorId && isSetorOpcaoId(setorId)) {
    return CARGOS_POR_SETOR[setorId].find((cargo) => cargo.id === cargoId)?.nome ?? cargoId;
  }

  return Object.values(CARGOS_POR_SETOR)
    .flat()
    .find((cargo) => cargo.id === cargoId)?.nome ?? cargoId;
}

export function normalizarTextoAdmin(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function valorTextoAdmin(value: string | null | undefined): string {
  return value?.trim() ? value : 'Não informado';
}

export function booleanoAdmin(value: boolean | null | undefined): string {
  return value ? 'Sim' : 'Não';
}
