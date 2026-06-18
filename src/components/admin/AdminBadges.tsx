import type { PrioridadeNivel, StatusSolicitacao } from '../../types/solicitacao.types';

const prioridadeClasses: Record<string, string> = {
  Baixa:
    'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/20',
  Média:
    'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/20',
  Alta:
    'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/20',
  Crítica:
    'bg-red-50 text-red-700 ring-red-100 dark:bg-red-500/15 dark:text-red-200 dark:ring-red-500/20',
  'Não informada':
    'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
};

const statusClasses: Record<string, string> = {
  Nova:
    'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
  'Em Análise':
    'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-500/20',
  'Aguardando Informações':
    'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/20',
  Aprovada:
    'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/20',
  Rejeitada:
    'bg-red-50 text-red-700 ring-red-100 dark:bg-red-500/15 dark:text-red-200 dark:ring-red-500/20',
  Concluída:
    'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/20',
  'Não informado':
    'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
};

interface AdminBadgeProps {
  children: string;
  className: string;
}

function AdminBadge({ children, className }: AdminBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${className}`}>
      {children}
    </span>
  );
}

export function PrioridadeBadge({
  prioridade,
}: {
  prioridade: PrioridadeNivel | null | undefined;
}) {
  const label = prioridade ?? 'Não informada';
  return <AdminBadge className={prioridadeClasses[label] ?? prioridadeClasses['Não informada']}>{label}</AdminBadge>;
}

export function StatusBadge({ status }: { status: StatusSolicitacao | null | undefined }) {
  const label = status ?? 'Não informado';
  return <AdminBadge className={statusClasses[label] ?? statusClasses['Não informado']}>{label}</AdminBadge>;
}
