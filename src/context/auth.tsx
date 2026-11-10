import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { ApiError } from '@/api/client';
import { forgotPassword, resendVerificationEmail, signInAccount, signUpAccount } from '@/api/mpuza';
import { clearToken, getToken, saveToken, userFromToken, type SessionUser } from '@/api/session';

export type User = { id?: string; name: string; email: string };

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Creates the account and sends a verification email. Does NOT sign the user in. */
  signUp: (name: string, email: string, password: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  /** Asks the server to email a password-reset link. */
  requestPasswordReset: (email: string) => Promise<void>;
  signOut: () => void;
  /** Saves a session token returned by Google sign-in. */
  adoptToken: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function messageOf(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getToken()
      .then((token) => {
        if (!token) return;
        const session = userFromToken(token);
        if (!session) {
          clearToken().catch(() => {});
          return;
        }
        setUser(session);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const data = await signInAccount(email.trim(), password);
      await saveToken(data.token);
      const session: SessionUser = userFromToken(data.token) ?? {
        id: data.id,
        name: [data.firstname, data.lastname].filter(Boolean).join(' ') || data.email,
        email: data.email,
      };
      setUser(session);
    } catch (error) {
      throw new Error(messageOf(error));
    }
  }

  async function signUp(name: string, email: string, password: string) {
    const parts = name.trim().split(/\s+/);
    const firstname = parts[0] ?? name.trim();
    const lastname = parts.slice(1).join(' ') || firstname;
    try {
      await signUpAccount({ firstname, lastname, email: email.trim(), password });
    } catch (error) {
      throw new Error(messageOf(error));
    }
  }

  async function resendVerification(email: string) {
    try {
      await resendVerificationEmail(email.trim());
    } catch (error) {
      throw new Error(messageOf(error));
    }
  }

  async function requestPasswordReset(email: string) {
    try {
      await forgotPassword(email.trim());
    } catch (error) {
      throw new Error(messageOf(error));
    }
  }

  async function adoptToken(token: string) {
    const session = userFromToken(token);
    if (!session) throw new Error('Google sign-in did not return a valid session.');
    await saveToken(token);
    setUser(session);
  }

  function signOut() {
    setUser(null);
    clearToken().catch(() => {});
  }

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signUp, resendVerification, requestPasswordReset, signOut, adoptToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
