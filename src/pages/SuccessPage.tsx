import { Link, useLocation } from 'react-router-dom';
import { Check, CheckCircle2, LogOut, Plus } from 'lucide-react';

import { BrandHeader } from '../components/BrandHeader';
import { Button } from '../components/ui/Button';
import { ButtonLink } from '../components/ui/Button';
import { ROTAS } from '../lib/constants';
import { useAuth } from '../hooks/useAuth';

interface SuccessLocationState {
  protocolo?: string;
  solicitacaoId?: string;
}

export function SuccessPage() {
  const location = useLocation();
  const { logout } = useAuth();
  const state = location.state as SuccessLocationState | null;
  const protocolo = state?.protocolo ?? null;

  return (
    <div className="app-backdrop min-h-screen">
      <BrandHeader />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-4xl items-center px-4 py-8 sm:px-6">
        <section className="page-enter relative w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-6 text-center shadow-[0_34px_100px_rgba(15,23,42,0.16)] backdrop-blur sm:p-10 dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-[0_34px_100px_rgba(0,0,0,0.48)]">
          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-500/10" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-500/10" />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shadow-[0_18px_44px_rgba(16,185,129,0.22)] dark:bg-emerald-500/15 dark:text-emerald-200">
              <CheckCircle2 size={34} className="success-check" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-cyan-200">
              Demanda registrada
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
              Demanda registrada para análise de automação interna.
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Sua solicitação foi recebida e será analisada pela equipe de Automações e IA. Use o
              protocolo abaixo para acompanhar ou mencionar este registro.
            </p>

            {protocolo ? (
              <div className="step-enter mx-auto mt-7 max-w-md rounded-[1.5rem] border border-brand-100 bg-gradient-to-br from-brand-50 to-white px-6 py-5 shadow-[0_24px_70px_rgba(21,120,194,0.14)] dark:border-brand-500/30 dark:from-brand-900/60 dark:to-slate-900 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700 dark:text-cyan-200">
                  Protocolo
                </p>
                <p className="mt-2 text-3xl font-semibold text-brand-900 dark:text-white">{protocolo}</p>
              </div>
            ) : (
              <div className="mx-auto mt-7 max-w-md rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
                Protocolo não encontrado nesta navegação. Envie uma nova solicitação para gerar um
                protocolo.
              </div>
            )}

            <div className="mx-auto mt-7 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
              {['Análise inicial', 'Avaliação de automação', 'Retorno ao setor'].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/75 dark:shadow-[0_14px_34px_rgba(0,0,0,0.22)]"
                >
                  <Check size={16} className="text-emerald-600 dark:text-emerald-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <ButtonLink to={ROTAS.formulario} icon={<Plus size={16} />}>
                Registrar nova demanda
              </ButtonLink>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void logout()}
                icon={<LogOut size={16} />}
              >
                Sair
              </Button>
            </div>

            <Link
              to={ROTAS.formulario}
              className="mt-5 inline-block text-sm font-semibold text-brand-700 transition hover:text-brand-900 dark:text-cyan-200 dark:hover:text-cyan-100"
            >
              Voltar ao formulário
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
