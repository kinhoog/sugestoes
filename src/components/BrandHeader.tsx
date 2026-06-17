import { Link } from 'react-router-dom';

export function BrandHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Protege"
            className="h-10 w-auto"
          />
          <div>
            <p className="text-sm font-semibold text-brand-700">Protege</p>
            <p className="text-xs text-slate-500">Oportunidades de Melhoria</p>
          </div>
        </Link>
        <Link
          to="/admin/login"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
        >
          Area administrativa
        </Link>
      </div>
    </header>
  );
}
