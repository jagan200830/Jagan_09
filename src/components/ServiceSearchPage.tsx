import React, { useState } from 'react';
import {
  CheckCircle,
  Filter,
  Heart,
  MapPin,
  MessageSquare,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Star,
  Wrench,
  X,
} from 'lucide-react';
import { store } from '../data/store';
import { ServiceItem, ServiceProfessional } from '../types';
import { getProDistance } from '../utils/distanceTracker';
import { TradeAvatar } from './TradeAvatar';

interface ServiceSearchPageProps {
  initialCategory?: string;
  onViewProfile: (pro: ServiceProfessional) => void;
  onBookPro: (pro: ServiceProfessional) => void;
  onOpenChat: (proId: string) => void;
}

export const ServiceSearchPage: React.FC<ServiceSearchPageProps> = ({
  initialCategory = 'All',
  onViewProfile,
  onBookPro,
  onOpenChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(20);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
  const [availableNowOnly, setAvailableNowOnly] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(store.favorites);

  const categories = ['All', ...store.categories.map((c) => c.name)];
  const allPros = store.getApprovedProfessionals();

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    store.toggleFavorite(id);
    setFavorites([...store.favorites]);
  };

  // Filter logic
  const filteredPros = allPros.filter((pro) => {
    // Search query
    const matchSearch =
      pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pro.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pro.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pro.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Category
    const matchCategory =
      selectedCategory === 'All' || pro.category.toLowerCase() === selectedCategory.toLowerCase();

    // Distance
    const matchDistance = pro.serviceRadiusKm <= maxDistanceKm;

    // Rating
    const matchRating = pro.rating >= minRating;

    // Verified
    const matchVerified = !verifiedOnly || pro.verificationStatus === 'verified';

    // Emergency
    const matchEmergency = !emergencyOnly || pro.emergencyAvailable;

    // Availability
    const matchAvail = !availableNowOnly || pro.availability === 'available_now';

    return (
      matchSearch &&
      matchCategory &&
      matchDistance &&
      matchRating &&
      matchVerified &&
      matchEmergency &&
      matchAvail
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Cooperative Worker Directory
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Discover Verified Service Professionals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Worker-owned services in Bangalore · Direct booking with zero platform exploitation
          </p>
        </div>
        <div className="text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
          Showing <span className="text-white font-bold">{filteredPros.length}</span> professionals
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-700/80 space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by professional name, skill (e.g. MCB, tap, gas refill), or locality..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toggle Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="text-slate-200 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Verified Only
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              className="rounded border-slate-700 text-rose-500 focus:ring-0"
            />
            <span className="text-slate-200 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Emergency Service
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={availableNowOnly}
              onChange={(e) => setAvailableNowOnly(e.target.checked)}
              className="rounded border-slate-700 text-teal-500 focus:ring-0"
            />
            <span className="text-slate-200 font-medium">Available Now</span>
          </label>

          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Min Rating:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none"
            >
              <option value="0" className="bg-slate-900">All</option>
              <option value="4.5" className="bg-slate-900">4.5+ ★</option>
              <option value="4.8" className="bg-slate-900">4.8+ ★</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Professional Cards */}
      {filteredPros.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-slate-800 space-y-3">
          <Wrench className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No professionals match your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try loosening your rating or emergency filters, or search for a different trade.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setVerifiedOnly(false);
              setEmergencyOnly(false);
              setMinRating(0);
            }}
            className="px-4 py-2 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPros.map((pro) => (
            <div
              key={pro.id}
              className="p-5 rounded-2xl glass-card glass-card-hover border-slate-800/90 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header with Avatar & Favorite */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <TradeAvatar name={pro.name} category={pro.category} size="lg" className="ring-2 ring-emerald-500/20 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white">{pro.name}</h3>
                        {pro.verificationStatus === 'verified' && (
                          <span title="Verified Worker-Owner">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400">{pro.category}</span>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {pro.location}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFav(pro.id, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${favorites.includes(pro.id) ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                  </button>
                </div>

                {/* Rating & Jobs */}
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-300">
                  <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {pro.rating}
                  </span>
                  <span>·</span>
                  <span>{pro.completedJobs} jobs done</span>
                  <span>·</span>
                  <span>{pro.experienceYears} yrs exp</span>
                </div>

                {/* Skills Preview */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {pro.skills.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {pro.skills.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{pro.skills.length - 3}</span>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 mt-3 text-[11px]">
                  {pro.availability === 'available_now' ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Available Now ({getProDistance(pro, store.currentUser.location).formattedDistance} · ~{getProDistance(pro, store.currentUser.location).formattedEta})
                    </span>
                  ) : (
                    <span className="text-slate-400">Scheduled Visits ({getProDistance(pro, store.currentUser.location).formattedDistance})</span>
                  )}
                  {pro.emergencyAvailable && (
                    <span className="text-rose-400 text-[10px] font-bold bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/30">
                      Emergency On-Call
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Starting price</span>
                  <span className="text-sm font-bold text-white font-mono">₹{pro.startingPrice}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewProfile(pro)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onBookPro(pro)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
