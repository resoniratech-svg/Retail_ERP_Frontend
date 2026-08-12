import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials } from '@qatar-erp/types';
import { UserRole } from '@qatar-erp/config';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  switchBranch: (branchId: string, branchName: string) => void;
  checkPermission: (permission: string) => boolean;
}

const AUTH_STORAGE_KEY = 'qatar_erp_user';
const LOGGED_OUT_KEY = 'qatar_erp_logged_out';

const DEFAULT_USER: User = {
  id: 'user-001',
  username: 'admin',
  email: 'admin@qatar-erp.qa',
  firstName: 'Ahmed',
  lastName: 'Al-Mansouri',
  role: UserRole.SUPER_ADMIN,
  permissions: ['*:*'],
  branchId: 'br-doha-01',
  branchName: 'Doha Main Branch',
  companyId: 'comp-qatar-01',
  isActive: true,
};

const getInitialUser = (): User | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as User;
    }
    const isExplicitLoggedOut = localStorage.getItem(LOGGED_OUT_KEY) === 'true';
    if (!isExplicitLoggedOut) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return null;
  } catch (e) {
    return DEFAULT_USER;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const loggedInUser: User = {
      id: 'user-001',
      username: credentials.username || 'admin',
      email: 'admin@qatar-erp.qa',
      firstName: 'Ahmed',
      lastName: 'Al-Mansouri',
      role: UserRole.SUPER_ADMIN,
      permissions: ['*:*'],
      branchId: 'br-doha-01',
      branchName: 'Doha Main Branch',
      companyId: 'comp-qatar-01',
      isActive: true,
    };
    setUser(loggedInUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
    localStorage.removeItem(LOGGED_OUT_KEY);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.setItem(LOGGED_OUT_KEY, 'true');
  };

  const switchBranch = (branchId: string, branchName: string) => {
    if (user) {
      const updated = { ...user, branchId, branchName };
      setUser(updated);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*:*') || user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchBranch,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
