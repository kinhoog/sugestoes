import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Clock3,
  Gauge,
  Layers3,
} from 'lucide-react';

import { AdminShell } from '../components/admin/AdminShell';
import { PrioridadeBadge } from '../components/admin/AdminBadges';
import { Alert } from '../components/ui/Alert';
import { useAdminSolicitacoes } from '../hooks/useAdminSolicitacoes';
import {
  PRIORIDADE_NIVEIS,
  ROTAS,
  SETORES_OPCOES,
  STATUS_SOLICITACAO,
} from '../lib/constants';
import {
  formatarDataHoraAdmin,
  getSetorNomeAdmin,
  valorTextoAdmin,
} from '../lib/admin';
import type { SolicitacaoAdmin } from '../services/firebase/admin.service';
import type { PrioridadeNivel, StatusSolicitacao } from '../types/solicitacao.types';

function countBy<T extends string>(
  solicitacoes: readonly SolicitacaoAdmin[],
  values: readonly T[],
  getter: (solicitacao: SolicitacaoAdmin) => T | null | undefined,
): Record<T, number> {
  const initial = values.reduce(
    (acc, value) => ({ ...acc, [value]: 0 }),
    {} as Record<T, number>,
  );

  return solicitacoes.reduce<Record<T, number>>((acc, solicitacao) => {
    const value = getter(solicitacao);
    if (value && value in acc) {
      acc[value] += 1;
    }
    return acc;
  }, initial);
}

function percent(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

export function AdminDashboardPage() {
  const { solicitacoes, loading, error } = useAdminSolicitacoes();

  const dashboard = useMemo(() => {
    const total = solicitacoes.length;
    const porStatus = countBy<StatusSolicitacao>(
      solicitacoes,
      STATUS_SOLICITACAO,
      (solicitacao) => solicitacao.status,
    );
    const porPrioridade = countBy<PrioridadeNivel>(
      solicitacoes,
      PRIORIDADE_NIVEIS,
      (solicitacao) => solicitacao.prioridade_calculada,
    );
    const setores = SETORES_OPCOES.map((setor) => ({
      id: setor.id,
      nome: setor.nome,
      total: solicitacoes.filter((solicitacao) => solicitacao.setor_id === setor.id).length,
    })).sort((a, b) => b.total - a.total);
    const recentes = solicitacoes.slice(0, 5);

    return {
      total,
      novas: porStatus.Nova,
      criticasOuAltas: porPrioridade.Alta + porPrioridade.Crítica,
      setoresComDemandas: setores.filter((setor) => setor.total > 0).length,
      porStatus,
      porPrioridade,
      setores,
      recentes,
    };
  }, [solicitacoes]);

  return (
    <AdminShell>
      <div className="page-enter">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-cyan-200">
              Administrativo
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
              Dashboard de demandas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Visão em tempo real das demandas registradas para análise de automação interna.
            </p>
          </div>
          <Link
            to={ROTAS.adminSolicitacoes}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(18,95,157,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            Ver solicitações
            <ArrowRight size={16} />
          </Link>
        </div>

        {error ? <Alert tone="error">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<ClipboardList size={20} />}
            label="Total de solicitações"
            value={loading ? '—' : String(dashboard.total)}
            detail="Demandas registradas"
          />
          <KpiCard
            icon={<Clock3 size={20} />}
            label="Solicitações novas"
            value={loading ? '—' : String(dashboard.novas)}
            detail="Aguardando triagem"
          />
          <KpiCard
            icon={<AlertTriangle size={20} />}
            label="Alta ou crítica"
            value={loading ? '—' : String(dashboard.criticasOuAltas)}
            detail="Prioridade calculada"
          />
          <KpiCard
            icon={<Layers3 size={20} />}
            label="Setores envolvidos"
            value={loading ? '—' : String(dashboard.setoresComDemandas)}
            detail="Com demandas abertas"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <DistributionCard
            title="Solicitações por status"
            icon={<Activity size={18} />}
            total={dashboard.total}
            items={STATUS_SOLICITACAO.map((status) => ({
              label: status,
              value: dashboard.porStatus[status],
            }))}
          />
          <DistributionCard
            title="Solicitações por prioridade"
            icon={<Gauge size={18} />}
            total={dashboard.total}
            items={PRIORIDADE_NIVEIS.map((prioridade) => ({
              label: prioridade,
              value: dashboard.porPrioridade[prioridade],
            }))}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <DistributionCard
            title="Solicitações por setor"
            icon={<Layers3 size={18} />}
            total={dashboard.total}
            items={dashboard.setores.map((setor) => ({
              label: setor.nome,
              value: setor.total,
            }))}
          />

          <section className="rounded-[1.5rem] border border-white/80 bg-white/88 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_28px_84px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-cyan-200">
                  Tempo real
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                  Solicitações recentes
                </h2>
              </div>
              <Link
                to={ROTAS.adminSolicitacoes}
                className="text-sm font-semibold text-brand-700 transition hover:text-brand-900 dark:text-cyan-200 dark:hover:text-cyan-100"
              >
                Ver lista
              </Link>
            </div>

            <div className="mt-5 grid gap-3">
              {loading ? (
                <EmptyState text="Carregando solicitações..." />
              ) : dashboard.recentes.length === 0 ? (
                <EmptyState text="Nenhuma solicitação registrada ainda." />
              ) : (
                dashboard.recentes.map((solicitacao) => (
                  <Link
                    key={solicitacao.id}
                    to={ROTAS.adminDetalhe(solicitacao.id)}
                    className="rounded-2xl border border-slate-200 bg-white/90 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-brand-500"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-brand-800 dark:text-cyan-200">
                          {solicitacao.protocolo ?? 'Sem protocolo'}
                        </p>
                        <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-slate-950 dark:text-white">
                          {valorTextoAdmin(solicitacao.processo_alvo)}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {getSetorNomeAdmin(solicitacao.setor_id)} ·{' '}
                          {valorTextoAdmin(solicitacao.nome_completo)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <PrioridadeBadge prioridade={solicitacao.prioridade_calculada} />
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {formatarDataHoraAdmin(solicitacao.data_criacao)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function KpiCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <section className="rounded-[1.35rem] border border-white/80 bg-white/88 p-5 shadow-[0_22px_64px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_28px_84px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-cyan-200">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </section>
  );
}

function DistributionCard({
  title,
  icon,
  total,
  items,
}: {
  title: string;
  icon: ReactNode;
  total: number;
  items: readonly { label: string; value: number }[];
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/80 bg-white/88 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_28px_84px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-cyan-200">
          {icon}
        </span>
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
      </div>

      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
              <span className="text-slate-500 dark:text-slate-400">{item.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 via-cyan-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${percent(item.value, total)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
      {text}
    </div>
  );
}
