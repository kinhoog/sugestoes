import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

interface BrandHeaderProps {
  children?: ReactNode;
  showAdminLink?: boolean;
}

export function BrandHeader({ children, showAdminLink = true }: BrandHeaderProps) {
  return (
    <header className="portal-brand-header sticky top-0 z-30 border-b border-white/70 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-[0_16px_44px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 rounded-2xl bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 dark:bg-white/95 dark:ring-white/10">
            <BrandLogo className="h-9" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-700 dark:text-cyan-200">eProtege</p>
            <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">
              Automação de Rotinas e Melhoria de Processos
            </p>
          </div>
        </Link>

        {children ?? (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {showAdminLink ? (
              <Link
                to="/admin/login"
                className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-cyan-200 dark:hover:shadow-[0_14px_34px_rgba(0,0,0,0.3)]"
              >
                Área administrativa
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
