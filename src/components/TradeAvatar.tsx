import React from 'react';
import {
  Hammer,
  Laptop,
  Paintbrush,
  Sparkles,
  Tv,
  User,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';

interface TradeAvatarProps {
  name: string;
  category?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const categoryIcons: Record<string, React.ReactElement> = {
  Plumbing: <Wrench className="w-1/2 h-1/2 text-sky-300" />,
  Electrical: <Zap className="w-1/2 h-1/2 text-amber-300" />,
  'Deep Cleaning': <Sparkles className="w-1/2 h-1/2 text-emerald-300" />,
  Carpentry: <Hammer className="w-1/2 h-1/2 text-amber-500" />,
  'Painting & Waterproofing': <Paintbrush className="w-1/2 h-1/2 text-pink-300" />,
  'AC & Cooling': <Wind className="w-1/2 h-1/2 text-cyan-300" />,
  'Appliance Repair': <Tv className="w-1/2 h-1/2 text-indigo-300" />,
  'Computer & Tech': <Laptop className="w-1/2 h-1/2 text-purple-300" />,
};

const categoryGradients: Record<string, string> = {
  Plumbing: 'from-sky-950 via-slate-900 to-sky-900/60 border-sky-500/30 text-sky-200',
  Electrical: 'from-amber-950 via-slate-900 to-amber-900/60 border-amber-500/30 text-amber-200',
  'Deep Cleaning': 'from-emerald-950 via-slate-900 to-emerald-900/60 border-emerald-500/30 text-emerald-200',
  Carpentry: 'from-amber-950 via-slate-900 to-orange-950/60 border-amber-600/30 text-amber-300',
  'Painting & Waterproofing': 'from-pink-950 via-slate-900 to-rose-950/60 border-pink-500/30 text-pink-200',
  'AC & Cooling': 'from-cyan-950 via-slate-900 to-teal-950/60 border-cyan-500/30 text-cyan-200',
  'Appliance Repair': 'from-indigo-950 via-slate-900 to-blue-950/60 border-indigo-500/30 text-indigo-200',
  'Computer & Tech': 'from-purple-950 via-slate-900 to-slate-900 border-purple-500/30 text-purple-200',
};

const sizeClasses = {
  xs: 'w-6 h-6 rounded-md text-[10px]',
  sm: 'w-8 h-8 rounded-lg text-xs',
  md: 'w-10 h-10 rounded-xl text-xs',
  lg: 'w-12 h-12 rounded-xl text-sm',
  xl: 'w-16 h-16 rounded-2xl text-base',
};

export const TradeAvatar: React.FC<TradeAvatarProps> = ({
  name,
  category = '',
  size = 'md',
  className = '',
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PRO';

  const gradient = categoryGradients[category] || 'from-slate-900 via-slate-850 to-emerald-950/60 border-emerald-500/30 text-emerald-300';
  const icon = category ? categoryIcons[category] : null;

  return (
    <div
      className={`relative inline-flex items-center justify-center font-bold tracking-tight bg-gradient-to-br border shadow-inner shrink-0 select-none ${sizeClasses[size]} ${gradient} ${className}`}
      title={`${name} (${category || 'Verified Pro'})`}
    >
      {icon && size === 'xl' ? (
        <div className="flex flex-col items-center justify-center">
          {icon}
          <span className="text-[10px] mt-0.5 font-mono">{initials}</span>
        </div>
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
