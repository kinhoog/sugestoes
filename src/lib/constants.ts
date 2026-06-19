/**
 * Fonte única de verdade de domínio (frontend).
 *
 * Centraliza opções de seleção, pontuações da engine de prioridade, máquina de
 * estados, cores de status e limites operacionais. Os valores (`value`) devem
 * espelhar os contratos validados por `firebase.rules`.
 */

/** Opção de seleção genérica, com pontuação opcional usada pela engine de prioridade. */
export interface OpcaoSelecao<T extends string = string> {
  readonly value: T;
  readonly label: string;
  /** Pontuação atribuída na matriz de prioridade (ARQUITETURA MVP §6). */
  readonly pontos?: number;
}

export const ADMIN_EMAILS = [
  'fabio@protege.med.br',
  'abner@protege.med.br',
  'esocial@protege.med.br',
] as const;

// -----------------------------------------------------------------------------
// Critérios pontuados (Matriz Crítica de Pontuação — ARQUITETURA MVP §6)
// -----------------------------------------------------------------------------

export const IMPACTO_OPERACIONAL_OPCOES = [
  { value: 'Baixo', label: 'Baixo', pontos: 10 },
  { value: 'Médio', label: 'Médio', pontos: 20 },
  { value: 'Alto', label: 'Alto', pontos: 30 },
  { value: 'Crítico', label: 'Crítico', pontos: 40 },
] as const satisfies readonly OpcaoSelecao[];

export const PESSOAS_IMPACTADAS_OPCOES = [
  { value: '1', label: '1 pessoa', pontos: 5 },
  { value: '2-5', label: '2 a 5 pessoas', pontos: 10 },
  { value: '6-10', label: '6 a 10 pessoas', pontos: 15 },
  { value: '11-20', label: '11 a 20 pessoas', pontos: 20 },
  { value: '20+', label: 'Mais de 20 pessoas', pontos: 25 },
] as const satisfies readonly OpcaoSelecao[];

export const TEMPO_PERDIDO_OPCOES = [
  { value: '<30min', label: 'Menos de 30 minutos', pontos: 5 },
  { value: '30min-2h', label: 'Entre 30 minutos e 2 horas', pontos: 10 },
  { value: '2-5h', label: 'Entre 2 e 5 horas', pontos: 15 },
  { value: '5-10h', label: 'Entre 5 e 10 horas', pontos: 20 },
  { value: '10h+', label: 'Mais de 10 horas', pontos: 25 },
] as const satisfies readonly OpcaoSelecao[];

export const FREQUENCIA_OPCOES = [
  { value: 'Esporádico', label: 'Esporádico', pontos: 5 },
  { value: 'Mensal', label: 'Mensal', pontos: 10 },
  { value: 'Semanal', label: 'Semanal', pontos: 15 },
  { value: 'Diário', label: 'Diário', pontos: 20 },
] as const satisfies readonly OpcaoSelecao[];

/** Pontuação dos critérios booleanos: Sim soma; Não soma 0. */
export const PONTOS_USA_PLANILHA = 10;
export const PONTOS_USA_EMAIL = 5;
export const PONTOS_DEPENDENCIA_PESSOA = 5;

/** Soma máxima possível da matriz crua = 40 + 25 + 25 + 20 + 10 + 5 + 5. */
export const SCORE_MAXIMO_BRUTO = 130;
/** Escala final normalizada das faixas de classificação. */
export const SCORE_MAXIMO_NORMALIZADO = 100;

// -----------------------------------------------------------------------------
// Campos não pontuados, porém validados/persistidos
// -----------------------------------------------------------------------------

