import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { RouterProvider, useRouter } from './context/RouterContext.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';
import { TechnicianLoginPage } from './components/auth/TechnicianLoginPage.tsx';
import { OwnerLoginPage } from './components/auth/OwnerLoginPage.tsx';
import { CustomerDashboard } from './components/customer/CustomerDashboard.tsx';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard.tsx';
import { OwnerDashboard } from './components/owner/OwnerDashboard.tsx';
import { Wind } from 'lucide-react';

const MainApp: React.FC = () => {
  const { role, isLoading, loginCustomerDemo } = useAuth();
  const { currentPath, navigate } = useRouter();

  // If user visits customer dashboard directly and not logged in as customer, ensure customer session is ready
  useEffect(() => {
    if (!isLoading && currentPath === '/customer/dashboard' && role !== 'CUSTOMER') {
      loginCustomerDemo();
    }
  }, [isLoading, currentPath, role, loginCustomerDemo]);

  // If user is already logged in as Technician and visits /technician/login, redirect to dashboard
  useEffect(() => {
    if (!isLoading && role === 'SERVICE_PROVIDER' && currentPath === '/technician/login') {
      navigate('/technician/dashboard');
    }
  }, [isLoading, role, currentPath, navigate]);

  // If user is already logged in as Owner and visits /owner/login, redirect to dashboard
  useEffect(() => {
    if (!isLoading && role === 'OWNER' && currentPath === '/owner/login') {
      navigate('/owner/dashboard');
    }
  }, [isLoading, role, currentPath, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
          <Wind className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Connecting to SmartAC Live Relational Engine...</p>
      </div>
    );
  }

  // Routing Switch
  if (currentPath === '/technician/login') {
    return <TechnicianLoginPage />;
  }

  if (currentPath === '/owner/login') {
    return <OwnerLoginPage />;
  }

  if (currentPath === '/technician/dashboard') {
    if (role !== 'SERVICE_PROVIDER') {
      return <TechnicianLoginPage />;
    }
    return <TechnicianDashboard />;
  }

  if (currentPath === '/owner/dashboard') {
    if (role !== 'OWNER') {
      return <OwnerLoginPage />;
    }
    return <OwnerDashboard />;
  }

  if (currentPath === '/customer/dashboard') {
    return <CustomerDashboard />;
  }

  // Public Landing Page (default route: '/')
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

