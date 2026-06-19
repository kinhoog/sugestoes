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
export type HistoricoTipoEvento =
  | 'criacao'
  | 'alteracao_status'
  | 'atribuicao_responsavel'
  | 'observacao_interna';

export interface Setor {
  id: string;
  nome: string;
  deleted_at: unknown | null;
}

export interface Cargo {
  id: string;
  setor_id: string;
  nome: string;
  deleted_at: unknown | null;
}

export interface Solicitacao {
  id: string;
  protocolo: string;
  nome_completo: string;
  email: string;
  setor_id: string;
  cargo_id: string;
  processo_alvo: string;
  funcionamento_atual: string;
  frequencia: Frequencia;
  impacto_operacional: ImpactoOperacional;
  pessoas_impactadas: PessoasImpactadas;
  tempo_perdido: TempoPerdido;
  informacoes_complementares: string | null;
  referencia_evidencia: string | null;
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
  responsavel_admin_id?: string | null;
  responsavel_admin_email?: string | null;
  responsavel_admin_nome?: string | null;
  created_by: string;
  created_by_email: string;
  data_criacao: unknown;
  data_inicio_analise: unknown | null;
  data_decisao: unknown | null;
  data_fechamento: unknown | null;
  deleted_at: unknown | null;
  updated_at?: unknown;
  updated_by?: string | null;
  updated_by_email?: string | null;
}

export interface HistoricoStatus {
  id: string;
  solicitacao_id: string;
  protocolo?: string | null;
  tipo_evento?: HistoricoTipoEvento;
  status_anterior: StatusSolicitacao | null;
  status_novo: StatusSolicitacao;
  observacao?: string | null;
  usuario_id: string | null;
  usuario_email: string | null;
  data_alteracao: unknown;
}

export interface NovaSolicitacaoPayload {
  nome_completo: string;
  email: string;
  setor_id: string;
  cargo_id: string;
  processo_alvo: string;
  funcionamento_atual: string;
  frequencia: Frequencia;
  impacto_operacional: ImpactoOperacional;
  pessoas_impactadas: PessoasImpactadas;
  tempo_perdido: TempoPerdido;
  informacoes_complementares?: string | null;
  referencia_evidencia?: string | null;
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

export interface CriarSolicitacaoResult {
  id: string;
  protocolo: string;
}
