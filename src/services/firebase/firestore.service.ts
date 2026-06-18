import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from '@firebase/firestore';
import type { User as FirebaseUser } from '@firebase/auth';

import { formatarProtocolo } from '../../lib/protocol';
import type {
  HistoricoStatus,
  NovaSolicitacaoPayload,
  Solicitacao,
  StatusSolicitacao,
} from '../../types/solicitacao.types';
import { isAdminEmail } from '../../lib/admin';
import { requireFirestore } from './client';

export const FIRESTORE_COLLECTIONS = {
  usuarios: 'usuarios',
  solicitacoes: 'solicitacoes',
  historicoStatus: 'historico_status',
  setores: 'setores',
  cargos: 'cargos',
  contadores: 'contadores',
} as const;

interface UsuarioPerfil {
  uid: string;
  email: string;
  nome_completo: string | null;
  perfil: 'admin' | 'colaborador';
  email_verificado: boolean;
}

export async function criarOuAtualizarPerfilUsuario(
  user: FirebaseUser,
  nomeCompleto?: string,
): Promise<void> {
  const db = requireFirestore();
  const email = user.email?.toLowerCase() ?? '';
  const perfil: UsuarioPerfil = {
    uid: user.uid,
    email,
    nome_completo: nomeCompleto?.trim() || user.displayName || null,
    perfil: isAdminEmail(email) ? 'admin' : 'colaborador',
    email_verificado: user.emailVerified,
  };

  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.usuarios, user.uid),
    {
      ...perfil,
      updated_at: serverTimestamp(),
    },
    { merge: true },
  );
}

interface CriarSolicitacaoComProtocoloInput {
  payload: NovaSolicitacaoPayload;
  uid: string;
  email: string;
}

export interface CriarSolicitacaoComProtocoloResult {
  id: string;
  protocolo: string;
}

export async function criarSolicitacaoComProtocolo({
  payload,
  uid,
  email,
}: CriarSolicitacaoComProtocoloInput): Promise<CriarSolicitacaoComProtocoloResult> {
  const db = requireFirestore();
  const ano = new Date().getFullYear();
  const contadorRef = doc(db, FIRESTORE_COLLECTIONS.contadores, `protocolos_${ano}`);
  const solicitacaoRef = doc(collection(db, FIRESTORE_COLLECTIONS.solicitacoes));

  return runTransaction(db, async (transaction) => {
    const contadorSnap = await transaction.get(contadorRef);
    const ultimoNumero = contadorSnap.exists()
      ? Number(contadorSnap.data().ultimo_numero ?? 0)
      : 0;
    const proximoNumero = ultimoNumero + 1;
    const protocolo = formatarProtocolo(ano, proximoNumero);

    transaction.set(
      contadorRef,
      {
        ano,
        ultimo_numero: proximoNumero,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    );

    transaction.set(solicitacaoRef, {
      ...payload,
      email: email.toLowerCase(),
      protocolo,
      status: 'Nova' satisfies StatusSolicitacao,
      created_by: uid,
      created_by_email: email.toLowerCase(),
      data_criacao: serverTimestamp(),
      data_inicio_analise: null,
      data_decisao: null,
      data_fechamento: null,
      parecer_tecnico: null,
      observacao_interna: null,
      deleted_at: null,
      updated_at: serverTimestamp(),
    });

    const historicoRef = doc(collection(db, FIRESTORE_COLLECTIONS.historicoStatus));
    transaction.set(historicoRef, {
      solicitacao_id: solicitacaoRef.id,
      status_anterior: null,
      status_novo: 'Nova' satisfies StatusSolicitacao,
      usuario_id: uid,
      usuario_email: email.toLowerCase(),
      data_alteracao: serverTimestamp(),
    });

    return { id: solicitacaoRef.id, protocolo };
  });
}

function mapDoc<T extends { id: string }>(snapshot: QueryDocumentSnapshot): T {
  return { id: snapshot.id, ...snapshot.data() } as T;
}

export function observarMinhasSolicitacoes(
  uid: string,
  onNext: (solicitacoes: Solicitacao[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const db = requireFirestore();
  const q = query(
    collection(db, FIRESTORE_COLLECTIONS.solicitacoes),
    where('created_by', '==', uid),
    where('deleted_at', '==', null),
    orderBy('data_criacao', 'desc'),
  );

  return onSnapshot(q, (snapshot) => onNext(snapshot.docs.map(mapDoc<Solicitacao>)), onError);
}

export function observarSolicitacoesAdmin(
  onNext: (solicitacoes: Solicitacao[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const db = requireFirestore();
  const q = query(
    collection(db, FIRESTORE_COLLECTIONS.solicitacoes),
    where('deleted_at', '==', null),
    orderBy('data_criacao', 'desc'),
  );

  return onSnapshot(q, (snapshot) => onNext(snapshot.docs.map(mapDoc<Solicitacao>)), onError);
}

export function observarHistoricoSolicitacao(
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

export async function atualizarTriagemSolicitacao(
  solicitacaoId: string,
  patch: {
    status?: StatusSolicitacao;
    parecer_tecnico?: string | null;
    observacao_interna?: string | null;
    data_inicio_analise?: Date | null;
    data_decisao?: Date | null;
    data_fechamento?: Date | null;
  },
): Promise<void> {
  const db = requireFirestore();
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.solicitacoes, solicitacaoId), {
    ...patch,
    updated_at: serverTimestamp(),
  });
}
