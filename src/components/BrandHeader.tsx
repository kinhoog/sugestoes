import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface BrandHeaderProps {
  children?: ReactNode;
  showAdminLink?: boolean;
}

export function BrandHeader({ children, showAdminLink = true }: BrandHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="rounded-2xl bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Protege"
              className="h-9 w-auto"
            />
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-700">Protege</p>
            <p className="text-xs text-slate-500">Oportunidades de Melhoria</p>
          </div>
        </Link>
        {children ??
          (showAdminLink ? (
            <Link
              to="/admin/login"
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] motion-reduce:transition-none"
            >
              Área administrativa
            </Link>
          ) : null)}
      </div>
    </header>
  );
}
