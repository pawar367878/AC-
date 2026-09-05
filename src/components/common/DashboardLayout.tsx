import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Wind,
  LogOut,
  Menu,
  X,
  Bell,
  User as UserIcon,
  Shield,
  Wrench,
  Crown,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

interface DashboardLayoutProps {
  role: 'CUSTOMER' | 'SERVICE_PROVIDER' | 'OWNER';
  roleTitle: string;
  roleSubtitle?: string;
  navItems: NavItem[];
  activeItemId: string;
  onSelectItemId: (id: string) => void;
  children: React.ReactNode;
  onRefreshData?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  role,
  roleTitle,
  roleSubtitle,
  navItems,
  activeItemId,
  onSelectItemId,
  children,
  onRefreshData,
}) => {
  const { user, customer, technician, logout, notifications } = useAuth();
  const { navigate } = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadNotifsCount = (notifications || []).filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = async () => {
    if (onRefreshData) {
      setIsRefreshing(true);
      try {
        await onRefreshData();
      } finally {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  const displayName =
    role === 'CUSTOMER'
      ? customer?.full_name || user?.name || 'Customer'
      : role === 'SERVICE_PROVIDER'
      ? technician?.name || user?.name || 'Technician'
      : user?.name || 'Administrator';

  const displaySubtitle =
    role === 'CUSTOMER'
      ? customer?.phone || user?.email
      : role === 'SERVICE_PROVIDER'
      ? technician?.skills?.[0] || 'AC Specialist'
      : 'Chief Operations';

  const roleIcon =
    role === 'CUSTOMER' ? (
      <UserIcon className="w-4 h-4 text-sky-600" />
    ) : role === 'SERVICE_PROVIDER' ? (
      <Wrench className="w-4 h-4 text-teal-600" />
    ) : (
      <Crown className="w-4 h-4 text-amber-500" />
    );

  const roleBadgeStyle =
    role === 'CUSTOMER'
      ? 'bg-sky-50 text-sky-800 border-sky-200'
      : role === 'SERVICE_PROVIDER'
      ? 'bg-teal-50 text-teal-800 border-teal-200'
      : 'bg-indigo-50 text-indigo-800 border-indigo-200';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row selection:bg-sky-500 selection:text-white">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-200 shrink-0 sticky top-0 h-screen z-30 justify-between shadow-xs">
        {/* Top Branding */}
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
              title="Return to Public Landing Page"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                  Smart<span className="text-sky-600">AC</span> Pro
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Service System</span>
              </div>
            </div>
          </div>

          {/* Role Portal Indicator Badge */}
          <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-xs">
              {roleIcon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{roleTitle}</p>
              <p className="text-[10px] text-slate-500 leading-tight">
                {roleSubtitle || 'Authorized Session'}
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] no-scrollbar">
            {(navItems || []).map((item) => {
              const Icon = item.icon;
              const isActive = activeItemId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectItemId(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition ${
                        isActive
                          ? 'text-sky-400'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeColor
                          ? item.badgeColor
                          : isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Visible Logout Button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{displaySubtitle}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition shadow-xs"
            title="End current session and return to Landing Page"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <span className="text-sm font-black text-slate-900 block leading-tight">
              Smart<span className="text-sky-600">AC</span> Pro
            </span>
            <span className="text-[10px] font-bold text-slate-500">{roleTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshData && (
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">SmartAC Pro</p>
                    <p className="text-[10px] text-slate-500">{roleTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="py-4 space-y-1">
                {(navItems || []).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItemId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectItemId(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="text-xs">
                <p className="font-bold text-slate-900">{displayName}</p>
                <p className="text-[11px] text-slate-500">{displaySubtitle}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top Global Action Bar */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={() => navigate('/')}
              className="hover:text-slate-900 font-medium transition"
            >
              Smart AC Platform
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-slate-900">{roleTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            {onRefreshData && (
              <button
                onClick={handleRefresh}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                title="Sync live data with server"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
                <span>Sync DB</span>
              </button>
            )}

            <button
              onClick={() => onSelectItemId('NOTIFICATIONS')}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
              title="Logout and return to Landing Page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Child Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
