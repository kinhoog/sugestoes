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
      <div className="min-h-screen bg-slate-50">
        <BrandHeader showAdminLink={false} />
        <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md items-center justify-center px-4">
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-soft">
            <Loader2 className="h-4 w-4 animate-spin" />
            Validando sessao
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
      <div className="min-h-screen bg-slate-50">
        <BrandHeader showAdminLink={false} />
        <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md items-center px-4 py-8">
          <section className="w-full rounded-lg border border-red-100 bg-white p-6 shadow-soft">
            <h1 className="text-xl font-semibold text-slate-950">E-mail nao autorizado</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use uma conta com dominio @protege.med.br para acessar o portal.
            </p>
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
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
