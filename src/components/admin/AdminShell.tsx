import { ClipboardList, ExternalLink, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
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
  { to: ROTAS.adminDashboard, label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: ROTAS.adminSolicitacoes, label: 'Solicitações', icon: <ClipboardList size={16} /> },
] as const;

function navClassName(isActive: boolean): string {
  return `inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-semibold transition-all duration-200 motion-reduce:transition-none ${
    isActive
      ? 'bg-brand-700 text-white shadow-[0_14px_30px_rgba(18,95,157,0.24)] dark:bg-brand-600 dark:shadow-[0_14px_34px_rgba(36,151,227,0.2)]'
      : 'border border-transparent text-slate-600 hover:-translate-y-0.5 hover:border-brand-100 hover:bg-brand-50 hover:text-brand-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-cyan-100'
  }`;
}

export function AdminShell({ children }: AdminShellProps) {
  const { email, logout } = useAuth();

  return (
    <div className="portal-admin-shell min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(139,208,255,0.22),transparent_30rem),linear-gradient(135deg,#f8fbff_0%,#eef7ff_46%,#f8fafc_100%)] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,rgba(36,151,227,0.18),transparent_32rem),linear-gradient(135deg,#020617_0%,#07111f_52%,#020617_100%)] dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/88 shadow-[0_16px_46px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/88 dark:shadow-[0_18px_52px_rgba(0,0,0,0.34)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Link to={ROTAS.adminDashboard} className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 rounded-lg bg-white p-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 dark:bg-white/95 dark:ring-white/10">
                  <BrandLogo className="h-7" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-brand-700 dark:text-cyan-200">eProtege</p>
                    <span className="hidden rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700 ring-1 ring-brand-100 sm:inline-flex dark:bg-brand-900/40 dark:text-cyan-200 dark:ring-brand-500/20">
                      Admin
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    Gestão de automações
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2 lg:hidden">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all duration-200 hover:border-brand-200 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-cyan-100"
                  aria-label="Sair"
                  title="Sair"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:justify-center">
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

            <div className="hidden items-center justify-end gap-2 lg:flex">
              <Link
                to={ROTAS.formulario}
                className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-[13px] font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-800 hover:shadow-[0_12px_28px_rgba(15,23,42,0.1)] dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-cyan-100"
              >
                <ExternalLink size={15} />
                Portal público
              </Link>
              <span className="inline-flex min-h-8 max-w-[230px] items-center gap-1.5 truncate rounded-lg border border-brand-100 bg-white/78 px-2.5 py-1 text-[13px] font-semibold text-brand-900 shadow-[0_8px_20px_rgba(15,23,42,0.05)] dark:border-cyan-400/20 dark:bg-slate-900/76 dark:text-cyan-100 dark:shadow-none">
                <ShieldCheck size={15} className="shrink-0" />
                <span className="truncate">{email}</span>
              </span>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-[13px] font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-800 hover:shadow-[0_12px_28px_rgba(15,23,42,0.1)] dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-cyan-100"
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 lg:hidden">
            <Link
              to={ROTAS.formulario}
              className="inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-[13px] font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
            >
              <ExternalLink size={15} />
              Portal público
            </Link>
            <span className="hidden min-h-8 max-w-[48%] items-center gap-1.5 truncate rounded-lg border border-brand-100 bg-white/78 px-2.5 py-1 text-[13px] font-semibold text-brand-900 sm:inline-flex dark:border-cyan-400/20 dark:bg-slate-900/76 dark:text-cyan-100">
              <ShieldCheck size={15} className="shrink-0" />
              <span className="truncate">{email}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
