import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
  type Unsubscribe,
} from '@firebase/auth';

import { ADMIN_EMAILS, PROTEGE_EMAIL_DOMAIN } from '../../lib/constants';
import { requireFirebaseAuth } from './client';

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmailCorporativo(email: string): boolean {
  return normalizarEmail(email).endsWith(PROTEGE_EMAIL_DOMAIN);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(normalizarEmail(email) as (typeof ADMIN_EMAILS)[number]);
}

export async function criarContaComEmailSenha(
  email: string,
  senha: string,
  nomeCompleto?: string,
): Promise<User> {
  const emailNormalizado = normalizarEmail(email);

  if (!isEmailCorporativo(emailNormalizado)) {
    throw new Error(`Use um e-mail corporativo ${PROTEGE_EMAIL_DOMAIN}.`);
  }

  const auth = requireFirebaseAuth();
  const credencial = await createUserWithEmailAndPassword(auth, emailNormalizado, senha);

  if (nomeCompleto?.trim()) {
    await updateProfile(credencial.user, { displayName: nomeCompleto.trim() });
  }

  await sendEmailVerification(credencial.user);
  await firebaseSignOut(auth);

  return credencial.user;
}

export async function entrarComEmailSenha(email: string, senha: string): Promise<User> {
  const emailNormalizado = normalizarEmail(email);

  if (!isEmailCorporativo(emailNormalizado)) {
    throw new Error(`Use um e-mail corporativo ${PROTEGE_EMAIL_DOMAIN}.`);
  }

  const auth = requireFirebaseAuth();
  const credencial = await signInWithEmailAndPassword(auth, emailNormalizado, senha);
  return credencial.user;
}

export async function reenviarVerificacaoEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function enviarRecuperacaoSenha(email: string): Promise<void> {
  const emailNormalizado = normalizarEmail(email);

  if (!isEmailCorporativo(emailNormalizado)) {
    throw new Error(`Use um e-mail corporativo ${PROTEGE_EMAIL_DOMAIN}.`);
  }

  await sendPasswordResetEmail(requireFirebaseAuth(), emailNormalizado);
}

export async function sair(): Promise<void> {
  await firebaseSignOut(requireFirebaseAuth());
}

export function observarSessao(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(requireFirebaseAuth(), callback);
}
