import React from 'react';
import { CheckCircle, LogOut, Mail, MapPin, Phone, Shield, User, X } from 'lucide-react';
import { store } from '../data/store';
import { TradeAvatar } from './TradeAvatar';

interface AccountProfileModalProps {
  onClose: () => void;
  onLogout: () => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({ onClose, onLogout }) => {
  const currentUser = store.currentUser;

  const roleDisplayNames = {
    customer: 'Customer Member',
    professional: 'Verified Service Person',
    admin: 'Platform Administrator',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-slate-700/80 shadow-2xl p-6 sm:p-7 space-y-6 text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <TradeAvatar
            name={currentUser.name}
            size="xl"
            className="ring-4 ring-emerald-500/30 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white truncate">{currentUser.name}</h3>
              {currentUser.isVerified && (
                <span title="Verified Account">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-emerald-400 mt-0.5">
              {roleDisplayNames[currentUser.role]}
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {currentUser.id}</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Information</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block">Email</span>
                <span className="text-slate-200 truncate block">{currentUser.email}</span>
              </div>
            </div>

            {currentUser.phone && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block">Phone (Demo)</span>
                  <span className="text-slate-200 truncate block">
                    {currentUser.phone}{' '}
                    <span className="text-[10px] text-emerald-400 font-medium">(Demo Number)</span>
                  </span>
                </div>
              </div>
            )}

            {currentUser.location && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block">Location</span>
                  <span className="text-slate-200 truncate block">{currentUser.location}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
