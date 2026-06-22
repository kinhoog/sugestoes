import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';

import { AuthLayout } from '../components/auth/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/Field';
import { ROTAS } from '../lib/constants';
import { getFriendlyFirebaseError } from '../lib/firebase-errors';
import { isEmailCorporativoValido, isPreenchido } from '../lib/validators';
import { criarContaComEmailSenha } from '../services/firebase/auth.service';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const navigate = useNavigate();
  const { user, isEmailVerified } = useAuth();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user && isEmailVerified) {
    return <Navigate to={ROTAS.formulario} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isPreenchido(nomeCompleto)) {
      setError('Informe seu nome completo.');
      return;
    }

    if (!isEmailCorporativoValido(email)) {
      setError('Use um e-mail corporativo @protege.med.br.');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmacaoSenha) {
      setError('A confirmação de senha não confere.');
      return;
    }

    setLoading(true);

    try {
      await criarContaComEmailSenha(email, senha, nomeCompleto);
      navigate(ROTAS.login, {
        replace: true,
        state: {
          notice:
            'Cadastro criado com sucesso. Verifique seu e-mail corporativo antes de acessar o portal.',
        },
      });
    } catch (registerError) {
      setError(getFriendlyFirebaseError(registerError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Criar cadastro"
      description="Crie seu acesso corporativo para registrar demandas de automação de rotinas e melhoria de processos."
      variant="register"
      initialModalOpen
    >
      <form className="space-y-3" onSubmit={handleSubmit}>
        <InputField
          label="Nome completo"
          type="text"
          value={nomeCompleto}
          onChange={(event) => setNomeCompleto(event.target.value)}
          autoComplete="name"
          className="[padding-bottom:0.5rem] [padding-top:0.5rem]"
        />

        <InputField
          label="E-mail corporativo"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="exemplo@protege.med.br"
          className="[padding-bottom:0.5rem] [padding-top:0.5rem]"
        />

        <InputField
          label="Senha"
          type="password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="new-password"
          helper="Use pelo menos 6 caracteres."
          className="[padding-bottom:0.5rem] [padding-top:0.5rem]"
        />

        <InputField
          label="Confirmar senha"
          type="password"
          value={confirmacaoSenha}
          onChange={(event) => setConfirmacaoSenha(event.target.value)}
          autoComplete="new-password"
          className="[padding-bottom:0.5rem] [padding-top:0.5rem]"
        />

        {error ? <Alert tone="error">{error}</Alert> : null}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
          icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus size={16} />}
        >
          Criar cadastro
        </Button>
      </form>

      <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300">
        Já tem cadastro?{' '}
        <Link
          to={ROTAS.login}
          className="font-medium text-brand-700 hover:text-brand-800 dark:text-cyan-200 dark:hover:text-cyan-100"
        >
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
