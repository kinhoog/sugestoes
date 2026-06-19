import { useEffect, useState } from 'react';

import {
  observarHistoricoSolicitacaoAdminReadOnly,
  observarSolicitacaoAdminReadOnly,
  observarSolicitacoesAdminReadOnly,
  type SolicitacaoAdmin,
} from '../services/firebase/admin.service';
import { dataAdminParaDate } from '../lib/admin';
import type { HistoricoStatus } from '../types/solicitacao.types';

interface AdminSolicitacoesState {
  solicitacoes: SolicitacaoAdmin[];
  loading: boolean;
  error: string | null;
}

interface AdminSolicitacaoState {
  solicitacao: SolicitacaoAdmin | null;
  loading: boolean;
  error: string | null;
}

interface AdminHistoricoState {
  historico: HistoricoStatus[];
  loading: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown): string {
  const detail = error instanceof Error ? error.message : null;
  const message = 'Não foi possível carregar as solicitações. Verifique permissões ou conexão com o Firestore.';

  if (detail) {
    return `${message} Detalhe: ${detail}`;
  }

  return message;
}

function ordenarSolicitacoesRecentes(solicitacoes: readonly SolicitacaoAdmin[]): SolicitacaoAdmin[] {
  return solicitacoes
    .slice()
    .sort(
      (a, b) =>
        (dataAdminParaDate(b.data_criacao)?.getTime() ?? 0) -
        (dataAdminParaDate(a.data_criacao)?.getTime() ?? 0),
    );
}

function ordenarHistorico(historico: readonly HistoricoStatus[]): HistoricoStatus[] {
  return historico
    .slice()
    .sort(
      (a, b) =>
        (dataAdminParaDate(a.data_alteracao)?.getTime() ?? 0) -
        (dataAdminParaDate(b.data_alteracao)?.getTime() ?? 0),
    );
}

function getDetalheErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `Não foi possível carregar os dados administrativos. Detalhe: ${error.message}`;
  }

  return 'Não foi possível carregar os dados administrativos.';
}

export function useAdminSolicitacoes(): AdminSolicitacoesState {
  const [state, setState] = useState<AdminSolicitacoesState>({
    solicitacoes: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = observarSolicitacoesAdminReadOnly(
      (solicitacoes) =>
        setState({ solicitacoes: ordenarSolicitacoesRecentes(solicitacoes), loading: false, error: null }),
      (error) =>
        setState((current) => ({
          ...current,
          loading: false,
          error: getErrorMessage(error),
        })),
    );

    return unsubscribe;
  }, []);

  return state;
}

export function useAdminSolicitacao(solicitacaoId: string | undefined): AdminSolicitacaoState {
  const [state, setState] = useState<AdminSolicitacaoState>({
    solicitacao: null,
    loading: Boolean(solicitacaoId),
    error: null,
  });

  useEffect(() => {
    if (!solicitacaoId) {
      setState({ solicitacao: null, loading: false, error: 'Solicitação não informada.' });
      return undefined;
    }

    setState({ solicitacao: null, loading: true, error: null });

    const unsubscribe = observarSolicitacaoAdminReadOnly(
      solicitacaoId,
      (solicitacao) => setState({ solicitacao, loading: false, error: null }),
      (error) =>
        setState((current) => ({
          ...current,
          loading: false,
          error: getDetalheErrorMessage(error),
        })),
    );

    return unsubscribe;
  }, [solicitacaoId]);

  return state;
}

export function useAdminHistoricoSolicitacao(
  solicitacaoId: string | undefined,
): AdminHistoricoState {
  const [state, setState] = useState<AdminHistoricoState>({
    historico: [],
    loading: Boolean(solicitacaoId),
    error: null,
  });

  useEffect(() => {
    if (!solicitacaoId) {
      setState({ historico: [], loading: false, error: null });
      return undefined;
    }

    setState({ historico: [], loading: true, error: null });

    const unsubscribe = observarHistoricoSolicitacaoAdminReadOnly(
      solicitacaoId,
      (historico) => setState({ historico: ordenarHistorico(historico), loading: false, error: null }),
      (error) =>
        setState((current) => ({
          ...current,
          loading: false,
          error: getDetalheErrorMessage(error),
        })),
    );

    return unsubscribe;
  }, [solicitacaoId]);

  return state;
}
