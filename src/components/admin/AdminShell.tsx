import { ClipboardList, LayoutDashboard, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Protege"
            className="h-10 w-auto"
          />
          <div>
            <p className="text-sm font-semibold text-brand-700">Comite</p>
            <p className="text-xs text-slate-500">Triagem operacional</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 rounded-md bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ClipboardList size={18} />
            Solicitacoes
          </Link>
        </nav>

        <button
          type="button"
          className="absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <main className="min-h-screen px-4 py-6 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
