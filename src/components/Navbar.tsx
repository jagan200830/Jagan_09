import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  Layers,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  RotateCcw,
  Shield,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { store } from '../data/store';
import { TradeAvatar } from './TradeAvatar';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenBooking: () => void;
  onOpenChat: (bookingId?: string) => void;
  unreadCount: number;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenBooking,
  onOpenChat,
  unreadCount,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetSuccessToast, setResetSuccessToast] = useState(false);
  const currentUser = store.currentUser;
  const notifications = store.notifications.filter(
    (n) => n.userId === currentUser.id || currentUser.role === 'admin'
  );

  const handleResetData = () => {
    store.resetDataToDefault();
    setResetConfirmOpen(false);
    setResetSuccessToast(true);
    setTimeout(() => setResetSuccessToast(false), 3000);
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              if (currentUser.role === 'admin') setCurrentTab('admin_dashboard');
              else if (currentUser.role === 'professional') setCurrentTab('pro_dashboard');
              else setCurrentTab('home');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-lg font-bold tracking-tight text-white">
                  Cooperative<span className="text-emerald-400">Gig</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'professional' ? 'Pro' : 'Co-op'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {currentUser.role === 'admin'
                  ? 'Platform Operations Center'
                  : currentUser.role === 'professional'
                  ? 'Professional Partner Workspace'
                  : 'Democratic Worker Platform'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links - Strictly Role-Tailored */}
          <div className="hidden md:flex items-center gap-1">
            {currentUser.role === 'customer' && (
              <>
                <button
                  onClick={() => setCurrentTab('home')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'home' ? 'text-white bg-slate-800/80 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentTab('services')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'services' ? 'text-white bg-slate-800/80 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  Find Services
                </button>
                <button
                  onClick={() => setCurrentTab('ai_assistant')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'ai_assistant'
                      ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  GigAssist AI
                </button>
                <button
                  onClick={() => setCurrentTab('guilds')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'guilds' ? 'text-white bg-slate-800/80 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  Co-op Guilds
                </button>
                <button
                  onClick={() => setCurrentTab('customer_dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'customer_dashboard' ? 'text-white bg-slate-800/80' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  My Bookings
                </button>
              </>
            )}

            {currentUser.role === 'professional' && (
              <>
                <button
                  onClick={() => setCurrentTab('pro_dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    currentTab === 'pro_dashboard'
                      ? 'text-white bg-emerald-600 shadow-sm shadow-emerald-600/30'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Work Orders & Jobs
                </button>
                <button
                  onClick={() => setCurrentTab('guilds')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'guilds' ? 'text-white bg-slate-800/80 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  My Co-op Guild
                </button>
              </>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('admin_dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    currentTab === 'admin_dashboard'
                      ? 'text-white bg-cyan-600 shadow-sm shadow-cyan-600/30'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Control Room
                </button>
                <button
                  onClick={() => setCurrentTab('guilds')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'guilds' ? 'text-white bg-slate-800/80 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  Co-op Guilds Oversight
                </button>
              </>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Active Role Indicator Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="capitalize">
                {currentUser.role === 'professional' ? 'Service Person' : currentUser.role}
              </span>
            </div>

            {/* Chat Trigger */}
            <button
              onClick={() => onOpenChat()}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors relative"
              title="Open Chat"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 text-[10px] font-bold text-white bg-emerald-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-3 z-50 backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                    <button
                      onClick={() => store.markAllNotificationsAsRead(currentUser.id)}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => store.markNotificationAsRead(n.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            n.read ? 'bg-slate-950/40 border-slate-800/50 opacity-70' : 'bg-slate-800/60 border-emerald-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-slate-100">{n.title}</h4>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar or Login */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div onClick={onOpenAuth} className="cursor-pointer" title={`${currentUser.name} (${currentUser.role})`}>
                <TradeAvatar
                  name={currentUser.name}
                  size="sm"
                  className="rounded-full ring-2 ring-emerald-500/40"
                />
              </div>
              <div className="hidden lg:block text-left cursor-pointer" onClick={onOpenAuth}>
                <p className="text-xs font-semibold text-slate-100 leading-tight truncate max-w-[140px]">
                  Hello, <span className="text-emerald-400 font-bold">{currentUser.name}</span>
                </p>
                <p className="text-[10px] text-slate-400 capitalize">{currentUser.role === 'customer' ? 'Customer' : currentUser.role}</p>
              </div>

              {/* Reset Preview Data Button */}
              <button
                onClick={() => setResetConfirmOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors"
                title="Reset Preview Data (Removes all entered data and restores defaults)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 ml-0.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                  title="Sign Out / Switch Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-2">
          {currentUser.role === 'customer' && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('home');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentTab('services');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
              >
                Find Services
              </button>
              <button
                onClick={() => {
                  setCurrentTab('ai_assistant');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-emerald-400 font-medium hover:bg-slate-900 rounded-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                GigAssist AI
              </button>
              <button
                onClick={() => {
                  setCurrentTab('guilds');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
              >
                Cooperative Guilds
              </button>
              <button
                onClick={() => {
                  setCurrentTab('customer_dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
              >
                My Bookings
              </button>
            </>
          )}

          {currentUser.role === 'professional' && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('pro_dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 rounded-lg"
              >
                Work Orders & Jobs
              </button>
              <button
                onClick={() => {
                  setCurrentTab('guilds');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
              >
                My Co-op Guild
              </button>
              <button
                onClick={() => {
                  onOpenChat();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Client Messages
              </button>
            </>
          )}

          {currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('admin_dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 rounded-lg"
              >
                Platform Control Room
              </button>
              <button
                onClick={() => {
                  setCurrentTab('guilds');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
              >
                Cooperative Guilds Oversight
              </button>
            </>
          )}

          {onLogout && (
            <div className="pt-3 border-t border-slate-800 space-y-1">
              <div className="px-3 py-1.5 text-xs text-slate-400 flex items-center justify-between">
                <span>Signed in as:</span>
                <span className="font-semibold text-white capitalize">{currentUser.role === 'professional' ? 'Service Person' : currentUser.role}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setResetConfirmOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-amber-950/30 rounded-lg flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Entered Preview Data</span>
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-slate-700 bg-slate-900/95 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Preview Data?</h3>
                <p className="text-xs text-slate-400">Restore platform to clean initial state</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will remove all bookings, chat messages, address inputs, and reviews entered during this preview session, returning the app to its original mock dataset.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
              >
                Reset All Entered Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Success Toast */}
      {resetSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          Preview data has been cleared and reset to fresh defaults!
        </div>
      )}
    </nav>
  );
};
