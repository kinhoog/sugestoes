import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FileCheck2,
  Loader2,
  LogOut,
  Send,
} from 'lucide-react';

import { BrandHeader } from '../components/BrandHeader';
import { FormStep } from '../components/form/FormStep';
import { ProgressIndicator } from '../components/form/ProgressIndicator';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { InputField, SelectField, TextareaField } from '../components/ui/Field';
import {
  CARGOS_POR_SETOR,
  FREQUENCIA_OPCOES,
  IMPACTO_OPERACIONAL_OPCOES,
  PESSOAS_IMPACTADAS_OPCOES,
  ROTAS,
  SETORES_OPCOES,
  TEMPO_PERDIDO_OPCOES,
  URGENCIA_OPCOES,
  type SetorOpcaoId,
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

interface WizardStep {
  label: string;
  eyebrow: string;
  title: string;
  description: string;
}

const steps: readonly WizardStep[] = [
  {
    label: 'Identificação',
    eyebrow: 'Etapa 1',
    title: 'Quem está registrando a oportunidade?',
    description: 'Confirme seus dados e selecione o setor e cargo para contextualizar a análise.',
  },
  {
    label: 'Processo afetado',
    eyebrow: 'Etapa 2',
    title: 'Qual processo, atividade ou rotina está gerando dificuldade?',
    description: 'Dê um nome claro para a rotina ou processo afetado.',
  },
  {
    label: 'Funcionamento atual',
    eyebrow: 'Etapa 3',
    title: 'Explique como essa atividade funciona hoje.',
    description:
      'O foco é entender onde existe retrabalho, perda de tempo ou dependência manual.',
  },
  {
    label: 'Impacto',
    eyebrow: 'Etapa 4',
    title: 'Com que frequência isso acontece e qual é o impacto?',
    description: 'Se não souber estimar exatamente, informe uma aproximação.',
  },
  {
    label: 'Retrabalho',
    eyebrow: 'Etapa 5',
    title: 'Quais sinais de retrabalho aparecem nessa rotina?',
    description: 'Marque apenas o que se aplica ao cenário descrito.',
  },
  {
    label: 'Resultado esperado',
    eyebrow: 'Etapa 6',
    title: 'Como seria o cenário ideal?',
    description: 'Não é necessário sugerir uma solução técnica.',
  },
  {
    label: 'Evidência',
    eyebrow: 'Etapa 7',
    title: 'Existe alguma referência que ajude a entender o problema?',
    description: 'Use este espaço para link, caminho interno, documento ou observação complementar.',
  },
  {
    label: 'Revisão',
    eyebrow: 'Etapa 8',
    title: 'Revise antes de enviar.',
    description: 'A solicitação será registrada com protocolo e enviada para análise do comitê.',
  },
] as const;

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

function toSelectOptions(options: readonly { value: string; label: string }[]) {
  return options.map((option) => ({ value: option.value, label: option.label }));
}

function toIdSelectOptions(options: readonly { id: string; nome: string }[]) {
  return options.map((option) => ({ value: option.id, label: option.nome }));
}

function isSetorOpcaoId(value: string): value is SetorOpcaoId {
  return SETORES_OPCOES.some((setor) => setor.id === value);
}

function getCargoOptions(setorId: string) {
  return isSetorOpcaoId(setorId) ? CARGOS_POR_SETOR[setorId] : [];
}

function getSetorNome(setorId: string): string {
  return SETORES_OPCOES.find((setor) => setor.id === setorId)?.nome ?? 'Não informado';
}

function getCargoNome(setorId: string, cargoId: string): string {
  return getCargoOptions(setorId).find((cargo) => cargo.id === cargoId)?.nome ?? 'Não informado';
}

function getOptionLabel<T extends string>(
  options: readonly { value: T; label: string }[],
  value: SelectValue<T>,
): string {
  return value ? (options.find((option) => option.value === value)?.label ?? value) : 'Não informado';
}

function validateStep(stepIndex: number, form: FormState): string[] {
  const errors: string[] = [];

  if (stepIndex === 0 || stepIndex === 7) {
    if (!isPreenchido(form.nome_completo)) errors.push('Informe seu nome completo.');
    if (!isPreenchido(form.setor_id)) errors.push('Selecione o setor.');
    if (!isPreenchido(form.cargo_id)) errors.push('Selecione o cargo.');
  }

  if (stepIndex === 1 || stepIndex === 7) {
    if (!isPreenchido(form.processo_alvo)) {
      errors.push('Informe qual processo, atividade ou rotina está gerando dificuldade.');
    }
  }

  if (stepIndex === 2 || stepIndex === 7) {
    if (!isPreenchido(form.funcionamento_atual)) {
      errors.push('Explique como essa atividade funciona hoje.');
    }
  }

  if (stepIndex === 3 || stepIndex === 7) {
    if (!form.frequencia) errors.push('Selecione com que frequência isso acontece.');
    if (!form.impacto_operacional) errors.push('Selecione o impacto operacional.');
    if (!form.pessoas_impactadas) errors.push('Selecione quantas pessoas são impactadas.');
    if (!form.tempo_perdido) errors.push('Selecione quanto tempo aproximadamente é perdido.');
  }

  if (stepIndex === 4 || stepIndex === 7) {
    if (form.usa_planilha && !isPreenchido(form.descricao_planilha)) {
      errors.push('Descreva como a rotina depende de planilha.');
    }
    if (form.usa_email && !isPreenchido(form.descricao_email)) {
      errors.push('Descreva como a rotina depende de troca de e-mails.');
    }
    if (form.atividade_repetitiva && !isPreenchido(form.descricao_atividade_repetitiva)) {
      errors.push('Descreva a atividade repetitiva ou manual.');
    }
    if (form.dependencia_pessoa && !isPreenchido(form.descricao_dependencia_pessoa)) {
      errors.push('Descreva a dependência de uma pessoa específica.');
    }
  }

  if (stepIndex === 5 || stepIndex === 7) {
    if (!isPreenchido(form.resultado_ideal)) errors.push('Informe como seria o cenário ideal.');
    if (!form.urgencia) errors.push('Selecione a urgência percebida.');
  }

  return errors;
}

function validateForm(form: FormState): string[] {
  return validateStep(7, form);
}

export function PublicFormPage() {
  const navigate = useNavigate();
  const { user, email, logout } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    nome_completo: user?.displayName ?? '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentStep = steps[stepIndex];
  const cargoOptions = useMemo(() => getCargoOptions(form.setor_id), [form.setor_id]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSetorChange(value: string) {
    setForm((current) => ({ ...current, setor_id: value, cargo_id: '' }));
  }

  function handleNext() {
    const validationErrors = validateStep(stepIndex, form);
    setErrors(validationErrors);
    setSubmitError(null);

    if (validationErrors.length > 0) {
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function handleBack() {
    setErrors([]);
    setSubmitError(null);
    setStepIndex((current) => Math.max(current - 1, 0));
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
      setSubmitError('Sessão inválida. Entre novamente.');
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
    <div className="app-backdrop min-h-screen">
      <BrandHeader>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[220px] truncate rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 sm:block">
            {email}
          </span>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] motion-reduce:transition-none"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </BrandHeader>

      <main className="page-enter mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-7 rounded-[1.5rem] border border-white/70 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                Formulário público
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
                Registrar oportunidade de melhoria
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Conte onde existe retrabalho, perda de tempo ou dependência manual. O comitê
                analisará o contexto informado.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-brand-900 px-4 py-3 text-white shadow-[0_18px_42px_rgba(18,95,157,0.25)]">
              <ClipboardList size={20} />
              <div>
                <p className="text-xs text-brand-100">Fluxo guiado</p>
                <p className="text-sm font-semibold">8 etapas rápidas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <ProgressIndicator
            currentStep={stepIndex}
            totalSteps={steps.length}
            labels={steps.map((step) => step.label)}
          />

          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormStep
              key={stepIndex}
              eyebrow={currentStep.eyebrow}
              title={currentStep.title}
              description={currentStep.description}
            >
              {stepIndex === 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Nome completo"
                    value={form.nome_completo}
                    onChange={(event) => setField('nome_completo', event.target.value)}
                    autoComplete="name"
                  />
                  <InputField label="E-mail" value={email ?? ''} disabled />
                  <SelectField
                    label="Setor"
                    value={form.setor_id}
                    onChange={(event) => handleSetorChange(event.target.value)}
                    options={toIdSelectOptions(SETORES_OPCOES)}
                  />
                  <SelectField
                    label="Cargo"
                    value={form.cargo_id}
                    onChange={(event) => setField('cargo_id', event.target.value)}
                    options={toIdSelectOptions(cargoOptions)}
                    disabled={!form.setor_id}
                    placeholder={form.setor_id ? 'Selecione' : 'Selecione um setor primeiro'}
                  />
                </div>
              ) : null}

              {stepIndex === 1 ? (
                <InputField
                  label="Qual processo, atividade ou rotina está gerando dificuldade?"
                  value={form.processo_alvo}
                  onChange={(event) => setField('processo_alvo', event.target.value)}
                  placeholder="Ex.: conferência de ASO, controle de exames, fechamento financeiro"
                  helper="Use um nome simples para ajudar o comitê a localizar a rotina."
                />
              ) : null}

              {stepIndex === 2 ? (
                <TextareaField
                  label="Explique como essa atividade funciona hoje."
                  value={form.funcionamento_atual}
                  onChange={(event) => setField('funcionamento_atual', event.target.value)}
                  rows={7}
                  placeholder="Descreva etapas, pessoas envolvidas, sistemas usados, planilhas, e-mails ou pontos de espera."
                  helper="Não é necessário sugerir uma solução técnica."
                />
              ) : null}

              {stepIndex === 3 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="Com que frequência isso acontece?"
                    value={form.frequencia}
                    onChange={(event) =>
                      setField('frequencia', event.target.value as FormState['frequencia'])
                    }
                    options={toSelectOptions(FREQUENCIA_OPCOES)}
                  />
                  <SelectField
                    label="Qual o impacto operacional percebido?"
                    value={form.impacto_operacional}
                    onChange={(event) =>
                      setField(
                        'impacto_operacional',
                        event.target.value as FormState['impacto_operacional'],
                      )
                    }
                    options={toSelectOptions(IMPACTO_OPERACIONAL_OPCOES)}
                  />
                  <SelectField
                    label="Quantas pessoas são impactadas?"
                    value={form.pessoas_impactadas}
                    onChange={(event) =>
                      setField(
                        'pessoas_impactadas',
                        event.target.value as FormState['pessoas_impactadas'],
                      )
                    }
                    options={toSelectOptions(PESSOAS_IMPACTADAS_OPCOES)}
                  />
                  <SelectField
                    label="Quanto tempo aproximadamente é perdido?"
                    value={form.tempo_perdido}
                    onChange={(event) =>
                      setField('tempo_perdido', event.target.value as FormState['tempo_perdido'])
                    }
                    options={toSelectOptions(TEMPO_PERDIDO_OPCOES)}
                    helper="Se não souber estimar exatamente, informe uma aproximação."
                  />
                </div>
              ) : null}

              {stepIndex === 4 ? (
                <div className="grid gap-4">
                  <BooleanQuestion
                    checked={form.usa_planilha}
                    label="Essa rotina depende de planilha?"
                    detailLabel="Como a planilha é usada nessa rotina?"
                    detailValue={form.descricao_planilha}
                    onCheckedChange={(value) => setField('usa_planilha', value)}
                    onDetailChange={(value) => setField('descricao_planilha', value)}
                  />
                  <BooleanQuestion
                    checked={form.usa_email}
                    label="Essa rotina depende de troca de e-mails?"
                    detailLabel="Como os e-mails entram nesse processo?"
                    detailValue={form.descricao_email}
                    onCheckedChange={(value) => setField('usa_email', value)}
                    onDetailChange={(value) => setField('descricao_email', value)}
                  />
                  <BooleanQuestion
                    checked={form.atividade_repetitiva}
                    label="Existe atividade repetitiva ou manual?"
                    detailLabel="Qual atividade precisa ser repetida manualmente?"
                    detailValue={form.descricao_atividade_repetitiva}
                    onCheckedChange={(value) => setField('atividade_repetitiva', value)}
                    onDetailChange={(value) => setField('descricao_atividade_repetitiva', value)}
                  />
                  <BooleanQuestion
                    checked={form.dependencia_pessoa}
                    label="A rotina depende de uma pessoa específica?"
                    detailLabel="Explique a dependência dessa pessoa."
                    detailValue={form.descricao_dependencia_pessoa}
                    onCheckedChange={(value) => setField('dependencia_pessoa', value)}
                    onDetailChange={(value) => setField('descricao_dependencia_pessoa', value)}
                  />
                </div>
              ) : null}

              {stepIndex === 5 ? (
                <div className="grid gap-5">
                  <TextareaField
                    label="Como seria o cenário ideal?"
                    value={form.resultado_ideal}
                    onChange={(event) => setField('resultado_ideal', event.target.value)}
                    rows={6}
                    placeholder="Descreva o resultado esperado para a operação, sem precisar propor tecnologia."
                    helper="Pense no que deveria ficar mais simples, rápido, seguro ou rastreável."
                  />
                  <SelectField
                    label="Qual é a urgência percebida?"
                    value={form.urgencia}
                    onChange={(event) =>
                      setField('urgencia', event.target.value as FormState['urgencia'])
                    }
                    options={toSelectOptions(URGENCIA_OPCOES)}
                  />
                </div>
              ) : null}

              {stepIndex === 6 ? (
                <TextareaField
                  label="Existe algum link, caminho interno, documento ou observação que ajude a entender o problema?"
                  value={form.referencia_evidencia}
                  onChange={(event) => setField('referencia_evidencia', event.target.value)}
                  rows={5}
                  placeholder="Ex.: caminho de pasta interna, link de sistema, nome de planilha ou observação complementar."
                  helper="Campo opcional. Não envie arquivos; o MVP não possui upload de anexos."
                />
              ) : null}

              {stepIndex === 7 ? (
                <ReviewContent form={form} />
              ) : null}
            </FormStep>

            {errors.length > 0 ? (
              <Alert tone="error">
                <p className="font-semibold">Revise antes de continuar:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </Alert>
            ) : null}

            {submitError ? <Alert tone="error">{submitError}</Alert> : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                disabled={stepIndex === 0 || submitting}
                icon={<ArrowLeft size={16} />}
              >
                Voltar
              </Button>

              {stepIndex < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  icon={<ArrowRight size={16} />}
                  className="sm:min-w-40"
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  icon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                  className="sm:min-w-48"
                >
                  Enviar solicitação
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

interface BooleanQuestionProps {
  checked: boolean;
  label: string;
  detailLabel: string;
  detailValue: string;
  onCheckedChange: (value: boolean) => void;
  onDetailChange: (value: string) => void;
}

function BooleanQuestion({
  checked,
  label,
  detailLabel,
  detailValue,
  onCheckedChange,
  onDetailChange,
}: BooleanQuestionProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 motion-reduce:transition-none ${
        checked
          ? 'border-brand-200 bg-brand-50/70 shadow-[0_16px_36px_rgba(21,120,194,0.1)]'
          : 'border-slate-200 bg-white hover:border-brand-100 hover:shadow-[0_12px_32px_rgba(15,23,42,0.06)]'
      }`}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
        />
        <span>
          <span className="block text-sm font-semibold text-slate-900">{label}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Marque somente se isso fizer parte do problema informado.
          </span>
        </span>
      </label>

      {checked ? (
        <div className="notice-enter mt-4">
          <TextareaField
            label={detailLabel}
            value={detailValue}
            onChange={(event) => onDetailChange(event.target.value)}
            rows={3}
          />
        </div>
      ) : null}
    </div>
  );
}

function ReviewContent({ form }: { form: FormState }) {
  const retrabalho = [
    form.usa_planilha ? 'Depende de planilha' : null,
    form.usa_email ? 'Depende de troca de e-mails' : null,
    form.atividade_repetitiva ? 'Possui atividade repetitiva ou manual' : null,
    form.dependencia_pessoa ? 'Depende de uma pessoa específica' : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="grid gap-4">
      <Alert tone="info">
        Confira as informações antes de enviar. Após o envio, a solicitação será analisada pelo
        comitê interno.
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <ReviewCard
          title="Identificação"
          items={[
            ['Nome', form.nome_completo || 'Não informado'],
            ['Setor', getSetorNome(form.setor_id)],
            ['Cargo', getCargoNome(form.setor_id, form.cargo_id)],
          ]}
        />
        <ReviewCard
          title="Impacto informado"
          items={[
            ['Frequência', getOptionLabel(FREQUENCIA_OPCOES, form.frequencia)],
            ['Impacto operacional', getOptionLabel(IMPACTO_OPERACIONAL_OPCOES, form.impacto_operacional)],
            ['Pessoas impactadas', getOptionLabel(PESSOAS_IMPACTADAS_OPCOES, form.pessoas_impactadas)],
            ['Tempo perdido', getOptionLabel(TEMPO_PERDIDO_OPCOES, form.tempo_perdido)],
            ['Urgência', getOptionLabel(URGENCIA_OPCOES, form.urgencia)],
          ]}
        />
      </div>

      <ReviewBlock title="Processo afetado" value={form.processo_alvo} />
      <ReviewBlock title="Como funciona hoje" value={form.funcionamento_atual} />
      <ReviewBlock title="Sinais de retrabalho" value={retrabalho.join(', ') || 'Nenhum marcado'} />
      <ReviewBlock title="Resultado esperado" value={form.resultado_ideal} />
      <ReviewBlock
        title="Referência de evidência"
        value={form.referencia_evidencia || 'Não informado'}
      />
    </div>
  );
}

function ReviewCard({ title, items }: { title: string; items: readonly [string, string][] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <FileCheck2 size={16} className="text-brand-700" />
        {title}
      </h3>
      <dl className="mt-3 space-y-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ReviewBlock({ title, value }: { title: string; value: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {value || 'Não informado'}
      </p>
    </section>
  );
}