/** Nível de urgência percebida (Bloco 4) — não entra no cálculo de prioridade. */
export const URGENCIA_OPCOES = [
  { value: 'Baixa', label: 'Baixa' },
  { value: 'Média', label: 'Média' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Imediata', label: 'Imediata' },
] as const satisfies readonly OpcaoSelecao[];

// -----------------------------------------------------------------------------
// Prioridade — faixas de classificação (ARQUITETURA MVP §6)
// -----------------------------------------------------------------------------

export const PRIORIDADE_NIVEIS = ['Baixa', 'Média', 'Alta', 'Crítica'] as const;
type PrioridadeNivelInterno = (typeof PRIORIDADE_NIVEIS)[number];

export const FAIXAS_PRIORIDADE = [
  { min: 0, max: 25, nivel: 'Baixa' },
  { min: 26, max: 50, nivel: 'Média' },
  { min: 51, max: 75, nivel: 'Alta' },
  { min: 76, max: 100, nivel: 'Crítica' },
] as const satisfies readonly { min: number; max: number; nivel: PrioridadeNivelInterno }[];

// -----------------------------------------------------------------------------
// Máquina de estados
// -----------------------------------------------------------------------------

export const STATUS_SOLICITACAO = [
  'Nova',
  'Em Análise',
  'Aguardando Informações',
  'Aprovada',
  'Rejeitada',
  'Concluída',
] as const;
type StatusInterno = (typeof STATUS_SOLICITACAO)[number];

/** Transições permitidas. Espelha `fn_validar_transicao_status` no banco. */
export const TRANSICOES_STATUS: Record<StatusInterno, readonly StatusInterno[]> = {
  Nova: ['Em Análise'],
  'Em Análise': ['Aguardando Informações', 'Aprovada', 'Rejeitada'],
  'Aguardando Informações': ['Em Análise'],
  Aprovada: ['Concluída'],
  Rejeitada: ['Concluída'],
  Concluída: [],
};

export const STATUS_CORES: Record<StatusInterno, { hex: string; bg: string; text: string }> = {
  Nova: { hex: '#9CA3AF', bg: 'bg-gray-400', text: 'text-gray-400' },
  'Em Análise': { hex: '#3B82F6', bg: 'bg-blue-500', text: 'text-blue-500' },
  'Aguardando Informações': { hex: '#F59E0B', bg: 'bg-amber-500', text: 'text-amber-500' },
  Aprovada: { hex: '#10B981', bg: 'bg-emerald-500', text: 'text-emerald-500' },
  Rejeitada: { hex: '#EF4444', bg: 'bg-red-500', text: 'text-red-500' },
  Concluída: { hex: '#8B5CF6', bg: 'bg-violet-500', text: 'text-violet-500' },
};

// -----------------------------------------------------------------------------
// Autenticação / domínio corporativo
// -----------------------------------------------------------------------------

/** Sufixo de e-mail obrigatório do colaborador. */
export const EMAIL_DOMINIO_PERMITIDO = '@protege.med.br';
export const PROTEGE_EMAIL_DOMAIN = EMAIL_DOMINIO_PERMITIDO;

// -----------------------------------------------------------------------------
// Rotas
// -----------------------------------------------------------------------------

export const ROTAS = {
  formulario: '/',
  sucesso: '/sucesso',
  minhasDemandas: '/minhas-demandas',
  minhaDemandaDetalhe: (id: string) => `/minhas-demandas/${id}`,
  login: '/login',
  cadastro: '/cadastro',
  verificarEmail: '/verificar-email',
  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard',
  adminSolicitacoes: '/admin/solicitacoes',
  adminDetalhe: (id: string) => `/admin/solicitacoes/${id}`,
} as const;

// -----------------------------------------------------------------------------
// Opcoes locais do formulario publico
// -----------------------------------------------------------------------------

export const SETORES_OPCOES = [
  { id: 'recepcao', nome: 'Recepção' },
  { id: 'administrativo', nome: 'Administrativo' },
  { id: 'enfermagem', nome: 'Enfermagem' },
  { id: 'financeiro', nome: 'Financeiro' },
  { id: 'seguranca-do-trabalho', nome: 'Segurança do Trabalho' },
] as const;

export type SetorOpcaoId = (typeof SETORES_OPCOES)[number]['id'];

export const CARGOS_POR_SETOR = {
  recepcao: [
    { id: 'lider-recepcao-atendimento', nome: 'Líder de Recepção e Atendimento' },
    { id: 'atendente-saude-ocupacional', nome: 'Atendente de Saúde Ocupacional' },
    { id: 'estagiario-recepcao', nome: 'Estagiário(a)' },
  ],
  administrativo: [
    { id: 'gerente-administrativo', nome: 'Gerente Administrativo(a)' },
    { id: 'assistente-administrativo', nome: 'Assistente Administrativo' },
    { id: 'assistente-sistemas', nome: 'Assistente de Sistemas' },
  ],
  enfermagem: [
    { id: 'auxiliar-enfermagem', nome: 'Auxiliar de Enfermagem' },
    { id: 'tecnica-enfermagem-trabalho', nome: 'Técnica de Enfermagem do Trabalho' },
  ],
  financeiro: [{ id: 'assistente-financeiro', nome: 'Assistente Financeiro' }],
  'seguranca-do-trabalho': [
    { id: 'tecnico-seguranca-trabalho', nome: 'Técnico(a) de Segurança do Trabalho' },
    { id: 'engenheira-seguranca-trabalho', nome: 'Engenheira de Segurança do Trabalho' },
    { id: 'estagiario-seguranca-trabalho', nome: 'Estagiário(a)' },
  ],
} as const satisfies Record<SetorOpcaoId, readonly { id: string; nome: string }[]>;

export const CARGOS_OPCOES = Object.values(CARGOS_POR_SETOR).flat();
