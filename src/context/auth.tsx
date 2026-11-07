import { createContext, useContext, useState, type ReactNode } from 'react';

export type User = { name: string; email: string };

type AuthContextValue = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * TEMPORARY in-memory auth so the screens work end to end.
 * Replace the bodies of signIn / signUp with real API calls (and persist the
 * session, e.g. with expo-secure-store) once the backend is ready.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function signIn(email: string, password: string) {
    await wait(900);
    if (password.length < 6) throw new Error('Incorrect email or password.');
    const name = email.split('@')[0];
    setUser({ name: name.charAt(0).toUpperCase() + name.slice(1), email });
  }

  async function signUp(name: string, email: string, _password: string) {
    await wait(1100);
    setUser({ name, email });
  }

  function signOut() {
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
