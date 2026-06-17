import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogIn, Mail } from 'lucide-react';

import { AuthLayout } from '../components/auth/AuthLayout';
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
      setNotice('Enviamos as instrucoes de recuperacao para o seu e-mail.');
    } catch (resetError) {
      setError(getFriendlyFirebaseError(resetError));
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Entrar no portal"
      description="Acesse com seu e-mail corporativo para registrar uma oportunidade de melhoria."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">E-mail corporativo</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="seu.nome@protege.med.br"
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn size={16} />}
          Entrar
        </button>
      </form>

      <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <Link to={ROTAS.cadastro} className="font-medium text-brand-700 hover:text-brand-800">
          Criar cadastro
        </Link>
        <button
          type="button"
          onClick={() => void handlePasswordReset()}
          disabled={resetLoading}
          className="inline-flex items-center gap-2 font-medium text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail size={15} />}
          Recuperar senha
        </button>
      </div>
    </AuthLayout>
  );
}
