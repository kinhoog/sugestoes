import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Gauge,
  Save,
  UserCheck,
  UserRound,
} from 'lucide-react';

import { PrioridadeBadge, StatusBadge } from '../components/admin/AdminBadges';
import { AdminShell } from '../components/admin/AdminShell';
import { Alert } from '../components/ui/Alert';
import {
  useAdminHistoricoSolicitacao,
  useAdminSolicitacao,
} from '../hooks/useAdminSolicitacoes';
import { useAuth } from '../hooks/useAuth';
import {
  booleanoAdmin,
  formatarDataHoraAdmin,
  getCargoNomeAdmin,
  getSetorNomeAdmin,
  valorTextoAdmin,
} from '../lib/admin';
import { ROTAS, STATUS_SOLICITACAO } from '../lib/constants';
import {
  assumirSolicitacaoAdmin,
  atualizarObservacaoInternaAdmin,
  atualizarStatusSolicitacaoAdmin,
  type SolicitacaoAdmin,
} from '../services/firebase/admin.service';
import type { HistoricoStatus, StatusSolicitacao } from '../types/solicitacao.types';

function isHttpReference(value: string | null | undefined): boolean {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function getHistoricoEventoLabel(item: HistoricoStatus): string {
  if (item.tipo_evento === 'criacao') {
    return 'Criação da solicitação';
  }

  if (item.tipo_evento === 'alteracao_status') {
    return 'Alteração de status';
  }

  if (item.tipo_evento === 'atribuicao_responsavel') {
    return 'Atribuição de responsável';
  }

  if (item.tipo_evento === 'observacao_interna') {
    return 'Observação interna';
  }

  return item.status_anterior ? 'Alteração de status' : 'Criação da solicitação';
}

export function AdminSolicitacaoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { user, email } = useAuth();
  const { solicitacao, loading, error } = useAdminSolicitacao(id);
  const {
    historico,
    loading: historicoLoading,
    error: historicoError,
  } = useAdminHistoricoSolicitacao(id);
  const [novoStatus, setNovoStatus] = useState<StatusSolicitacao>('Nova');
  const [observacaoStatus, setObservacaoStatus] = useState('');
  const [observacaoInterna, setObservacaoInterna] = useState('');
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!solicitacao) {
      return;
    }

    setNovoStatus(solicitacao.status);
    setObservacaoInterna(solicitacao.observacao_interna ?? '');
    setObservacaoStatus('');
  }, [solicitacao]);

  const adminUsuario = useMemo(() => {
    if (!user || !email) {
      return null;
    }

    return {
      uid: user.uid,
      email,
      nome: user.displayName,
    };
  }, [email, user]);

  const observacaoInternaAlterada =
    observacaoInterna.trim() !== (solicitacao?.observacao_interna?.trim() ?? '');

  function getActionErrorMessage(actionErrorValue: unknown): string {
    if (actionErrorValue instanceof Error) {
      return actionErrorValue.message;
    }

    return 'Não foi possível concluir a ação administrativa.';
  }

  async function runAdminAction(
    actionName: string,
    action: () => Promise<void>,
    success: string,
  ): Promise<boolean> {
    setSavingAction(actionName);
    setActionError(null);
    setActionSuccess(null);

    try {
      await action();
      setActionSuccess(success);
      return true;
    } catch (actionErrorValue) {
      setActionError(getActionErrorMessage(actionErrorValue));
      return false;
    } finally {
      setSavingAction(null);
    }
  }

  async function handleAtualizarStatus() {
    if (!solicitacao || !adminUsuario || novoStatus === solicitacao.status) {
      return;
    }

    const success = await runAdminAction(
      'status',
      () =>
        atualizarStatusSolicitacaoAdmin({
          solicitacao,
          novoStatus,
          observacao: observacaoStatus,
          admin: adminUsuario,
      }),
      'Status atualizado e histórico registrado.',
    );

    if (success) {
      setObservacaoStatus('');
    }
  }

  async function handleAssumirDemanda() {
    if (!solicitacao || !adminUsuario) {
      return;
    }

    await runAdminAction(
      'responsavel',
      () => assumirSolicitacaoAdmin({ solicitacao, admin: adminUsuario }),
      'Responsável administrativo atualizado.',
    );
  }

  async function handleSalvarObservacaoInterna() {
    if (!solicitacao || !adminUsuario || !observacaoInternaAlterada) {
      return;
    }

    await runAdminAction(
      'observacao',
      () =>
        atualizarObservacaoInternaAdmin({
          solicitacao,
          observacaoInterna,
          admin: adminUsuario,
        }),
      'Observação interna salva.',
    );
  }

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
        {actionError ? <Alert tone="error" className="mb-4">{actionError}</Alert> : null}
        {actionSuccess ? <Alert tone="success" className="mb-4">{actionSuccess}</Alert> : null}

        {loading ? (
          <EmptyDetail text="Carregando detalhe da solicitação..." />
        ) : error ? null : !solicitacao ? (
          <EmptyDetail text="Solicitação não encontrada ou sem permissão de acesso." />
        ) : (
          <>
            <section className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_22px_64px_rgba(0,0,0,0.36)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-cyan-200">
                    Detalhe da solicitação
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold text-slate-950 dark:text-white">
                      {solicitacao.protocolo ?? 'Sem protocolo'}
                    </h1>
                    <StatusBadge status={solicitacao.status} />
                    <PrioridadeBadge prioridade={solicitacao.prioridade_calculada} />
                    <span className="inline-flex rounded-full bg-slate-950 px-2.5 py-0.5 text-xs font-bold text-white ring-1 ring-slate-900 dark:bg-white dark:text-slate-950 dark:ring-white">
                      Score {solicitacao.score ?? '—'}
                    </span>
                  </div>
                  <p className="mt-1.5 max-w-4xl text-sm leading-5 text-slate-600 dark:text-slate-300">
                    {valorTextoAdmin(solicitacao.processo_alvo)}
                  </p>
                </div>

                <div className="grid gap-1.5 text-xs text-slate-500 lg:min-w-52 lg:text-right dark:text-slate-400">
                  <span>Criada em {formatarDataHoraAdmin(solicitacao.data_criacao)}</span>
                  <span>
                    Atualizada em{' '}
                    {formatarDataHoraAdmin(solicitacao.updated_at ?? solicitacao.data_criacao)}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
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

            <div className="mt-4">
              <AdminManagementPanel
                solicitacao={solicitacao}
                novoStatus={novoStatus}
                observacaoStatus={observacaoStatus}
                observacaoInterna={observacaoInterna}
                observacaoInternaAlterada={observacaoInternaAlterada}
                savingAction={savingAction}
                onStatusChange={setNovoStatus}
                onObservacaoStatusChange={setObservacaoStatus}
                onObservacaoInternaChange={setObservacaoInterna}
                onAtualizarStatus={() => void handleAtualizarStatus()}
                onAssumirDemanda={() => void handleAssumirDemanda()}
                onSalvarObservacaoInterna={() => void handleSalvarObservacaoInterna()}
              />
            </div>

            <div className="mt-4 grid gap-3.5 xl:grid-cols-2">
              <div className="grid content-start gap-3.5">
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

              <div className="grid content-start gap-3.5">
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

              </div>
            </div>

            <div className="mt-3.5">
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
                  <div className="grid gap-2 md:grid-cols-2">
                    {historico.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-white/76 p-2.5 dark:border-slate-800 dark:bg-slate-900/62"
                      >
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-brand-700 dark:text-cyan-200">
                          {getHistoricoEventoLabel(item)}
                        </p>
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
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          {formatarDataHoraAdmin(item.data_alteracao)} ·{' '}
                          {valorTextoAdmin(item.usuario_email)}
                        </p>
                        {item.observacao ? (
                          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-5 text-slate-600 dark:text-slate-300">
                            {item.observacao}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </InfoPanel>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function AdminManagementPanel({
  solicitacao,
  novoStatus,
  observacaoStatus,
  observacaoInterna,
  observacaoInternaAlterada,
  savingAction,
  onStatusChange,
  onObservacaoStatusChange,
  onObservacaoInternaChange,
  onAtualizarStatus,
  onAssumirDemanda,
  onSalvarObservacaoInterna,
}: {
  solicitacao: SolicitacaoAdmin;
  novoStatus: StatusSolicitacao;
  observacaoStatus: string;
  observacaoInterna: string;
  observacaoInternaAlterada: boolean;
  savingAction: string | null;
  onStatusChange: (status: StatusSolicitacao) => void;
  onObservacaoStatusChange: (value: string) => void;
  onObservacaoInternaChange: (value: string) => void;
  onAtualizarStatus: () => void;
  onAssumirDemanda: () => void;
  onSalvarObservacaoInterna: () => void;
}) {
  const isSavingStatus = savingAction === 'status';
  const isSavingResponsavel = savingAction === 'responsavel';
  const isSavingObservacao = savingAction === 'observacao';
  const responsavel = solicitacao.responsavel_admin_email
    ? valorTextoAdmin(solicitacao.responsavel_admin_nome ?? solicitacao.responsavel_admin_email)
    : 'Não atribuído';

  return (
    <section className="rounded-2xl border border-brand-100 bg-white/90 p-3.5 shadow-[0_18px_46px_rgba(15,23,42,0.08)] backdrop-blur dark:border-brand-500/20 dark:bg-slate-950/88 dark:shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-cyan-200">
            Gestão da demanda
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950 dark:text-white">
            Controle administrativo
          </h2>
        </div>
        <StatusBadge status={solicitacao.status} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.05fr)_minmax(220px,0.75fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.05fr)_minmax(220px,0.75fr)_minmax(0,1fr)_minmax(260px,0.85fr)]">
        <div>
          <label
            htmlFor="novo-status"
            className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500"
          >
            Alterar status
          </label>
          <select
            id="novo-status"
            value={novoStatus}
            onChange={(event) => onStatusChange(event.target.value as StatusSolicitacao)}
            className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-900/50"
          >
            {STATUS_SOLICITACAO.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <textarea
            value={observacaoStatus}
            onChange={(event) => onObservacaoStatusChange(event.target.value)}
            rows={2}
            className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm leading-5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-900/50"
            placeholder="Observação opcional sobre a alteração de status"
          />
          <button
            type="button"
            onClick={onAtualizarStatus}
            disabled={novoStatus === solicitacao.status || Boolean(savingAction)}
            className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(18,95,157,0.22)] transition hover:-translate-y-0.5 hover:bg-brand-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            <CheckCircle2 size={16} />
            {isSavingStatus ? 'Atualizando...' : 'Atualizar status'}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/72 p-3 dark:border-slate-800 dark:bg-slate-900/58">
          <InfoRow label="Responsável atual" value={responsavel} detail={solicitacao.responsavel_admin_email} />
          <button
            type="button"
            onClick={onAssumirDemanda}
            disabled={Boolean(savingAction)}
            className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-brand-100 bg-white px-3 py-1.5 text-sm font-semibold text-brand-800 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-100 dark:hover:border-brand-500 dark:hover:bg-slate-800"
          >
            <UserCheck size={16} />
            {isSavingResponsavel ? 'Assumindo...' : 'Assumir demanda'}
          </button>
        </div>

        <div>
          <label
            htmlFor="observacao-interna"
            className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500"
          >
            Observação interna
          </label>
          <textarea
            id="observacao-interna"
            value={observacaoInterna}
            onChange={(event) => onObservacaoInternaChange(event.target.value)}
            rows={2}
            className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm leading-5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-900/50"
            placeholder="Registre contexto interno da equipe administrativa"
          />
          <button
            type="button"
            onClick={onSalvarObservacaoInterna}
            disabled={!observacaoInternaAlterada || Boolean(savingAction)}
            className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-brand-100 bg-white px-3 py-1.5 text-sm font-semibold text-brand-800 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-100 dark:hover:border-brand-500 dark:hover:bg-slate-800"
          >
            <Save size={16} />
            {isSavingObservacao ? 'Salvando...' : 'Salvar observação interna'}
          </button>
        </div>

        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white/72 p-3 sm:grid-cols-2 lg:col-span-2 xl:col-span-3 2xl:col-span-1 dark:border-slate-800 dark:bg-slate-900/58">
          <InfoRow
            label="Início da análise"
            value={formatarDataHoraAdmin(solicitacao.data_inicio_analise)}
          />
          <InfoRow label="Decisão" value={formatarDataHoraAdmin(solicitacao.data_decisao)} />
          <InfoRow
            label="Fechamento"
            value={formatarDataHoraAdmin(solicitacao.data_fechamento)}
          />
          <InfoRow
            label="Última atualização"
            value={formatarDataHoraAdmin(solicitacao.updated_at ?? solicitacao.data_criacao)}
            detail={solicitacao.updated_by_email ?? 'Sem registro de atualização administrativa'}
          />
        </div>
      </div>
    </section>
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
    <div className="rounded-xl border border-slate-200 bg-white/78 p-3 dark:border-slate-800 dark:bg-slate-900/62">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-cyan-200">
        {icon}
      </div>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/80 bg-white/88 p-3.5 shadow-[0_16px_42px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_20px_56px_rgba(0,0,0,0.34)]">
      <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/80 bg-white/88 p-3.5 shadow-[0_16px_42px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:shadow-[0_20px_56px_rgba(0,0,0,0.34)]">
      <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-2.5 grid gap-2.5">{children}</div>
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
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      {detail ? (
        <p className="mt-0.5 whitespace-pre-wrap text-xs leading-5 text-slate-500 dark:text-slate-400">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

function EmptyDetail({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/88 px-5 py-8 text-center text-sm text-slate-500 shadow-[0_16px_42px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/86 dark:text-slate-400">
      {text}
    </div>
  );
}
