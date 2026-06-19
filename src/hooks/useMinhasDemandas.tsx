import { useEffect, useState } from 'react';

import { dataAdminParaDate } from '../lib/admin';
import {
  observarMinhaSolicitacaoPublica,
  observarMinhasSolicitacoesPublicas,
} from '../services/firebase/firestore.service';
import type { SolicitacaoPublica } from '../types/solicitacao.types';

interface MinhasDemandasState {
  demandas: SolicitacaoPublica[];
  loading: boolean;
  error: string | null;
}

interface MinhaDemandaState {
  demanda: SolicitacaoPublica | null;
  loading: boolean;
  error: string | null;
}

const initialListState: MinhasDemandasState = {
  demandas: [],
  loading: true,
  error: null,
};

const initialDetailState: MinhaDemandaState = {
  demanda: null,
  loading: true,
  error: null,
};

function sortByRecent(a: SolicitacaoPublica, b: SolicitacaoPublica): number {
  const dateA = dataAdminParaDate(a.created_at)?.getTime() ?? 0;
  const dateB = dataAdminParaDate(b.created_at)?.getTime() ?? 0;
  return dateB - dateA;
}

function getFirestoreReadErrorMessage(): string {
  return 'Não foi possível carregar suas demandas. Verifique sua sessão e tente novamente.';
}

export function useMinhasDemandas(uid: string | null | undefined): MinhasDemandasState {
  const [state, setState] = useState<MinhasDemandasState>(initialListState);

  useEffect(() => {
    if (!uid) {
      setState({ demandas: [], loading: false, error: null });
      return undefined;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    const unsubscribe = observarMinhasSolicitacoesPublicas(
      uid,
      (demandas) =>
        setState({
          demandas: demandas.slice().sort(sortByRecent),
          loading: false,
          error: null,
        }),
      () =>
        setState({
          demandas: [],
          loading: false,
          error: getFirestoreReadErrorMessage(),
        }),
    );

    return unsubscribe;
  }, [uid]);

  return state;
}

export function useMinhaDemanda(
  solicitacaoId: string | undefined,
  uid: string | null | undefined,
): MinhaDemandaState {
  const [state, setState] = useState<MinhaDemandaState>(initialDetailState);

  useEffect(() => {
    if (!solicitacaoId || !uid) {
      setState({ demanda: null, loading: false, error: null });
      return undefined;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    const unsubscribe = observarMinhaSolicitacaoPublica(
      solicitacaoId,
      (demanda) => setState({ demanda, loading: false, error: null }),
      () =>
        setState({
          demanda: null,
          loading: false,
          error: getFirestoreReadErrorMessage(),
        }),
    );

    return unsubscribe;
  }, [solicitacaoId, uid]);

  return state;
}
