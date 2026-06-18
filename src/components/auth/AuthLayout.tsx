import type { ReactNode } from 'react';
import { Bot, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

import { BrandLogo } from '../BrandLogo';
import { ThemeToggle } from '../ThemeToggle';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const valueCards = [
  {
    icon: <Bot size={18} />,
    title: 'Rotinas automatizáveis',
    text: 'Aponte controles manuais, retrabalhos e atividades repetitivas do setor.',
  },
  {
    icon: <ShieldCheck size={18} />,
    title: 'Acesso protegido',
    text: 'Entrada restrita a colaboradores com e-mail corporativo verificado.',
  },
  {
    icon: <Cpu size={18} />,
    title: 'Avaliação por Automações e IA',
    text: 'As demandas são analisadas para identificar sistemas internos e melhorias digitais.',
  },
];

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="auth-backdrop relative min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#e6f7ff_0,#f8fbff_34%,#eef7ff_68%,#f8fafc_100%)] transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,rgba(36,151,227,0.24)_0,rgba(2,6,23,0.98)_38%,#020617_100%)]">
      <div className="pointer-events-none absolute -left-20 top-10 h-60 w-60 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute -right-16 bottom-6 h-64 w-64 rounded-full bg-brand-300/20 blur-3xl dark:bg-brand-600/10" />
      <div className="absolute right-4 top-4 z-20 sm:right-6">
        <ThemeToggle />
      </div>

      <main className="relative mx-auto grid min-h-dvh w-full max-w-6xl content-center items-start gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[0.95fr_0.82fr] lg:py-5">
        <section className="page-enter hidden max-w-2xl lg:block">
          <div className="automation-badge inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-800 shadow-[0_10px_28px_rgba(21,120,194,0.1)] backdrop-blur dark:border-cyan-300/20 dark:bg-slate-900/70 dark:text-cyan-100 dark:shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
            <Sparkles size={12} className="badge-sparkle" />
            Portal interno de automação
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/80 p-2.5 shadow-[0_16px_44px_rgba(15,23,42,0.1)] ring-1 ring-white/80 backdrop-blur dark:bg-white/95 dark:ring-white/20">
              <BrandLogo className="h-11" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-700 dark:text-cyan-200">
                eProtege
              </p>
              <h1 className="mt-1.5 max-w-2xl text-[1.75rem] font-semibold leading-snug text-slate-950 dark:text-white">
                Registro de Demandas para Automação Interna
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Registre gargalos operacionais, retrabalhos ou rotinas manuais que possam ser avaliados
            pela equipe de Automações e IA como oportunidades para sistemas internos, automações ou
            melhorias digitais.
          </p>

          <div className="mt-5 grid max-w-2xl gap-2.5">
            {valueCards.map((card) => (
              <article
                key={card.title}
                className="info-card rounded-2xl border border-white/70 bg-white/75 p-3 shadow-[0_14px_38px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.1)] motion-reduce:transition-none dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-[0_18px_44px_rgba(0,0,0,0.2)] dark:hover:border-slate-600"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-[0_12px_30px_rgba(21,120,194,0.22)]">
                    {card.icon}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                      {card.title}
                    </h2>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
                      {card.text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="page-enter mx-auto w-full max-w-md">
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <span className="rounded-2xl bg-white/90 p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:bg-white/95">
              <BrandLogo className="h-9" />
            </span>
            <div>
              <p className="text-sm font-bold text-brand-700 dark:text-cyan-200">eProtege</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automação de Rotinas e Melhoria de Processos
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur sm:p-6 dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-cyan-200">
                Acesso corporativo
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {description}
              </p>
            </div>
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
