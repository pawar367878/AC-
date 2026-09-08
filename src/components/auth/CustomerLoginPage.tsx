import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useRouter } from '../../context/RouterContext.tsx';
import {
  User as UserIcon,
  ArrowLeft,
  Lock,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

export const CustomerLoginPage: React.FC = () => {
  const { login, loginCustomerDemo, registerCustomer } = useAuth();
  const { navigate } = useRouter();

  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('customer');
  const [loginPassword, setLoginPassword] = useState('customer123');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Handle Customer Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your email ID or username');
      return;
    }

    setIsLoggingIn(true);
    try {
      const success = await login(loginIdentifier.trim(), loginPassword);
      if (success) {
        navigate('/customer/dashboard');
      } else {
        setLoginError('Invalid email ID or password. Please verify and try again.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Direct Customer Demo Login
  const handleDemoLogin = async () => {
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const success = await loginCustomerDemo();
      if (success) {
        navigate('/customer/dashboard');
      } else {
        setLoginError('Demo login unavailable.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Demo login error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Customer Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    // Validations
    if (!regName.trim()) {
      setRegError('Please enter your full name');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailRegex.test(regEmail.trim())) {
      setRegError('Please provide a valid email address (e.g. name@example.com)');
      return;
    }
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setRegError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!regAddress.trim()) {
      setRegError('Please enter your service address');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setRegError('Password must be at least 4 characters');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please retype carefully.');
      return;
    }

    setIsRegistering(true);
    try {
      const success = await registerCustomer({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: cleanPhone,
        address: regAddress.trim(),
        password: regPassword,
      });

      if (success) {
        setRegSuccess('Account created successfully! Redirecting to your dashboard...');
        setTimeout(() => {
          navigate('/customer/dashboard');
        }, 1000);
      } else {
        setRegError('Failed to create account. Please try again.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Registration failed. Email might already exist.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      {/* Back to Home Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition group py-1.5 px-3 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>← Back to Home</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Customer Badge */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 shadow-xl shadow-sky-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-sky-400">
              <UserIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Customer Portal
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Book certified AC repairs, track technicians & manage service requests
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-md py-7 px-6 shadow-2xl rounded-3xl border border-white/20 sm:px-9">
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setTab('LOGIN');
                setRegError('');
                setLoginError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                tab === 'LOGIN'
                  ? 'bg-white text-sky-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer Login
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('REGISTER');
                setRegError('');
                setLoginError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                tab === 'REGISTER'
                  ? 'bg-white text-sky-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ================= LOGIN TAB ================= */}
          {tab === 'LOGIN' && (
            <div>
              {/* Quick Demo Credentials Autofill Banner */}
              <div className="mb-5 p-3.5 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-sky-900 block">Customer Demo:</span>
                  <p className="text-[11px] text-sky-700 font-mono mt-0.5">
                    customer / customer123
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('customer');
                      setLoginPassword('customer123');
                      setLoginError('');
                    }}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition shadow-sm"
                  >
                    Autofill
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[11px] font-bold shrink-0 transition"
                  >
                    All Roles
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email ID or Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. priya@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full mt-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Log In to Customer Portal</span>
                  )}
                </button>
              </form>

              {/* Direct One-Click Demo Access */}
              <div className="mt-5 pt-4 border-t border-slate-200 text-center">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoggingIn}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Instant 1-Click Customer Demo</span>
                </button>
                <p className="text-[11px] text-slate-500 mt-2">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('REGISTER')}
                    className="text-sky-600 font-bold hover:underline"
                  >
                    Register new customer account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ================= REGISTER TAB ================= */}
          {tab === 'REGISTER' && (
            <div>
              {regSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {regError && (
                <div className="mb-4 p-3 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{regError}</span>
                </div>
              )}

              <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email ID *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="10-digit mobile number (e.g. 9876543210)"
                      maxLength={14}
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Default Service Address *
                  </label>
                  <div className="relative">
                    <div className="absolute top-2.5 left-3.5 pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <textarea
                      required
                      rows={2}
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="House No, Apartment, Street, City, Landmark"
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Retype Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full mt-3 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Register Account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                <p className="text-[11px] text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('LOGIN')}
                    className="text-sky-600 font-bold hover:underline"
                  >
                    Click here to log in
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
