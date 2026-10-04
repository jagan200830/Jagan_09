import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Upload,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { store } from '../data/store';
import { UserRole } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('register');

  // Customer Form State
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custLocation, setCustLocation] = useState('Indiranagar, Bangalore');
  const [password, setPassword] = useState('');

  // Pro Form State
  const [proName, setProName] = useState('');
  const [proEmail, setProEmail] = useState('');
  const [proPhone, setProPhone] = useState('');
  const [proCategory, setProCategory] = useState('Plumbing');
  const [proSkills, setProSkills] = useState('Pipe Leak Repair, Fixture Installation, Drain Cleaning');
  const [proExp, setProExp] = useState('5');
  const [proLocation, setProLocation] = useState('Koramangala, Bangalore');
  const [proStartingPrice, setProStartingPrice] = useState('299');
  const [proBio, setProBio] = useState('Certified professional with trade licenses.');

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('admin@coopgig.org');
  const [adminPassword, setAdminPassword] = useState('coop-admin-2026');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail) {
      setError('Please fill in name and email');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = store.registerCustomer(custName, custEmail, custPhone, custLocation);
      setLoading(false);
      onSuccess('customer');
      onClose();
    }, 600);
  };

  const handleProSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proName || !proEmail) {
      setError('Please fill in required fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      store.registerProfessional({
        name: proName,
        email: proEmail,
        phone: proPhone,
        category: proCategory,
        skills: proSkills.split(',').map((s) => s.trim()),
        experienceYears: Number(proExp) || 3,
        location: proLocation,
        startingPrice: Number(proStartingPrice) || 299,
        hourlyRate: 350,
        bio: proBio,
      });
      setLoading(false);
      onSuccess('professional');
      onClose();
    }, 800);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      store.switchRole('admin');
      setLoading(false);
      onSuccess('admin');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 text-left max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* First Screen: Select Role */}
        {!selectedRole ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Authentication Portal
              </span>
              <h2 className="font-heading text-2xl font-bold text-white">How do you want to use the platform?</h2>
              <p className="text-xs text-slate-300">
                Choose your role to log in or register on the Cooperative Gig Services Platform.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Customer Card */}
              <div
                onClick={() => {
                  setSelectedRole('customer');
                  setMode('register');
                }}
                className="p-5 rounded-2xl glass-card glass-card-hover border-slate-800 cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">I am a Customer</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Find and book verified plumbers, electricians, cleaners, and multi-trade cooperative groups.
                  </p>
                </div>
              </div>

              {/* Service Pro Card */}
              <div
                onClick={() => {
                  setSelectedRole('professional');
                  setMode('register');
                }}
                className="p-5 rounded-2xl glass-card glass-card-hover border-slate-800 cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform shrink-0">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">I am a Service Professional</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Join the cooperative guild, earn 90% direct payout, gain verified credentials, and form squads.
                  </p>
                </div>
              </div>

              {/* Admin Card */}
              <div
                onClick={() => {
                  setSelectedRole('admin');
                  setMode('login');
                }}
                className="p-5 rounded-2xl glass-card glass-card-hover border-slate-800 cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Platform Administrator</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Secure verification gate, arbitration dashboard, and cooperative escrow oversight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : selectedRole === 'customer' ? (
          /* Customer Form */
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-xs text-slate-400 hover:text-white mb-1"
                >
                  ← Choose different role
                </button>
                <h3 className="font-heading text-xl font-bold text-white">
                  {mode === 'register' ? 'Create Customer Account' : 'Customer Sign In'}
                </h3>
              </div>
              <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => setMode('register')}
                  className={`px-3 py-1 rounded-md font-medium ${mode === 'register' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Register
                </button>
                <button
                  onClick={() => setMode('login')}
                  className={`px-3 py-1 rounded-md font-medium ${mode === 'login' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Sign In
                </button>
              </div>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Phone Number (Demo)</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+91 00000 00000 (Demo)"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Delivery / Home Location</label>
                <input
                  type="text"
                  value={custLocation}
                  onChange={(e) => setCustLocation(e.target.value)}
                  placeholder="Area / Locality in Bangalore"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? 'Setting up Account...' : mode === 'register' ? 'Register as Customer' : 'Sign In'}
              </button>
            </form>
          </div>
        ) : selectedRole === 'professional' ? (
          /* Service Professional Registration */
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-xs text-slate-400 hover:text-white mb-1"
                >
                  ← Choose different role
                </button>
                <h3 className="font-heading text-xl font-bold text-white">Join Cooperative as Service Partner</h3>
              </div>
            </div>

            <form onSubmit={handleProSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={proName}
                    onChange={(e) => setProName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Email</label>
                  <input
                    type="email"
                    value={proEmail}
                    onChange={(e) => setProEmail(e.target.value)}
                    placeholder="rajesh@worker.coop"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Primary Trade / Category</label>
                  <select
                    value={proCategory}
                    onChange={(e) => setProCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    {store.categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Experience (Years)</label>
                  <input
                    type="number"
                    value={proExp}
                    onChange={(e) => setProExp(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Specific Skills (comma separated)</label>
                <input
                  type="text"
                  value={proSkills}
                  onChange={(e) => setProSkills(e.target.value)}
                  placeholder="e.g. MCB Wiring, Smart Dimmer Setup, Concealed Conduit"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Operating Locality</label>
                  <input
                    type="text"
                    value={proLocation}
                    onChange={(e) => setProLocation(e.target.value)}
                    placeholder="e.g. HSR Layout, Bangalore"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Starting Price (INR)</label>
                  <input
                    type="number"
                    value={proStartingPrice}
                    onChange={(e) => setProStartingPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-bold text-slate-300 block">Verification Documents</span>
                <p className="text-[11px] text-slate-400">
                  Government ID & trade certifications will be reviewed by admin before issuing the Verified Badge.
                </p>
                <div className="pt-1 flex items-center gap-2 text-emerald-400 font-mono text-[10px]">
                  <FileText className="w-3.5 h-3.5" />
                  <span>govt_id_trade_cert.pdf attached</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                {loading ? 'Submitting Application...' : 'Submit Cooperative Membership Application'}
              </button>
            </form>
          </div>
        ) : (
          /* Admin Login */
          <div className="space-y-5">
            <div className="pb-3 border-b border-slate-800">
              <button
                onClick={() => setSelectedRole(null)}
                className="text-xs text-slate-400 hover:text-white mb-1"
              >
                ← Choose different role
              </button>
              <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Administrator Authentication
              </h3>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px]">
                Demo Admin credentials loaded. Click below to access the live operations panel.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
              >
                {loading ? 'Authenticating...' : 'Sign In to Admin Operations'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
