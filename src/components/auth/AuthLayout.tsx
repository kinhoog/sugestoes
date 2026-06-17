import type { ReactNode } from 'react';
import { Activity, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const valueCards = [
  {
    icon: <Activity size={18} />,
    title: 'Gargalos visíveis',
    text: 'Registre pontos de retrabalho, perda de tempo e rotina manual.',
  },
  {
    icon: <ShieldCheck size={18} />,
    title: 'Acesso protegido',
    text: 'Entrada restrita a colaboradores com e-mail corporativo verificado.',
  },
  {
    icon: <CheckCircle2 size={18} />,
    title: 'Análise estruturada',
    text: 'Cada solicitação recebe protocolo e segue para avaliação interna.',
  },
];

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#e6f7ff_0,#f8fbff_34%,#eef7ff_68%,#f8fafc_100%)]">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />
      <main className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
        <section className="page-enter hidden lg:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-800 shadow-[0_14px_40px_rgba(21,120,194,0.12)] backdrop-blur">
            <Sparkles size={16} />
            Portal interno de melhoria contínua
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="rounded-3xl bg-white/80 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-white/80 backdrop-blur">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Protege"
                className="h-16 w-auto"
              />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-700">
                Protege
              </p>
              <h1 className="mt-2 max-w-xl text-4xl font-semibold leading-tight text-slate-950">
                Transforme gargalos operacionais em oportunidades reais de melhoria.
              </h1>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
            Registre dificuldades, retrabalhos e rotinas manuais para que o comitê avalie
            melhorias internas com mais contexto, rastreabilidade e segurança.
          </p>

          <div className="mt-8 grid max-w-2xl gap-4">
            {valueCards.map((card, index) => (
              <article
                key={card.title}
                className="floating-card rounded-2xl border border-white/70 bg-white/75 p-4 shadow-[0_18px_54px_rgba(15,23,42,0.09)] backdrop-blur"
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
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Protege" className="h-12 w-auto" />
            <div>
              <p className="text-sm font-bold text-brand-700">Protege</p>
              <p className="text-xs text-slate-500">Oportunidades de Melhoria</p>
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
