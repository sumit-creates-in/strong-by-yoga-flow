
export interface Teacher {
  id: string;
  title: string;
  name: string;
  bio: string;
  specialties: string[];
  expertise: string[];
  certifications: string[];
  sessionTypes: SessionType[];
  availability: AvailabilitySlot[];
  zoomAccount: ZoomAccount;
  notificationSettings: NotificationSettings;
  teachingStyle?: string;
  lastReviewDate?: string;  // Changed from Date to string for React compatibility
  reviews?: Review[];
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  experience?: number;
  shortBio?: string;
  fullBio?: string;
  totalSessions?: number;
  languages?: string[];
}

export interface AvailabilitySlot {
  id?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  date?: string;
  day?: string;
  slots?: {
    start: string;
    end: string;
  }[];
}

export interface ZoomAccount {
  id?: string;
  email?: string;
  verified?: boolean;
  personalMeetingId?: string;
  isConnected?: boolean;
  accountName?: string;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  userName?: string;     // Added for TeacherDetail.tsx
  userInitials?: string; // Added for TeacherDetail.tsx
  date?: string;         // Added for TeacherDetail.tsx
}

export interface NotificationSettings {
  email?: {
    enabled: boolean;
    templates: NotificationTemplate[];
  };
  sms?: {
    enabled: boolean;
    templates: NotificationTemplate[];
  };
  whatsapp?: {
    enabled: boolean;
    phoneNumberId: string;
    accessToken: string;
    businessAccountId: string;
    verifyToken: string;
    autoReplyEnabled: boolean;
    autoReplyMessage: string;
    templates: NotificationTemplate[];
  };
  zoom?: {
    enabled: boolean;
    templates: NotificationTemplate[];
  };
  app?: {
    enabled: boolean;
    templates: NotificationTemplate[];
  };
}

export interface SessionType {
  id: string;
  name: string;
  duration: number;
  credits?: number;
  price?: number;
  type?: 'video' | 'call' | 'chat';
  minTimeBeforeBooking?: number;
  maxAdvanceBookingDays?: number;
  allowRecurring?: boolean;
  description?: string;
  isActive?: boolean;
  bookingRestrictions?: {
    minTimeBeforeBooking: number;
    maxAdvanceBookingPeriod: number;
    minTimeBeforeCancelling: number;
    minTimeBeforeRescheduling: number;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject?: string;
  body: string;
  type: string;
  enabled: boolean;
  recipientType: string;
  triggerType: string;
  timing?: {
    type: 'before' | 'after';
    minutes: number;
  };
  recipients?: ('user' | 'teacher')[];
  triggerAction?: 'booking_confirmed' | 'booking_cancelled' | 'booking_rescheduled' | 'booking_reminder';
  scheduledTime?: {
    when: 'before' | 'after' | 'same-day';
    time: number;
  };
}

export interface TeacherContextProps {
  teachers: Teacher[];
  getTeacher: (id: string) => Teacher | undefined;
  loading?: boolean;
  error?: Error | null;
  notificationSettings?: NotificationSettings;
  updateNotificationSettings?: (settings: any) => void;
  bookSession?: (bookingData: any) => void;
  getBooking?: (bookingId: string) => BookingData | undefined;
  purchaseCredits?: (amount: number | string) => void;
  userCredits: number;
  creditPackages?: CreditPackage[];
  creditTransactions?: CreditTransaction[];
  addCreditPackage?: (packageData: Partial<CreditPackage>) => void;
  updateCreditPackage?: (packageData: CreditPackage) => void;
  deleteCreditPackage?: (packageId: string) => void;
  addTeacher?: (teacher: Teacher) => void;
  updateTeacher?: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher?: (id: string) => void;
  updateNotificationTemplate?: (template: NotificationTemplate) => void;
  deleteNotificationTemplate?: (id: string) => void;
  sendTestNotification?: (templateId: string, recipient: string) => void;
  addTeacherAvailability?: (teacherId: string, availability: AvailabilitySlot) => void;
  removeTeacherAvailability?: (teacherId: string, dayIndex: number) => void;
  connectZoomAccount?: (teacherId: string, email: string) => void;
  disconnectZoomAccount?: (teacherId: string) => void;
  bookings?: BookingData[];
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  mostValue?: boolean;
}

export interface CreditTransaction {
  id: string;
  user_id?: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund' | 'adjustment' | 'admin' | 'gift';
  created_at?: string;
  payment_id?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: any;
  description?: string;
  date?: string;
}

export interface BookingData {
  id: string;
  teacherId: string;
  userId: string;
  sessionType: SessionType;
  date: Date;
  time: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  credits: number;
}
