
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
  teachingStyle?: string;
  lastReviewDate?: Date;
  reviews?: Review[];
  notificationSettings?: NotificationSettings;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  experience?: number;
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  date?: string;
}

export interface ZoomAccount {
  id?: string;
  email?: string;
  verified?: boolean;
  personalMeetingId?: string;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
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
}

export interface SessionType {
  id: string;
  name: string;
  duration: number;
  credits: number;
  type?: 'video' | 'call' | 'chat';
  minTimeBeforeBooking?: number;
  maxAdvanceBookingDays?: number;
  allowRecurring?: boolean;
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
  timing: {
    type: 'before' | 'after';
    minutes: number;
  };
  recipients: ('user' | 'teacher')[];
}

export interface TeacherContextProps {
  teachers: Teacher[];
  getTeacher: (id: string) => Teacher | undefined;
  loading: boolean;
  error: Error | null;
  notificationSettings?: NotificationSettings;
  updateNotificationSettings?: (settings: any) => void;
  bookSession?: (bookingData: any) => void;
  getBooking?: (bookingId: string) => any;
  purchaseCredits?: (amount: number | string) => void;
}
