import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, MailCheck, RefreshCw, Send } from 'lucide-react';

import { AuthLayout } from '../components/auth/AuthLayout';
import { ROTAS } from '../lib/constants';
import { getFriendlyFirebaseError } from '../lib/firebase-errors';
import { reenviarVerificacaoEmail } from '../services/firebase/auth.service';
import { useAuth } from '../hooks/useAuth';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const { user, email, isEmailVerified, refreshUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!user) {
    return <Navigate to={ROTAS.login} replace />;
  }

  if (isEmailVerified) {
    return <Navigate to={ROTAS.formulario} replace />;
  }

  async function handleRefresh() {
    setError(null);
    setNotice(null);
    setChecking(true);

    try {
      const refreshedUser = await refreshUser();

      if (refreshedUser?.emailVerified) {
        navigate(ROTAS.formulario, { replace: true });
        return;
      }

      setNotice('Ainda nao identificamos a verificacao. Confira seu e-mail e tente novamente.');
    } catch (refreshError) {
      setError(getFriendlyFirebaseError(refreshError));
    } finally {
      setChecking(false);
    }
  }

  async function handleResend() {
    setError(null);
    setNotice(null);

    if (!user) {
      setError('Sessao invalida. Entre novamente.');
      return;
    }

    setSending(true);

    try {
      await reenviarVerificacaoEmail(user);
      setNotice('Enviamos um novo link de verificacao.');
    } catch (resendError) {
      setError(getFriendlyFirebaseError(resendError));
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthLayout
      title="Verifique seu e-mail"
      description="Antes de acessar o formulario, confirme o link enviado pelo Firebase para sua caixa de entrada."
    >
      <div className="rounded-md border border-brand-100 bg-brand-50 p-4">
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 h-5 w-5 text-brand-700" />
          <div>
            <p className="text-sm font-medium text-slate-900">{email}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Apos clicar no link recebido por e-mail, volte aqui e atualize a validacao.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {notice}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={checking}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw size={16} />}
          Ja verifiquei
        </button>
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
          Reenviar
        </button>
      </div>

      <button
        type="button"
        onClick={() => void logout()}
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <LogOut size={15} />
        Sair desta conta
      </button>
    </AuthLayout>
  );
}
