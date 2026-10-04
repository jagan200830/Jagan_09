import {
  Booking,
  BookingStatus,
  Complaint,
  CooperativeGroup,
  Message,
  NotificationItem,
  PaymentMethod,
  ServiceCategory,
  ServiceItem,
  ServiceProfessional,
  User,
  UserRole,
  VerificationStatus,
} from '../types';
import {
  COOPERATIVE_GROUPS,
  INITIAL_BOOKINGS,
  INITIAL_COMPLAINTS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFESSIONALS,
  INITIAL_USERS,
  SERVICES_CATALOG,
  SERVICE_CATEGORIES,
} from './mockData';

const STORAGE_KEYS = {
  USER: 'cgsp_current_user',
  USERS: 'cgsp_registered_users',
  PROFESSIONALS: 'cgsp_professionals',
  BOOKINGS: 'cgsp_bookings',
  MESSAGES: 'cgsp_messages',
  NOTIFICATIONS: 'cgsp_notifications',
  FAVORITES: 'cgsp_favorites',
  COMPLAINTS: 'cgsp_complaints',
};

const DATA_VERSION_KEY = 'cgsp_storage_version';
const CURRENT_DATA_VERSION = '2026_10_03_clean_reset';

export function purgePreviewData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem('cgsp_is_authenticated');
    localStorage.removeItem('cgsp_recent_searches');
    // Remove all keys starting with cgsp_ or coop_
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('cgsp_') || k.startsWith('coop_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  } catch (e) {
    // Ignore storage errors
  }
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    // Ignore quota or memory errors
  }
}

export class PlatformStore {
  private static instance: PlatformStore;

  currentUser: User;
  users: User[];
  professionals: ServiceProfessional[];
  bookings: Booking[];
  messages: Message[];
  notifications: NotificationItem[];
  favorites: string[];
  complaints: Complaint[];
  categories: ServiceCategory[] = SERVICE_CATEGORIES;
  services: ServiceItem[] = SERVICES_CATALOG;
  coopGroups: CooperativeGroup[] = COOPERATIVE_GROUPS;

  private listeners: Set<() => void> = new Set();
  private isNotifying = false;
  private pendingNotify = false;

