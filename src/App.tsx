import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { RouterProvider, useRouter } from './context/RouterContext.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { CustomerLoginPage } from './components/auth/CustomerLoginPage.tsx';
import { TechnicianLoginPage } from './components/auth/TechnicianLoginPage.tsx';
import { OwnerLoginPage } from './components/auth/OwnerLoginPage.tsx';
import { CustomerDashboard } from './components/customer/CustomerDashboard.tsx';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard.tsx';
import { OwnerDashboard } from './components/owner/OwnerDashboard.tsx';
import { AccessDeniedView } from './components/common/AccessDeniedView.tsx';
import { Wind } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const { currentPath, navigate } = useRouter();

  // If user is already authenticated and visits any login page, redirect to their role's dashboard
  useEffect(() => {
    if (!isLoading && role) {
      if (
        currentPath === '/login' ||
        currentPath === '/customer/login' ||
        currentPath === '/technician/login' ||
        currentPath === '/owner/login'
      ) {
        if (role === 'CUSTOMER') {
          navigate('/customer/dashboard');
        } else if (role === 'SERVICE_PROVIDER') {
          navigate('/technician/dashboard');
        } else if (role === 'OWNER') {
          navigate('/owner/dashboard');
        }
      }
    }
  }, [isLoading, role, currentPath, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
          <Wind className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Loading SmartAC Engine...</p>
      </div>
    );
  }

  // Public & Authentication Routes
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/customer/login') {
    return <CustomerLoginPage />;
  }

  if (currentPath === '/technician/login') {
    return <TechnicianLoginPage />;
  }

  if (currentPath === '/owner/login') {
    return <OwnerLoginPage />;
  }

  // Protected Role-Based Routes
  // 1. Customer Dashboard Route Protection
  if (currentPath === '/customer/dashboard') {
    if (!user || !role) {
      return <LoginPage />;
    }
    if (role !== 'CUSTOMER') {
      return <AccessDeniedView requiredRole="CUSTOMER" targetPageName="Customer Service Portal" />;
    }
    return <CustomerDashboard />;
  }

  // 2. Technician Dashboard Route Protection
  if (currentPath === '/technician/dashboard') {
    if (!user || !role) {
      return <LoginPage />;
    }
    if (role !== 'SERVICE_PROVIDER') {
      return <AccessDeniedView requiredRole="SERVICE_PROVIDER" targetPageName="Technician Job Desk" />;
    }
    return <TechnicianDashboard />;
  }

  // 3. Owner/Admin Dashboard Route Protection
  if (currentPath === '/owner/dashboard') {
    if (!user || !role) {
      return <LoginPage />;
    }
    if (role !== 'OWNER') {
      return <AccessDeniedView requiredRole="OWNER" targetPageName="Owner / Administrator Control Center" />;
    }
    return <OwnerDashboard />;
  }

  // Default Route: Public Landing Page ('/')
  return <LandingPage />;
};

export function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <MainApp />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
