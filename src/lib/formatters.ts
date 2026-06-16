/**
 * Formatadores de exibição (pt-BR).
 */

const FORMATADOR_DATA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const FORMATADOR_DATA_HORA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatarData(valor: string | Date | null | undefined): string {
  if (!valor) return '—';
  return FORMATADOR_DATA.format(new Date(valor));
}

export function formatarDataHora(valor: string | Date | null | undefined): string {
  if (!valor) return '—';
  return FORMATADOR_DATA_HORA.format(new Date(valor));
}

/** Formata um tamanho em bytes para KB/MB legível. */
export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Diferença em horas entre duas datas (para SLAs). Retorna null se faltar dado. */
export function horasEntre(
  inicio: string | Date | null | undefined,
  fim: string | Date | null | undefined,
): number | null {
  if (!inicio || !fim) return null;
  const ms = new Date(fim).getTime() - new Date(inicio).getTime();
  return ms / (1000 * 60 * 60);
}

/** Formata uma duração em horas como "Xh Ymin" ou "N dias". */
export function formatarDuracaoHoras(horas: number | null): string {
  if (horas === null) return '—';
  if (horas < 1) return `${Math.round(horas * 60)} min`;
  if (horas < 24) return `${Math.round(horas)} h`;
  return `${(horas / 24).toFixed(1)} dias`;
}
