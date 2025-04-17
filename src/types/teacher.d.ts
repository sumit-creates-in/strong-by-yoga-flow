
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
  // Add all the methods and properties that were missing
  notificationSettings?: any;
  updateNotificationSettings?: (settings: any) => void;
  bookSession?: (bookingData: any) => void;
  getBooking?: (bookingId: string) => any;
  purchaseCredits?: (amount: number | string) => void;
}
