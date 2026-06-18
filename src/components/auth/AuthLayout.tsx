import type { ReactNode } from 'react';
import { Bot, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#e6f7ff_0,#f8fbff_34%,#eef7ff_68%,#f8fafc_100%)]">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />
      <main className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.96fr_0.84fr] lg:py-10">
        <section className="page-enter hidden max-w-2xl lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-800 shadow-[0_10px_28px_rgba(21,120,194,0.1)] backdrop-blur">
            <Sparkles size={13} />
            Portal interno de automação
          </div>

          <div className="mt-7 flex items-start gap-4">
            <div className="rounded-2xl bg-white/80 p-3 shadow-[0_18px_52px_rgba(15,23,42,0.11)] ring-1 ring-white/80 backdrop-blur">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="eProtege"
                className="h-12 w-auto"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-700">
                eProtege
              </p>
              <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-snug text-slate-950">
                Registro de Demandas para Automação Interna
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
            Registre situações do dia a dia que geram retrabalho, perda de tempo, controle manual
            ou dificuldade operacional. As informações serão avaliadas pela equipe de Automações e
            IA para identificar se há possibilidade de criação de sistemas internos, automações ou
            melhorias digitais para apoiar o setor solicitante.
          </p>

          <div className="mt-7 grid max-w-2xl gap-3">
            {valueCards.map((card, index) => (
              <article
                key={card.title}
                className="floating-card rounded-2xl border border-white/70 bg-white/75 p-3.5 shadow-[0_16px_46px_rgba(15,23,42,0.08)] backdrop-blur"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-[0_12px_30px_rgba(21,120,194,0.24)]">
                    {card.icon}
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-950">{card.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{card.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="page-enter mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="eProtege" className="h-12 w-auto" />
            <div>
              <p className="text-sm font-bold text-brand-700">eProtege</p>
              <p className="text-xs text-slate-500">
                Automação de Rotinas e Melhoria de Processos
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                Acesso corporativo
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
