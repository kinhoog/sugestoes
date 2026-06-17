import type { ReactNode } from 'react';

interface PlaceholderPanelProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PlaceholderPanel({ title, description, children }: PlaceholderPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
