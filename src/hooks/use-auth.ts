import { useState, useEffect, useCallback } from 'react';
import { apiFetch, setToken, clearToken, hasToken, getToken } from '@/lib/api-client';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  has_api_key: boolean;
}

export interface Session {
  token: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: validate existing token
  useEffect(() => {
    const init = async () => {
      if (!hasToken()) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await apiFetch<AuthUser>('/auth/me');
        const token = getToken()!;
        setUser(currentUser);
        setSession({ token });
      } catch {
        // Token is invalid or expired — clear it
        clearToken();
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiFetch<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setToken(result.token);
    setUser(result.user);
    setSession({ token: result.token });

    return result;
  }, []);

  const signUp = useCallback(async (email: string, password: string, full_name: string) => {
    const result = await apiFetch<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });

    setToken(result.token);
    setUser(result.user);
    setSession({ token: result.token });

    return result;
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
    setSession(null);
  }, []);

  const isAuthenticated = !!session;

  return { user, session, loading, signUp, signIn, signOut, isAuthenticated };
}
