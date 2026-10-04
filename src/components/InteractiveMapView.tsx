import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Compass,
  MapPin,
  Navigation,
  PhoneCall,
  Shield,
  ShieldAlert,
  Star,
  Wrench,
  Zap,
} from 'lucide-react';
import { store } from '../data/store';
import { ServiceProfessional } from '../types';
import { getProDistance } from '../utils/distanceTracker';
import { TradeAvatar } from './TradeAvatar';

interface InteractiveMapViewProps {
  onSelectPro: (pro: ServiceProfessional) => void;
  onBookPro: (pro: ServiceProfessional) => void;
}

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  onSelectPro,
  onBookPro,
}) => {
  const pros = store.getApprovedProfessionals();
  const [selectedProId, setSelectedProId] = useState<string>(pros[0]?.id || '');
  const [radiusKm, setRadiusKm] = useState<number>(12);
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);

  const selectedPro = pros.find((p) => p.id === selectedProId) || pros[0];

  const visiblePros = pros.filter(
    (p) => p.serviceRadiusKm <= radiusKm && (!emergencyOnly || p.emergencyAvailable)
  );

  return (
    <div className="space-y-6 text-left">
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Live Cooperative Radar</h3>
            <p className="text-[11px] text-slate-400">Bangalore Central & East Region</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Radius:</span>
            <input
              type="range"
              min={5}
              max={20}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="accent-emerald-500 cursor-pointer w-24"
            />
            <span className="font-mono text-emerald-400 font-bold">{radiusKm} km</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              className="rounded border-slate-700 text-rose-500 focus:ring-0"
            />
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Emergency Standby
            </span>
          </label>
        </div>
      </div>

      {/* Visual Map Canvas / Vector Surface */}
      <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-800 bg-[#0a1120] shadow-inner select-none">
        {/* Stylized vector roads & grid pattern */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Ambient Radar Rings radiating from Customer position */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-emerald-500/20 animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-emerald-500/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-emerald-500/5 pointer-events-none" />

        {/* Customer Location Pin (Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <div className="w-3.5 h-3.5 rounded-full bg-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-white shadow">
            Your Location (Indiranagar)
          </div>
        </div>

        {/* Pros Pins Positioned Geographically in simulated 2D coordinates */}
        {visiblePros.map((pro, index) => {
          // Offsets based on Bangalore coordinates
          const offsets: Record<string, { top: string; left: string }> = {
            pro_ravi: { top: '38%', left: '55%' },
            pro_arjun: { top: '56%', left: '46%' },
            pro_priya: { top: '70%', left: '58%' },
            pro_manoj: { top: '64%', left: '40%' },
            pro_sneha: { top: '72%', left: '32%' },
            pro_rajesh: { top: '48%', left: '76%' },
            pro_vikram: { top: '52%', left: '62%' },
            pro_kavita: { top: '32%', left: '82%' },
          };

          const pos = offsets[pro.id] || {
            top: `${40 + (index % 4) * 12}%`,
            left: `${35 + (index * 14) % 55}%`,
          };

          const isSelected = selectedProId === pro.id;

          return (
            <div
              key={pro.id}
              style={{ top: pos.top, left: pos.left }}
              onClick={() => setSelectedProId(pro.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
            >
              <div
                className={`relative flex items-center justify-center transition-transform ${
                  isSelected ? 'scale-125' : 'hover:scale-110'
                }`}
              >
                <TradeAvatar
                  name={pro.name}
                  category={pro.category}
                  size="sm"
                  className={`rounded-full border-2 shadow-lg ${
                    isSelected
                      ? 'border-emerald-400 ring-4 ring-emerald-500/40'
                      : pro.emergencyAvailable
                      ? 'border-rose-400'
                      : 'border-slate-400'
                  }`}
                />
                {pro.emergencyAvailable && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-900" />
                )}
              </div>

              {/* Pin Hover/Select Tooltip */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-11 px-2.5 py-1 rounded-xl bg-slate-900/95 border shadow-xl whitespace-nowrap text-left transition-all ${
                  isSelected
                    ? 'opacity-100 border-emerald-500/40'
                    : 'opacity-0 group-hover:opacity-100 border-slate-700 pointer-events-none'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-white">{pro.name}</span>
                  {pro.verificationStatus === 'verified' && (
                    <span title="Verified Worker-Owner">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-300">
                  {pro.category} · <span className="text-emerald-400">{getProDistance(pro, store.currentUser.location).displayTransit}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Selected Pro Quick Card Overlay (Bottom Left) */}
        {selectedPro && (() => {
          const distInfo = getProDistance(selectedPro, store.currentUser.location);
          return (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-30 p-4 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <TradeAvatar
                  name={selectedPro.name}
                  category={selectedPro.category}
                  size="lg"
                  className="ring-2 ring-emerald-500/30 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white">{selectedPro.name}</h4>
                    {selectedPro.verificationStatus === 'verified' && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {selectedPro.category} · {selectedPro.experienceYears} yrs exp
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {selectedPro.location}
                  </p>
                </div>
              </div>

              <span className="text-amber-400 text-xs font-bold flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400" /> {selectedPro.rating}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">Distance & Transit</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {distInfo.formattedDistance} · ~{distInfo.formattedEta}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectPro(selectedPro)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => onBookPro(selectedPro)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
                >
                  Book Pro
                </button>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
};
