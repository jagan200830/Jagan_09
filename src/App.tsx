import React, { useEffect, useState } from 'react';
import {
  Bell,
  Compass,
  FileText,
  Heart,
  HelpCircle,
  Home,
  Layers,
  LogOut,
  MapPin,
  MessageSquare,
  PhoneCall,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { AccountProfileModal } from './components/AccountProfileModal';
import { BookingModal } from './components/BookingModal';
import { ChatDrawer } from './components/ChatDrawer';
import { CooperativeGuildsSection } from './components/CooperativeGuildsSection';
import { CustomerDashboard } from './components/CustomerDashboard';
import { GigAssistAI } from './components/GigAssistAI';
import { InteractiveMapView } from './components/InteractiveMapView';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { ProfessionalDashboard } from './components/ProfessionalDashboard';
import { ProfessionalProfileModal } from './components/ProfessionalProfileModal';
import { ServiceSearchPage } from './components/ServiceSearchPage';
import { store } from './data/store';
import { Booking, CooperativeGroup, ServiceItem, ServiceProfessional, UserRole } from './types';

export default function App() {
  const [, setTick] = useState(0);

  // Subscribe to central store
  useEffect(() => {
    const unsub = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const currentUser = store.currentUser;

  // Authentication gate state (shows login page before entering app)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cgsp_is_authenticated') === 'true';
  });

  const handleLoginSuccess = (role: 'customer' | 'professional' | 'admin') => {
    const effectiveRole = store.currentUser?.role || role;
    setIsAuthenticated(true);
    localStorage.setItem('cgsp_is_authenticated', 'true');
    if (effectiveRole === 'admin') setCurrentTab('admin_dashboard');
    else if (effectiveRole === 'professional') setCurrentTab('pro_dashboard');
    else setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cgsp_is_authenticated');
  };

  // View state
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (currentUser.role === 'admin') return 'admin_dashboard';
    if (currentUser.role === 'professional') return 'pro_dashboard';
    return 'home';
  });
  const [selectedCategoryForSearch, setSelectedCategoryForSearch] = useState<string>('All');

  // Guard views so Admin and Service Person are never routed to consumer booking pages
  useEffect(() => {
    if (
      currentUser.role === 'admin' &&
      ['home', 'services', 'ai_assistant', 'radar', 'customer_dashboard'].includes(currentTab)
    ) {
      setCurrentTab('admin_dashboard');
    } else if (
      currentUser.role === 'professional' &&
      ['home', 'services', 'ai_assistant', 'radar', 'customer_dashboard'].includes(currentTab)
    ) {
      setCurrentTab('pro_dashboard');
    }
  }, [currentUser.role, currentTab]);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | undefined>(undefined);
  const [activeProfilePro, setActiveProfilePro] = useState<ServiceProfessional | null>(null);

  // Booking prep state
  const [bookingPro, setBookingPro] = useState<ServiceProfessional | undefined>(undefined);
  const [bookingService, setBookingService] = useState<ServiceItem | undefined>(undefined);
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [bookingEmergency, setBookingEmergency] = useState<boolean>(false);

  // AI prefill
  const [aiPresetPrompt, setAiPresetPrompt] = useState<string>('');

  // Unread notifications
  const unreadNotifications = store.notifications.filter(
    (n) => !n.read && (n.userId === currentUser.id || currentUser.role === 'admin')
  ).length;

  const handleSelectCategoryFromLanding = (categoryName: string) => {
    setSelectedCategoryForSearch(categoryName);
    setCurrentTab('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectServiceFromLanding = (service: ServiceItem) => {
    const approvedPros = store.getApprovedProfessionals();
    const pro = approvedPros.find((p) => p.category === service.category) || approvedPros[0] || store.professionals[0];
    setBookingPro(pro);
    setBookingService(service);
    setBookingEmergency(service.emergencyEligible);
    setBookingModalOpen(true);
  };

  const handleOpenAIWithPrompt = (prompt: string) => {
    setAiPresetPrompt(prompt);
    setCurrentTab('ai_assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookFromSearch = (pro: ServiceProfessional) => {
    const matchedSrv = store.services.find((s) => s.category === pro.category) || store.services[0];
    setBookingPro(pro);
    setBookingService(matchedSrv);
    setBookingEmergency(pro.emergencyAvailable);
    setBookingModalOpen(true);
  };

  const handleBookFromAI = (
    pro: ServiceProfessional,
    service?: ServiceItem,
    notes?: string,
    isEmergency?: boolean
  ) => {
    setBookingPro(pro);
    setBookingService(service || store.services[0]);
    setBookingNotes(notes || '');
    setBookingEmergency(!!isEmergency);
    setBookingModalOpen(true);
  };

  const handleBookCoopGroup = (group: CooperativeGroup) => {
    const approvedPros = store.getApprovedProfessionals();
    const firstPro = approvedPros.find((p) => group.memberIds.includes(p.id)) || approvedPros[0] || store.professionals[0];
    setBookingPro(firstPro);
    setBookingService(store.services[0]);
    setBookingNotes(`Cooperative Squad Request: ${group.name}`);
    setBookingModalOpen(true);
  };

  const handleOpenEmergencyDispatch = () => {
    const approvedPros = store.getApprovedProfessionals();
    const emergencyPro = approvedPros.find((p) => p.emergencyAvailable) || approvedPros[0] || store.professionals[0];
    setBookingPro(emergencyPro);
    setBookingService(store.services[0]);
    setBookingNotes('CRITICAL 24/7 EMERGENCY DISPATCH: Need immediate on-call technician.');
    setBookingEmergency(true);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setBookingModalOpen(false);
    setCurrentTab('customer_dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenChatWithPro = (proId: string) => {
    const existing = store.bookings.find(
      (b) => b.customerId === currentUser.id && b.professionalId === proId
    );
    setActiveChatBookingId(existing ? existing.id : undefined);
    setChatDrawerOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onExploreGuest={() => {
          setIsAuthenticated(true);
          setCurrentTab('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenBooking={() => {
          setBookingPro(store.getApprovedProfessionals()[0] || store.professionals[0]);
          setBookingService(store.services[0]);
          setBookingModalOpen(true);
        }}
        onOpenChat={(bookingId) => {
          setActiveChatBookingId(bookingId);
          setChatDrawerOpen(true);
        }}
        unreadCount={unreadNotifications}
        onLogout={handleLogout}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 w-full">
        {currentTab === 'home' && (
          <LandingPage
            onSelectCategory={handleSelectCategoryFromLanding}
            onSelectService={handleSelectServiceFromLanding}
            onOpenAI={() => setCurrentTab('ai_assistant')}
            onOpenRegisterPro={() => setAuthModalOpen(true)}
            onOpenEmergency={handleOpenEmergencyDispatch}
          />
        )}

        {currentTab === 'services' && (
          <ServiceSearchPage
            initialCategory={selectedCategoryForSearch}
            onViewProfile={(pro) => setActiveProfilePro(pro)}
            onBookPro={handleBookFromSearch}
            onOpenChat={(proId) => handleOpenChatWithPro(proId)}
          />
        )}

        {currentTab === 'ai_assistant' && (
          <GigAssistAI
            onSelectProToBook={handleBookFromAI}
            onOpenChat={(proId) => handleOpenChatWithPro(proId)}
          />
        )}

        {currentTab === 'guilds' && (
          <CooperativeGuildsSection
            onBookGroup={handleBookCoopGroup}
            onViewPro={(pro) => setActiveProfilePro(pro)}
          />
        )}

        {currentTab === 'radar' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Geo-Radar</span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
                Nearby Verified Professionals Radar
              </h1>
            </div>
            <InteractiveMapView
              onSelectPro={(pro) => setActiveProfilePro(pro)}
              onBookPro={handleBookFromSearch}
            />
          </div>
        )}

        {currentTab === 'customer_dashboard' && (
          <CustomerDashboard
            onOpenAIWithPrompt={handleOpenAIWithPrompt}
            onOpenBookingModal={() => {
              setBookingPro(store.getApprovedProfessionals()[0] || store.professionals[0]);
              setBookingService(store.services[0]);
              setBookingModalOpen(true);
            }}
            onOpenChat={(bId) => {
              setActiveChatBookingId(bId);
              setChatDrawerOpen(true);
            }}
            onViewProProfile={(pro) => setActiveProfilePro(pro)}
          />
        )}

        {currentTab === 'pro_dashboard' && (
          <ProfessionalDashboard
            onOpenChat={(bId) => {
              setActiveChatBookingId(bId);
              setChatDrawerOpen(true);
            }}
          />
        )}

        {currentTab === 'admin_dashboard' && <AdminDashboard />}
      </main>

      {/* Native App Floating Bottom Navigation Bar - Role Tailored */}
      <nav aria-label="Bottom Navigation" className="sticky bottom-0 z-40 w-full border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl px-4 py-2.5 flex items-center justify-around sm:justify-center sm:gap-10 shadow-2xl">
        {currentUser.role === 'customer' && (
          <>
            <button
              onClick={() => {
                setCurrentTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                currentTab === 'home'
                  ? 'text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[11px]">Home</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                currentTab === 'services'
                  ? 'text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[11px]">Services</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('ai_assistant');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                currentTab === 'ai_assistant'
                  ? 'text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-[11px]">GigAssist AI</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('radar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                currentTab === 'radar'
                  ? 'text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[11px]">Live Radar</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('customer_dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                currentTab === 'customer_dashboard'
                  ? 'text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[11px]">My Bookings</span>
            </button>
          </>
        )}

        {currentUser.role === 'professional' && (
          <>
            <button
              onClick={() => {
                setCurrentTab('pro_dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                currentTab === 'pro_dashboard'
                  ? 'text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-5 h-5" />
              <span className="text-[11px]">Work Orders</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('guilds');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                currentTab === 'guilds'
                  ? 'text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[11px]">My Guild</span>
            </button>

            <button
              onClick={() => setChatDrawerOpen(true)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all relative"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[11px]">Client Chat</span>
              <span className="absolute top-1 right-4 w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
            >
              <User className="w-5 h-5" />
              <span className="text-[11px]">My Account</span>
            </button>
          </>
        )}

        {currentUser.role === 'admin' && (
          <>
            <button
              onClick={() => {
                setCurrentTab('admin_dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                currentTab === 'admin_dashboard'
                  ? 'text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[11px]">Control Room</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('guilds');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                currentTab === 'guilds'
                  ? 'text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[11px]">Guilds</span>
            </button>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
            >
              <User className="w-5 h-5" />
              <span className="text-[11px]">Admin Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-rose-400 hover:text-rose-300 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[11px]">Sign Out</span>
            </button>
          </>
        )}
      </nav>

      {/* Global Modals */}
      {authModalOpen && (
        <AccountProfileModal
          onClose={() => setAuthModalOpen(false)}
          onLogout={handleLogout}
        />
      )}

      {bookingModalOpen && (
        <BookingModal
          initialPro={bookingPro}
          initialService={bookingService}
          initialNotes={bookingNotes}
          initialEmergency={bookingEmergency}
          onClose={() => setBookingModalOpen(false)}
          onBookingSuccess={handleBookingSuccess}
          onOpenChat={(bId) => {
            setActiveChatBookingId(bId);
            setChatDrawerOpen(true);
          }}
        />
      )}

      {activeProfilePro && (
        <ProfessionalProfileModal
          pro={activeProfilePro}
          onClose={() => setActiveProfilePro(null)}
          onBook={(pro) => {
            setActiveProfilePro(null);
            handleBookFromSearch(pro);
          }}
          onChat={(proId) => {
            setActiveProfilePro(null);
            handleOpenChatWithPro(proId);
          }}
        />
      )}

      {chatDrawerOpen && (
        <ChatDrawer
          initialBookingId={activeChatBookingId}
          onClose={() => setChatDrawerOpen(false)}
        />
      )}
    </div>
  );
}
