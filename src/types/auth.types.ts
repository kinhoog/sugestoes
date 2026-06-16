/**
 * Tipos de autenticação administrativa (Supabase Auth).
 */
import type { Session, User } from '@supabase/supabase-js';

/** Sessão administrativa resolvida no app. */
export interface AdminSession {
  user: User;
  session: Session;
  email: string;
}

/** Estado do contexto/hook de autenticação. */
export interface AuthState {
  session: Session | null;
  user: User | null;
  carregando: boolean;
}

export interface CredenciaisLogin {
  email: string;
  senha: string;
}
