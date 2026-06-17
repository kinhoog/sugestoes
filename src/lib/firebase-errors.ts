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
      return 'Este e-mail ja possui cadastro. Tente entrar ou recuperar a senha.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha invalidos.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas em sequencia. Aguarde alguns minutos e tente novamente.';
    case 'auth/invalid-email':
      return 'Informe um e-mail valido.';
    case 'permission-denied':
      return 'A operacao foi bloqueada pelas regras de seguranca. Confirme login, dominio e verificacao de e-mail.';
    case 'unavailable':
      return 'O Firebase ficou indisponivel por instantes. Tente novamente.';
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }

      return 'Nao foi possivel concluir a operacao. Tente novamente.';
  }
}
