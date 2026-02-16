import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, User } from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { auth } from './firebase';

const DEMO_USER_STORAGE_KEY = 'powergrid-demo-user';
const DEMO_AUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH !== 'false';

const DEMO_FALLBACK_ERROR_CODES = new Set([
  'auth/network-request-failed',
  'auth/invalid-api-key',
  'auth/unauthorized-domain',
  'auth/operation-not-allowed',
  'auth/too-many-requests',
  'auth/internal-error',
]);

export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  isDemo: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInDemo: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  demoEnabled: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInDemo: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  demoEnabled: false,
});

export const useAuth = () => useContext(AuthContext);

const toAuthUser = (firebaseUser: User): AuthUser => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  emailVerified: firebaseUser.emailVerified,
  isDemo: false,
});

const createDemoUser = (email: string): AuthUser => ({
  uid: `demo-${Date.now()}`,
  email,
  emailVerified: true,
  isDemo: true,
});

const getDemoUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.uid || !parsed?.email) return null;
    return { ...parsed, isDemo: true };
  } catch {
    return null;
  }
};

const saveDemoUser = (user: AuthUser | null) => {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
};

const canFallbackToDemo = (error: unknown): boolean => {
  if (!DEMO_AUTH_ENABLED) return false;
  const code = (error as FirebaseError | undefined)?.code;
  if (!code) return true;
  return DEMO_FALLBACK_ERROR_CODES.has(code);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const normalized = toAuthUser(firebaseUser);
        setUser(normalized);
        saveDemoUser(null);
      } else if (DEMO_AUTH_ENABLED) {
        setUser(getDemoUser());
      } else {
        setUser(null);
      }
      setLoading(false);
    }, () => {
      if (DEMO_AUTH_ENABLED) {
        setUser(getDemoUser());
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (!canFallbackToDemo(error)) {
        throw error;
      }
      const demoUser = createDemoUser(email.trim().toLowerCase() || 'demo@powergrid.local');
      saveDemoUser(demoUser);
      setUser(demoUser);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
    } catch (error) {
      if (!canFallbackToDemo(error)) {
        throw error;
      }
      const demoUser = createDemoUser(email.trim().toLowerCase() || 'demo@powergrid.local');
      saveDemoUser(demoUser);
      setUser(demoUser);
    }
  };

  const signInDemo = async (email = 'demo@powergrid.local') => {
    const demoUser = createDemoUser(email.trim().toLowerCase() || 'demo@powergrid.local');
    saveDemoUser(demoUser);
    setUser(demoUser);
  };

  const logout = async () => {
    let logoutError: unknown = null;
    try {
      await signOut(auth);
    } catch (error) {
      logoutError = error;
    } finally {
      saveDemoUser(null);
      setUser(null);
    }
    if (logoutError && !DEMO_AUTH_ENABLED) {
      throw logoutError;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (!canFallbackToDemo(error)) {
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInDemo, logout, resetPassword, demoEnabled: DEMO_AUTH_ENABLED }}>
      {children}
    </AuthContext.Provider>
  );
};
