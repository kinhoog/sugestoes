import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';

import { AuthLayout } from '../components/auth/AuthLayout';
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
      setError('A confirmacao de senha nao confere.');
      return;
    }

    setLoading(true);

    try {
      await criarContaComEmailSenha(email, senha, nomeCompleto);
      navigate(ROTAS.verificarEmail, { replace: true });
    } catch (registerError) {
      setError(getFriendlyFirebaseError(registerError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Criar cadastro"
      description="Cadastre-se com seu e-mail corporativo para acessar o formulario."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nome completo</span>
          <input
            type="text"
            value={nomeCompleto}
            onChange={(event) => setNomeCompleto(event.target.value)}
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

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
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Confirmar senha</span>
          <input
            type="password"
            value={confirmacaoSenha}
            onChange={(event) => setConfirmacaoSenha(event.target.value)}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus size={16} />}
          Criar cadastro
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Ja tem cadastro?{' '}
        <Link to={ROTAS.login} className="font-medium text-brand-700 hover:text-brand-800">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
