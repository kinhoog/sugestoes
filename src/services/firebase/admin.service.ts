import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentSnapshot,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from '@firebase/firestore';

import type { HistoricoStatus, Solicitacao } from '../../types/solicitacao.types';
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

export function observarSolicitacoesAdminReadOnly(
  onNext: (solicitacoes: SolicitacaoAdmin[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const db = requireFirestore();
  const q = query(
    collection(db, FIRESTORE_COLLECTIONS.solicitacoes),
    where('deleted_at', '==', null),
    orderBy('data_criacao', 'desc'),
  );

  return onSnapshot(q, (snapshot) => onNext(snapshot.docs.map(mapDoc<SolicitacaoAdmin>)), onError);
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
    orderBy('data_alteracao', 'asc'),
  );

  return onSnapshot(q, (snapshot) => onNext(snapshot.docs.map(mapDoc<HistoricoStatus>)), onError);
}
