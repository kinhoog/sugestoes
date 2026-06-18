import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';

import { BrandHeader } from '../BrandHeader';
import { ROTAS } from '../../lib/constants';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
  requireVerifiedEmail?: boolean;
}

export function AuthGuard({ children, requireVerifiedEmail = false }: AuthGuardProps) {
  const location = useLocation();
  const { loading, error, user, isCorporateEmail, isEmailVerified, logout } = useAuth();

  if (loading) {
    return (
      <div className="app-backdrop min-h-screen">
        <BrandHeader showAdminLink={false} />
        <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md items-center justify-center px-4">
          <div className="page-enter flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-5 py-4 text-sm font-medium text-slate-600 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/90 dark:text-slate-300 dark:shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Validando sessão
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROTAS.login} replace state={{ from: location }} />;
  }

  if (!isCorporateEmail) {
    return (
      <div className="app-backdrop min-h-screen">
        <BrandHeader showAdminLink={false} />
        <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md items-center px-4 py-8">
          <section className="page-enter w-full rounded-[1.5rem] border border-red-100 bg-white/90 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:border-red-500/30 dark:bg-slate-950/90 dark:shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
            <h1 className="text-xl font-semibold text-slate-950 dark:text-white">E-mail não autorizado</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Use uma conta com domínio @protege.med.br para acessar o portal.
            </p>
            {error ? <p className="mt-3 text-sm text-red-700 dark:text-red-200">{error}</p> : null}
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700 motion-reduce:transition-none dark:bg-brand-600 dark:hover:bg-brand-500"
            >
              <LogOut size={16} />
              Sair
            </button>
          </section>
        </main>
      </div>
    );
  }

  if (requireVerifiedEmail && !isEmailVerified) {
    return <Navigate to={ROTAS.verificarEmail} replace />;
  }

  return <>{children}</>;
}
