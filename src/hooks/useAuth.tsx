import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@firebase/auth';

import { isEmailCorporativo, observarSessao, sair } from '../services/firebase/auth.service';
import { requireFirebaseAuth } from '../services/firebase/client';
import { criarOuAtualizarPerfilUsuario } from '../services/firebase/firestore.service';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isCorporateEmail: boolean;
  isEmailVerified: boolean;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Nao foi possivel validar sua sessao.';
}

async function syncVerifiedProfile(user: User): Promise<void> {
  if (!user.emailVerified || !user.email || !isEmailCorporativo(user.email)) {
    return;
  }

  await criarOuAtualizarPerfilUsuario(user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    try {
      const unsubscribe = observarSessao((currentUser) => {
        if (!active) {
          return;
        }

        setUser(currentUser);
        setLoading(false);
        setError(null);
        setVersion((current) => current + 1);

        if (currentUser) {
          void syncVerifiedProfile(currentUser).catch((profileError: unknown) => {
            setError(getErrorMessage(profileError));
          });
        }
      });

      return () => {
        active = false;
        unsubscribe();
      };
    } catch (authError) {
      setError(getErrorMessage(authError));
      setLoading(false);
      return undefined;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = requireFirebaseAuth().currentUser;

    if (!currentUser) {
      setUser(null);
      setVersion((current) => current + 1);
      return null;
    }

    await currentUser.reload();
    await currentUser.getIdToken(true);

    const refreshedUser = requireFirebaseAuth().currentUser;
    setUser(refreshedUser);
    setVersion((current) => current + 1);

    if (refreshedUser) {
      await syncVerifiedProfile(refreshedUser);
    }

    return refreshedUser;
  }, []);

  const logout = useCallback(async () => {
    await sair();
    setUser(null);
    setVersion((current) => current + 1);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const email = user?.email?.toLowerCase() ?? null;

    return {
      user,
      loading,
      error,
      email,
      isAuthenticated: Boolean(user),
      isCorporateEmail: Boolean(email && isEmailCorporativo(email)),
      isEmailVerified: Boolean(user?.emailVerified),
      refreshUser,
      logout,
    };
  }, [user, loading, error, refreshUser, logout, version]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
