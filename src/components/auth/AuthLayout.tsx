import type { ReactNode } from 'react';

import { BrandHeader } from '../BrandHeader';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-50">
      <BrandHeader showAdminLink={false} />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md items-center px-4 py-8 sm:px-6">
        <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-6">{children}</div>
        </section>
      </main>
    </div>
  );
}
