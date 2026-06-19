import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Clock3,
  Gauge,
  Layers3,
  UserCheck,
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
  dataAdminParaDate,
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

function sortByRecent(a: SolicitacaoAdmin, b: SolicitacaoAdmin): number {
  const dateA = dataAdminParaDate(a.updated_at ?? a.data_criacao)?.getTime() ?? 0;
  const dateB = dataAdminParaDate(b.updated_at ?? b.data_criacao)?.getTime() ?? 0;
  return dateB - dateA;
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
    const solicitacoesRecentes = solicitacoes.slice().sort(sortByRecent);
    const recentes = solicitacoesRecentes.slice(0, 5);
    const semResponsavel = solicitacoes.filter(
      (solicitacao) => !solicitacao.responsavel_admin_email,
    );

    return {
      total,
      novas: porStatus.Nova,
      emAnalise: porStatus['Em Análise'],
      aguardandoInformacoes: porStatus['Aguardando Informações'],
      aprovadas: porStatus.Aprovada,
      rejeitadas: porStatus.Rejeitada,
      concluidas: porStatus.Concluída,
      semResponsavel: semResponsavel.length,
      comResponsavel: total - semResponsavel.length,
      porStatus,
      porPrioridade,
      setores,
      recentes,
      semResponsavelRecentes: semResponsavel.slice().sort(sortByRecent).slice(0, 5),
    };
  }, [solicitacoes]);

  return (
    <AdminShell>
      <div className="page-enter">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-cyan-200">
              Administrativo
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
              Dashboard de demandas
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600 dark:text-slate-300">
              Visão em tempo real das demandas registradas para análise de automação interna.
            </p>
          </div>
          <Link
            to={ROTAS.adminSolicitacoes}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(18,95,157,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            Ver solicitações
            <ArrowRight size={16} />
          </Link>
        </div>

        {error ? <Alert tone="error">{error}</Alert> : null}

        {loading ? <DashboardLoading /> : null}

        {!loading && !error ? (
          <>
            <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              <KpiCard
                icon={<ClipboardList size={20} />}
                label="Total de solicitações"
                value={String(dashboard.total)}
                detail="Demandas registradas"
              />
              <KpiCard
                icon={<Clock3 size={20} />}
                label="Solicitações novas"
                value={String(dashboard.novas)}
                detail="Aguardando triagem"
              />
              <KpiCard
                icon={<Activity size={20} />}
                label="Em análise"
                value={String(dashboard.emAnalise)}
                detail="Demandas em andamento"
              />
              <KpiCard
                icon={<Clock3 size={20} />}
                label="Aguardando informações"
                value={String(dashboard.aguardandoInformacoes)}
                detail="Pendentes de complemento"
              />
              <KpiCard
                icon={<UserCheck size={20} />}
                label="Aprovadas"
                value={String(dashboard.aprovadas)}
                detail="Demandas aprovadas"
              />
              <KpiCard
                icon={<Activity size={20} />}
                label="Rejeitadas"
                value={String(dashboard.rejeitadas)}
                detail="Demandas rejeitadas"
              />
              <KpiCard
                icon={<ClipboardList size={20} />}
                label="Concluídas"
                value={String(dashboard.concluidas)}
                detail="Demandas finalizadas"
              />
              <KpiCard
                icon={<UserCheck size={20} />}
                label="Sem responsável"
                value={String(dashboard.semResponsavel)}
                detail="Aguardando atribuição"
              />
              <KpiCard
                icon={<UserCheck size={20} />}
                label="Com responsável"
                value={String(dashboard.comResponsavel)}
                detail="Demandas atribuídas"
              />
            </div>

            {dashboard.total === 0 ? (
              <section className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-5 py-8 text-center shadow-[0_14px_36px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Nenhuma solicitação encontrada.
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Quando colaboradores registrarem demandas pelo formulário público, elas aparecerão
                  aqui em tempo real.
                </p>
              </section>
            ) : (
              <>
                <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
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

                <div className="mt-4 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                  <DistributionCard
                    title="Solicitações por setor"
                    icon={<Layers3 size={18} />}
                    total={dashboard.total}
                    items={dashboard.setores.map((setor) => ({
                      label: setor.nome,
                      value: setor.total,
                    }))}
                  />

                  <section className="rounded-2xl border border-white/80 bg-white/88 p-3.5 shadow-[0_18px_46px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-cyan-200">
                          Tempo real
                        </p>
                        <h2 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
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

                    <div className="mt-3 grid gap-2">
                      {dashboard.recentes.map((solicitacao) => (
                        <Link
                          key={solicitacao.id}
                          to={ROTAS.adminDetalhe(solicitacao.id)}
                          className="rounded-xl border border-slate-200 bg-white/90 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-brand-500"
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
                      ))}
                    </div>
                  </section>
                </div>

                <section className="mt-4 rounded-2xl border border-white/80 bg-white/88 p-3.5 shadow-[0_18px_46px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-cyan-200">
                        Atribuição
                      </p>
                      <h2 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
                        Demandas sem responsável
                      </h2>
                    </div>
                    <Link
                      to={ROTAS.adminSolicitacoes}
                      className="text-sm font-semibold text-brand-700 transition hover:text-brand-900 dark:text-cyan-200 dark:hover:text-cyan-100"
                    >
                      Ver lista
                    </Link>
                  </div>

                  {dashboard.semResponsavelRecentes.length > 0 ? (
                    <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                      {dashboard.semResponsavelRecentes.map((solicitacao) => (
                        <Link
                          key={solicitacao.id}
                          to={ROTAS.adminDetalhe(solicitacao.id)}
                          className="rounded-xl border border-slate-200 bg-white/90 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-brand-500"
                        >
                          <p className="text-sm font-bold text-brand-800 dark:text-cyan-200">
                            {solicitacao.protocolo ?? 'Sem protocolo'}
                          </p>
                          <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-slate-950 dark:text-white">
                            {valorTextoAdmin(solicitacao.processo_alvo)}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {getSetorNomeAdmin(solicitacao.setor_id)} ·{' '}
                            {formatarDataHoraAdmin(solicitacao.data_criacao)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="Todas as demandas carregadas já possuem responsável." />
                  )}
                </section>
              </>
            )}
          </>
        ) : null}
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
    <section className="rounded-2xl border border-white/80 bg-white/88 p-3.5 shadow-[0_16px_44px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_22px_62px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-cyan-200">
          {icon}
        </div>
      </div>
      <p className="mt-2.5 text-[13px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
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
    <section className="rounded-2xl border border-white/80 bg-white/88 p-3.5 shadow-[0_18px_46px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-cyan-200">
          {icon}
        </span>
        <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
      </div>

      <div className="mt-3 grid gap-2.5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
              <span className="text-slate-500 dark:text-slate-400">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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

function DashboardLoading() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {['Total', 'Novas', 'Prioridade', 'Setores'].map((item) => (
        <section
          key={item}
          className="rounded-2xl border border-white/80 bg-white/78 p-3.5 shadow-[0_14px_36px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/76"
        >
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="mt-4 h-4 w-28 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="mt-3 h-8 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="mt-3 h-3 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
        </section>
      ))}
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-5 py-6 text-sm text-slate-500 shadow-[0_14px_36px_rgba(15,23,42,0.06)] backdrop-blur md:col-span-2 xl:col-span-4 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
        Carregando solicitações em tempo real...
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
      {text}
    </div>
  );
}
