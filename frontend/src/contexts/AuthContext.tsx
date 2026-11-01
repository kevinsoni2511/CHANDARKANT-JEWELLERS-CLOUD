import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, Tenant, Branch } from '../types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchBranch: (branchId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cjc_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('cjc_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data.user);
          setTenant(res.data.data.tenant);
        }
      } catch (err) {
        localStorage.removeItem('cjc_token');
        setUser(null);
        setTenant(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user, tenant } = res.data.data;
        localStorage.setItem('cjc_token', token);
        if (tenant?.subdomain) {
          localStorage.setItem('cjc_subdomain', tenant.subdomain);
        }
        setToken(token);
        setUser(user);
        setTenant(tenant);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      // Ignore
    } finally {
      localStorage.removeItem('cjc_token');
      setToken(null);
      setUser(null);
      setTenant(null);
    }
  };

  const switchBranch = async (branchId: number) => {
    const res = await api.post('/auth/switch-branch', { branch_id: branchId });
    if (res.data.success && user) {
      setUser({ ...user, branch_id: branchId, branch: res.data.data.branch });
    }
  };

  return (
    <AuthContext.Provider value={{ user, tenant, token, isLoading, login, logout, switchBranch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
