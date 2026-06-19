import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type DocumentSnapshot,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from '@firebase/firestore';

import type {
  HistoricoStatus,
  HistoricoTipoEvento,
  Solicitacao,
  StatusSolicitacao,
} from '../../types/solicitacao.types';
import { FIRESTORE_COLLECTIONS } from './firestore.service';
import { requireFirestore } from './client';

export type SolicitacaoAdmin = Solicitacao;

function mapDoc<T extends { id: string }>(snapshot: QueryDocumentSnapshot): T {
  return { id: snapshot.id, ...snapshot.data() } as T;
}

function mapDocument<T extends { id: string }>(snapshot: DocumentSnapshot): T | null {
  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as T;
}

function isSolicitacaoAtiva(solicitacao: SolicitacaoAdmin): boolean {
  return solicitacao.deleted_at == null;
}

interface AdminUsuarioInput {
  uid: string;
  email: string;
  nome?: string | null;
}

interface HistoricoEventoInput {
  solicitacao: SolicitacaoAdmin;
  tipo: HistoricoTipoEvento;
  admin: AdminUsuarioInput;
  statusAnterior: StatusSolicitacao | null;
  statusNovo: StatusSolicitacao;
  observacao?: string | null;
}

interface AtualizarStatusInput {
  solicitacao: SolicitacaoAdmin;
  novoStatus: StatusSolicitacao;
  observacao?: string | null;
  admin: AdminUsuarioInput;
}

interface AssumirSolicitacaoInput {
  solicitacao: SolicitacaoAdmin;
  admin: AdminUsuarioInput;
}

interface AtualizarObservacaoInternaInput {
  solicitacao: SolicitacaoAdmin;
  observacaoInterna: string;
  admin: AdminUsuarioInput;
}

function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed || null;
}

function isEmptyDate(value: unknown): boolean {
  return value == null;
}

function buildHistoricoEvento({
  solicitacao,
  tipo,
  admin,
  statusAnterior,
  statusNovo,
  observacao,
}: HistoricoEventoInput) {
  return {
    solicitacao_id: solicitacao.id,
    protocolo: solicitacao.protocolo ?? null,
    tipo_evento: tipo,
    status_anterior: statusAnterior,
    status_novo: statusNovo,
    observacao: trimOrNull(observacao),
    usuario_id: admin.uid,
    usuario_email: admin.email.toLowerCase(),
    data_alteracao: serverTimestamp(),
  };
}

