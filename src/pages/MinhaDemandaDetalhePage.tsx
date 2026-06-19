import { ArrowLeft, ClipboardPlus, MessageSquareText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { BrandHeader } from '../components/BrandHeader';
import { PublicHeaderActions } from '../components/PublicHeaderActions';
import { PublicStatusBadge } from '../components/PublicStatusBadge';
import { Alert } from '../components/ui/Alert';
import { ButtonLink } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useMinhaDemanda } from '../hooks/useMinhasDemandas';
import { formatarDataHoraAdmin, valorTextoAdmin } from '../lib/admin';
import { ROTAS } from '../lib/constants';

export function MinhaDemandaDetalhePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { demanda, loading, error } = useMinhaDemanda(id, user?.uid);
  const respostaPublica = demanda?.resposta_publica?.trim() ?? '';

  return (
    <div className="app-backdrop min-h-screen">
      <BrandHeader>
        <PublicHeaderActions />
      </BrandHeader>

      <main className="page-enter mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <Link
          to={ROTAS.minhasDemandas}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-900 dark:text-cyan-200 dark:hover:text-cyan-100"
        >
          <ArrowLeft size={16} />
          Voltar para minhas demandas
        </Link>

        {error ? <Alert tone="error">{error}</Alert> : null}

        {loading ? (
          <section className="rounded-[1.5rem] border border-white/80 bg-white/76 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/76">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="mt-5 h-8 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="mt-4 h-4 w-1/2 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          </section>
        ) : null}

        {!loading && !error && !demanda ? (
          <section className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white/72 px-5 py-10 text-center shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/72">
            <h1 className="text-lg font-semibold text-slate-950 dark:text-white">
              Demanda não encontrada.
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Esta demanda pode não existir ou não pertencer ao seu usuário.
            </p>
            <div className="mt-5">
              <ButtonLink to={ROTAS.minhasDemandas} variant="secondary">
                Ver minhas demandas
              </ButtonLink>
            </div>
          </section>
        ) : null}

        {!loading && !error && demanda ? (
          <div className="grid gap-4">
            <section className="rounded-[1.5rem] border border-white/80 bg-white/86 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-brand-800 dark:text-cyan-200">
                      {demanda.protocolo}
                    </p>
                    <PublicStatusBadge status={demanda.status_publico} />
                  </div>
                  <h1 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                    {valorTextoAdmin(demanda.processo_atividade)}
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {valorTextoAdmin(demanda.setor)} · {valorTextoAdmin(demanda.cargo)}
                  </p>
                </div>
                <ButtonLink to={ROTAS.formulario} icon={<ClipboardPlus size={16} />}>
                  Nova demanda
                </ButtonLink>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoCard label="Enviado em" value={formatarDataHoraAdmin(demanda.created_at)} />
                <InfoCard
                  label="Última atualização"
                  value={formatarDataHoraAdmin(demanda.updated_at ?? demanda.created_at)}
                />
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/80 bg-white/86 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-2">
                <MessageSquareText size={18} className="text-brand-700 dark:text-cyan-200" />
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                  Resposta da equipe
                </h2>
              </div>

              {respostaPublica ? (
                <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-sm leading-6 text-slate-700 dark:border-brand-500/30 dark:bg-brand-900/30 dark:text-slate-200">
                  {respostaPublica}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  Ainda não há resposta da equipe para esta demanda.
                </p>
              )}
            </section>

            <section className="rounded-[1.5rem] border border-white/80 bg-white/86 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Dados da demanda
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoCard label="Protocolo" value={demanda.protocolo} />
                <InfoCard label="Status" value={demanda.status_publico} />
                <InfoCard label="Setor" value={valorTextoAdmin(demanda.setor)} />
                <InfoCard label="Cargo" value={valorTextoAdmin(demanda.cargo)} />
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/78 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-[0_14px_34px_rgba(0,0,0,0.22)]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}
