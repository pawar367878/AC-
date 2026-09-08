import React from 'react';
import { useRouter } from '../../context/RouterContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { ShieldAlert, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { UserRole } from '../../types.ts';

interface AccessDeniedProps {
  requiredRole: UserRole | string;
  targetPageName: string;
}

export const AccessDeniedView: React.FC<AccessDeniedProps> = ({ requiredRole, targetPageName }) => {
  const { user, role, logout } = useAuth();
  const { navigate } = useRouter();

  const getMyDashboardPath = () => {
    if (role === 'CUSTOMER') return '/customer/dashboard';
    if (role === 'SERVICE_PROVIDER') return '/technician/dashboard';
    if (role === 'OWNER') return '/owner/dashboard';
    return '/login';
  };

  const getRoleLabel = (r: UserRole | null | string) => {
    if (r === 'CUSTOMER') return 'Customer';
    if (r === 'SERVICE_PROVIDER') return 'Technician';
    if (r === 'OWNER') return 'Owner / Administrator';
    return 'Guest';
  };

  const handleLogoutAndSwitch = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
            Access Denied
          </span>
          <h2 className="text-2xl font-black text-white">Restricted Role Portal</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The <strong className="text-slate-200">{targetPageName}</strong> requires{' '}
            <strong className="text-rose-400">{getRoleLabel(requiredRole)}</strong> permissions.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Current Session:</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Logged in as:</span>
            <span className="font-bold text-white">{user?.name || 'User'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Active Role:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {getRoleLabel(role)}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate(getMyDashboardPath())}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to My Dashboard ({getRoleLabel(role)})</span>
          </button>

          <button
            onClick={handleLogoutAndSwitch}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out & Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
