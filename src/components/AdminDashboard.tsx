import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Bell,
  Check,
  CheckCircle,
  FileText,
  Layers,
  MapPin,
  Megaphone,
  Percent,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Users,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import { store } from '../data/store';
import { Complaint, ServiceProfessional } from '../types';
import { TradeAvatar } from './TradeAvatar';

export const AdminDashboard: React.FC = () => {
  const pros = store.professionals;
  const bookings = store.bookings;
  const complaints = store.complaints;
  const notifications = store.notifications;

  const [activeTab, setActiveTab] = useState<'verifications' | 'bookings' | 'complaints' | 'announcements'>('verifications');
  const [selectedProForReview, setSelectedProForReview] = useState<ServiceProfessional | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolvingComplaintId, setResolvingComplaintId] = useState<string | null>(null);

  const pendingPros = pros.filter((p) => p.verificationStatus === 'pending');
  const verifiedPros = pros.filter((p) => p.verificationStatus === 'verified');
  const approvedPros = pros.filter((p) => p.verificationStatus === 'approved');
  const rejectedPros = pros.filter((p) => p.verificationStatus === 'rejected');
  const totalVolume = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const handleNormalApprove = (proId: string) => {
    store.updateVerificationStatus(proId, 'approved');
    setSelectedProForReview(null);
  };

  const handleApproveWithBadge = (proId: string) => {
    store.updateVerificationStatus(proId, 'verified');
    setSelectedProForReview(null);
  };

  const handleReject = (proId: string, reason?: string) => {
    store.updateVerificationStatus(proId, 'rejected', reason);
    setSelectedProForReview(null);
  };

  const handleResolveComplaint = (id: string) => {
    if (!resolutionNote.trim()) return;
    store.resolveComplaint(id, resolutionNote);
    setResolvingComplaintId(null);
    setResolutionNote('');
  };

  const handleSendAnnouncement = () => {
    if (!announcementText.trim()) return;
    store.addNotification({
      userId: 'user_cust_1',
      role: 'customer',
      title: '📢 Cooperative Platform Announcement',
      message: announcementText,
      type: 'system',
    });
    store.addNotification({
      userId: 'pro_ravi',
      role: 'professional',
      title: '📢 Union Announcement from Operations',
      message: announcementText,
      type: 'system',
    });
    setAnnouncementSent(true);
    setTimeout(() => {
      setAnnouncementSent(false);
      setAnnouncementText('');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Admin Title Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 text-xs font-bold border border-cyan-500/30 mb-1">
            <Shield className="w-3.5 h-3.5" />
            Executive Governance Panel
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">Platform Operations & Compliance</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Worker-owner verification, cooperative escrow clearing, and peer arbitration.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Platform Fee Pool</span>
          <span className="text-base font-bold text-cyan-400 font-mono">10% Fair Overhead</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Total Registered</span>
          <h3 className="font-heading text-2xl font-bold text-white mt-1">{pros.length + 2} Users</h3>
          <p className="text-[10px] text-slate-400 mt-1">Customers & worker-owners</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Verified Professionals</span>
          <h3 className="font-heading text-2xl font-bold text-emerald-400 mt-1">{verifiedPros.length}</h3>
          <p className="text-[10px] text-emerald-400 mt-1">Active with Verified badge</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Pending Verification</span>
          <h3 className="font-heading text-2xl font-bold text-amber-400 mt-1">{pendingPros.length}</h3>
          <p className="text-[10px] text-amber-300 mt-1">Trade docs uploaded</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Platform Volume</span>
          <h3 className="font-heading text-2xl font-bold text-teal-400 mt-1 font-mono">₹{totalVolume}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Protected in escrow</p>
        </div>

        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl glass-card border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Disputes / Complaints</span>
          <h3 className="font-heading text-2xl font-bold text-rose-400 mt-1">{complaints.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Peer mediation panel</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'verifications'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Professional Verifications ({pendingPros.length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'bookings'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Platform Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'complaints'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Mediation & Complaints ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'announcements'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Broadcast Announcements
        </button>
      </div>

      {/* Tab: Verifications */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Awaiting Document Review ({pendingPros.length})
            </h3>
            {pendingPros.length === 0 ? (
              <div className="p-6 rounded-2xl glass-card border-slate-800 text-center text-xs text-slate-400">
                All professional registration applications have been processed.
              </div>
            ) : (
              pendingPros.map((pro) => (
                <div
                  key={pro.id}
                  className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <TradeAvatar name={pro.name} category={pro.category} size="lg" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{pro.name}</h4>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                          Pending Verification
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Category: <span className="text-emerald-400 font-semibold">{pro.category}</span> · {pro.experienceYears} yrs experience
                      </p>
                      <p className="text-xs text-slate-400">Location: {pro.location} · {pro.phone} (Demo)</p>
                      <p className="text-xs text-slate-300 italic">"{pro.bio}"</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedProForReview(pro)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Docs
                    </button>
                    <button
                      onClick={() => handleReject(pro.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleNormalApprove(pro.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-950 text-sky-300 hover:bg-sky-900 border border-sky-500/40 transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                      title="Normal approve without verified badge - Pro becomes visible to customers"
                    >
                      <Check className="w-3.5 h-3.5 text-sky-400" />
                      Normal Approve
                    </button>
                    <button
                      onClick={() => handleApproveWithBadge(pro.id)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                      title="Approve with official Verified Worker-Owner Badge - Pro becomes visible with verified checkmark"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                      Approve with Verified Badge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active Approved & Verified Pros List */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Live Professionals ({verifiedPros.length + approvedPros.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                {verifiedPros.length} with Verified Badge · {approvedPros.length} Normal Approved
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...verifiedPros, ...approvedPros].map((pro) => {
                const isBadge = pro.verificationStatus === 'verified';
                return (
                  <div key={pro.id} className="p-4 rounded-2xl glass-card border-slate-800 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <TradeAvatar name={pro.name} category={pro.category} size="lg" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">{pro.name}</h4>
                            {isBadge && (
                              <span title="Verified Worker-Owner">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{pro.category} · {pro.rating}★ · {pro.completedJobs} jobs</p>
                          <p className="text-[10px] text-slate-500">{pro.location}</p>
                        </div>
                      </div>

                      {isBadge ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified Badge
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-500/30 shrink-0 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Approved (Normal)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      {isBadge ? (
                        <button
                          onClick={() => handleNormalApprove(pro.id)}
                          className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="Remove verified badge but keep normal approval"
                        >
                          Remove Badge
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproveWithBadge(pro.id)}
                          className="px-2.5 py-1 rounded-lg font-semibold text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30 transition-colors"
                          title="Grant official Verified Badge"
                        >
                          + Grant Verified Badge
                        </button>
                      )}
                      <button
                        onClick={() => handleReject(pro.id)}
                        className="px-2.5 py-1 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Revoke and reject access"
                      >
                        Reject / Suspend
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rejected Applications List */}
          {rejectedPros.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Rejected Applications ({rejectedPros.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rejectedPros.map((pro) => (
                  <div key={pro.id} className="p-4 rounded-2xl bg-rose-950/10 border border-rose-500/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <TradeAvatar name={pro.name} category={pro.category} size="md" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{pro.name}</h4>
                        <p className="text-[11px] text-slate-400">{pro.category} · {pro.location}</p>
                        <span className="text-[10px] text-rose-400 font-semibold">Status: Rejected</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleNormalApprove(pro.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title="Re-approve as Normal"
                      >
                        Normal Approve
                      </button>
                      <button
                        onClick={() => handleApproveWithBadge(pro.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                        title="Re-approve with Badge"
                      >
                        Approve with Badge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Bookings Oversight */}
      {activeTab === 'bookings' && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl glass-card border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">Order #{b.id.slice(-6)}: {b.serviceName}</h4>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    {b.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Customer: {b.customerName} → Pro: {b.professionalName} ({b.scheduledDate})
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">Fee: ₹{b.platformFee}</span>
                <span className="text-white font-bold">Total: ₹{b.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Complaints Mediation */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No open disputes reported.</p>
          ) : (
            complaints.map((cmp) => (
              <div key={cmp.id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{cmp.issueType}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        cmp.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-950 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {cmp.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Filed {cmp.createdAt}</span>
                </div>

                <p className="text-xs text-slate-300">
                  Complainant: <span className="font-semibold text-white">{cmp.filedByName}</span> regarding{' '}
                  <span className="text-amber-400 font-semibold">{cmp.targetUserName}</span> (Booking #{cmp.bookingId})
                </p>

                <p className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  "{cmp.description}"
                </p>

                {cmp.status === 'resolved' ? (
                  <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                    <span className="font-bold">Resolution:</span> {cmp.resolution}
                  </p>
                ) : resolvingComplaintId === cmp.id ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Enter binding mediation resolution note..."
                      rows={2}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setResolvingComplaintId(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleResolveComplaint(cmp.id)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950"
                      >
                        Save & Resolve
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResolvingComplaintId(cmp.id)}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    Enter Resolution Note
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Announcements */}
      {activeTab === 'announcements' && (
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4 max-w-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-cyan-400" />
            Send System-Wide Announcement
          </h3>
          <p className="text-xs text-slate-300">
            Publish notifications to all active customers and worker-owners on the cooperative platform.
          </p>

          <textarea
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            rows={3}
            placeholder="e.g. Cooperative monsoon bonus is now active. All emergency plumbing dispatches receive guaranteed coverage."
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
          />

          <div className="flex items-center justify-between pt-2">
            {announcementSent && (
              <span className="text-xs text-emerald-400 font-semibold">Announcement broadcasted!</span>
            )}
            <button
              onClick={handleSendAnnouncement}
              disabled={!announcementText.trim()}
              className="ml-auto px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors disabled:opacity-50"
            >
              Broadcast Notification
            </button>
          </div>
        </div>
      )}

      {/* Document Review Modal for Pending Pros */}
      {selectedProForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-panel border border-slate-700 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading text-lg font-bold text-white">Review Professional Credentials</h3>
              <button
                onClick={() => setSelectedProForReview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <TradeAvatar
                name={selectedProForReview.name}
                category={selectedProForReview.category}
                size="lg"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{selectedProForReview.name}</h4>
                <p className="text-xs text-emerald-400">{selectedProForReview.category} Specialist</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Submitted Credentials</span>
              <p>Government ID: <span className="text-cyan-400 font-mono">VERIFIED_AADHAAR_DOC.PDF</span></p>
              <p>Trade Experience: {selectedProForReview.experienceYears} Years</p>
              <p>Declared Skills: {selectedProForReview.skills.join(', ')}</p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleReject(selectedProForReview.id)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl border border-rose-500/30 transition-colors cursor-pointer"
              >
                Reject Application
              </button>
              <button
                onClick={() => handleNormalApprove(selectedProForReview.id)}
                className="px-4 py-2 text-xs font-bold bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                title="Normal Approve without verified badge"
              >
                <Check className="w-3.5 h-3.5 text-sky-400" />
                Normal Approve
              </button>
              <button
                onClick={() => handleApproveWithBadge(selectedProForReview.id)}
                className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                title="Approve with official Verified Worker-Owner Badge"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                Approve with Verified Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
