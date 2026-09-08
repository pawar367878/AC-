import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useRouter } from '../../context/RouterContext.tsx';
import {
  Wind,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Users,
  Wrench,
  Crown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Shield,
} from 'lucide-react';

interface DemoCredential {
  roleName: string;
  roleSubtitle: string;
  username: string;
  password: string;
  roleIcon: React.ElementType;
  targetDashboard: string;
  badgeBg: string;
  accentColor: string;
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { navigate } = useRouter();

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Demo Credentials Definition per requirements
  const demoCredentials: DemoCredential[] = [
    {
      roleName: 'Customer',
      roleSubtitle: 'Book services & track requests',
      username: 'customer',
      password: 'customer123',
      roleIcon: Users,
      targetDashboard: 'Customer Dashboard',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      accentColor: 'from-sky-500 to-teal-500',
    },
    {
      roleName: 'Technician',
      roleSubtitle: 'Manage jobs & update statuses',
      username: 'technician',
      password: 'technician123',
      roleIcon: Wrench,
      targetDashboard: 'Technician Dashboard',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      accentColor: 'from-indigo-500 to-blue-600',
    },
    {
      roleName: 'Owner',
      roleSubtitle: 'Dispatch & administrative control',
      username: 'owner',
      password: 'owner123',
      roleIcon: Crown,
      targetDashboard: 'Owner/Admin Dashboard',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      accentColor: 'from-purple-600 to-slate-900',
    },
  ];

  // Quick fill handler
  const handleSelectDemo = (demo: DemoCredential) => {
    setUsername(demo.username);
    setPassword(demo.password);
    setErrorMessage('');
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMessage('Please enter a username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login(cleanUsername, password);

      if (!loggedInUser) {
        setErrorMessage('Invalid username or password.');
        setIsLoading(false);
        return;
      }

      // Automatically detect role based on entered credentials and redirect
      if (loggedInUser.role === 'CUSTOMER') {
        navigate('/customer/dashboard');
      } else if (loggedInUser.role === 'SERVICE_PROVIDER') {
        navigate('/technician/dashboard');
      } else if (loggedInUser.role === 'OWNER') {
        navigate('/owner/dashboard');
      } else {
        setErrorMessage('Unable to determine user role permissions.');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setErrorMessage(err?.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Wind className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base sm:text-lg tracking-tight">SmartAC</span>
                <span className="text-[10px] uppercase font-extrabold bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded border border-sky-400/30">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Service Management System</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Role Demo Credentials Showcase */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Demo Access Credentials</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Role-Based Demo Login
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                Test the application across all 3 user roles. Select or copy credentials below to enter any dashboard.
              </p>
            </div>

            {/* Demo Cards Grid */}
            <div className="space-y-3">
              {demoCredentials.map((demo) => {
                const Icon = demo.roleIcon;
                const isSelected = username === demo.username;

                return (
                  <div
                    key={demo.roleName}
                    className={`rounded-2xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? 'bg-slate-800/90 border-sky-500/50 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${demo.accentColor} flex items-center justify-center text-white shadow-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{demo.roleName}</h3>
                            <span className="text-[10px] text-slate-400">→ {demo.targetDashboard}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{demo.roleSubtitle}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectDemo(demo)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          isSelected
                            ? 'bg-sky-500 text-white shadow-sm'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <span>Quick Fill</span>
                        )}
                      </button>
                    </div>

                    {/* Credentials details row */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700/50 font-mono text-xs">
                      <div className="bg-slate-900/60 rounded-lg p-2 flex items-center justify-between border border-slate-700/40">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                            Username
                          </span>
                          <span className="font-bold text-sky-300">{demo.username}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(demo.username, `u-${demo.username}`)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                          title="Copy Username"
                        >
                          {copiedField === `u-${demo.username}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="bg-slate-900/60 rounded-lg p-2 flex items-center justify-between border border-slate-700/40">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                            Password
                          </span>
                          <span className="font-bold text-amber-300">{demo.password}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(demo.password, `p-${demo.password}`)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                          title="Copy Password"
                        >
                          {copiedField === `p-${demo.password}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note on Role Protection */}
            <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-300 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong>Role-Protected Dashboards:</strong> Dashboards are completely isolated. The system automatically redirects each role to its dedicated view and restricts unauthorized cross-role access.
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Login Form */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-sky-400" />
                  Sign In to Your Account
                </h2>
                <p className="text-xs text-slate-400">
                  Enter your credentials manually or use a demo role above.
                </p>
              </div>

              {/* Error Message Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder="e.g. customer, technician, or owner"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-teal-500 to-sky-600 hover:from-sky-400 hover:via-teal-400 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2 transform active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Validating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Login to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Dynamic Role Redirection Legend */}
              <div className="pt-4 border-t border-slate-700/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Automatic Role Redirection:
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/40 text-center">
                    <span className="font-bold text-sky-400 block">customer</span>
                    <span className="text-slate-400 text-[10px]">Customer Portal</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/40 text-center">
                    <span className="font-bold text-indigo-400 block">technician</span>
                    <span className="text-slate-400 text-[10px]">Tech Job Desk</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/40 text-center">
                    <span className="font-bold text-purple-400 block">owner</span>
                    <span className="text-slate-400 text-[10px]">Admin Dispatch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-900/40 py-4 px-4 text-center text-xs text-slate-500">
        Smart AC Service Management System • Connected Multi-Role Platform
      </footer>
    </div>
  );
};
