import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Compass,
  Hammer,
  Laptop,
  MapPin,
  Paintbrush,
  Percent,
  PhoneCall,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Tv,
  Users,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';
import { store } from '../data/store';
import { ServiceCategory, ServiceItem, ServiceProfessional } from '../types';
import { TradeAvatar } from './TradeAvatar';

interface LandingPageProps {
  onSelectCategory: (categoryName: string) => void;
  onSelectService: (service: ServiceItem) => void;
  onOpenAI: () => void;
  onOpenRegisterPro: () => void;
  onOpenEmergency: () => void;
  onViewProProfile?: (pro: ServiceProfessional) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectCategory,
  onSelectService,
  onOpenAI,
  onOpenRegisterPro,
  onOpenEmergency,
  onViewProProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const categories = store.categories;
  const services = store.services;
  const coopGroups = store.coopGroups;
  const professionals = store.professionals.filter((p) => p.isVerified);
  const currentUser = store.currentUser;
  const activeBookings = store.bookings.filter(
    (b) => b.customerId === currentUser.id && !['completed', 'cancelled'].includes(b.status)
  );

  const categoryIcons: Record<string, React.ReactNode> = {
    Plumbing: <Wrench className="w-5 h-5 text-sky-400" />,
    Electrical: <Zap className="w-5 h-5 text-amber-400" />,
    'Deep Cleaning': <Sparkles className="w-5 h-5 text-emerald-400" />,
    Carpentry: <Hammer className="w-5 h-5 text-amber-600" />,
    'Painting & Waterproofing': <Paintbrush className="w-5 h-5 text-pink-400" />,
    'AC & Cooling': <Wind className="w-5 h-5 text-cyan-400" />,
    'Appliance Repair': <Tv className="w-5 h-5 text-indigo-400" />,
    'Computer & Tech': <Laptop className="w-5 h-5 text-purple-400" />,
  };

  const filteredServices = searchQuery.trim()
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : services.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-left">
      {/* App Top Location & Emergency Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Indiranagar, Bengaluru</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-medium">42 Pros Nearby</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Co-op Escrow Protected</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 shadow-sm transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>24/7 Emergency Dispatch</span>
          </button>
        </div>
      </div>

      {/* App Search & AI Diagnostic Hero Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Search Bar with Quick Action */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  On-Demand Trade Services
                </span>
                {currentUser?.name && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Hello, <span className="text-white font-bold">{currentUser.name}</span>!
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Fair Cooperative Rates</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {currentUser?.name ? (
                <>
                  <span className="text-emerald-400">Hello {currentUser.name}, </span>
                  <span>what do you need help with today?</span>
                </>
              ) : (
                <span>What do you need help with today?</span>
              )}
            </h1>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services: 'electrician', 'AC gas refill', 'pipe leak', 'fan repair'..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Popular:</span>
            {['Plumbing', 'Electrical', 'AC & Cooling', 'Deep Cleaning', 'Carpentry'].map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GigAssist AI Interactive Launcher Card */}
        <div
          onClick={onOpenAI}
          className="lg:col-span-4 p-6 rounded-3xl glass-panel border border-emerald-500/30 hover:border-emerald-500/60 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 cursor-pointer transition-all flex flex-col justify-between group shadow-lg shadow-emerald-950/30"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                Gemini AI
              </span>
            </div>

            <div>
              <h3 className="font-heading text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                GigAssist AI Diagnostic
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Describe any breakdown in your own words. Get instant cause analysis, safety guidance, and direct verified pro dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs font-semibold text-emerald-400">
            <span>Diagnose My Problem</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Active Booking Banner (if present) */}
      {activeBookings.length > 0 && (
        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/40 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Active Service in Progress</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold uppercase">
                  {activeBookings[0].status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {activeBookings[0].serviceName} with {activeBookings[0].professionalName} · {activeBookings[0].scheduledTimeSlot}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectCategory('All')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shrink-0"
          >
            View Live Tracker
          </button>
        </div>
      )}

      {/* Service Categories Quick Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-white">Browse Categories</h2>
          <button
            onClick={() => onSelectCategory('All')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.slice(0, 8).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="p-3.5 rounded-2xl glass-card glass-card-hover cursor-pointer flex flex-col items-center text-center space-y-2 border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800/90 flex items-center justify-center shadow-inner">
                {categoryIcons[cat.name] || <Wrench className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white truncate max-w-full">{cat.name}</h4>
                <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">From ₹{cat.baseStartingPrice}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Cooperative Services */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Popular Doorstep Services</h2>
            <p className="text-xs text-slate-400">Fixed cooperative pricing, vetted parts, 30-day warranty</p>
          </div>
          <button
            onClick={() => onSelectCategory('All')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Explore 60+ Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="p-4 rounded-2xl glass-card glass-card-hover border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    {categoryIcons[srv.category] || <Wrench className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{srv.rating}</span>
                    <span className="text-slate-400 font-normal">({srv.reviewsCount})</span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{srv.category}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-1">{srv.name}</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{srv.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Starting from</span>
                  <span className="text-sm font-bold text-white font-mono">₹{srv.startingPrice}</span>
                </div>
                <button
                  onClick={() => onSelectService(srv)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cooperative Guild Squads (Renovations, Tech, Emergency) */}
      <section className="space-y-4">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/25 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 mb-1">
                <Users className="w-3.5 h-3.5" />
                Cooperative Guild Feature
              </div>
              <h2 className="font-heading text-xl font-bold text-white">Coordinated Multi-Trade Squads</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Multi-trade projects synchronized by peer worker squads with up to 15% package discounts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coopGroups.map((grp) => (
              <div key={grp.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-white">{grp.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {grp.discountPercentage}% OFF
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{grp.description}</p>
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Included Trades:</span>
                  <div className="flex flex-wrap gap-1">
                    {grp.servicesOffered.map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/60"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Base Bundle</span>
                    <span className="text-sm font-bold text-white font-mono">₹{grp.baseBundlePrice}</span>
                  </div>
                  <button
                    onClick={() => onSelectCategory('All')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors"
                  >
                    Request Squad
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Nearby Verified Professionals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Nearby Verified Professionals</h2>
            <p className="text-xs text-slate-400">Worker-owners with verified peer credentials & 100% background checks</p>
          </div>
          <button
            onClick={() => onSelectCategory('All')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View Map Radar</span>
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {professionals.slice(0, 4).map((pro) => (
            <div
              key={pro.id}
              className="p-4 rounded-2xl glass-card glass-card-hover border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <TradeAvatar name={pro.name} category={pro.category} size="lg" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="text-sm font-bold text-white truncate">{pro.name}</h3>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 truncate">{pro.category}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {pro.rating}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300">{pro.completedJobs} jobs</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Starting from</span>
                  <span className="font-bold text-white font-mono">₹{pro.hourlyRate}</span>
                </div>
                <button
                  onClick={() => onSelectCategory(pro.category)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                >
                  Book Pro
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
