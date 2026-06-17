import type { ADMIN_EMAILS } from '../lib/constants';

export type AdminEmail = (typeof ADMIN_EMAILS)[number];
export type PerfilUsuario = 'admin' | 'colaborador';

export interface UsuarioPerfil {
  uid: string;
  email: string;
  nome_completo: string | null;
  perfil: PerfilUsuario;
  email_verificado: boolean;
  created_at?: unknown;
  updated_at?: unknown;
}
