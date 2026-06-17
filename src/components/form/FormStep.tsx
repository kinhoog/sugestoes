import type { ReactNode } from 'react';

interface FormStepProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function FormStep({ eyebrow, title, description, children }: FormStepProps) {
  return (
    <section className="step-enter rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-7">
      <div className="mb-6 border-b border-slate-100 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}
