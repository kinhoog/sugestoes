import { ClipboardPlus, LayoutDashboard, ListChecks, LogOut } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { isAdminEmail } from '../lib/admin';
import { ROTAS } from '../lib/constants';
import { ThemeToggle } from './ThemeToggle';

function navClassName(isActive: boolean): string {
  return `inline-flex min-h-9 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 motion-reduce:transition-none ${
    isActive
      ? 'bg-brand-700 text-white shadow-[0_14px_30px_rgba(18,95,157,0.22)] dark:bg-brand-600 dark:shadow-[0_14px_34px_rgba(36,151,227,0.2)]'
      : 'border border-slate-200 bg-white/80 text-slate-700 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-800 dark:hover:text-cyan-100'
  }`;
}

export function PublicHeaderActions() {
  const { email, isEmailVerified, logout, user } = useAuth();
  const canAccessAdmin = Boolean(user && isEmailVerified && isAdminEmail(email));

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="hidden max-w-[220px] truncate rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 lg:block dark:bg-slate-900 dark:text-slate-300">
        {email}
      </span>

      <NavLink end to={ROTAS.formulario} className={({ isActive }) => navClassName(isActive)}>
        <ClipboardPlus size={15} />
        <span className="hidden sm:inline">Nova demanda</span>
      </NavLink>

      <NavLink to={ROTAS.minhasDemandas} className={({ isActive }) => navClassName(isActive)}>
        <ListChecks size={15} />
        <span className="hidden sm:inline">Minhas demandas</span>
      </NavLink>

      {canAccessAdmin ? (
        <Link
          to={ROTAS.adminDashboard}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-brand-100 bg-brand-50/90 px-3 py-2 text-sm font-semibold text-brand-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white hover:text-brand-900 hover:shadow-[0_12px_30px_rgba(18,95,157,0.12)] motion-reduce:transition-none dark:border-brand-500/30 dark:bg-brand-900/40 dark:text-cyan-100 dark:hover:border-brand-400 dark:hover:bg-slate-900 dark:hover:text-cyan-50"
        >
          <LayoutDashboard size={15} />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      ) : null}

      <ThemeToggle />

      <button
        type="button"
        onClick={() => void logout()}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-cyan-200 dark:hover:shadow-[0_14px_34px_rgba(0,0,0,0.3)]"
      >
        <LogOut size={15} />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </div>
  );
}
