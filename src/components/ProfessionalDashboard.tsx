import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Layers,
  MapPin,
  MessageSquare,
  Navigation,
  Percent,
  Power,
  Shield,
  ShieldAlert,
  Star,
  TrendingUp,
  User,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { store } from '../data/store';
import { Booking, BookingStatus, ServiceProfessional } from '../types';
import { calculateDistanceAndEta } from '../utils/distanceTracker';
import { LiveTrackerModal } from './LiveTrackerModal';
import { TradeAvatar } from './TradeAvatar';

interface ProfessionalDashboardProps {
  onOpenChat: (bookingId: string) => void;
}

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ onOpenChat }) => {
  const currentUser = store.currentUser;
  const pros = store.professionals;

  // Current active pro record
  const currentPro =
    pros.find((p) => p.id === currentUser.id) ||
    pros.find((p) => p.name === currentUser.name) ||
    pros[0];

  const bookings = store.bookings.filter((b) => b.professionalId === currentPro.id);
  const pendingRequests = bookings.filter((b) => b.status === 'requested');
  const activeJobs = bookings.filter((b) => ['accepted', 'on_the_way', 'work_started', 'payment_pending'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'completed');

  const [availability, setAvailability] = useState(currentPro.availability);
  const [activeTab, setActiveTab] = useState<'jobs' | 'analytics' | 'guilds' | 'earnings'>('jobs');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('15000');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<Booking | null>(null);

  const earningsTotal = currentPro.earningsTotal || 184500;

  const handleUpdateStatus = (bookingId: string, status: BookingStatus) => {
    store.updateBookingStatus(bookingId, status);
  };

  const handleToggleAvail = (newVal: 'available_now' | 'busy' | 'scheduled_only' | 'offline') => {
    currentPro.availability = newVal;
    setAvailability(newVal);
    store.addNotification({
      userId: currentPro.id,
      role: 'professional',
      title: 'Availability Status Updated',
      message: `Your status is now ${newVal.replace('_', ' ').toUpperCase()}. Customers can see this on the live radar.`,
      type: 'system',
    });
  };

  const handleWithdraw = () => {
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawModalOpen(false);
      store.addNotification({
        userId: currentPro.id,
        role: 'professional',
        title: 'Payout Dispatched to Bank',
        message: `₹${withdrawAmount} cooperative direct transfer initiated to HDFC A/C ending in 4491.`,
        type: 'payment',
      });
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header Profile Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <TradeAvatar
            name={currentPro.name}
            category={currentPro.category}
            size="xl"
            className="ring-2 ring-emerald-500/40 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-white">{currentPro.name}</h1>
              {currentPro.verificationStatus === 'verified' && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified Worker-Owner
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentPro.category} Specialist · {currentPro.experienceYears} Years Exp · Member since {currentPro.createdAt}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {currentPro.location}
            </p>
          </div>
        </div>

        {/* Availability Toggle Segment */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => handleToggleAvail('available_now')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                availability === 'available_now'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ● Available Now
            </button>
            <button
              onClick={() => handleToggleAvail('scheduled_only')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                availability === 'scheduled_only'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Scheduled Only
            </button>
            <button
              onClick={() => handleToggleAvail('offline')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                availability === 'offline'
                  ? 'bg-rose-950 text-rose-300 font-bold border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Offline
            </button>
          </div>

          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
          >
            Withdraw Payout
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Pending Requests</span>
          <h3 className="font-heading text-2xl font-bold text-amber-400 mt-1">{pendingRequests.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Requires your acceptance</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Active Jobs</span>
          <h3 className="font-heading text-2xl font-bold text-teal-400 mt-1">{activeJobs.length}</h3>
          <p className="text-[10px] text-emerald-400 mt-1">In progress right now</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Completed Jobs</span>
          <h3 className="font-heading text-2xl font-bold text-white mt-1">{currentPro.completedJobs}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Verified work signoffs</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Co-op Earnings</span>
          <h3 className="font-heading text-2xl font-bold text-emerald-400 mt-1 font-mono">
            ₹{earningsTotal.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Direct to bank (Zero cut)</p>
        </div>

        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Average Rating</span>
          <h3 className="font-heading text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400" />
            {currentPro.rating}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">{currentPro.reviewCount} customer reviews</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'jobs' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Job Queue & Active Dispatches ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Earnings & Growth Charts
        </button>
        <button
          onClick={() => setActiveTab('guilds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'guilds' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          My Cooperative Guilds
        </button>
      </div>

      {/* Tab: Jobs Queue */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Pending Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Action Required: New Booking Requests ({pendingRequests.length})
              </h3>
              <div className="space-y-3">
                {pendingRequests.map((b) => {
                  const distInfo = calculateDistanceAndEta(
                    currentPro.coords || currentPro.location,
                    b.address,
                    b.isEmergency
                  );
                  return (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{b.serviceName}</h4>
                          {b.isEmergency && (
                            <span className="text-[10px] font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-500/40">
                              Emergency
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300">
                          Customer: <span className="font-semibold text-white">{b.customerName}</span> · {b.customerPhone} (Demo)
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {b.address}
                        </p>
                        <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Distance: {distInfo.formattedDistance} · Est. Travel Time: ~{distInfo.formattedEta} (based on distance)</span>
                        </p>
                        <p className="text-xs text-amber-200/90 italic">"{b.problemDescription}"</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Payout Value</span>
                          <span className="font-mono text-base font-bold text-emerald-400">₹{b.totalAmount - b.platformFee}</span>
                        </div>
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'accepted')}
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
                        >
                          Accept Booking
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Jobs Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active In-Progress Jobs ({activeJobs.length})
            </h3>
            {activeJobs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No active jobs at the moment.</p>
            ) : (
              activeJobs.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-white">{b.serviceName}</h4>
                      <p className="text-xs text-slate-400">
                        Customer: {b.customerName} · Scheduled: {b.scheduledDate} ({b.scheduledTimeSlot})
                      </p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      Current: {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Address:</span> {b.address}
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    <span className="font-semibold text-slate-400">Notes:</span> "{b.problemDescription}"
                  </p>

                  {/* Status update controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenChat(b.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        Chat Customer
                      </button>
                      <button
                        onClick={() => setActiveTrackingBooking(b)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center gap-1.5 shadow-sm cursor-pointer"
                        title="View Live Route GPS Tracker"
                      >
                        <Navigation className="w-3.5 h-3.5 text-slate-950" />
                        <span>Track Route</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {b.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'on_the_way')}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950"
                        >
                          I'm On The Way
                        </button>
                      )}

                      {b.status === 'on_the_way' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'work_started')}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                        >
                          Arrived & Start Work
                        </button>
                      )}

                      {b.status === 'work_started' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'work_completed')}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950"
                        >
                          Mark Work Completed
                        </button>
                      )}

                      {b.status === 'work_completed' && (
                        <span className="text-xs font-semibold text-slate-400">
                          Awaiting customer sign-off & escrow release
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Analytics & Growth Charts */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Volume Chart Simulation */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Weekly Jobs Completed
              </h3>
              <div className="flex items-end justify-between h-44 pt-6 gap-3">
                {[
                  { day: 'Mon', count: 4, height: '40%' },
                  { day: 'Tue', count: 6, height: '60%' },
                  { day: 'Wed', count: 3, height: '30%' },
                  { day: 'Thu', count: 8, height: '80%' },
                  { day: 'Fri', count: 9, height: '90%' },
                  { day: 'Sat', count: 12, height: '100%' },
                  { day: 'Sun', count: 7, height: '70%' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] text-emerald-400 font-bold">{item.count}</span>
                    <div
                      style={{ height: item.height }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md"
                    />
                    <span className="text-[10px] text-slate-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Earnings Trajectory */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Monthly Net Cooperative Earnings (INR)
              </h3>
              <div className="space-y-3 pt-2">
                {[
                  { month: 'June 2026', amount: '₹34,200', pct: 60 },
                  { month: 'July 2026', amount: '₹42,800', pct: 75 },
                  { month: 'August 2026', amount: '₹51,400', pct: 88 },
                  { month: 'September 2026', amount: '₹56,100', pct: 100 },
                ].map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{m.month}</span>
                      <span className="text-emerald-400 font-bold font-mono">{m.amount}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        style={{ width: `${m.pct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Cooperative Guilds */}
      {activeTab === 'guilds' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            You are enrolled in the following multi-trade cooperative groups. When customers request squad packages,
            bookings are synchronized across member schedules.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {store.coopGroups.map((grp) => (
              <div key={grp.id} className="p-5 rounded-2xl glass-card border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-white">{grp.name}</h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Active Member
                  </span>
                </div>
                <p className="text-xs text-slate-300">{grp.description}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Coordinator: <span className="text-white font-medium">{grp.coordinatorName}</span> · Rating: {grp.rating}★
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-slate-700 space-y-4 text-left">
            <h3 className="font-heading text-lg font-bold text-white">Withdraw Cooperative Earnings</h3>
            <p className="text-xs text-slate-300">
              Transfer funds directly from cooperative escrow to your registered bank account. Zero withdrawal fees.
            </p>

            {withdrawSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold">
                Payout of ₹{withdrawAmount} successfully submitted! Funds will reflect within 15 minutes.
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Withdrawal Amount (INR)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold font-mono text-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Destination Account</span>
                  <p className="font-mono text-white">HDFC Bank · A/C **4491 · IFSC: HDFC0001245</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setWithdrawModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl"
                  >
                    Confirm Instant Transfer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Live Route GPS Tracker Modal */}
      {activeTrackingBooking && (
        <LiveTrackerModal
          booking={activeTrackingBooking}
          onClose={() => setActiveTrackingBooking(null)}
          onOpenChat={onOpenChat}
        />
      )}
    </div>
  );
};
