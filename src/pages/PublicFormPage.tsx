import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Loader2, LogOut, Send } from 'lucide-react';

import { BrandHeader } from '../components/BrandHeader';
import {
  CARGOS_OPCOES,
  FREQUENCIA_OPCOES,
  IMPACTO_OPERACIONAL_OPCOES,
  PESSOAS_IMPACTADAS_OPCOES,
  ROTAS,
  SETORES_OPCOES,
  TEMPO_PERDIDO_OPCOES,
  URGENCIA_OPCOES,
} from '../lib/constants';
import { getFriendlyFirebaseError } from '../lib/firebase-errors';
import { calcularPrioridade } from '../lib/priority';
import { isPreenchido, normalizarReferenciaEvidencia } from '../lib/validators';
import { useAuth } from '../hooks/useAuth';
import { criarSolicitacaoComProtocolo } from '../services/firebase/firestore.service';
import type {
  Frequencia,
  ImpactoOperacional,
  NovaSolicitacaoPayload,
  PessoasImpactadas,
  TempoPerdido,
  Urgencia,
} from '../types/solicitacao.types';

type SelectValue<T extends string> = '' | T;

interface FormState {
  nome_completo: string;
  setor_id: string;
  cargo_id: string;
  processo_alvo: string;
  funcionamento_atual: string;
  frequencia: SelectValue<Frequencia>;
  impacto_operacional: SelectValue<ImpactoOperacional>;
  pessoas_impactadas: SelectValue<PessoasImpactadas>;
  tempo_perdido: SelectValue<TempoPerdido>;
  usa_planilha: boolean;
  descricao_planilha: string;
  usa_email: boolean;
  descricao_email: string;
  atividade_repetitiva: boolean;
  descricao_atividade_repetitiva: string;
  dependencia_pessoa: boolean;
  descricao_dependencia_pessoa: string;
  resultado_ideal: string;
  urgencia: SelectValue<Urgencia>;
  referencia_evidencia: string;
}

interface SuccessState {
  protocolo: string;
  solicitacaoId: string;
}

const emptyForm: FormState = {
  nome_completo: '',
  setor_id: '',
  cargo_id: '',
  processo_alvo: '',
  funcionamento_atual: '',
  frequencia: '',
  impacto_operacional: '',
  pessoas_impactadas: '',
  tempo_perdido: '',
  usa_planilha: false,
  descricao_planilha: '',
  usa_email: false,
  descricao_email: '',
  atividade_repetitiva: false,
  descricao_atividade_repetitiva: '',
  dependencia_pessoa: false,
  descricao_dependencia_pessoa: '',
  resultado_ideal: '',
  urgencia: '',
  referencia_evidencia: '',
};

function trimOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function validateForm(form: FormState): string[] {
  const errors: string[] = [];

  if (!isPreenchido(form.nome_completo)) errors.push('Informe seu nome completo.');
  if (!isPreenchido(form.setor_id)) errors.push('Selecione o setor.');
  if (!isPreenchido(form.cargo_id)) errors.push('Selecione o cargo.');
  if (!isPreenchido(form.processo_alvo)) errors.push('Informe o processo ou atividade alvo.');
  if (!isPreenchido(form.funcionamento_atual)) {
    errors.push('Explique como a atividade funciona hoje.');
  }
  if (!form.frequencia) errors.push('Selecione a frequencia.');
  if (!form.impacto_operacional) errors.push('Selecione o impacto operacional.');
  if (!form.pessoas_impactadas) errors.push('Selecione quantas pessoas sao impactadas.');
  if (!form.tempo_perdido) errors.push('Selecione o tempo perdido.');
  if (form.usa_planilha && !isPreenchido(form.descricao_planilha)) {
    errors.push('Descreva a dependencia de planilha.');
  }
  if (form.usa_email && !isPreenchido(form.descricao_email)) {
    errors.push('Descreva a dependencia de e-mail.');
  }
  if (form.atividade_repetitiva && !isPreenchido(form.descricao_atividade_repetitiva)) {
    errors.push('Descreva a atividade repetitiva.');
  }
  if (form.dependencia_pessoa && !isPreenchido(form.descricao_dependencia_pessoa)) {
    errors.push('Descreva a dependencia de pessoa unica.');
  }
  if (!isPreenchido(form.resultado_ideal)) errors.push('Informe o resultado ideal.');
  if (!form.urgencia) errors.push('Selecione a urgencia.');

  return errors;
}

