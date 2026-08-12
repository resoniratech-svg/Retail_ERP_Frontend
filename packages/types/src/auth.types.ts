export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  branchId?: string;
  branchName?: string;
  companyId?: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
  pin?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
