import { BrandHeader } from '../components/BrandHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function PublicFormPage() {
  return (
    <div className="min-h-screen bg-brand-50">
      <BrandHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <PlaceholderPanel
          title="Registrar oportunidade de melhoria"
          description="Nesta primeira fase, a aplicacao ja esta organizada em React, Vite e rotas. O formulario real entra na proxima fase, conectado as validacoes, prioridade e Supabase."
        >
          <div className="grid gap-4 rounded-md border border-dashed border-brand-200 bg-brand-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <p className="font-medium text-slate-900">Fluxo publico</p>
              <p className="mt-1">Sem login para colaboradores.</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Validacoes</p>
              <p className="mt-1">Campos obrigatorios e dominio @protege.med.br.</p>
            </div>
          </div>
        </PlaceholderPanel>
      </main>
    </div>
  );
}