export function PublicFormPage() {
  const navigate = useNavigate();
  const { user, email, logout } = useAuth();
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    nome_completo: user?.displayName ?? '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const prioridadePreview = useMemo(() => {
    if (
      !form.impacto_operacional ||
      !form.pessoas_impactadas ||
      !form.tempo_perdido ||
      !form.frequencia
    ) {
      return null;
    }

    return calcularPrioridade({
      impactoOperacional: form.impacto_operacional,
      pessoasImpactadas: form.pessoas_impactadas,
      tempoPerdido: form.tempo_perdido,
      frequencia: form.frequencia,
      usaPlanilha: form.usa_planilha,
      usaEmail: form.usa_email,
      dependenciaPessoa: form.dependencia_pessoa,
    });
  }, [
    form.atividade_repetitiva,
    form.dependencia_pessoa,
    form.frequencia,
    form.impacto_operacional,
    form.pessoas_impactadas,
    form.tempo_perdido,
    form.usa_email,
    form.usa_planilha,
  ]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    if (!user || !email) {
      setSubmitError('Sessao invalida. Entre novamente.');
      return;
    }

    const prioridade = calcularPrioridade({
      impactoOperacional: form.impacto_operacional as ImpactoOperacional,
      pessoasImpactadas: form.pessoas_impactadas as PessoasImpactadas,
      tempoPerdido: form.tempo_perdido as TempoPerdido,
      frequencia: form.frequencia as Frequencia,
      usaPlanilha: form.usa_planilha,
      usaEmail: form.usa_email,
      dependenciaPessoa: form.dependencia_pessoa,
    });

    const payload: NovaSolicitacaoPayload = {
      nome_completo: form.nome_completo.trim(),
      email,
      setor_id: form.setor_id,
      cargo_id: form.cargo_id,
      processo_alvo: form.processo_alvo.trim(),
      funcionamento_atual: form.funcionamento_atual.trim(),
      frequencia: form.frequencia as Frequencia,
      impacto_operacional: form.impacto_operacional as ImpactoOperacional,
      pessoas_impactadas: form.pessoas_impactadas as PessoasImpactadas,
      tempo_perdido: form.tempo_perdido as TempoPerdido,
      informacoes_complementares: null,
      referencia_evidencia: normalizarReferenciaEvidencia(form.referencia_evidencia),
      usa_planilha: form.usa_planilha,
      descricao_planilha: form.usa_planilha ? trimOrNull(form.descricao_planilha) : null,
      usa_email: form.usa_email,
      descricao_email: form.usa_email ? trimOrNull(form.descricao_email) : null,
      atividade_repetitiva: form.atividade_repetitiva,
      descricao_atividade_repetitiva: form.atividade_repetitiva
        ? trimOrNull(form.descricao_atividade_repetitiva)
        : null,
      dependencia_pessoa: form.dependencia_pessoa,
      descricao_dependencia_pessoa: form.dependencia_pessoa
        ? trimOrNull(form.descricao_dependencia_pessoa)
        : null,
      resultado_ideal: form.resultado_ideal.trim(),
      urgencia: form.urgencia as Urgencia,
      score: prioridade.score,
      prioridade_calculada: prioridade.prioridade,
    };

    setSubmitting(true);

    try {
      const result = await criarSolicitacaoComProtocolo({
        payload,
        uid: user.uid,
        email,
      });
      const successState: SuccessState = {
        protocolo: result.protocolo,
        solicitacaoId: result.id,
      };
      navigate(ROTAS.sucesso, { replace: true, state: successState });
    } catch (submitErrorValue) {
      setSubmitError(getFriendlyFirebaseError(submitErrorValue));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <BrandHeader>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[220px] truncate text-sm text-slate-600 sm:block">
            {email}
          </span>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </BrandHeader>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-brand-700">Formulario publico</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            Registrar oportunidade de melhoria
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Descreva o problema real da operacao. Nao e necessario propor uma solucao tecnica.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-base font-semibold text-slate-950">Identificacao</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nome completo</span>
                <input
                  type="text"
                  value={form.nome_completo}
                  onChange={(event) => setField('nome_completo', event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">E-mail</span>
                <input
                  type="email"
                  value={email ?? ''}
                  disabled
                  className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Setor</span>
                <select
                  value={form.setor_id}
                  onChange={(event) => setField('setor_id', event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Selecione</option>
                  {SETORES_OPCOES.map((setor) => (
                    <option key={setor.id} value={setor.id}>
                      {setor.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Cargo</span>
                <select
                  value={form.cargo_id}
                  onChange={(event) => setField('cargo_id', event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Selecione</option>
                  {CARGOS_OPCOES.map((cargo) => (
                    <option key={cargo.id} value={cargo.id}>
                      {cargo.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-base font-semibold text-slate-950">Problema observado</h2>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Processo ou atividade alvo
                </span>
                <input
                  type="text"
                  value={form.processo_alvo}
                  onChange={(event) => setField('processo_alvo', event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Como funciona atualmente
                </span>
                <textarea
                  value={form.funcionamento_atual}
                  onChange={(event) => setField('funcionamento_atual', event.target.value)}
                  rows={5}
                  className="mt-1 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-base font-semibold text-slate-950">Impacto operacional</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Frequencia</span>
                <select
                  value={form.frequencia}
                  onChange={(event) => setField('frequencia', event.target.value as FormState['frequencia'])}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Selecione</option>
                  {FREQUENCIA_OPCOES.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Impacto operacional</span>
                <select
                  value={form.impacto_operacional}
                  onChange={(event) =>
                    setField('impacto_operacional', event.target.value as FormState['impacto_operacional'])
                  }
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Selecione</option>
                  {IMPACTO_OPERACIONAL_OPCOES.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Pessoas impactadas</span>
                <select
                  value={form.pessoas_impactadas}
                  onChange={(event) =>
                    setField('pessoas_impactadas', event.target.value as FormState['pessoas_impactadas'])
                  }
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Selecione</option>
                  {PESSOAS_IMPACTADAS_OPCOES.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Tempo perdido</span>
                <select
                  value={form.tempo_perdido}
                  onChange={(event) =>
                    setField('tempo_perdido', event.target.value as FormState['tempo_perdido'])
                  }
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Selecione</option>
                  {TEMPO_PERDIDO_OPCOES.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {prioridadePreview ? (
              <div className="mt-5 flex flex-col gap-3 rounded-md border border-brand-100 bg-brand-50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 font-medium text-brand-900">
                  <ClipboardCheck size={17} />
                  Prioridade calculada automaticamente
                </div>
                <div className="text-slate-700">
                  Score {prioridadePreview.score}/100 - {prioridadePreview.prioridade}
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-base font-semibold text-slate-950">Sinais de retrabalho</h2>
            <div className="mt-4 grid gap-4">
              <BooleanDetail
                checked={form.usa_planilha}
                label="Existe uso de planilha?"
                detailLabel="Descreva a dependencia de planilha"
                detailValue={form.descricao_planilha}
                onCheckedChange={(value) => setField('usa_planilha', value)}
                onDetailChange={(value) => setField('descricao_planilha', value)}
              />

              <BooleanDetail
                checked={form.usa_email}
                label="Existe dependencia de e-mail?"
                detailLabel="Descreva a dependencia de e-mail"
                detailValue={form.descricao_email}
                onCheckedChange={(value) => setField('usa_email', value)}
                onDetailChange={(value) => setField('descricao_email', value)}
              />

              <BooleanDetail
                checked={form.atividade_repetitiva}
                label="Existe atividade repetitiva?"
                detailLabel="Descreva a atividade repetitiva"
                detailValue={form.descricao_atividade_repetitiva}
                onCheckedChange={(value) => setField('atividade_repetitiva', value)}
                onDetailChange={(value) => setField('descricao_atividade_repetitiva', value)}
              />

              <BooleanDetail
                checked={form.dependencia_pessoa}
                label="Existe dependencia de pessoa unica?"
                detailLabel="Descreva a dependencia"
                detailValue={form.descricao_dependencia_pessoa}
                onCheckedChange={(value) => setField('dependencia_pessoa', value)}
                onDetailChange={(value) => setField('descricao_dependencia_pessoa', value)}
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-base font-semibold text-slate-950">Resultado esperado</h2>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Resultado ideal</span>
                <textarea
                  value={form.resultado_ideal}
                  onChange={(event) => setField('resultado_ideal', event.target.value)}
                  rows={4}
                  className="mt-1 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Urgencia</span>
                  <select
                    value={form.urgencia}
                    onChange={(event) => setField('urgencia', event.target.value as FormState['urgencia'])}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="">Selecione</option>
                    {URGENCIA_OPCOES.map((opcao) => (
                      <option key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Referencia de evidencia
                  </span>
                  <input
                    type="text"
                    value={form.referencia_evidencia}
                    onChange={(event) => setField('referencia_evidencia', event.target.value)}
                    placeholder="Link, caminho interno ou observacao"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
              </div>
            </div>
          </section>

          {errors.length > 0 ? (
            <section className="rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">Revise os campos:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {submitError ? (
            <p className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
              Enviar solicitacao
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

interface BooleanDetailProps {
  checked: boolean;
  label: string;
  detailLabel: string;
  detailValue: string;
  onCheckedChange: (value: boolean) => void;
  onDetailChange: (value: string) => void;
}

function BooleanDetail({
  checked,
  label,
  detailLabel,
  detailValue,
  onCheckedChange,
  onDetailChange,
}: BooleanDetailProps) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
        />
        {label}
      </label>
      {checked ? (
        <label className="mt-3 block">
          <span className="text-sm font-medium text-slate-700">{detailLabel}</span>
          <textarea
            value={detailValue}
            onChange={(event) => onDetailChange(event.target.value)}
            rows={3}
            className="mt-1 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>
      ) : null}
    </div>
  );
}
