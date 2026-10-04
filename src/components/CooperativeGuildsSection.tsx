import React from 'react';
import {
  ArrowRight,
  CheckCircle,
  Hammer,
  Laptop,
  Percent,
  Shield,
  ShieldAlert,
  Star,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { store } from '../data/store';
import { CooperativeGroup, ServiceProfessional } from '../types';
import { TradeAvatar } from './TradeAvatar';

interface CooperativeGuildsSectionProps {
  onBookGroup: (group: CooperativeGroup) => void;
  onViewPro: (pro: ServiceProfessional) => void;
}

export const CooperativeGuildsSection: React.FC<CooperativeGuildsSectionProps> = ({
  onBookGroup,
  onViewPro,
}) => {
  const groups = store.coopGroups;
  const pros = store.getApprovedProfessionals();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <Users className="w-3.5 h-3.5" />
          Cooperative Solidarity
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          Multi-Trade Cooperative Guilds
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Why coordinate 4 different contractors yourself? Our member-owned squads pool their trade skills—plumbing,
          wiring, woodworking, and cleaning—to execute coordinated renovation, emergency, and tech installations at
          subsidized bundle rates.
        </p>
      </div>

      {/* Guild Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {groups.map((group) => {
          const memberPros = pros.filter((p) => group.memberIds.includes(p.id));

          return (
            <div
              key={group.id}
              className="p-6 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    Save {group.discountPercentage}% Bundle
                  </span>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold text-white">{group.name}</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">{group.category}</p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{group.description}</p>
                </div>

                {/* Included Trades */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Synchronized Tasks Included:
                  </span>
                  <ul className="text-xs text-slate-200 space-y-1.5">
                    {group.servicesOffered.map((srv, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Squad Members */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Squad Delegates ({memberPros.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {memberPros.map((pro) => (
                      <div
                        key={pro.id}
                        onClick={() => onViewPro(pro)}
                        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors"
                      >
                        <TradeAvatar name={pro.name} category={pro.category} size="xs" />
                        <span className="text-xs font-semibold text-slate-200">{pro.name}</span>
                        <span className="text-[10px] text-emerald-400">({pro.category})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Co-op Squad Base</span>
                  <span className="text-lg font-bold text-white font-mono">₹{group.baseBundlePrice}</span>
                </div>

                {store.currentUser.role === 'customer' ? (
                  <button
                    onClick={() => onBookGroup(group)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Book Coordinated Squad
                  </button>
                ) : store.currentUser.role === 'professional' ? (
                  <span className="px-3.5 py-1.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                    Delegate Squad Roster
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">
                    Guild Governance
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
