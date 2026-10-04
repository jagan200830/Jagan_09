import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Heart,
  HelpCircle,
  MapPin,
  MessageSquare,
  Navigation,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Star,
  User,
  Wrench,
  Zap,
} from 'lucide-react';
import { store } from '../data/store';
import { Booking, ServiceItem, ServiceProfessional } from '../types';
import { calculateDistanceAndEta } from '../utils/distanceTracker';
import { LiveTrackerModal } from './LiveTrackerModal';
import { TradeAvatar } from './TradeAvatar';

interface CustomerDashboardProps {
  onOpenAIWithPrompt: (prompt: string) => void;
  onOpenBookingModal: (pro?: ServiceProfessional, service?: ServiceItem) => void;
  onOpenChat: (bookingId: string) => void;
  onViewProProfile: (pro: ServiceProfessional) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenAIWithPrompt,
  onOpenBookingModal,
  onOpenChat,
  onViewProProfile,
}) => {
  const currentUser = store.currentUser;
  const bookings = store.bookings.filter((b) => b.customerId === currentUser.id);
  const pros = store.professionals;

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'favorites' | 'reviews'>('overview');
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<Booking | null>(null);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [scores, setScores] = useState({ quality: 5, professionalism: 5, timeliness: 5, value: 5 });

  // Problem report state
  const [disputeBooking, setDisputeBooking] = useState<Booking | null>(null);
  const [issueType, setIssueType] = useState('Service Quality');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  // Financial aggregates
  const activeBookings = bookings.filter((b) => !['completed', 'cancelled'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const pendingRequests = bookings.filter((b) => b.status === 'requested');
  const totalSpent = completedBookings.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const favoritePros = pros.filter((p) => store.favorites.includes(p.id));

  const handlePayNow = (bookingId: string) => {
    store.payBooking(bookingId, 'upi');
  };

  const handleCompleteRating = () => {
    if (!ratingBooking) return;
    store.rateBooking(ratingBooking.id, ratingStars, reviewComment, scores);
    setRatingBooking(null);
    setReviewComment('');
  };

  const handleFileDispute = () => {
    if (!disputeBooking || !disputeDesc.trim()) return;
    store.fileComplaint({
      bookingId: disputeBooking.id,
      filedByName: currentUser.name,
      filedByRole: 'customer',
      targetUserName: disputeBooking.professionalName,
      issueType,
      description: disputeDesc,
    });
    setDisputeSuccess(true);
    setTimeout(() => {
      setDisputeBooking(null);
      setDisputeDesc('');
      setDisputeSuccess(false);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      requested: { bg: 'bg-amber-950/70 border-amber-500/30', text: 'text-amber-300' },
      accepted: { bg: 'bg-sky-950/70 border-sky-500/30', text: 'text-sky-300' },
      on_the_way: { bg: 'bg-indigo-950/70 border-indigo-500/30', text: 'text-indigo-300' },
      work_started: { bg: 'bg-emerald-950/70 border-emerald-500/40', text: 'text-emerald-300' },
      work_completed: { bg: 'bg-teal-950/70 border-teal-500/40', text: 'text-teal-300' },
      payment_pending: { bg: 'bg-orange-950/70 border-orange-500/40', text: 'text-orange-300' },
      completed: { bg: 'bg-emerald-900/40 border-emerald-500/30', text: 'text-emerald-400' },
      cancelled: { bg: 'bg-rose-950/60 border-rose-500/30', text: 'text-rose-400' },
    };
    const c = config[status] || config.requested;
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${c.bg} ${c.text}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Welcome Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Cooperative Member</span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
            Hello {currentUser.name}! What do you need help with today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered Address: {currentUser.location} · Member ID: {currentUser.id}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/80 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Co-op Dividend Points</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">150 pts (₹150 off)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Active Bookings</span>
          <h3 className="font-heading text-2xl font-bold text-white mt-1">{activeBookings.length}</h3>
          <p className="text-[10px] text-emerald-400 mt-1">In progress or en route</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Completed Services</span>
          <h3 className="font-heading text-2xl font-bold text-teal-400 mt-1">{completedBookings.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Verified with digital receipt</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Pending Requests</span>
          <h3 className="font-heading text-2xl font-bold text-amber-400 mt-1">{pendingRequests.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting pro confirmation</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Total Co-op Volume</span>
          <h3 className="font-heading text-2xl font-bold text-emerald-400 mt-1 font-mono">₹{totalSpent}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Zero corporate commission</p>
        </div>
      </div>

      {/* Quick Service Search Card */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Quick Service Assistance</h3>
        </div>
        <p className="text-xs text-slate-300">
          Need immediate help? Click any common request to trigger GigAssist AI diagnosis or enter your own problem:
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            'I need a plumber',
            'I need AC repair',
            'My laptop is not working',
            'My kitchen tap is leaking',
            'Main electric switch is sparking',
            'Need deep sanitization for 3BHK flat',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onOpenAIWithPrompt(prompt)}
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-all text-left flex items-center gap-2 group"
            >
              <span>"{prompt}"</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Active Jobs Tracker ({activeBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'bookings'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          All Bookings History ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'favorites'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Saved Favorites ({favoritePros.length})
        </button>
      </div>

      {/* Tab: Overview / Active Jobs Tracker */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {activeBookings.length === 0 ? (
            <div className="p-8 text-center rounded-3xl glass-card border-slate-800 space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Active Service Jobs</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All your past service requests are completed. Ready to book your next home maintenance service?
              </p>
              <button
                onClick={() => onOpenBookingModal()}
                className="px-4 py-2 text-xs font-bold bg-emerald-500 text-slate-950 rounded-xl"
              >
                Book a Service Now
              </button>
            </div>
          ) : (
            activeBookings.map((b) => (
              <div
                key={b.id}
                className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-6"
              >
                {/* Header of Active Booking */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <TradeAvatar
                      name={b.professionalName}
                      category={b.professionalCategory}
                      size="lg"
                      className="ring-2 ring-emerald-500/30 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{b.serviceName}</h3>
                        {b.isEmergency && (
                          <span className="text-[10px] font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-400" /> Emergency
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">
                        Assigned Professional: <span className="text-emerald-400 font-semibold">{b.professionalName}</span> ({b.professionalCategory})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(b.status)}
                    <span className="font-mono text-base font-bold text-white">₹{b.totalAmount}</span>
                  </div>
                </div>

                {/* Live Status Progress Stepper */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live Progress Tracker
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { key: 'requested', label: '1. Requested' },
                      { key: 'accepted', label: '2. Accepted' },
                      { key: 'work_started', label: '3. In Progress' },
                      { key: 'completed', label: '4. Completed' },
                    ].map((step, idx) => {
                      const isPast =
                        b.timeline.some((t) => t.status === step.key) ||
                        (step.key === 'work_started' && ['work_started', 'work_completed', 'completed'].includes(b.status)) ||
                        (step.key === 'completed' && b.status === 'completed');

                      const isCurrent = b.status === step.key;

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold'
                              : isPast
                              ? 'bg-slate-900 border-emerald-500/30 text-slate-200'
                              : 'bg-slate-950/40 border-slate-800 text-slate-600'
                          }`}
                        >
                          <p>{step.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline Notes */}
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Latest Status Log</span>
                  <p className="text-slate-200">
                    {b.timeline[b.timeline.length - 1]?.note || 'Order received.'} (at {b.timeline[b.timeline.length - 1]?.timestamp})
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Live Tracking Button - Unlocked once Service Person Accepts */}
                    {b.status !== 'requested' ? (
                      <button
                        onClick={() => setActiveTrackingBooking(b)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/25 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                        <span>Track Service Person</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Awaiting Partner Acceptance
                        </span>
                        <button
                          onClick={() => {
                            store.updateBookingStatus(b.id, 'accepted', `${b.professionalName} accepted your booking`);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 cursor-pointer"
                        >
                          Accept as Pro (Demo)
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => onOpenChat(b.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      Chat with {b.professionalName}
                    </button>
                    <button
                      onClick={() => setDisputeBooking(b)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Report Problem
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'work_completed' && b.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => handlePayNow(b.id)}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
                      >
                        Release Escrow & Pay ₹{b.totalAmount}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: All Bookings History */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl glass-card border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{b.serviceName}</h4>
                  {getStatusBadge(b.status)}
                </div>
                <p className="text-xs text-slate-400">
                  {b.scheduledDate} ({b.scheduledTimeSlot}) · Professional: {b.professionalName}
                </p>
                <p className="text-xs text-slate-300 line-clamp-1 italic">"{b.problemDescription}"</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Total</span>
                  <span className="font-mono text-sm font-bold text-white">₹{b.totalAmount}</span>
                </div>

                {b.status !== 'requested' && b.status !== 'cancelled' && (
                  <button
                    onClick={() => setActiveTrackingBooking(b)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                    title="Track Service Person live GPS and route"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </button>
                )}

                {b.status === 'completed' && !b.rating && (
                  <button
                    onClick={() => setRatingBooking(b)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Rate Service
                  </button>
                )}

                {b.rating && (
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{b.rating} ★ Rated</span>
                  </div>
                )}

                <button
                  onClick={() => onOpenChat(b.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favoritePros.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No saved favorites yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoritePros.map((pro) => (
                <div key={pro.id} className="p-4 rounded-2xl glass-card border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TradeAvatar name={pro.name} category={pro.category} size="lg" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{pro.name}</h4>
                      <p className="text-[11px] text-slate-400">{pro.category} · {pro.rating}★</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewProProfile(pro)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal Dialog */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-slate-700 space-y-4 text-left">
            <h3 className="font-heading text-lg font-bold text-white">Rate Service & Professional</h3>
            <p className="text-xs text-slate-300">
              Leave verified feedback for {ratingBooking.professionalName} on "{ratingBooking.serviceName}".
            </p>

            {/* Stars */}
            <div className="flex items-center gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Detailed Criteria */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Quality</span>
                <span className="font-bold text-white">{scores.quality}/5</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Professionalism</span>
                <span className="font-bold text-white">{scores.professionalism}/5</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Timeliness</span>
                <span className="font-bold text-white">{scores.timeliness}/5</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Value for Money</span>
                <span className="font-bold text-white">{scores.value}/5</span>
              </div>
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="What went well? Was the job completed cleanly and on time?"
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRatingBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteRating}
                className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl"
              >
                Submit Verified Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal Dialog */}
      {disputeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-slate-700 space-y-4 text-left">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              File Dispute / Mediation
            </h3>
            <p className="text-xs text-slate-300">
              Cooperative union mediators review customer reports to ensure fair resolution.
            </p>

            {disputeSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-center">
                Dispute submitted to cooperative operations board. Reference generated.
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Issue Category</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="Service Quality">Service Quality / Incomplete Work</option>
                    <option value="Unpunctuality">Extreme Tardiness / No-Show</option>
                    <option value="Pricing Dispute">Overcharging / Additional Fee</option>
                    <option value="Professional Conduct">Unprofessional Conduct</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Description of Problem</label>
                  <textarea
                    value={disputeDesc}
                    onChange={(e) => setDisputeDesc(e.target.value)}
                    rows={3}
                    placeholder="Provide specific details so our mediation team can assist..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDisputeBooking(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFileDispute}
                    disabled={!disputeDesc.trim()}
                    className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl disabled:opacity-50"
                  >
                    Submit Dispute
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
