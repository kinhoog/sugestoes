import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, MailCheck, RefreshCw, Send } from 'lucide-react';

import { AuthLayout } from '../components/auth/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
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

      setNotice('Ainda não identificamos a verificação. Confira seu e-mail e tente novamente.');
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
      setError('Sessão inválida. Entre novamente.');
      return;
    }

    setSending(true);

    try {
      await reenviarVerificacaoEmail(user);
      setNotice('Enviamos um novo link de verificação.');
    } catch (resendError) {
      setError(getFriendlyFirebaseError(resendError));
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthLayout
      title="Verifique seu e-mail"
      description="Antes de acessar o formulário, confirme o link enviado para sua caixa de entrada."
      initialModalOpen
    >
      <div className="rounded-2xl border border-brand-100 bg-brand-50/80 p-4 shadow-[0_14px_36px_rgba(21,120,194,0.08)] dark:border-brand-500/30 dark:bg-brand-900/40 dark:shadow-[0_16px_42px_rgba(0,0,0,0.24)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-[0_10px_28px_rgba(21,120,194,0.14)] dark:bg-slate-900 dark:text-cyan-200">
            <MailCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{email}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Após clicar no link recebido por e-mail, volte aqui e atualize a validação.
            </p>
          </div>
        </div>
      </div>

      {error ? <Alert tone="error" className="mt-4">{error}</Alert> : null}
      {notice ? <Alert tone="info" className="mt-4">{notice}</Alert> : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={checking}
          icon={checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw size={16} />}
        >
          Já verifiquei
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleResend()}
          disabled={sending}
          icon={sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
        >
          Reenviar
        </Button>
      </div>

      <button
        type="button"
        onClick={() => void logout()}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      >
        <LogOut size={15} />
        Sair desta conta
      </button>
    </AuthLayout>
  );
}
