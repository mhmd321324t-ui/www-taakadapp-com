import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { clearLovableAuthStorage, isRefreshTokenNotFoundError } from '@/lib/authStorage';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!alive) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading((prev) => (prev ? false : prev));
    });

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error && isRefreshTokenNotFoundError(error)) {
          // Broken local session: clear and force local sign-out so the app can recover.
          clearLovableAuthStorage();
          await supabase.auth.signOut({ scope: 'local' }).catch(() => {});

          if (!alive) return;
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        if (!alive) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      } catch (err) {
        if (!alive) return;
        if (isRefreshTokenNotFoundError(err)) {
          clearLovableAuthStorage();
          await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        }
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    clearLovableAuthStorage();
    await supabase.auth.signOut({ scope: 'local' });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
