import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppRoute =
  | '/'
  | '/customer/dashboard'
  | '/technician/login'
  | '/technician/dashboard'
  | '/owner/login'
  | '/owner/dashboard';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    try {
      const p = window.location.pathname;
      return p && p !== '' ? p : '/';
    } catch {
      return '/';
    }
  });

  useEffect(() => {
    const handlePopState = () => {
      try {
        setCurrentPath(window.location.pathname || '/');
      } catch {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    try {
      window.history.pushState({}, '', path);
    } catch {
      // If pushState restricted by sandboxed environment, state update still switches views
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
