import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, ExternalLink, FileText, Gauge, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';

import { PrioridadeBadge, StatusBadge } from '../components/admin/AdminBadges';
import { AdminShell } from '../components/admin/AdminShell';
import { Alert } from '../components/ui/Alert';
import {
  useAdminHistoricoSolicitacao,
  useAdminSolicitacao,
} from '../hooks/useAdminSolicitacoes';
import {
  booleanoAdmin,
  formatarDataHoraAdmin,
  getCargoNomeAdmin,
  getSetorNomeAdmin,
  valorTextoAdmin,
} from '../lib/admin';
import { ROTAS } from '../lib/constants';

function isHttpReference(value: string | null | undefined): boolean {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export function AdminSolicitacaoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { solicitacao, loading, error } = useAdminSolicitacao(id);
  const {
    historico,
    loading: historicoLoading,
    error: historicoError,
  } = useAdminHistoricoSolicitacao(id);

  return (
    <AdminShell>
      <div className="page-enter">
        <Link
          to={ROTAS.adminSolicitacoes}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-800 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-cyan-100"
        >
          <ArrowLeft size={16} />
          Voltar para solicitações
        </Link>

        {error ? <Alert tone="error">{error}</Alert> : null}

        {loading ? (
          <EmptyDetail text="Carregando detalhe da solicitação..." />
        ) : error ? null : !solicitacao ? (
          <EmptyDetail text="Solicitação não encontrada ou sem permissão de acesso." />
        ) : (
          <>
            <section className="overflow-hidden rounded-[1.45rem] border border-white/80 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_28px_82px_rgba(0,0,0,0.38)]">
              <div className="border-b border-slate-100 bg-gradient-to-br from-brand-50/90 to-white px-5 py-5 dark:border-slate-800 dark:from-brand-950/42 dark:to-slate-950 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-cyan-200">
                      Detalhe da solicitação
                    </p>
                    <h1 className="mt-1.5 text-2xl font-semibold text-slate-950 dark:text-white">
                      {solicitacao.protocolo ?? 'Sem protocolo'}
                    </h1>
                    <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {valorTextoAdmin(solicitacao.processo_alvo)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={solicitacao.status} />
                    <PrioridadeBadge prioridade={solicitacao.prioridade_calculada} />
                    <span className="inline-flex rounded-full bg-slate-950 px-2.5 py-1 text-xs font-bold text-white ring-1 ring-slate-900 dark:bg-white dark:text-slate-950 dark:ring-white">
                      Score {solicitacao.score ?? '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3.5 p-5 sm:p-6 lg:grid-cols-4">
                <SummaryCard
                  icon={<UserRound size={19} />}
                  label="Solicitante"
                  value={valorTextoAdmin(solicitacao.nome_completo)}
                  detail={valorTextoAdmin(solicitacao.email)}
                />
                <SummaryCard
                  icon={<FileText size={19} />}
                  label="Setor e cargo"
                  value={getSetorNomeAdmin(solicitacao.setor_id)}
                  detail={getCargoNomeAdmin(solicitacao.cargo_id, solicitacao.setor_id)}
                />
                <SummaryCard
                  icon={<Gauge size={19} />}
                  label="Prioridade"
                  value={solicitacao.prioridade_calculada ?? 'Não informada'}
                  detail={`Score ${solicitacao.score ?? '—'}`}
                />
                <SummaryCard
                  icon={<Clock3 size={19} />}
                  label="Criada em"
                  value={formatarDataHoraAdmin(solicitacao.data_criacao)}
                  detail={`Atualizada em ${formatarDataHoraAdmin(solicitacao.updated_at)}`}
                />
              </div>
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.78fr]">
              <div className="grid gap-5">
                <DetailSection title="Processo ou atividade alvo">
                  {valorTextoAdmin(solicitacao.processo_alvo)}
                </DetailSection>
                <DetailSection title="Funcionamento atual">
                  {valorTextoAdmin(solicitacao.funcionamento_atual)}
                </DetailSection>
                <DetailSection title="Resultado esperado">
                  {valorTextoAdmin(solicitacao.resultado_ideal)}
                </DetailSection>
                <DetailSection title="Referência de evidência">
                  {solicitacao.referencia_evidencia ? (
                    isHttpReference(solicitacao.referencia_evidencia) ? (
                      <a
                        href={solicitacao.referencia_evidencia}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:text-brand-900 dark:text-cyan-200 dark:hover:text-cyan-100"
                      >
                        {solicitacao.referencia_evidencia}
                        <ExternalLink size={15} />
                      </a>
                    ) : (
                      solicitacao.referencia_evidencia
                    )
                  ) : (
                    'Não informado'
                  )}
                </DetailSection>
              </div>

              <div className="grid content-start gap-5">
                <InfoPanel title="Impacto informado">
                  <InfoRow label="Frequência" value={valorTextoAdmin(solicitacao.frequencia)} />
                  <InfoRow
                    label="Impacto operacional"
                    value={valorTextoAdmin(solicitacao.impacto_operacional)}
                  />
                  <InfoRow
                    label="Pessoas impactadas"
                    value={valorTextoAdmin(solicitacao.pessoas_impactadas)}
                  />
                  <InfoRow
                    label="Tempo perdido"
                    value={valorTextoAdmin(solicitacao.tempo_perdido)}
                  />
                  <InfoRow label="Urgência percebida" value={valorTextoAdmin(solicitacao.urgencia)} />
                </InfoPanel>

                <InfoPanel title="Sinais de retrabalho">
                  <InfoRow
                    label="Depende de planilha"
                    value={booleanoAdmin(solicitacao.usa_planilha)}
                    detail={solicitacao.descricao_planilha}
                  />
                  <InfoRow
                    label="Depende de e-mail"
                    value={booleanoAdmin(solicitacao.usa_email)}
                    detail={solicitacao.descricao_email}
                  />
                  <InfoRow
                    label="Atividade repetitiva"
                    value={booleanoAdmin(solicitacao.atividade_repetitiva)}
                    detail={solicitacao.descricao_atividade_repetitiva}
                  />
                  <InfoRow
                    label="Dependência de pessoa"
                    value={booleanoAdmin(solicitacao.dependencia_pessoa)}
                    detail={solicitacao.descricao_dependencia_pessoa}
                  />
                </InfoPanel>

                <InfoPanel title="Histórico">
                  {historicoError ? (
                    <Alert tone="error">{historicoError}</Alert>
                  ) : historicoLoading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Carregando histórico...
                    </p>
                  ) : historico.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Nenhum histórico registrado.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {historico.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200 bg-white/76 p-3 dark:border-slate-800 dark:bg-slate-900/62"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {item.status_anterior ? (
                              <StatusBadge status={item.status_anterior} />
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                                Inicial
                              </span>
                            )}
                            <span className="text-xs text-slate-400">→</span>
                            <StatusBadge status={item.status_novo} />
                          </div>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            {formatarDataHoraAdmin(item.data_alteracao)} ·{' '}
                            {valorTextoAdmin(item.usuario_email)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </InfoPanel>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/78 p-3.5 dark:border-slate-800 dark:bg-slate-900/62">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-cyan-200">
        {icon}
      </div>
      <p className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.25rem] border border-white/80 bg-white/88 p-4 shadow-[0_20px_56px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
      <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-2.5 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.25rem] border border-white/80 bg-white/88 p-4 shadow-[0_20px_56px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
      <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-3 grid gap-3.5">{children}</div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string | null;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      {detail ? (
        <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-500 dark:text-slate-400">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

function EmptyDetail({ text }: { text: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/80 bg-white/88 px-5 py-10 text-center text-sm text-slate-500 shadow-[0_20px_56px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:text-slate-400">
      {text}
    </div>
  );
}
