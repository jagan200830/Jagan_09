import React, { useState } from 'react';
import { Eye, EyeOff, Layers, ShieldCheck } from 'lucide-react';
import { store } from '../data/store';

interface LoginPageProps {
  onLoginSuccess: (role: 'customer' | 'professional' | 'admin') => void;
  onExploreGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onExploreGuest }) => {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'professional' | 'admin'>('customer');
  const [isRegistering, setIsRegistering] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [tradeCategory, setTradeCategory] = useState('Plumbing');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Demo accounts
  const demoCredentials: Record<
    'customer' | 'professional' | 'admin',
    { email: string; pass: string; label: string }
  > = {
    customer: { email: 'customer@demo.in', pass: 'demo123', label: 'customer@demo.in / demo123' },
    professional: { email: 'pro@demo.in', pass: 'demo123', label: 'pro@demo.in / demo123' },
    admin: { email: 'admin@demo.in', pass: 'demo123', label: 'admin@demo.in / demo123' },
  };

  const handleFillDemo = () => {
    const cred = demoCredentials[selectedRole];
    setEmail(cred.email);
    setPassword(cred.pass);
    setError(null);
  };

  const handleRoleChange = (role: 'customer' | 'professional' | 'admin') => {
    setSelectedRole(role);
    setError(null);
    if (!email || Object.values(demoCredentials).some((c) => c.email === email)) {
      const cred = demoCredentials[role];
      setEmail(cred.email);
      setPassword(cred.pass);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (isRegistering) {
        if (!name.trim()) {
          setError('Please enter your name');
          return;
        }

        if (selectedRole === 'customer') {
          store.registerCustomer(
            name.trim(),
            email.trim(),
            phone.trim() || '+91 00000 00001',
            location.trim() || 'Indiranagar, Bangalore'
          );
        } else if (selectedRole === 'professional') {
          store.registerProfessional({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || '+91 00000 10000',
            category: tradeCategory,
            skills: ['General Diagnostics', 'Installation', 'Emergency Fixes'],
            experienceYears: 4,
            location: location.trim() || 'Indiranagar, Bangalore',
            startingPrice: 349,
            hourlyRate: 399,
            bio: 'Verified trade professional with cooperative credentials.',
          });
        } else {
          store.switchRole('admin');
        }
      } else {
        // Direct Login - finds user by email or falls back to demo account
        store.loginWithEmail(email, selectedRole);
      }

      onLoginSuccess(selectedRole);
    }, 450);
  };

  const roleButtonLabels = {
    customer: 'Customer',
    professional: 'Service person',
    admin: 'Admin',
  };

  const submitButtonLabels = {
    customer: isRegistering ? 'Register as customer' : 'Sign in as customer',
    professional: isRegistering ? 'Register as service person' : 'Sign in as service person',
    admin: isRegistering ? 'Register as admin' : 'Sign in as admin',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 py-10 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Dot Lattice */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Atmospheric Radial Light Orbs matching app theme (Emerald, Teal, Cyan) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/12 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Elevated Glassmorphic Card Container */}
      <div className="w-full max-w-lg mx-auto relative z-10 p-6 sm:p-9 rounded-3xl glass-panel border border-slate-800/90 shadow-2xl shadow-emerald-950/20 backdrop-blur-2xl space-y-6 text-left">
        {/* Top App Brand & Value Proposition Section */}
        <div className="space-y-4">
          {/* Header Brand Bar */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block leading-tight">
                  Cooperative Gig Platform
                </span>
                <span className="text-xs text-slate-400 font-mono">100% Worker-Owned</span>
              </div>
            </div>

            {onExploreGuest && (
              <button
                type="button"
                onClick={onExploreGuest}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Explore as guest →
              </button>
            )}
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Corporate <span className="text-emerald-400">Gig</span> Services
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Describe a household problem, and our AI assistant finds the right service and the right professional nearby.
          </p>

          <ul className="space-y-2 pt-1 text-xs sm:text-sm text-slate-200">
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 shrink-0" />
              <span>AI service discovery from plain language</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 shrink-0" />
              <span>Nearby professionals with ratings and fair rates</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 shrink-0" />
              <span>Booking, live status tracking and cooperative escrow</span>
            </li>
          </ul>
        </div>

        {/* Divider Bar */}
        <div className="border-t border-slate-800/80 pt-6">
          {/* Sign in Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white">
              {isRegistering ? 'Create an account' : 'Sign in'}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Co-op Protected</span>
            </div>
          </div>

          {/* Role Segmented Selector: Customer | Service person | Admin */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 mb-5">
            {(['customer', 'professional', 'admin'] as const).map((role) => {
              const isActive = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {roleButtonLabels[role]}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    required
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Indiranagar, Bangalore"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Phone Number (Demo)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 00000 00000 (Demo)"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
                  />
                </div>

                {selectedRole === 'professional' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Primary Trade Category
                    </label>
                    <select
                      value={tradeCategory}
                      onChange={(e) => setTradeCategory(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all cursor-pointer"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="AC & Cooling">AC & Cooling</option>
                      <option value="Deep Cleaning">Deep Cleaning</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Appliance Repair">Appliance Repair</option>
                      <option value="Painting & Waterproofing">Painting & Waterproofing</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={demoCredentials[selectedRole].email}
                required
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button - Styled in signature app emerald/teal gradient */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] disabled:opacity-60 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center cursor-pointer"
            >
              {loading ? 'Please wait...' : submitButtonLabels[selectedRole]}
            </button>

            {/* Quick Demo Credentials Fill Pill */}
            {!isRegistering && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between text-xs text-slate-300">
                <span className="truncate mr-2">
                  Demo: <span className="font-mono text-emerald-300/90">{demoCredentials[selectedRole].label}</span>
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-3.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Fill
                </button>
              </div>
            )}
          </form>

          {/* New here? Register / Back to Sign In button */}
          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={() => {
                const willRegister = !isRegistering;
                setIsRegistering(willRegister);
                setError(null);
                if (willRegister && Object.values(demoCredentials).some((c) => c.email === email)) {
                  setEmail('');
                  setPassword('');
                }
              }}
              className="px-6 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/90 hover:border-emerald-500/40 hover:text-emerald-300 text-slate-300 text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              {isRegistering ? 'Already have an account? Sign in' : 'New here? Register'}
            </button>
          </div>

          {/* Trust and Cooperative Guarantee Notice */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 pt-5 border-t border-slate-800/60 mt-5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Co-op Escrow Protected
            </span>
            <span className="text-slate-600">•</span>
            <span>Verified Pros</span>
            <span className="text-slate-600">•</span>
            <span>Zero Platform Markup</span>
          </div>
        </div>
      </div>
    </div>
  );
};