export function observarSolicitacoesAdminReadOnly(
  onNext: (solicitacoes: SolicitacaoAdmin[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const db = requireFirestore();
  const solicitacoesRef = collection(db, FIRESTORE_COLLECTIONS.solicitacoes);

  return onSnapshot(
    solicitacoesRef,
    (snapshot) => onNext(snapshot.docs.map(mapDoc<SolicitacaoAdmin>).filter(isSolicitacaoAtiva)),
    onError,
  );
}

export function observarSolicitacaoAdminReadOnly(
  solicitacaoId: string,
  onNext: (solicitacao: SolicitacaoAdmin | null) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const db = requireFirestore();
  const solicitacaoRef = doc(db, FIRESTORE_COLLECTIONS.solicitacoes, solicitacaoId);

  return onSnapshot(
    solicitacaoRef,
    (snapshot) => onNext(mapDocument<SolicitacaoAdmin>(snapshot)),
    onError,
  );
}

export function observarHistoricoSolicitacaoAdminReadOnly(
  solicitacaoId: string,
  onNext: (historico: HistoricoStatus[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const db = requireFirestore();
  const q = query(
    collection(db, FIRESTORE_COLLECTIONS.historicoStatus),
    where('solicitacao_id', '==', solicitacaoId),
  );

  return onSnapshot(q, (snapshot) => onNext(snapshot.docs.map(mapDoc<HistoricoStatus>)), onError);
}

export async function atualizarStatusSolicitacaoAdmin({
  solicitacao,
  novoStatus,
  observacao,
  admin,
}: AtualizarStatusInput): Promise<void> {
  if (novoStatus === solicitacao.status) {
    return;
  }

  const db = requireFirestore();
  const batch = writeBatch(db);
  const solicitacaoRef = doc(db, FIRESTORE_COLLECTIONS.solicitacoes, solicitacao.id);
  const historicoRef = doc(collection(db, FIRESTORE_COLLECTIONS.historicoStatus));
  const updatePayload: Record<string, unknown> = {
    status: novoStatus,
    updated_at: serverTimestamp(),
    updated_by: admin.uid,
    updated_by_email: admin.email.toLowerCase(),
  };

  if (novoStatus === 'Em Análise' && isEmptyDate(solicitacao.data_inicio_analise)) {
    updatePayload.data_inicio_analise = serverTimestamp();
  }

  if (
    (novoStatus === 'Aprovada' || novoStatus === 'Rejeitada') &&
    isEmptyDate(solicitacao.data_decisao)
  ) {
    updatePayload.data_decisao = serverTimestamp();
  }

  if (novoStatus === 'Concluída' && isEmptyDate(solicitacao.data_fechamento)) {
    updatePayload.data_fechamento = serverTimestamp();
  }

  batch.update(solicitacaoRef, updatePayload);
  batch.set(
    historicoRef,
    buildHistoricoEvento({
      solicitacao,
      tipo: 'alteracao_status',
      admin,
      statusAnterior: solicitacao.status,
      statusNovo: novoStatus,
      observacao,
    }),
  );

  await batch.commit();
}

export async function assumirSolicitacaoAdmin({
  solicitacao,
  admin,
}: AssumirSolicitacaoInput): Promise<void> {
  const adminEmail = admin.email.toLowerCase();
  const responsavelAtualEmail = solicitacao.responsavel_admin_email?.toLowerCase() ?? null;

  if (responsavelAtualEmail === adminEmail) {
    return;
  }

  const db = requireFirestore();
  const batch = writeBatch(db);
  const solicitacaoRef = doc(db, FIRESTORE_COLLECTIONS.solicitacoes, solicitacao.id);
  const historicoRef = doc(collection(db, FIRESTORE_COLLECTIONS.historicoStatus));
  const responsavelNome = trimOrNull(admin.nome) ?? adminEmail;
  const responsavelAnterior =
    trimOrNull(solicitacao.responsavel_admin_nome) ?? responsavelAtualEmail ?? null;
  const observacaoHistorico = responsavelAnterior
    ? `Responsável alterado de ${responsavelAnterior} para ${responsavelNome}.`
    : `Responsável definido como ${responsavelNome}.`;

  batch.update(solicitacaoRef, {
    responsavel_admin_id: admin.uid,
    responsavel_admin_email: adminEmail,
    responsavel_admin_nome: responsavelNome,
    updated_at: serverTimestamp(),
    updated_by: admin.uid,
    updated_by_email: adminEmail,
  });
  batch.set(
    historicoRef,
    buildHistoricoEvento({
      solicitacao,
      tipo: 'atribuicao_responsavel',
      admin,
      statusAnterior: solicitacao.status,
      statusNovo: solicitacao.status,
      observacao: observacaoHistorico,
    }),
  );

  await batch.commit();
}

export async function atualizarObservacaoInternaAdmin({
  solicitacao,
  observacaoInterna,
  admin,
}: AtualizarObservacaoInternaInput): Promise<void> {
  const observacaoNormalizada = trimOrNull(observacaoInterna);
  const observacaoAtual = trimOrNull(solicitacao.observacao_interna);

  if (observacaoNormalizada === observacaoAtual) {
    return;
  }

  const db = requireFirestore();
  const batch = writeBatch(db);
  const solicitacaoRef = doc(db, FIRESTORE_COLLECTIONS.solicitacoes, solicitacao.id);
  const historicoRef = doc(collection(db, FIRESTORE_COLLECTIONS.historicoStatus));

  batch.update(solicitacaoRef, {
    observacao_interna: observacaoNormalizada,
    updated_at: serverTimestamp(),
    updated_by: admin.uid,
    updated_by_email: admin.email.toLowerCase(),
  });
  batch.set(
    historicoRef,
    buildHistoricoEvento({
      solicitacao,
      tipo: 'observacao_interna',
      admin,
      statusAnterior: solicitacao.status,
      statusNovo: solicitacao.status,
      observacao: observacaoNormalizada ?? 'Observação interna removida.',
    }),
  );

  await batch.commit();
}
