import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogIn, Mail } from 'lucide-react';

import { AuthLayout } from '../components/auth/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/Field';
import { ROTAS } from '../lib/constants';
import { getFriendlyFirebaseError } from '../lib/firebase-errors';
import { isEmailCorporativoValido } from '../lib/validators';
import { entrarComEmailSenha, enviarRecuperacaoSenha } from '../services/firebase/auth.service';
import { useAuth } from '../hooks/useAuth';

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isEmailVerified } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? ROTAS.formulario;

  if (user && isEmailVerified) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!isEmailCorporativoValido(email)) {
      setError('Use um e-mail corporativo @protege.med.br.');
      return;
    }

    if (!senha.trim()) {
      setError('Informe sua senha.');
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await entrarComEmailSenha(email, senha);
      navigate(loggedUser.emailVerified ? redirectTo : ROTAS.verificarEmail, { replace: true });
    } catch (loginError) {
      setError(getFriendlyFirebaseError(loginError));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    setError(null);
    setNotice(null);

    if (!isEmailCorporativoValido(email)) {
      setError('Informe seu e-mail @protege.med.br para recuperar a senha.');
      return;
    }

    setResetLoading(true);

    try {
      await enviarRecuperacaoSenha(email);
      setNotice('Enviamos as instruções de recuperação para o seu e-mail.');
    } catch (resetError) {
      setError(getFriendlyFirebaseError(resetError));
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Entrar no portal"
      description="Acesse com seu e-mail corporativo para registrar demandas de automação interna e melhoria digital."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          label="E-mail corporativo"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="seu.nome@protege.med.br"
        />

        <InputField
          label="Senha"
          type="password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="current-password"
        />

        {error ? <Alert tone="error">{error}</Alert> : null}
        {notice ? <Alert tone="success">{notice}</Alert> : null}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
          icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn size={16} />}
        >
          Entrar
        </Button>
      </form>

      <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <Link to={ROTAS.cadastro} className="font-medium text-brand-700 hover:text-brand-800">
          Criar cadastro
        </Link>
        <button
          type="button"
          onClick={() => void handlePasswordReset()}
          disabled={resetLoading}
          className="inline-flex items-center gap-2 font-semibold text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail size={15} />}
          Recuperar senha
        </button>
      </div>
    </AuthLayout>
  );
}
