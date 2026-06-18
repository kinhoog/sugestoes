import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';

import { PrioridadeBadge, StatusBadge } from '../components/admin/AdminBadges';
import { AdminShell } from '../components/admin/AdminShell';
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
  normalizarTextoAdmin,
  valorTextoAdmin,
} from '../lib/admin';
import type { SolicitacaoAdmin } from '../services/firebase/admin.service';
import type { PrioridadeNivel, StatusSolicitacao } from '../types/solicitacao.types';

type StatusFilter = '' | StatusSolicitacao;
type PrioridadeFilter = '' | PrioridadeNivel;

const filterControlClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white/90 px-3 text-sm text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-brand-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-brand-500 dark:focus:border-brand-400 dark:focus:ring-brand-900/50';

function matchesSearch(solicitacao: SolicitacaoAdmin, search: string): boolean {
  if (!search) {
    return true;
  }

  const haystack = [
    solicitacao.protocolo,
    solicitacao.nome_completo,
    solicitacao.email,
    solicitacao.created_by_email,
    solicitacao.processo_alvo,
    getSetorNomeAdmin(solicitacao.setor_id),
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizarTextoAdmin)
    .join(' ');

  return haystack.includes(search);
}

function sortByRecent(a: SolicitacaoAdmin, b: SolicitacaoAdmin): number {
  const dateA = dataAdminParaDate(a.data_criacao)?.getTime() ?? 0;
  const dateB = dataAdminParaDate(b.data_criacao)?.getTime() ?? 0;
  return dateB - dateA;
}

export function AdminSolicitacoesPage() {
  const { solicitacoes, loading, error } = useAdminSolicitacoes();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [prioridade, setPrioridade] = useState<PrioridadeFilter>('');
  const [setor, setSetor] = useState('');

  const searchNormalized = normalizarTextoAdmin(search);

  const filteredSolicitacoes = useMemo(
    () =>
      solicitacoes
        .filter((solicitacao) => matchesSearch(solicitacao, searchNormalized))
        .filter((solicitacao) => (status ? solicitacao.status === status : true))
        .filter((solicitacao) =>
          prioridade ? solicitacao.prioridade_calculada === prioridade : true,
        )
        .filter((solicitacao) => (setor ? solicitacao.setor_id === setor : true))
        .slice()
        .sort(sortByRecent),
    [prioridade, searchNormalized, setor, solicitacoes, status],
  );

  return (
    <AdminShell>
      <div className="page-enter">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-cyan-200">
            Administrativo
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            Solicitações
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Consulte demandas registradas, filtre por status, prioridade e setor, e abra o detalhe
            completo para análise.
          </p>
        </div>

        {error ? <Alert tone="error">{error}</Alert> : null}

        <section className="rounded-[1.5rem] border border-white/80 bg-white/88 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_28px_84px_rgba(0,0,0,0.35)]">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_210px]">
            <label className="relative block">
              <span className="sr-only">Buscar</span>
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={`${filterControlClass} pl-10`}
                placeholder="Buscar por protocolo, solicitante ou processo"
              />
            </label>

            <label>
              <span className="sr-only">Filtrar por status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as StatusFilter)}
                className={filterControlClass}
              >
                <option value="">Todos os status</option>
                {STATUS_SOLICITACAO.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filtrar por prioridade</span>
              <select
                value={prioridade}
                onChange={(event) => setPrioridade(event.target.value as PrioridadeFilter)}
                className={filterControlClass}
              >
                <option value="">Todas as prioridades</option>
                {PRIORIDADE_NIVEIS.map((prioridadeOption) => (
                  <option key={prioridadeOption} value={prioridadeOption}>
                    {prioridadeOption}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filtrar por setor</span>
              <select
                value={setor}
                onChange={(event) => setSetor(event.target.value)}
                className={filterControlClass}
              >
                <option value="">Todos os setores</option>
                {SETORES_OPCOES.map((setorOption) => (
                  <option key={setorOption.id} value={setorOption.id}>
                    {setorOption.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>
              {error
                ? 'Erro ao carregar solicitações'
                : loading
                  ? 'Carregando solicitações...'
                  : `${filteredSolicitacoes.length} de ${solicitacoes.length} solicitações`}
            </span>
            <span>Ordenação: mais recentes primeiro</span>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_28px_84px_rgba(0,0,0,0.35)]">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60">
                <tr>
                  {[
                    'Protocolo',
                    'Solicitante',
                    'Setor',
                    'Processo',
                    'Status',
                    'Prioridade',
                    'Score',
                    'Criada em',
                    '',
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!loading && !error ? filteredSolicitacoes.map((solicitacao) => (
                  <tr
                    key={solicitacao.id}
                    className="transition-colors hover:bg-brand-50/60 dark:hover:bg-slate-900/80"
                  >
                    <td className="px-4 py-4 text-sm font-bold text-brand-800 dark:text-cyan-200">
                      {solicitacao.protocolo ?? '—'}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {valorTextoAdmin(solicitacao.nome_completo)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {valorTextoAdmin(solicitacao.email)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {getSetorNomeAdmin(solicitacao.setor_id)}
                    </td>
                    <td className="max-w-xs px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                      <span className="line-clamp-2">{valorTextoAdmin(solicitacao.processo_alvo)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={solicitacao.status} />
                    </td>
                    <td className="px-4 py-4">
                      <PrioridadeBadge prioridade={solicitacao.prioridade_calculada} />
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {solicitacao.score ?? '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatarDataHoraAdmin(solicitacao.data_criacao)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={ROTAS.adminDetalhe(solicitacao.id)}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 hover:text-brand-900 dark:text-cyan-200 dark:hover:bg-slate-800 dark:hover:text-cyan-100"
                      >
                        Abrir
                        <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {!loading && !error ? filteredSolicitacoes.map((solicitacao) => (
              <Link
                key={solicitacao.id}
                to={ROTAS.adminDetalhe(solicitacao.id)}
                className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition-all hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900/72 dark:hover:border-brand-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-brand-800 dark:text-cyan-200">
                      {solicitacao.protocolo ?? 'Sem protocolo'}
                    </p>
                    <h2 className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                      {valorTextoAdmin(solicitacao.processo_alvo)}
                    </h2>
                  </div>
                  <ArrowRight size={17} className="mt-1 shrink-0 text-slate-400" />
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {valorTextoAdmin(solicitacao.nome_completo)} ·{' '}
                  {getSetorNomeAdmin(solicitacao.setor_id)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge status={solicitacao.status} />
                  <PrioridadeBadge prioridade={solicitacao.prioridade_calculada} />
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Score {solicitacao.score ?? '—'}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {formatarDataHoraAdmin(solicitacao.data_criacao)}
                </p>
              </Link>
            )) : null}
          </div>

          {error ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Não foi possível carregar as solicitações.
              </p>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Verifique se o usuário é admin autorizado, se o e-mail está verificado e se a
                conexão com o Firestore está disponível.
              </p>
            </div>
          ) : null}

          {!loading && !error && filteredSolicitacoes.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Nenhuma solicitação encontrada para os filtros aplicados.
            </div>
          ) : null}

          {loading ? (
            <div className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Carregando solicitações em tempo real...
            </div>
          ) : null}
        </section>
      </div>
    </AdminShell>
  );
}
