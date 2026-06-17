import { AdminShell } from '../components/admin/AdminShell';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

const cards = [
  'Solicitacoes acumuladas',
  'Distribuicao por status',
  'Ranking por setor',
  'SLA de triagem'
];

export function AdminDashboardPage() {
  return (
    <AdminShell>
      <div className="mb-6">
        <p className="text-sm font-medium text-brand-700">Administrativo</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <section key={card} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-600">{card}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-300">--</p>
          </section>
        ))}
      </div>

      <div className="mt-6">
        <PlaceholderPanel
          title="Fila de gestao"
          description="Na fase de dashboard, esta area passara a escutar solicitacoes em tempo real pelo Firestore, com filtros, status e historico de auditoria."
        />
      </div>
    </AdminShell>
  );
}
