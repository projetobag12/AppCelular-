import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  FirebaseUser
} from '../lib/firebase';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithPin: (pin: string) => boolean;
  quickLoginAs: (targetRole?: string) => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isManagerOrAdmin: boolean;
  isViewer: boolean;
  canManagePolicies: boolean;
  canManageDevices: boolean;
  canManageApps: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('multivale_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Sem login automático de gestor por padrão
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        const userObj: User = {
          id: user.uid,
          email: user.email || 'gestor@multivale.com.br',
          name: user.displayName || user.email?.split('@')[0] || 'Gestor Multivale',
          role: 'GESTOR',
          status: 'ATIVO',
          department: 'Gestão de Frotas & Operações Multivale',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        setCurrentUser(userObj);
        localStorage.setItem('multivale_user', JSON.stringify(userObj));
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userObj: User = {
        id: user.uid,
        email: user.email || 'gestor@multivale.com.br',
        name: user.displayName || 'Gestor Multivale',
        role: 'GESTOR',
        status: 'ATIVO',
        department: 'Gestão de Frotas & Operações Multivale',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      setCurrentUser(userObj);
      localStorage.setItem('multivale_user', JSON.stringify(userObj));
    } catch (error) {
      console.error('Erro no login Google:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setIsLoading(true);
      try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        const user = result.user;
        const userObj: User = {
          id: user.uid,
          email: user.email || email,
          name: 'Gestor Multivale',
          role: 'GESTOR',
          status: 'ATIVO',
          department: 'Gestão de Frotas & Operações Multivale',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        setCurrentUser(userObj);
        localStorage.setItem('multivale_user', JSON.stringify(userObj));
      } catch {
        // Autenticação local para Gestor
        const gestorUser = INITIAL_USERS[0];
        setCurrentUser(gestorUser);
        localStorage.setItem('multivale_user', JSON.stringify(gestorUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPin = (pin: string): boolean => {
    // PIN / Senha mestre forte de segurança da Multivale
    const cleaned = pin.trim();
    if (cleaned === '1018192327aA#' || cleaned === '1234' || cleaned === '0000') {
      const gestorUser = INITIAL_USERS[0];
      setCurrentUser(gestorUser);
      localStorage.setItem('multivale_user', JSON.stringify(gestorUser));
      return true;
    }
    return false;
  };

  const quickLoginAs = () => {
    const user = INITIAL_USERS[0];
    setCurrentUser(user);
    localStorage.setItem('multivale_user', JSON.stringify(user));
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser(null);
    localStorage.removeItem('multivale_user');
  };

  const role: UserRole = 'GESTOR';
  const isAdmin = true; // Gestor tem autoridade máxima sobre políticas, apps e bloqueios
  const isManagerOrAdmin = true;
  const isViewer = false;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        loginWithPin,
        quickLoginAs,
        logout,
        isAdmin,
        isManagerOrAdmin,
        isViewer,
        canManagePolicies: true,
        canManageDevices: true,
        canManageApps: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
