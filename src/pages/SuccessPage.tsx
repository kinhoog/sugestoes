import { Link } from 'react-router-dom';

import { BrandHeader } from '../components/BrandHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function SuccessPage() {
  return (
    <div className="min-h-screen bg-brand-50">
      <BrandHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <PlaceholderPanel
          title="Solicitacao registrada"
          description="Esta tela exibira o protocolo gerado pelo Supabase apos o envio do formulario."
        >
          <Link
            to="/"
            className="inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Enviar outra solicitacao
          </Link>
        </PlaceholderPanel>
      </main>
    </div>
  );
}