  private constructor() {
    // Check if data version matches; if not, purge preview data entered till now!
    try {
      const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
      if (storedVersion !== CURRENT_DATA_VERSION) {
        purgePreviewData();
      }
    } catch (e) {
      // ignore
    }

    this.currentUser = getStored<User>(
      STORAGE_KEYS.USER,
      JSON.parse(JSON.stringify(INITIAL_USERS[0]))
    );
    this.users = getStored<User[]>(
      STORAGE_KEYS.USERS,
      JSON.parse(JSON.stringify(INITIAL_USERS))
    );
    this.professionals = getStored<ServiceProfessional[]>(
      STORAGE_KEYS.PROFESSIONALS,
      JSON.parse(JSON.stringify(INITIAL_PROFESSIONALS))
    );
    this.bookings = getStored<Booking[]>(
      STORAGE_KEYS.BOOKINGS,
      JSON.parse(JSON.stringify(INITIAL_BOOKINGS))
    );
    this.messages = getStored<Message[]>(
      STORAGE_KEYS.MESSAGES,
      JSON.parse(JSON.stringify(INITIAL_MESSAGES))
    );
    this.notifications = getStored<NotificationItem[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS))
    );
    this.favorites = getStored<string[]>(STORAGE_KEYS.FAVORITES, ['pro_arjun', 'pro_ravi']);
    this.complaints = getStored<Complaint[]>(
      STORAGE_KEYS.COMPLAINTS,
      JSON.parse(JSON.stringify(INITIAL_COMPLAINTS))
    );
  }

  public resetDataToDefault(): void {
    purgePreviewData();
    this.currentUser = JSON.parse(JSON.stringify(INITIAL_USERS[0]));
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.professionals = JSON.parse(JSON.stringify(INITIAL_PROFESSIONALS));
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    this.messages = JSON.parse(JSON.stringify(INITIAL_MESSAGES));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.favorites = ['pro_arjun', 'pro_ravi'];
    this.complaints = JSON.parse(JSON.stringify(INITIAL_COMPLAINTS));
    this.save();
    this.notify();
  }

  public static getInstance(): PlatformStore {
    if (!PlatformStore.instance) {
      PlatformStore.instance = new PlatformStore();
    }
    return PlatformStore.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    if (this.isNotifying) {
      this.pendingNotify = true;
      return;
    }
    this.isNotifying = true;
    try {
      this.save();
      const currentListeners = Array.from(this.listeners);
      currentListeners.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.error('Store listener error:', e);
        }
      });
    } finally {
      this.isNotifying = false;
      if (this.pendingNotify) {
        this.pendingNotify = false;
        this.notify();
      }
    }
  }

  private save(): void {
    setStored(STORAGE_KEYS.USER, this.currentUser);
    setStored(STORAGE_KEYS.USERS, this.users);
    setStored(STORAGE_KEYS.PROFESSIONALS, this.professionals);
    setStored(STORAGE_KEYS.BOOKINGS, this.bookings);
    setStored(STORAGE_KEYS.MESSAGES, this.messages);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    setStored(STORAGE_KEYS.FAVORITES, this.favorites);
    setStored(STORAGE_KEYS.COMPLAINTS, this.complaints);
  }

  // --- Auth / Roles ---
  public switchRole(role: UserRole): void {
    if (this.currentUser && this.currentUser.role === role) {
      return;
    }
    const matched = this.users.find((u) => u.role === role);
    if (matched) {
      this.currentUser = matched;
    } else if (role === 'customer') {
      this.currentUser = INITIAL_USERS[0];
    } else if (role === 'professional') {
      // Find Ravi Kumar
      const pro = this.professionals.find((p) => p.id === 'pro_ravi') || this.professionals[0];
      this.currentUser = {
        id: pro.id,
        name: pro.name,
        email: pro.email,
        role: 'professional',
        phone: pro.phone,
        location: pro.location,
        avatar: pro.avatar,
        createdAt: pro.createdAt,
        isVerified: pro.verificationStatus === 'verified',
      };
    } else {
      this.currentUser = INITIAL_USERS[2]; // Admin
    }
    this.save();
    this.notify();
  }

  public loginWithEmail(email: string, role: UserRole): User {
    const clean = email.trim().toLowerCase();
    // 1. Check exact match in registered users
    const found = this.users.find((u) => u.email.toLowerCase() === clean);
    if (found) {
      this.currentUser = found;
      this.save();
      this.notify();
      return found;
    }

    // 2. Check in professionals
    const foundPro = this.professionals.find((p) => p.email.toLowerCase() === clean);
    if (foundPro) {
      this.currentUser = {
        id: foundPro.id,
        name: foundPro.name,
        email: foundPro.email,
        role: 'professional',
        phone: foundPro.phone,
        location: foundPro.location,
        avatar: foundPro.avatar,
        createdAt: foundPro.createdAt,
        isVerified: foundPro.verificationStatus === 'verified',
      };
      if (!this.users.some((u) => u.id === foundPro.id)) {
        this.users.unshift(this.currentUser);
      }
      this.save();
      this.notify();
      return this.currentUser;
    }

    // 3. Fallback for custom entered email: create personal profile instead of showing another person's account
    const localPart = clean.split('@')[0] || 'Member';
    const friendlyName = localPart
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const newUser: User = {
      id: `cust_${Date.now()}`,
      name: friendlyName,
      email: clean,
      phone: '+91 98860 12345',
      location: 'Indiranagar, Bangalore',
      role: role === 'admin' ? 'admin' : role === 'professional' ? 'professional' : 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      createdAt: 'Joined today',
      isVerified: true,
    };

    this.users.unshift(newUser);
    this.currentUser = newUser;
    this.save();
    this.notify();
    return newUser;
  }

  public loginAs(user: User): void {
    this.currentUser = user;
    this.save();
    this.notify();
  }

  public registerCustomer(name: string, email: string, phone: string, location: string): User {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      existing.name = name.trim();
      existing.phone = phone.trim() || existing.phone;
      existing.location = location.trim() || existing.location;
      this.currentUser = existing;
      this.save();
      this.notify();
      return existing;
    }

    const newUser: User = {
      id: `cust_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 00000 00001',
      location: location.trim() || 'Indiranagar, Bangalore',
      role: 'customer',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
      createdAt: new Date().toISOString().split('T')[0],
      isVerified: true,
    };
    this.users.unshift(newUser);
    this.currentUser = newUser;
    this.save();
    this.addNotification({
      userId: newUser.id,
      role: 'customer',
      title: 'Welcome to Cooperative Gig Services!',
      message: `Welcome ${newUser.name}! Your account is active. Connect directly with verified worker-owners.`,
      type: 'system',
    });
    this.notify();
    return newUser;
  }

  public registerProfessional(data: {
    name: string;
    email: string;
    phone: string;
    category: string;
    skills: string[];
    experienceYears: number;
    location: string;
    startingPrice: number;
    hourlyRate: number;
    bio: string;
    governmentDocUrl?: string;
  }): ServiceProfessional {
    const id = `pro_${Date.now()}`;
    const newPro: ServiceProfessional = {
      id,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim() || '+91 00000 10000',
      category: data.category,
      skills: data.skills,
      experienceYears: data.experienceYears,
      location: data.location.trim() || 'Indiranagar, Bangalore',
      serviceRadiusKm: 15,
      hourlyRate: data.hourlyRate || 350,
      startingPrice: data.startingPrice || 299,
      availability: 'scheduled_only',
      certifications: ['Pending Document Verification'],
      portfolio: [
        {
          title: 'Recent Installation Work',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80',
          description: 'High standard customer project completed locally.',
        },
      ],
      verificationStatus: 'pending',
      governmentDocUrl: data.governmentDocUrl || 'https://example.com/docs/pending_id.pdf',
      rating: 5.0,
      reviewCount: 0,
      completedJobs: 0,
      bio: data.bio || 'Verified trade professional with cooperative credentials.',
      emergencyAvailable: false,
      responseTimeMinutes: 30,
      coords: { lat: 12.9716, lng: 77.5946, address: data.location || 'Bangalore', city: 'Bangalore' },
      role: 'professional',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString().split('T')[0],
      earningsTotal: 0,
    };

    const userObj: User = {
      id: newPro.id,
      name: newPro.name,
      email: newPro.email,
      role: 'professional',
      phone: newPro.phone,
      location: newPro.location,
      avatar: newPro.avatar,
      createdAt: newPro.createdAt,
      isVerified: false,
    };

    this.professionals.unshift(newPro);
    this.users.unshift(userObj);
    this.currentUser = userObj;
    this.save();

    // Notify admin of pending verification
    this.addNotification({
      userId: 'user_admin_1',
      role: 'admin',
      title: 'New Service Professional Verification Required',
      message: `${newPro.name} applied for ${newPro.category} cooperative membership.`,
      type: 'verification',
    });

    this.notify();
    return newPro;
  }

  // --- Verification ---
  public updateVerificationStatus(proId: string, status: VerificationStatus): void {
    const pro = this.professionals.find((p) => p.id === proId);
    if (pro) {
      pro.verificationStatus = status;
      pro.isVerified = status === 'verified';
      this.addNotification({
        userId: pro.id,
        role: 'professional',
        title: status === 'verified' ? 'Congratulations! You are Verified ✓' : 'Verification Status Updated',
        message:
          status === 'verified'
            ? 'Your cooperative documents and skills have been approved. The Verified Badge is now active on your profile.'
            : 'Your verification was reviewed. Please check compliance guidelines.',
        type: 'verification',
      });
      this.notify();
    }
  }

  // --- Bookings ---
  public createBooking(data: {
    professionalId: string;
    serviceId: string;
    scheduledDate: string;
    scheduledTimeSlot: string;
    address: string;
    problemDescription: string;
    notes?: string;
    isEmergency?: boolean;
    cooperativeGroupId?: string;
    paymentMethod: PaymentMethod;
  }): Booking {
    const pro = this.professionals.find((p) => p.id === data.professionalId) || this.professionals[0];
    const service = this.services.find((s) => s.id === data.serviceId) || this.services[0];

    const servicePrice = service.startingPrice;
    const platformFee = Math.round(servicePrice * 0.1);
    const taxes = Math.round((servicePrice + platformFee) * 0.05);
    const discount = data.cooperativeGroupId ? 50 : 0;
    const totalAmount = servicePrice + platformFee + taxes - discount;

    const newBooking: Booking = {
      id: `book_${Date.now()}`,
      customerId: this.currentUser.id,
      customerName: this.currentUser.name,
      customerPhone: this.currentUser.phone,
      professionalId: pro.id,
      professionalName: pro.name,
      professionalCategory: pro.category,
      professionalAvatar: pro.avatar,
      serviceId: service.id,
      serviceName: service.name,
      scheduledDate: data.scheduledDate,
      scheduledTimeSlot: data.scheduledTimeSlot,
      address: data.address,
      problemDescription: data.problemDescription,
      notes: data.notes,
      status: 'requested',
      timeline: [
        {
          status: 'requested',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: 'Booking request sent to cooperative professional',
        },
      ],
      servicePrice,
      platformFee,
      taxes,
      discount,
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'cash_on_service' ? 'pending' : 'paid',
      isEmergency: !!data.isEmergency,
      cooperativeGroupId: data.cooperativeGroupId,
      createdAt: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);

    // Notify Professional
    this.addNotification({
      userId: pro.id,
      role: 'professional',
      title: data.isEmergency ? '🚨 URGENT Emergency Booking Request!' : 'New Booking Request Received',
      message: `${this.currentUser.name} booked "${service.name}" for ${data.scheduledDate} (${data.scheduledTimeSlot}).`,
      type: data.isEmergency ? 'emergency' : 'booking',
    });

    // Notify Customer
    this.addNotification({
      userId: this.currentUser.id,
      role: 'customer',
      title: 'Booking Request Submitted',
      message: `Your request for ${service.name} has been sent to ${pro.name}.`,
      type: 'booking',
    });

    // Start auto simulated message
    this.sendMessage({
      bookingId: newBooking.id,
      senderId: this.currentUser.id,
      senderRole: 'customer',
      senderName: this.currentUser.name,
      text: `Hello ${pro.name}! I have placed a booking for "${service.name}". Problem: ${data.problemDescription}`,
    });

    this.notify();
    return newBooking;
  }

  public updateBookingStatus(bookingId: string, newStatus: BookingStatus, note?: string): void {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    booking.status = newStatus;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const defaultNotes: Record<BookingStatus, string> = {
      requested: 'Booking placed',
      accepted: `${booking.professionalName} accepted your booking request`,
      on_the_way: `${booking.professionalName} is traveling to your location`,
      work_started: `Service in progress at ${booking.address}`,
      work_completed: 'Service completed. Pending customer sign-off & payment verification',
      payment_pending: 'Work finished, awaiting settlement',
      completed: 'Booking completed successfully and payment settled',
      cancelled: 'Booking was cancelled',
    };

    booking.timeline.push({
      status: newStatus,
      timestamp: timeStr,
      note: note || defaultNotes[newStatus] || `Status updated to ${newStatus}`,
    });

    if (newStatus === 'accepted' && !booking.estimatedArrivalTimestamp) {
      const pro = this.professionals.find((p) => p.id === booking.professionalId);
      const travelMinutes = pro?.responseTimeMinutes || (booking.isEmergency ? 15 : 25);
      booking.estimatedArrivalTimestamp = Date.now() + travelMinutes * 60 * 1000;
    }

    if (newStatus === 'completed') {
      booking.paymentStatus = 'paid';
      const pro = this.professionals.find((p) => p.id === booking.professionalId);
      if (pro) {
        pro.completedJobs += 1;
        pro.earningsTotal = (pro.earningsTotal || 0) + (booking.totalAmount - booking.platformFee);
      }
    }

    // Notifications
    this.addNotification({
      userId: booking.customerId,
      role: 'customer',
      title: `Booking Update: ${newStatus.replace('_', ' ').toUpperCase()}`,
      message: note || defaultNotes[newStatus],
      type: 'booking',
    });

    this.notify();
  }

  public payBooking(bookingId: string, method: PaymentMethod): void {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (booking) {
      booking.paymentMethod = method;
      booking.paymentStatus = 'paid';
      this.updateBookingStatus(bookingId, 'completed', `Payment of ₹${booking.totalAmount} confirmed via ${method.toUpperCase()}`);
      this.addNotification({
        userId: booking.customerId,
        role: 'customer',
        title: 'Payment Successful',
        message: `₹${booking.totalAmount} paid to cooperative escrow for booking #${booking.id.slice(-5)}.`,
        type: 'payment',
      });
      this.notify();
    }
  }

  public rateBooking(
    bookingId: string,
    rating: number,
    comment: string,
    scores: { quality: number; professionalism: number; timeliness: number; value: number }
  ): void {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (booking && booking.status === 'completed') {
      booking.rating = rating;
      booking.reviewComment = comment;
      booking.reviewScores = scores;

      // Update pro rating average
      const pro = this.professionals.find((p) => p.id === booking.professionalId);
      if (pro) {
        const totalScore = pro.rating * pro.reviewCount + rating;
        pro.reviewCount += 1;
        pro.rating = Number((totalScore / pro.reviewCount).toFixed(2));
      }

      this.addNotification({
        userId: booking.professionalId,
        role: 'professional',
        title: `New ${rating}★ Review Received`,
        message: `${booking.customerName} left a review: "${comment}"`,
        type: 'booking',
      });

      this.notify();
    }
  }

  // --- Chat ---
  public sendMessage(msg: {
    bookingId: string;
    senderId: string;
    senderRole: UserRole;
    senderName: string;
    text: string;
    attachmentUrl?: string;
  }): Message {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      bookingId: msg.bookingId,
      senderId: msg.senderId,
      senderRole: msg.senderRole,
      senderName: msg.senderName,
      text: msg.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      attachmentUrl: msg.attachmentUrl,
    };

    this.messages.push(newMsg);

    // Auto-respond if customer sent message to professional
    if (msg.senderRole === 'customer') {
      const booking = this.bookings.find((b) => b.id === msg.bookingId);
      if (booking) {
        setTimeout(() => {
          const autoReplies = [
            `Understood! I have noted down the details. I am equipped with the required tools.`,
            `Thanks for the update. My GPS route is active, arriving right on schedule.`,
            `Got it! Please keep the work area clear. I'll inspect the fittings as soon as I arrive.`,
          ];
          const text = autoReplies[Math.floor(Math.random() * autoReplies.length)];
          this.messages.push({
            id: `msg_${Date.now() + 1}`,
            bookingId: msg.bookingId,
            senderId: booking.professionalId,
            senderRole: 'professional',
            senderName: booking.professionalName,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
          });
          this.notify();
        }, 1500);
      }
    }

    this.notify();
    return newMsg;
  }

  // --- Notifications ---
  public addNotification(item: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>): void {
    const notif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      read: false,
      timestamp: 'Just now',
    };
    this.notifications.unshift(notif);
    this.notify();
  }

  public markNotificationAsRead(id: string): void {
    const n = this.notifications.find((notif) => notif.id === id);
    if (n) {
      n.read = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.userId === userId || n.userId === 'user_admin_1') {
        n.read = true;
      }
    });
    this.notify();
  }

  // --- Favorites ---
  public toggleFavorite(proId: string): void {
    if (this.favorites.includes(proId)) {
      this.favorites = this.favorites.filter((id) => id !== proId);
    } else {
      this.favorites.push(proId);
    }
    this.notify();
  }

  // --- Complaints ---
  public fileComplaint(data: {
    bookingId: string;
    filedByName: string;
    filedByRole: UserRole;
    targetUserName: string;
    issueType: string;
    description: string;
  }): Complaint {
    const cmp: Complaint = {
      id: `cmp_${Date.now()}`,
      bookingId: data.bookingId,
      filedByName: data.filedByName,
      filedByRole: data.filedByRole,
      targetUserName: data.targetUserName,
      issueType: data.issueType,
      description: data.description,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.complaints.unshift(cmp);
    this.addNotification({
      userId: 'user_admin_1',
      role: 'admin',
      title: 'New Service Dispute Filed',
      message: `${data.filedByName} submitted a complaint regarding booking #${data.bookingId}.`,
      type: 'system',
    });
    this.notify();
    return cmp;
  }

  public resolveComplaint(id: string, resolution: string): void {
    const cmp = this.complaints.find((c) => c.id === id);
    if (cmp) {
      cmp.status = 'resolved';
      cmp.resolution = resolution;
      this.notify();
    }
  }
}

export const store = PlatformStore.getInstance();
