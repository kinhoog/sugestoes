import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LockKeyhole, LogOut } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { ROTAS } from '../../lib/constants';
import { isAdminEmail } from '../../lib/admin';
import { BrandHeader } from '../BrandHeader';
import { Button, ButtonLink } from '../ui/Button';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const location = useLocation();
  const { loading, user, email, isCorporateEmail, isEmailVerified, logout } = useAuth();

  if (loading) {
    return (
      <div className="app-backdrop min-h-screen">
        <BrandHeader showAdminLink={false} />
        <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md items-center justify-center px-4">
          <div className="page-enter rounded-2xl border border-white/80 bg-white/90 px-5 py-4 text-sm font-medium text-slate-600 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/90 dark:text-slate-300">
            Validando acesso administrativo
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROTAS.login} replace state={{ from: location }} />;
  }

  if (!isEmailVerified) {
    return <Navigate to={ROTAS.verificarEmail} replace />;
  }

  if (!isCorporateEmail || !isAdminEmail(email)) {
    return (
      <div className="app-backdrop min-h-screen">
        <BrandHeader showAdminLink={false} />
        <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-lg items-center px-4 py-8 sm:px-6">
          <section className="page-enter w-full rounded-[1.5rem] border border-amber-100 bg-white/90 p-7 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:border-amber-500/30 dark:bg-slate-950/90 dark:shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
              <LockKeyhole size={22} />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">
              Acesso administrativo restrito
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Esta área é exclusiva para usuários autorizados da equipe de Automações e IA.
              Colaboradores podem continuar registrando demandas pelo formulário público.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to={ROTAS.formulario}>Voltar ao portal público</ButtonLink>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void logout()}
                icon={<LogOut size={16} />}
              >
                Sair
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
