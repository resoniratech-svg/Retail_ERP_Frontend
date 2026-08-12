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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
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
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setUser({
      id: 'user-001',
      username: credentials.username || 'cashier',
      email: 'user@qatar-erp.qa',
      firstName: 'Cashier',
      lastName: 'Staff',
      role: UserRole.CASHIER,
      permissions: ['pos:sale', 'pos:cart', 'product:view'],
      branchId: 'br-doha-01',
      branchName: 'Doha Main Branch',
      isActive: true,
    });
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchBranch = (branchId: string, branchName: string) => {
    if (user) {
      setUser({ ...user, branchId, branchName });
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
