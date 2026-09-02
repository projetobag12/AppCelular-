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
  switchDemoRole: (newRole: UserRole) => void;
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
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0]; // Inicia com o Administrador padrão
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Se logado com Google
        const isMasterAdmin = user.email === 'projetobag12@gmail.com' || user.email?.includes('admin');
        const role: UserRole = isMasterAdmin ? 'ADMINISTRADOR' : 'GESTOR';
        const userObj: User = {
          id: user.uid,
          email: user.email || 'usuario@multivale.com.br',
          name: user.displayName || user.email?.split('@')[0] || 'Usuário Multivale',
          role,
          status: 'ATIVO',
          department: 'TI & Segurança',
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
      const isMasterAdmin = user.email === 'projetobag12@gmail.com' || user.email?.includes('admin');
      const userObj: User = {
        id: user.uid,
        email: user.email || 'usuario@multivale.com.br',
        name: user.displayName || 'Usuário Multivale',
        role: isMasterAdmin ? 'ADMINISTRADOR' : 'GESTOR',
        status: 'ATIVO',
        department: 'Tecnologia da Informação',
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
      // Suporte a autenticação direta pelo Firebase ou perfil local de simulação
      try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        const user = result.user;
        const matched = INITIAL_USERS.find((u) => u.email === email);
        const role: UserRole = matched?.role || (email.includes('admin') ? 'ADMINISTRADOR' : 'GESTOR');
        const userObj: User = {
          id: user.uid,
          email: user.email || email,
          name: matched?.name || email.split('@')[0],
          role,
          status: 'ATIVO',
          department: matched?.department || 'Tecnologia da Informação',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        setCurrentUser(userObj);
        localStorage.setItem('multivale_user', JSON.stringify(userObj));
      } catch {
        // Fallback para credenciais corporativas pré-cadastradas
        const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (matched) {
          setCurrentUser(matched);
          localStorage.setItem('multivale_user', JSON.stringify(matched));
        } else {
          // Criar sessão de usuário
          const role: UserRole = email.includes('admin') ? 'ADMINISTRADOR' : 'GESTOR';
          const newUser: User = {
            id: `usr-${Date.now()}`,
            email,
            name: email.split('@')[0].toUpperCase(),
            role,
            status: 'ATIVO',
            department: 'Operações Corporativas',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };
          setCurrentUser(newUser);
          localStorage.setItem('multivale_user', JSON.stringify(newUser));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = (newRole: UserRole) => {
    const demoUser = INITIAL_USERS.find((u) => u.role === newRole) || {
      id: `usr-${newRole.toLowerCase()}`,
      email: `${newRole.toLowerCase()}@multivale.com.br`,
      name: newRole === 'ADMINISTRADOR' ? 'Administrador TI Multivale' : newRole === 'GESTOR' ? 'Fernando Guimarães (Gestor)' : 'Mariana Rocha (Auditora)',
      role: newRole,
      status: 'ATIVO',
      department: newRole === 'ADMINISTRADOR' ? 'TI & Segurança' : newRole === 'GESTOR' ? 'Operações & Frota' : 'Auditoria',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    setCurrentUser(demoUser);
    localStorage.setItem('multivale_user', JSON.stringify(demoUser));
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

  const role: UserRole = currentUser?.role || 'VISUALIZACAO';
  const isAdmin = role === 'ADMINISTRADOR';
  const isManagerOrAdmin = role === 'ADMINISTRADOR' || role === 'GESTOR';
  const isViewer = role === 'VISUALIZACAO';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        switchDemoRole,
        logout,
        isAdmin,
        isManagerOrAdmin,
        isViewer,
        canManagePolicies: isAdmin,
        canManageDevices: isManagerOrAdmin,
        canManageApps: isAdmin,
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
