import type { StatusPublicoSolicitacao } from '../types/solicitacao.types';

const statusPublicoClasses: Record<StatusPublicoSolicitacao, string> = {
  Pendente:
    'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
  'Em análise':
    'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-500/20',
  'Aguardando informações':
    'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/20',
  Aprovada:
    'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/20',
  Rejeitada:
    'bg-red-50 text-red-700 ring-red-100 dark:bg-red-500/15 dark:text-red-200 dark:ring-red-500/20',
  Concluída:
    'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/20',
};

export function PublicStatusBadge({ status }: { status: StatusPublicoSolicitacao }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${
        statusPublicoClasses[status] ?? statusPublicoClasses.Pendente
      }`}
    >
      {status}
    </span>
  );
}
