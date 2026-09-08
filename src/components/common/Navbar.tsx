import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useRouter } from '../../context/RouterContext.tsx';
import {
  Wind,
  Bell,
  User as UserIcon,
  Shield,
  Wrench,
  ChevronDown,
  RefreshCw,
  LogOut,
  Sparkles,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from '../../types.ts';

interface NavbarProps {
  onRefreshData?: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefreshData, onOpenAuthModal }) => {
  const { user, role, logout, switchUserByEmail, notifications, markNotificationAsRead } = useAuth();
  const { navigate } = useRouter();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefreshData) {
      await onRefreshData();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const demoAccounts = [
    { email: 'rahul.sharma@example.com', name: 'Rahul Sharma', role: 'CUSTOMER', label: 'Customer (Rahul)' },
    { email: 'priya.patel@example.com', name: 'Priya Patel', role: 'CUSTOMER', label: 'Customer (Priya)' },
    { email: 'anil.tech@example.com', name: 'Anil Kumar', role: 'SERVICE_PROVIDER', label: 'Technician (Anil)' },
    { email: 'vikram.tech@example.com', name: 'Vikram Singh', role: 'SERVICE_PROVIDER', label: 'Technician (Vikram)' },
    { email: 'admin@smartac.com', name: 'Rajesh Verma', role: 'OWNER', label: 'Owner / Admin (Rajesh)' },
  ];

  const getRoleBadge = (r: UserRole | null) => {
    switch (r) {
      case 'OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Shield className="w-3 h-3" /> Owner Portal
          </span>
        );
      case 'SERVICE_PROVIDER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Wrench className="w-3 h-3" /> Technician Portal
          </span>
        );
      case 'CUSTOMER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <UserIcon className="w-3 h-3" /> Customer Portal
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Banner Demo Switcher Bar for Seamless Role Evaluation */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-sky-400">
            <Sparkles className="w-3.5 h-3.5" /> Instant Role Switcher:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => switchUserByEmail(acc.email)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  user?.email === acc.email
                    ? 'bg-sky-500 text-white font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden sm:inline">Active Database: <strong className="text-emerald-400">Live</strong></span>
          <button
            onClick={handleRefresh}
            title="Force refresh database state"
            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
            <Wind className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">SmartAC</span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Smart AC Service Management System</p>
          </div>
        </div>

        {/* Right Section: Active Portal Badge, Notification Bell, User Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Active Role Indicator */}
          <div className="hidden sm:block">
            {getRoleBadge(role)}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                  <span className="font-bold text-sm text-slate-900">Notifications</span>
                  <span className="text-xs text-slate-500">{notifications.length} alerts</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">No notifications yet.</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-2.5 rounded-lg text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                          !notif.read ? 'bg-sky-50/70 font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-slate-800">{notif.title}</p>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0 mt-1" />}
                        </div>
                        <p className="text-slate-600 font-normal mt-0.5 text-[11px] leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Switcher */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition text-slate-800 text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <span className="max-w-[120px] truncate hidden md:inline">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="p-2 border-b border-slate-100">
                    <p className="font-bold text-xs text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5">{getRoleBadge(role)}</div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowDemoMenu(false);
                        if (onOpenAuthModal) onOpenAuthModal();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      Sign In / Register New Account
                    </button>
                    <button
                      onClick={() => {
                        setShowDemoMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
