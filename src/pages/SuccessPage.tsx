import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Plus } from 'lucide-react';

import { BrandHeader } from '../components/BrandHeader';
import { ROTAS } from '../lib/constants';

interface SuccessLocationState {
  protocolo?: string;
  solicitacaoId?: string;
}

export function SuccessPage() {
  const location = useLocation();
  const state = location.state as SuccessLocationState | null;
  const protocolo = state?.protocolo ?? null;

  return (
    <div className="min-h-screen bg-brand-50">
      <BrandHeader />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-2xl items-center px-4 py-8 sm:px-6">
        <section className="w-full rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-slate-950">Solicitacao registrada</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sua oportunidade de melhoria foi enviada para avaliacao.
          </p>

          {protocolo ? (
            <div className="mx-auto mt-5 max-w-sm rounded-md border border-brand-100 bg-brand-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
                Protocolo
              </p>
              <p className="mt-1 text-2xl font-semibold text-brand-900">{protocolo}</p>
            </div>
          ) : (
            <p className="mt-5 rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Protocolo nao encontrado nesta navegacao. Envie uma nova solicitacao para gerar um
              protocolo.
            </p>
          )}

          <Link
            to={ROTAS.formulario}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            <Plus size={16} />
            Enviar outra solicitacao
          </Link>
        </section>
      </main>
    </div>
  );
}
