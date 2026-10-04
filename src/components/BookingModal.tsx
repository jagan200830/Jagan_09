import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { store } from '../data/store';
import { Booking, PaymentMethod, ServiceItem, ServiceProfessional } from '../types';
import { calculateDistanceAndEta } from '../utils/distanceTracker';
import { LiveTrackerModal } from './LiveTrackerModal';
import { TradeAvatar } from './TradeAvatar';

interface BookingModalProps {
  initialPro?: ServiceProfessional;
  initialService?: ServiceItem;
  initialNotes?: string;
  initialEmergency?: boolean;
  initialBooking?: Booking;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  onOpenChat?: (bookingId: string) => void;
}

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '04:00 PM - 05:00 PM',
  '06:00 PM - 07:00 PM',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  initialPro,
  initialService,
  initialNotes = '',
  initialEmergency = false,
  initialBooking,
  onClose,
  onBookingSuccess,
  onOpenChat,
}) => {
  const pros = store.getApprovedProfessionals();
  const services = store.services;

  const [selectedProId, setSelectedProId] = useState<string>(
    initialBooking
      ? initialBooking.professionalId
      : initialPro
      ? initialPro.id
      : pros[0]?.id || ''
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialBooking
      ? initialBooking.serviceId
      : initialService
      ? initialService.id
      : services[0]?.id || ''
  );

  const selectedPro = pros.find((p) => p.id === selectedProId) || pros[0];
  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [scheduledDate, setScheduledDate] = useState<string>(
    initialBooking ? initialBooking.scheduledDate : tomorrowStr
  );
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>(
    initialBooking ? initialBooking.scheduledTimeSlot : TIME_SLOTS[1]
  );
  const [address, setAddress] = useState<string>(
    initialBooking
      ? initialBooking.address
      : store.currentUser.location || ''
  );
  const [problemDescription, setProblemDescription] = useState<string>(
    initialBooking
      ? initialBooking.problemDescription
      : initialNotes || ''
  );
  const [additionalNotes, setAdditionalNotes] = useState<string>(
    initialBooking?.notes || ''
  );
  const [isEmergency, setIsEmergency] = useState<boolean>(
    initialBooking ? initialBooking.isEmergency : initialEmergency
  );
  const [selectedCoopGroup, setSelectedCoopGroup] = useState<string>(
    initialBooking?.cooperativeGroupId || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialBooking ? initialBooking.paymentMethod : 'upi'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Steps: 1 = Details, 2 = Payment & Confirm, 3 = Dispatch & Real-Time Tracking
  const [step, setStep] = useState<number>(initialBooking ? 3 : 1);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(initialBooking || null);

  // Service person acceptance state
  const isAlreadyAccepted = initialBooking ? initialBooking.status !== 'requested' : false;
  const [isProAccepted, setIsProAccepted] = useState<boolean>(isAlreadyAccepted);
  const [trackerModalOpen, setTrackerModalOpen] = useState<boolean>(false);

  // Dynamic distance & ETA calculation based on physical location
  const distanceInfo = calculateDistanceAndEta(
    selectedPro.coords || selectedPro.location,
    address,
    isEmergency
  );

  // Synchronize with external store events (when service person accepts from their dashboard)
  useEffect(() => {
    if (!confirmedBooking || isProAccepted) return;

    const unsubscribe = store.subscribe(() => {
      const updated = store.bookings.find((b) => b.id === confirmedBooking.id);
      if (updated && updated.status !== 'requested') {
        setIsProAccepted(true);
      }
    });

    return () => unsubscribe();
  }, [confirmedBooking, isProAccepted]);

  // Financial calculations
  const servicePrice = selectedService.startingPrice;
  const platformFee = Math.round(servicePrice * 0.1);
  const taxes = Math.round((servicePrice + platformFee) * 0.05);
  const discount = selectedCoopGroup ? 50 : 0;
  const totalAmount = servicePrice + platformFee + taxes - discount;

  // Handle booking creation (moves to waiting state)
  const handleConfirm = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking = store.createBooking({
        professionalId: selectedPro.id,
        serviceId: selectedService.id,
        scheduledDate,
        scheduledTimeSlot,
        address,
        problemDescription,
        notes: additionalNotes,
        isEmergency,
        cooperativeGroupId: selectedCoopGroup || undefined,
        paymentMethod,
      });

      setConfirmedBooking(newBooking);
      setIsSubmitting(false);
      setIsProAccepted(false); // Waiting for acceptance
      setStep(3);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 text-left max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Cooperative Booking Workflow
              </span>
              {step === 3 && (
                <span
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                    isProAccepted
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isProAccepted ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
                    }`}
                  />
                  {isProAccepted ? 'Live Tracking Active · En Route' : 'Awaiting Pro Acceptance'}
                </span>
              )}
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mt-0.5">
              {step === 1
                ? 'Schedule Service Visit'
                : step === 2
                ? 'Cooperative Escrow Checkout'
                : isProAccepted
                ? 'Booking Accepted · Live GPS Tracking Available'
                : 'Request Sent · Awaiting Service Person Acceptance'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        {step !== 3 && (
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setStep(1)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                step === 1 ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Job Details & Schedule
            </button>
            <button
              onClick={() => setStep(2)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                step === 2 ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Transparent Pricing & Pay
            </button>
          </div>
        )}

        {/* Step 1: Booking Details */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Pro & Service Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <TradeAvatar
                  name={selectedPro.name}
                  category={selectedPro.category}
                  size="lg"
                  className="ring-2 ring-emerald-500/30 shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedPro.name}</h4>
                  <p className="text-xs text-slate-400">
                    {selectedPro.category} · {selectedPro.experienceYears} yrs experience
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    Distance: {distanceInfo.formattedDistance} · Est. Travel Time: ~{distanceInfo.formattedEta} (after acceptance)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Base Inspection</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">₹{selectedService.startingPrice}</span>
              </div>
            </div>

            {/* Select Specific Service */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Selected Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 cursor-pointer"
              >
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} — ₹{srv.startingPrice} ({srv.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Service Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Time Slot
                </label>
                <select
                  value={scheduledTimeSlot}
                  onChange={(e) => setScheduledTimeSlot(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 cursor-pointer"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Service Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Door/Flat number, apartment name, street and landmark"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
              />
            </div>

            {/* Problem Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Problem Description & Notes
              </label>
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={2}
                placeholder="Describe what is broken, sounds heard, or exact model of appliance..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 resize-none"
              />
            </div>

            {/* Emergency Checkbox */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-white">Emergency Immediate Dispatch</h5>
                  <p className="text-[11px] text-slate-300">Priority dispatch: live road tracker activates immediately upon technician acceptance.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
              >
                Proceed to Payment & Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Pricing Breakdown & Payment Methods */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Price Breakdown Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Transparent Cooperative Pricing
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Standard Service Charge</span>
                  <span className="font-mono">₹{servicePrice}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Platform Operations Fee (10%)</span>
                  <span className="font-mono">₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Applicable GST / Taxes (5%)</span>
                  <span className="font-mono">₹{taxes}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Cooperative Guild Discount</span>
                    <span className="font-mono">-₹{discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Payable Amount</span>
                  <span className="font-mono text-emerald-400 text-base">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold">UPI / QR Code</h5>
                    <p className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold">Credit / Debit Card</h5>
                    <p className="text-[10px] text-slate-400">Visa, MasterCard, RuPay</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold">Net Banking</h5>
                    <p className="text-[10px] text-slate-400">All Major Indian Banks</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_service')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    paymentMethod === 'cash_on_service'
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold">Cash On Service</h5>
                    <p className="text-[10px] text-slate-400">Pay after completion</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Escrow Guarantee */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-emerald-300">Cooperative Escrow Guarantee</h5>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  Funds remain protected in cooperative escrow until you verify the repair and enter your completion PIN.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                ← Back
              </button>

              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Placing Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Booking (₹{totalAmount})
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Real-Time Pro Acceptance & Live Tracker System */}
        {step === 3 && (
          <div className="space-y-6">
            {!isProAccepted ? (
              /* Awaiting Service Person Acceptance State */
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Notice Banner */}
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                        Awaiting Partner Acceptance
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending Confirmation
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your booking request has been dispatched to <span className="text-white font-semibold">{selectedPro.name}</span> ({selectedPro.category}). Live GPS Tracking and arrival details will unlock <strong>once the service person accepts the booking</strong>.
                    </p>
                  </div>
                </div>

                {/* Dispatch & Distance Status Card */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                    <span className="text-slate-400 font-medium">Technician Proximity:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {distanceInfo.formattedDistance} ({distanceInfo.displayTransit})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Service Address</span>
                      <p className="text-slate-200 font-medium mt-1 truncate">{address}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Technician Hub</span>
                      <p className="text-slate-200 font-medium mt-1 truncate">{selectedPro.location}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-amber-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                      <span>Waiting for {selectedPro.name} to confirm dispatch...</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirmedBooking) {
                          store.updateBookingStatus(confirmedBooking.id, 'accepted', `${selectedPro.name} accepted your booking`);
                          setIsProAccepted(true);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer self-start sm:self-auto"
                      title="Simulate service partner accepting from their phone/dashboard"
                    >
                      Simulate Pro Acceptance (Demo)
                    </button>
                  </div>
                </div>

                {/* Service Person Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <TradeAvatar
                      name={selectedPro.name}
                      category={selectedPro.category}
                      size="lg"
                      className="ring-2 ring-amber-500/30 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedPro.name}</h4>
                      <p className="text-xs text-slate-400">
                        {selectedPro.category} · Phone: <span className="font-mono text-slate-300">{selectedPro.phone}</span> (Demo)
                      </p>
                      <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                        Status: Reviewing job scope & route distance ({distanceInfo.formattedDistance})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions while awaiting acceptance */}
                <div className="flex items-center justify-between pt-1">
                  {onOpenChat && confirmedBooking && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChat(confirmedBooking.id);
                        onClose();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      Chat with Partner
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (confirmedBooking) {
                        onBookingSuccess(confirmedBooking);
                      } else {
                        onClose();
                      }
                    }}
                    className="ml-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View in My Bookings</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Professional Accepted State -> TRACKING SYSTEM UNLOCKED */
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                {/* Acceptance Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 flex items-center justify-between gap-4 shadow-xl shadow-emerald-950/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-lg shadow-emerald-500/30">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Booking Accepted! Tracking Active
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          Order #{confirmedBooking?.id.slice(-5) || '104'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-400/90 font-medium mt-0.5">
                        {selectedPro.name} accepted your request and is preparing transit.
                      </p>
                    </div>
                  </div>
                </div>

                {/* TRACKER SYSTEM HERO CARD WITH TRACKING BUTTON */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <Navigation className="w-5 h-5 text-emerald-400 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                          Live Road Tracking System
                        </span>
                        <h4 className="text-base font-bold text-white">
                          {distanceInfo.formattedDistance} from your address
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Transit Time</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        ~{distanceInfo.formattedEta} (based on distance)
                      </span>
                    </div>
                  </div>

                  {/* Prominent Track Service Person Button */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Technician En Route Available
                      </h4>
                      <p className="text-xs text-slate-300">
                        View live GPS navigation, road progress, vehicle details and estimated arrival.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTrackerModalOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4 text-slate-950" />
                      <span>Track Service Person</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Technician Hub</span>
                      <span className="text-slate-200 font-medium truncate block mt-0.5">{selectedPro.location}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Destination</span>
                      <span className="text-slate-200 font-medium truncate block mt-0.5">{address}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Road Distance</span>
                      <span className="text-emerald-400 font-mono font-bold block mt-0.5">{distanceInfo.formattedDistance}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Dispatch Profile & Direct Contact */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <TradeAvatar
                      name={selectedPro.name}
                      category={selectedPro.category}
                      size="lg"
                      className="ring-2 ring-emerald-500/40 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{selectedPro.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Verified Delegate
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {selectedPro.category} · Rating: <span className="text-amber-400 font-bold">★ {selectedPro.rating}</span> ({selectedPro.completedJobs} jobs)
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Phone: <span className="font-mono text-slate-200">{selectedPro.phone}</span> (Demo)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setTrackerModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Live Map
                    </button>

                    {onOpenChat && confirmedBooking && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenChat(confirmedBooking.id);
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        Chat with Partner
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmedBooking) onBookingSuccess(confirmedBooking);
                      else onClose();
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                  >
                    <span>View in My Bookings</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Tracker Modal Portal */}
      {trackerModalOpen && confirmedBooking && (
        <LiveTrackerModal
          booking={confirmedBooking}
          onClose={() => setTrackerModalOpen(false)}
          onOpenChat={onOpenChat}
        />
      )}
    </div>
  );
};
