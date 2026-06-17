/**
 * Engine de cálculo de prioridade — EXCLUSIVAMENTE frontend (ARQUITETURA §7).
 *
 * Modelo: matriz absoluta de pontos (soma crua de 0 a 130) NORMALIZADA para a
 * escala 0–100 usada pelas faixas de classificação. Isso concilia a matriz do
 * ARQUITETURA com a escala percentual do CONTEXTO. O resultado é imutável após
 * o INSERT e nunca é recalculado no backend.
 */
import {
  IMPACTO_OPERACIONAL_OPCOES,
  PESSOAS_IMPACTADAS_OPCOES,
  TEMPO_PERDIDO_OPCOES,
  FREQUENCIA_OPCOES,
  PONTOS_USA_PLANILHA,
  PONTOS_USA_EMAIL,
  PONTOS_DEPENDENCIA_PESSOA,
  SCORE_MAXIMO_BRUTO,
  SCORE_MAXIMO_NORMALIZADO,
  FAIXAS_PRIORIDADE,
  type OpcaoSelecao,
} from './constants';
import type {
  ImpactoOperacional,
  PessoasImpactadas,
  TempoPerdido,
  Frequencia,
  PrioridadeNivel,
} from '../types/solicitacao.types';

/** Entrada da engine: apenas os critérios que pontuam. */
export interface PriorityInput {
  impactoOperacional: ImpactoOperacional;
  pessoasImpactadas: PessoasImpactadas;
  tempoPerdido: TempoPerdido;
  frequencia: Frequencia;
  usaPlanilha: boolean;
  usaEmail: boolean;
  dependenciaPessoa: boolean;
}

export interface PriorityResult {
  /** Score normalizado (0–100) — fonte de verdade analítica persistida. */
  score: number;
  /** Classificação derivada diretamente do score. */
  prioridade: PrioridadeNivel;
  /** Soma crua da matriz (0–130), exposta para auditoria/depuração. */
  scoreBruto: number;
}

/** Resolve a pontuação de uma opção, falhando explicitamente para valores inválidos. */
function pontosPara<T extends string>(opcoes: readonly OpcaoSelecao<T>[], value: T): number {
  const opcao = opcoes.find((o) => o.value === value);
  if (!opcao || opcao.pontos === undefined) {
    throw new Error(`Opção inválida para cálculo de prioridade: "${value}".`);
  }
  return opcao.pontos;
}

/** Classifica um score normalizado (0–100) na faixa de prioridade correspondente. */
export function classificarPrioridade(score: number): PrioridadeNivel {
  const faixa = FAIXAS_PRIORIDADE.find((f) => score >= f.min && score <= f.max);
  // Fallback defensivo: scores acima da última faixa são Crítica.
  return faixa?.nivel ?? FAIXAS_PRIORIDADE[FAIXAS_PRIORIDADE.length - 1].nivel;
}

/** Calcula score (normalizado 0–100) e prioridade a partir dos critérios. */
export function calcularPrioridade(input: PriorityInput): PriorityResult {
  const scoreBruto =
    pontosPara(IMPACTO_OPERACIONAL_OPCOES, input.impactoOperacional) +
    pontosPara(PESSOAS_IMPACTADAS_OPCOES, input.pessoasImpactadas) +
    pontosPara(TEMPO_PERDIDO_OPCOES, input.tempoPerdido) +
    pontosPara(FREQUENCIA_OPCOES, input.frequencia) +
    (input.usaPlanilha ? PONTOS_USA_PLANILHA : 0) +
    (input.usaEmail ? PONTOS_USA_EMAIL : 0) +
    (input.dependenciaPessoa ? PONTOS_DEPENDENCIA_PESSOA : 0);

  const score = Math.round((scoreBruto / SCORE_MAXIMO_BRUTO) * SCORE_MAXIMO_NORMALIZADO);
  return { score, prioridade: classificarPrioridade(score), scoreBruto };
}
