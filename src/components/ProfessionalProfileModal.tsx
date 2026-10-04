import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  MapPin,
  MessageSquare,
  Shield,
  Star,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { store } from '../data/store';
import { ServiceProfessional } from '../types';
import { TradeAvatar } from './TradeAvatar';

interface ProfessionalProfileModalProps {
  pro: ServiceProfessional | null;
  onClose: () => void;
  onBook: (pro: ServiceProfessional) => void;
  onChat: (proId: string) => void;
}

export const ProfessionalProfileModal: React.FC<ProfessionalProfileModalProps> = ({
  pro,
  onClose,
  onBook,
  onChat,
}) => {
  if (!pro) return null;

  const [isFavorite, setIsFavorite] = useState(store.favorites.includes(pro.id));
  const proBookings = store.bookings.filter(
    (b) => b.professionalId === pro.id && b.rating && b.reviewComment
  );

  const toggleFav = () => {
    store.toggleFavorite(pro.id);
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 text-left max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800">
          <TradeAvatar name={pro.name} category={pro.category} size="xl" className="ring-4 ring-emerald-500/30 shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">{pro.name}</h2>
              {pro.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified Worker-Owner
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-semibold text-emerald-400">{pro.category}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {pro.rating} ({pro.reviewCount} reviews)
              </span>
              <span>·</span>
              <span>{pro.experienceYears} Years Experience</span>
              <span>·</span>
              <span>{pro.completedJobs} Completed Jobs</span>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {pro.location} (Servicing up to {pro.serviceRadiusKm} km radius)
            </p>
          </div>

          <div className="flex sm:flex-col items-center gap-2 shrink-0">
            <button
              onClick={toggleFav}
              className={`p-2.5 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Add to Favorites"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">About the Professional</h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            {pro.bio}
          </p>
        </div>

        {/* Skills & Certifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              Verified Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {pro.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-teal-400" />
              Trade Licenses & Credentials
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5">
              {pro.certifications.map((cert, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Portfolio Showcase */}
        {pro.portfolio && pro.portfolio.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Past Project Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pro.portfolio.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified Work Order</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">#JOB-{idx + 1}04</span>
                  </div>
                  <h5 className="text-xs font-bold text-white">{item.title}</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Customer Reviews</h3>
          <div className="space-y-2.5">
            {proBookings.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No public reviews submitted yet.</p>
            ) : (
              proBookings.map((b) => (
                <div key={b.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{b.customerName}</span>
                    <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{b.rating} / 5</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">"{b.reviewComment}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pricing & Booking Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">Cooperative Inspection Fee</span>
            <span className="text-xl font-extrabold text-white font-mono">₹{pro.startingPrice}</span>
            <span className="text-xs text-slate-400 ml-1.5">(₹{pro.hourlyRate}/hr thereafter)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onChat(pro.id);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Chat First
            </button>
            <button
              onClick={() => {
                onClose();
                onBook(pro);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Book This Professional
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
