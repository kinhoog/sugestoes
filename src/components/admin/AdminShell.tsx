import { ClipboardList, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { ROTAS } from '../../lib/constants';
import { BrandLogo } from '../BrandLogo';
import { ThemeToggle } from '../ThemeToggle';

interface AdminShellProps {
  children: ReactNode;
}

const navItems = [
  { to: ROTAS.adminDashboard, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: ROTAS.adminSolicitacoes, label: 'Solicitações', icon: <ClipboardList size={18} /> },
] as const;

function navClassName(isActive: boolean): string {
  return `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 motion-reduce:transition-none ${
    isActive
      ? 'bg-brand-700 text-white shadow-[0_16px_34px_rgba(18,95,157,0.24)] dark:bg-brand-600 dark:shadow-[0_16px_38px_rgba(36,151,227,0.2)]'
      : 'text-slate-600 hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-100'
  }`;
}

export function AdminShell({ children }: AdminShellProps) {
  const { email, logout } = useAuth();

  return (
    <div className="portal-admin-shell min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(139,208,255,0.22),transparent_30rem),linear-gradient(135deg,#f8fbff_0%,#eef7ff_46%,#f8fafc_100%)] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,rgba(36,151,227,0.18),transparent_32rem),linear-gradient(135deg,#020617_0%,#07111f_52%,#020617_100%)] dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/70 bg-white/82 px-4 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:block dark:border-slate-800 dark:bg-slate-950/82 dark:shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
        <Link to={ROTAS.adminDashboard} className="flex items-center gap-3 rounded-2xl px-2">
          <span className="shrink-0 rounded-2xl bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 dark:bg-white/95 dark:ring-white/10">
            <BrandLogo className="h-10" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-brand-700 dark:text-cyan-200">eProtege</p>
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Gestão de automações
            </p>
          </div>
        </Link>

        <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/80 p-3 text-brand-900 dark:border-brand-500/20 dark:bg-brand-900/30 dark:text-cyan-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">
            <ShieldCheck size={15} />
            Admin
          </div>
          <p className="mt-2 truncate text-sm font-semibold">{email}</p>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => navClassName(isActive)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 grid gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/80">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tema</span>
            <ThemeToggle className="h-9 w-9" />
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-800 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-cyan-100"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex items-center justify-between gap-3">
          <Link to={ROTAS.adminDashboard} className="flex min-w-0 items-center gap-3">
            <span className="rounded-2xl bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:bg-white/95">
              <BrandLogo className="h-8" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-brand-700 dark:text-cyan-200">eProtege Admin</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{email}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.08)] transition-all duration-200 hover:border-brand-200 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-cyan-100"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <nav className="mt-3 grid grid-cols-2 gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => navClassName(isActive)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-72 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
