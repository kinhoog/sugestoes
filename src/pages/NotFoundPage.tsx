import { Link } from 'react-router-dom';

import { BrandHeader } from '../components/BrandHeader';

export function NotFoundPage() {
  return (
    <div className="app-backdrop min-h-screen">
      <BrandHeader />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-2xl items-center px-4 py-8 sm:px-6">
        <section className="page-enter w-full rounded-[1.5rem] border border-white/80 bg-white/90 p-7 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">404</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Página não encontrada</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            A rota acessada não existe neste portal.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-800 motion-reduce:transition-none"
          >
            Voltar ao formulário
          </Link>
        </section>
      </main>
    </div>
  );
}
