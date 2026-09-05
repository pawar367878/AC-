import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useRouter } from '../../context/RouterContext.tsx';
import { ShieldAlert, ArrowLeft, Lock, User, AlertCircle, Building2, Crown } from 'lucide-react';

export const OwnerLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { navigate } = useRouter();

  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('owner123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(username.trim(), password);
      if (success) {
        navigate('/owner/dashboard');
      } else {
        setError('Invalid username or password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('owner');
    setPassword('owner123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand / Icon Badge */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-0.5 shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Crown className="w-8 h-8" />
            </div>
          </div>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-white">
          Owner / Admin Login
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-400">
          Manage the complete AC service platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-white/20 sm:px-10">
          {/* Quick Demo Credentials Autofill Banner */}
          <div className="mb-6 p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-indigo-900 block">Demo Admin Credentials:</span>
              <p className="text-[11px] text-indigo-700 font-mono mt-0.5">
                owner / owner123
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition shadow-sm"
            >
              Autofill
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="owner"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-slate-800 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Centralized AC operations, model-service mapping & technician dispatch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
