export type UserRole = 'customer' | 'professional' | 'admin';

export type VerificationStatus = 'pending' | 'approved' | 'verified' | 'rejected';

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'on_the_way'
  | 'work_started'
  | 'work_completed'
  | 'payment_pending'
  | 'completed'
  | 'cancelled';

export type PaymentMethod =
  | 'upi'
  | 'card'
  | 'netbanking'
  | 'wallet'
  | 'cash_on_service';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface LocationCoords {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  location: string;
  avatar: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface ServiceProfessional extends User {
  category: string;
  skills: string[];
  experienceYears: number;
  serviceRadiusKm: number;
  hourlyRate: number;
  startingPrice: number;
  availability: 'available_now' | 'busy' | 'scheduled_only' | 'offline';
  certifications: string[];
  portfolio: { title: string; imageUrl: string; description: string }[];
  verificationStatus: VerificationStatus;
  governmentDocUrl?: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  bio: string;
  emergencyAvailable: boolean;
  responseTimeMinutes: number;
  coords: LocationCoords;
  groupIds?: string[];
  earningsTotal?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular?: boolean;
  baseStartingPrice: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  startingPrice: number;
  durationMinutes: number;
  icon: string;
  tags: string[];
  emergencyEligible: boolean;
  rating: number;
  reviewsCount: number;
}

export interface CooperativeGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  discountPercentage: number;
  memberIds: string[];
  members?: ServiceProfessional[];
  servicesOffered: string[];
  icon: string;
  coordinatorName: string;
  completedProjects: number;
  rating: number;
  baseBundlePrice: number;
}

export interface BookingTimelineEvent {
  status: BookingStatus;
  timestamp: string;
  note: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  professionalId: string;
  professionalName: string;
  professionalCategory: string;
  professionalAvatar: string;
  serviceId: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  address: string;
  coords?: LocationCoords;
  problemDescription: string;
  notes?: string;
  status: BookingStatus;
  timeline: BookingTimelineEvent[];
  servicePrice: number;
  platformFee: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  isEmergency: boolean;
  cooperativeGroupId?: string;
  estimatedArrivalTimestamp?: number;
  rating?: number;
  reviewComment?: string;
  reviewScores?: {
    quality: number;
    professionalism: number;
    timeliness: number;
    value: number;
  };
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachmentUrl?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'verification' | 'chat' | 'system' | 'emergency';
  read: boolean;
  timestamp: string;
  linkAction?: string;
}

export interface Complaint {
  id: string;
  bookingId: string;
  filedByName: string;
  filedByRole: UserRole;
  targetUserName: string;
  issueType: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  resolution?: string;
  createdAt: string;
}

export interface AIAnalysisResult {
  problemIdentified: string;
  recommendedCategory: string;
  recommendedService: string;
  estimatedPriceRange: string;
  urgencyLevel: 'Emergency (Immediate)' | 'High' | 'Standard';
  explanation: string;
  suggestedProIds: string[];
  cooperativeBundleRecommendation?: {
    suggested: boolean;
    bundleName: string;
    servicesNeeded: string[];
    coopGroupId?: string;
  };
  safetyAdvice: string;
}
