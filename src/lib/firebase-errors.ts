function getErrorCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

export function getFriendlyFirebaseError(error: unknown): string {
  const code = getErrorCode(error);

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já possui cadastro. Tente entrar ou recuperar a senha.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha inválidos.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas em sequência. Aguarde alguns minutos e tente novamente.';
    case 'auth/invalid-email':
      return 'Informe um e-mail válido.';
    case 'permission-denied':
      return 'A operação foi bloqueada pelas regras de segurança. Confirme login, domínio e verificação de e-mail.';
    case 'unavailable':
      return 'O Firebase ficou indisponivel por instantes. Tente novamente.';
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }

      return 'Não foi possível concluir a operação. Tente novamente.';
  }
}
