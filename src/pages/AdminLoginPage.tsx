import { ShieldCheck } from 'lucide-react';

import { BrandHeader } from '../components/BrandHeader';
import { ADMIN_EMAILS } from '../lib/constants';

export function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <BrandHeader />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md items-center px-4 py-8 sm:px-6">
        <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-950">Acesso administrativo</h1>
              <p className="text-sm text-slate-500">Login via Firebase Auth.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">E-mail</span>
              <input
                type="email"
                disabled
                placeholder="usuario@protege.med.br"
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Senha</span>
              <input
                type="password"
                disabled
                placeholder="Configurado na fase de Auth"
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
            </label>
            <button
              type="button"
              disabled
              className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white opacity-60"
            >
              Entrar
            </button>
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            E-mails autorizados: {ADMIN_EMAILS.join(', ')}.
          </p>
        </section>
      </main>
    </div>
  );
}
