import type { ReactNode } from 'react';

interface FormStepProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function FormStep({ eyebrow, title, description, children }: FormStepProps) {
  return (
    <section className="portal-step-card step-enter rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-7 dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
      <div className="portal-step-divider mb-6 border-b border-slate-100 pb-5 dark:border-slate-800">
        <p className="portal-step-eyebrow text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-cyan-200">
          {eyebrow}
        </p>
        <h2 className="portal-step-title mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
          {title}
        </h2>
        <p className="portal-step-description mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
