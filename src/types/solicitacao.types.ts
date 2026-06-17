/**
 * Tipos de domínio da solicitação. As uniões são derivadas das constantes em
 * `src/lib/constants.ts` para manter uma única fonte de verdade.
 */
import {
  FREQUENCIA_OPCOES,
  IMPACTO_OPERACIONAL_OPCOES,
  PESSOAS_IMPACTADAS_OPCOES,
  PRIORIDADE_NIVEIS,
  STATUS_SOLICITACAO,
  TEMPO_PERDIDO_OPCOES,
  URGENCIA_OPCOES,
} from '../lib/constants';

export type ImpactoOperacional = (typeof IMPACTO_OPERACIONAL_OPCOES)[number]['value'];
export type PessoasImpactadas = (typeof PESSOAS_IMPACTADAS_OPCOES)[number]['value'];
export type TempoPerdido = (typeof TEMPO_PERDIDO_OPCOES)[number]['value'];
export type Frequencia = (typeof FREQUENCIA_OPCOES)[number]['value'];
export type Urgencia = (typeof URGENCIA_OPCOES)[number]['value'];
export type StatusSolicitacao = (typeof STATUS_SOLICITACAO)[number];
export type PrioridadeNivel = (typeof PRIORIDADE_NIVEIS)[number];

export interface Setor {
  id: number;
  nome: string;
  deleted_at: string | null;
}

export interface Cargo {
  id: number;
  setor_id: number;
  nome: string;
  deleted_at: string | null;
}

export interface Solicitacao {
  id: string;
  protocolo: string;
  nome_completo: string;
  email: string;
  setor_id: number;
  cargo_id: number;
  processo_alvo: string;
  funcionamento_atual: string;
  frequencia: Frequencia;
  impacto_operacional: ImpactoOperacional;
  pessoas_impactadas: PessoasImpactadas;
  tempo_perdido: TempoPerdido;
  informacoes_complementares: string | null;
  usa_planilha: boolean;
  descricao_planilha: string | null;
  usa_email: boolean;
  descricao_email: string | null;
  atividade_repetitiva: boolean;
  descricao_atividade_repetitiva: string | null;
  dependencia_pessoa: boolean;
  descricao_dependencia_pessoa: string | null;
  resultado_ideal: string;
  urgencia: Urgencia;
  score: number;
  prioridade_calculada: PrioridadeNivel;
  status: StatusSolicitacao;
  parecer_tecnico: string | null;
  observacao_interna: string | null;
  data_criacao: string;
  data_inicio_analise: string | null;
  data_decisao: string | null;
  data_fechamento: string | null;
  deleted_at: string | null;
}

export interface Anexo {
  id: string;
  solicitacao_id: string;
  nome_arquivo: string;
  caminho_storage: string;
  tamanho_bytes: number;
  data_upload: string;
  deleted_at: string | null;
}

export interface HistoricoStatus {
  id: string;
  solicitacao_id: string;
  status_anterior: StatusSolicitacao | null;
  status_novo: StatusSolicitacao;
  usuario_comite_id: string | null;
  usuario_comite: string | null;
  data_alteracao: string;
}

export interface NovaSolicitacaoPayload {
  nome_completo: string;
  email: string;
  setor_id: number;
  cargo_id: number;
  processo_alvo: string;
  funcionamento_atual: string;
  frequencia: Frequencia;
  impacto_operacional: ImpactoOperacional;
  pessoas_impactadas: PessoasImpactadas;
  tempo_perdido: TempoPerdido;
  informacoes_complementares?: string | null;
  usa_planilha: boolean;
  descricao_planilha?: string | null;
  usa_email: boolean;
  descricao_email?: string | null;
  atividade_repetitiva: boolean;
  descricao_atividade_repetitiva?: string | null;
  dependencia_pessoa: boolean;
  descricao_dependencia_pessoa?: string | null;
  resultado_ideal: string;
  urgencia: Urgencia;
  score: number;
  prioridade_calculada: PrioridadeNivel;
}

export interface AnexoPayload {
  nome_arquivo: string;
  caminho_storage: string;
  tamanho_bytes: number;
}

export interface CriarSolicitacaoResult {
  id: string;
  protocolo: string;
}
