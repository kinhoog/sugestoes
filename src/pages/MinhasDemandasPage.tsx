import { ArrowRight, ClipboardPlus, Inbox, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BrandHeader } from '../components/BrandHeader';
import { PublicHeaderActions } from '../components/PublicHeaderActions';
import { PublicStatusBadge } from '../components/PublicStatusBadge';
import { Alert } from '../components/ui/Alert';
import { ButtonLink } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useMinhasDemandas } from '../hooks/useMinhasDemandas';
import { formatarDataHoraAdmin, valorTextoAdmin } from '../lib/admin';
import { ROTAS } from '../lib/constants';

function hasRespostaPublica(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function MinhasDemandasPage() {
  const { user } = useAuth();
  const { demandas, loading, error } = useMinhasDemandas(user?.uid);

  return (
    <div className="app-backdrop min-h-screen">
      <BrandHeader>
        <PublicHeaderActions />
      </BrandHeader>

      <main className="page-enter mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="mb-5 rounded-[1.5rem] border border-white/70 bg-white/78 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-cyan-200">
                Acompanhamento
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                Minhas demandas
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Acompanhe as demandas que você registrou e veja retornos publicados pela equipe de
                Automações e IA.
              </p>
            </div>
            <ButtonLink to={ROTAS.formulario} icon={<ClipboardPlus size={16} />}>
              Nova demanda
            </ButtonLink>
          </div>
        </section>

        {error ? <Alert tone="error">{error}</Alert> : null}

        {loading ? (
          <section className="grid gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70"
              >
                <div className="h-4 w-36 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </section>
        ) : null}

        {!loading && !error && demandas.length === 0 ? (
          <section className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white/72 px-5 py-10 text-center shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/72">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-cyan-200">
              <Inbox size={24} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
              Você ainda não registrou nenhuma demanda.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Quando uma nova demanda for registrada, ela aparecerá aqui automaticamente para
              acompanhamento.
            </p>
            <div className="mt-5">
              <ButtonLink to={ROTAS.formulario} icon={<ClipboardPlus size={16} />}>
                Registrar nova demanda
              </ButtonLink>
            </div>
          </section>
        ) : null}

        {!loading && !error && demandas.length > 0 ? (
          <section className="grid gap-3">
            {demandas.map((demanda) => (
              <Link
                key={demanda.id}
                to={ROTAS.minhaDemandaDetalhe(demanda.id)}
                className="rounded-2xl border border-white/80 bg-white/86 p-4 shadow-[0_16px_44px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_22px_60px_rgba(0,0,0,0.35)] dark:hover:border-brand-500"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-brand-800 dark:text-cyan-200">
                        {demanda.protocolo}
                      </p>
                      <PublicStatusBadge status={demanda.status_publico} />
                      {hasRespostaPublica(demanda.resposta_publica) ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/20">
                          <MessageSquareText size={13} />
                          Resposta disponível
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-2 line-clamp-2 text-base font-semibold text-slate-950 dark:text-white">
                      {valorTextoAdmin(demanda.processo_atividade)}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {valorTextoAdmin(demanda.setor)} · {valorTextoAdmin(demanda.cargo)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 lg:min-w-[260px]">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      <p>Enviado em {formatarDataHoraAdmin(demanda.created_at)}</p>
                      <p className="mt-1">Atualizado em {formatarDataHoraAdmin(demanda.updated_at)}</p>
                    </div>
                    <ArrowRight size={18} className="text-slate-400 dark:text-slate-500" />
                  </div>
                </div>
              </Link>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}
