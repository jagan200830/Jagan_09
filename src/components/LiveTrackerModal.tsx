import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Compass,
  MapPin,
  MessageSquare,
  Navigation,
  PhoneCall,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { store } from '../data/store';
import { Booking, BookingStatus, ServiceProfessional } from '../types';
import { calculateDistanceAndEta } from '../utils/distanceTracker';
import { TradeAvatar } from './TradeAvatar';

interface LiveTrackerModalProps {
  booking: Booking;
  onClose: () => void;
  onOpenChat?: (bookingId: string) => void;
}

export const LiveTrackerModal: React.FC<LiveTrackerModalProps> = ({
  booking,
  onClose,
  onOpenChat,
}) => {
  const pro =
    store.professionals.find((p) => p.id === booking.professionalId) ||
    store.professionals[0];

  // Dynamic distance calculation based on technician & customer addresses (NEVER static)
  const distanceInfo = calculateDistanceAndEta(
    pro.coords || pro.location,
    booking.address,
    booking.isEmergency
  );

  const initialDistanceKm = distanceInfo.distanceKm;
  const initialEtaMinutes = distanceInfo.etaMinutes;

  // Real-time tracking progression state
  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(booking.status);
  const [transitProgress, setTransitProgress] = useState<number>(() => {
    if (booking.status === 'completed' || booking.status === 'work_completed') return 100;
    if (booking.status === 'work_started') return 95;
    if (booking.status === 'on_the_way') return 45;
    return 15; // Accepted & preparing
  });

  // Calculate remaining distance based on transit progress
  const distanceRemaining = Math.max(
    0.1,
    Math.round(initialDistanceKm * (1 - transitProgress / 100) * 10) / 10
  );
  const etaMinutesRemaining = Math.max(
    1,
    Math.round(initialEtaMinutes * (1 - transitProgress / 100))
  );

  // Animate transit movement when on_the_way
  useEffect(() => {
    if (currentStatus !== 'on_the_way' && currentStatus !== 'accepted') return;

    const interval = setInterval(() => {
      setTransitProgress((prev) => {
        if (prev >= 96) {
          clearInterval(interval);
          return 96;
        }
        return prev + 2;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [currentStatus]);

  // Handler to advance stage in real-time
  const advanceStage = (nextStatus: BookingStatus, customNote?: string) => {
    setCurrentStatus(nextStatus);
    store.updateBookingStatus(booking.id, nextStatus, customNote);

    if (nextStatus === 'on_the_way') {
      setTransitProgress(40);
    } else if (nextStatus === 'work_started') {
      setTransitProgress(98);
    } else if (nextStatus === 'work_completed' || nextStatus === 'completed') {
      setTransitProgress(100);
    }
  };

  // Status badge config
  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    requested: { label: 'Dispatched (Awaiting Acceptance)', color: 'text-amber-300', bg: 'bg-amber-950/80 border-amber-500/40' },
    accepted: { label: 'Booking Accepted · Route Planned', color: 'text-sky-300', bg: 'bg-sky-950/80 border-sky-500/40' },
    on_the_way: { label: 'En Route · Live GPS Tracking Active', color: 'text-emerald-300', bg: 'bg-emerald-950/80 border-emerald-500/40' },
    work_started: { label: 'Arrived · Service In Progress', color: 'text-teal-300', bg: 'bg-teal-950/80 border-teal-500/40' },
    work_completed: { label: 'Service Completed · Pending Customer Review', color: 'text-emerald-400', bg: 'bg-emerald-950 border-emerald-500' },
    completed: { label: 'Completed & Escrow Settled', color: 'text-emerald-400', bg: 'bg-emerald-950 border-emerald-500' },
  };

  const statusConfig = statusLabels[currentStatus] || statusLabels.accepted;

  // Visual coordinates along simulated route
  // Start (technician origin) -> End (customer destination at 80% left, 50% top)
  const markerLeftPercent = 20 + (transitProgress / 100) * 60;
  const markerTopPercent = 35 + Math.sin((transitProgress / 100) * Math.PI) * 18;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl p-5 sm:p-7 space-y-6 text-left max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Live GPS Cooperative Tracking System
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1.5`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {statusConfig.label}
              </span>
            </div>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white mt-1">
              Tracking {booking.serviceName}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Order #{booking.id.slice(-6)} · Service Partner: {booking.professionalName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracking Content - Strictly displays after acceptance */}
        {currentStatus === 'requested' ? (
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-amber-500/40 text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Awaiting Service Person Acceptance
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-white mt-2">
                Live GPS Tracking Unlocks Upon Acceptance
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your service order has been dispatched to <span className="text-white font-semibold">{pro.name}</span>.
                Real-time route navigation, live road distance countdown, and technician movement will display here as soon as the service person accepts your booking.
              </p>
            </div>

            {/* Service Person Info Card */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left flex items-center gap-3">
              <TradeAvatar name={pro.name} category={pro.category} size="md" />
              <div>
                <h4 className="text-xs font-bold text-white">{pro.name}</h4>
                <p className="text-[11px] text-slate-400">{pro.category} Specialist · {pro.location}</p>
                <p className="text-[10px] text-amber-400 font-semibold mt-0.5">Route Distance: {distanceInfo.formattedDistance} from your address</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => advanceStage('accepted', `${pro.name} accepted your booking`)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                title="Simulate technician accepting booking"
              >
                <CheckCircle className="w-4 h-4 text-slate-950" />
                <span>Simulate Pro Acceptance (Demo)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Live Distance & ETA Stat Strip - COMPUTED FROM PHYSICAL DISTANCE */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Distance to Location
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-white">
                  {transitProgress >= 95 ? '0.0 km' : `${distanceRemaining} km`}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Calculated from route
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Estimated Travel Time
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">
                  {transitProgress >= 95 ? 'Arrived' : `~${etaMinutesRemaining} mins`}
                </span>
                <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                  Based on {initialDistanceKm} km distance
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Transit Vehicle
                </span>
                <span className="font-medium text-xs sm:text-sm text-slate-200 block truncate mt-1">
                  Two-Wheeler Mobile Toolkit
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  KA-03-EM-8821
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Safety PIN
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-amber-400">
                  {booking.id.slice(-4).toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Share with partner on arrival
                </span>
              </div>
            </div>

            {/* Live Vector Radar & Route Map Visualizer */}
            <div className="relative w-full h-[280px] sm:h-[320px] rounded-3xl overflow-hidden border border-slate-700/80 bg-[#090f1d] shadow-inner select-none">
              {/* Subtle Grid Matrix */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:32px_32px]" />

              {/* Radar Waves */}
              <div className="absolute top-1/2 left-[80%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-emerald-500/20 animate-pulse pointer-events-none" />
              <div className="absolute top-1/2 left-[80%] -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-emerald-500/10 pointer-events-none" />

              {/* Dotted Route Trajectory */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 20% 35% Q 50% 55% 80% 50%"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                  className="opacity-70"
                />
                {/* Completed Trajectory Path */}
                <path
                  d="M 20% 35% Q 50% 55% 80% 50%"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="4"
                  strokeDasharray="200"
                  strokeDashoffset={200 - (transitProgress / 100) * 200}
                  className="transition-all duration-700"
                />
              </svg>

              {/* Start Location Pin: Service Professional Base */}
              <div className="absolute top-[35%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center shadow-lg">
                  <Wrench className="w-3.5 h-3.5 text-slate-300" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 text-[9px] font-bold text-slate-400">
                  {pro.name.split(' ')[0]}'s Hub ({pro.location.split(',')[0]})
                </span>
              </div>

              {/* Destination Pin: Customer Home */}
              <div className="absolute top-[50%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    <MapPin className="w-5 h-5 text-emerald-300" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-emerald-500/40 text-[10px] font-bold text-white shadow max-w-[140px] truncate text-center">
                  Your Home ({booking.address.split(',')[0]})
                </span>
              </div>

              {/* LIVE MOVING TECHNICIAN PIN */}
              <div
                className="absolute z-30 flex flex-col items-center transition-all duration-700 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${markerLeftPercent}%`,
                  top: `${markerTopPercent}%`,
                }}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/60 ring-4 ring-emerald-500/30">
                    <Navigation className="w-5 h-5 animate-pulse text-slate-950" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-300 border-2 border-slate-950 animate-ping" />
                </div>

                <div className="mt-1 px-2 py-0.5 rounded-lg bg-slate-950/95 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 shadow whitespace-nowrap">
                  {transitProgress >= 95 ? (
                    'Arrived at your door'
                  ) : (
                    <>
                      {pro.name.split(' ')[0]} · {distanceRemaining} km away (~{etaMinutesRemaining}m)
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic route progress overlay bar */}
              <div className="absolute bottom-3 left-4 right-4 z-20 p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-sm flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Route: {pro.location.split(',')[0]} → {booking.address.split(',')[0]} ({initialDistanceKm} km total)
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {transitProgress}% of route traversed
                </span>
              </div>
            </div>
          </>
        )}

        {/* Dispatch Progress Steps */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cooperative Dispatch Stage Checkpoints
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {[
              { id: 'requested', label: '1. Request Placed', done: true },
              {
                id: 'accepted',
                label: '2. Accepted by Pro',
                done: ['accepted', 'on_the_way', 'work_started', 'work_completed', 'completed'].includes(currentStatus),
              },
              {
                id: 'on_the_way',
                label: '3. En Route (Live)',
                done: ['on_the_way', 'work_started', 'work_completed', 'completed'].includes(currentStatus),
              },
              {
                id: 'work_started',
                label: '4. Arrived & Working',
                done: ['work_started', 'work_completed', 'completed'].includes(currentStatus),
              },
              {
                id: 'completed',
                label: '5. Completed & Signed',
                done: ['work_completed', 'completed'].includes(currentStatus),
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  step.done
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  {step.done ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="text-[11px]">{step.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Service Person Info & Direct Contact Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TradeAvatar
              name={pro.name}
              category={pro.category}
              size="lg"
              className="ring-2 ring-emerald-500/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white">{pro.name}</h4>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Worker-Owner
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {pro.category} · {pro.experienceYears} yrs experience · {pro.rating} ★
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Dispatch Phone: <span className="font-mono text-emerald-300 font-medium">{pro.phone}</span> (Demo)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${pro.phone.replace(/\s+/g, '')}`}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              Call Partner
            </a>

            {onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  onOpenChat(booking.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Live Chat
              </button>
            )}
          </div>
        </div>

        {/* Live Simulation Controls for User Testing */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Simulate Live Technician Status Movement:
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Real-Time State Switch</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => advanceStage('on_the_way', `${pro.name} is on the way (2.8 km away)`)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500/40 transition-colors cursor-pointer"
            >
              1. En Route (On The Way)
            </button>
            <button
              onClick={() => advanceStage('work_started', `${pro.name} arrived at customer doorstep`)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500/40 transition-colors cursor-pointer"
            >
              2. Arrived & Started Work
            </button>
            <button
              onClick={() => advanceStage('work_completed', 'Service finished. Inspection verified.')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-950/40 transition-colors cursor-pointer"
            >
              3. Work Completed
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            100% Cooperative Escrow Guarantee
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
