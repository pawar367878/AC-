import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Customer, ServiceProvider, UserRole, AppNotification } from '../types.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  technician: ServiceProvider | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<User | null>;
  loginCustomerDemo: () => Promise<boolean>;
  registerCustomer: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
  }) => Promise<boolean>;
  registerTechnician: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
    services_provided?: string[];
  }) => Promise<boolean>;
  registerOwner: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
  }) => Promise<boolean>;
  logout: () => void;
  switchUserByEmail: (email: string) => Promise<boolean>;
  notifications: AppNotification[];
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [technician, setTechnician] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // On initial mount, rehydrate saved user if present
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedSessionStr = localStorage.getItem('smartac_user_session');
        if (savedSessionStr) {
          try {
            const sess = JSON.parse(savedSessionStr);
            if (sess.token || sess.userId) {
              const res = await api.restoreSession(sess.token, sess.userId);
              if (res.success) {
                setUser(res.user);
                setCustomer(res.customer);
                setTechnician(res.technician);
                return;
              }
            }
          } catch (e) {
            console.warn('Failed parsing saved session', e);
          }
        }

        const savedId = localStorage.getItem('smartac_user_identifier');
        if (savedId) {
          const res = await api.restoreSession(undefined, savedId);
          if (res.success) {
            setUser(res.user);
            setCustomer(res.customer);
            setTechnician(res.technician);
          }
        }
      } catch (err) {
        console.warn('Initial session restore skipped:', err);
        localStorage.removeItem('smartac_user_session');
        localStorage.removeItem('smartac_user_identifier');
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications(user.role, user.id);
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      // Poll notifications every 10 seconds for real-time responsiveness
      const interval = setInterval(refreshNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user, refreshNotifications]);

  const login = async (identifier: string, password?: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      const res = await api.login(identifier, password);
      if (res.success) {
        setUser(res.user);
        setCustomer(res.customer);
        setTechnician(res.technician);
        localStorage.setItem(
          'smartac_user_session',
          JSON.stringify({
            userId: res.user.id,
            role: res.user.role,
            token: res.token,
            identifier,
          })
        );
        localStorage.setItem('smartac_user_identifier', identifier);
        return res.user;
      }
      return null;
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginCustomerDemo = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.login('customer', 'customer123');
      if (res.success) {
        setUser(res.user);
        setCustomer(res.customer);
        setTechnician(null);
        localStorage.setItem(
          'smartac_user_session',
          JSON.stringify({
            userId: res.user.id,
            role: res.user.role,
            token: res.token,
            identifier: 'customer',
          })
        );
        localStorage.setItem('smartac_user_identifier', 'customer');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Customer demo login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerCustomer = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.registerCustomer(data);
      if (res.success) {
        setUser(res.user);
        setCustomer(res.customer);
        setTechnician(null);
        localStorage.setItem('smartac_user_identifier', res.user.email);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerTechnician = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
    services_provided?: string[];
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.registerTechnician(data);
      if (res.success) {
        setUser(res.user);
        setTechnician(res.technician);
        setCustomer(null);
        localStorage.setItem('smartac_user_identifier', res.user.email);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Technician registration failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerOwner = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.registerOwner(data);
      if (res.success) {
        setUser(res.user);
        setTechnician(null);
        setCustomer(null);
        localStorage.setItem('smartac_user_identifier', res.user.email);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Owner registration failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setCustomer(null);
    setTechnician(null);
    localStorage.removeItem('smartac_user_session');
    localStorage.removeItem('smartac_user_identifier');
  }, []);

  const switchUserByEmail = async (email: string): Promise<boolean> => {
    const res = await login(email);
    return Boolean(res);
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        technician,
        role: user?.role || null,
        isLoading,
        login,
        loginCustomerDemo,
        registerCustomer,
        registerTechnician,
        registerOwner,
        logout,
        switchUserByEmail,
        notifications,
        refreshNotifications,
        markNotificationAsRead,
      }}
    >
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
