
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Define teacher types
export interface SessionType {
  id: string;
  name: string;
  type: 'video' | 'call' | 'chat';
  duration: number;
  price: number;
  credits: number;
  allowRecurring?: boolean;
  minTimeBeforeBooking?: number; // in hours
  minTimeBeforeCancel?: number; // in hours
  minTimeBeforeReschedule?: number; // in hours
  maxAdvanceBookingDays?: number; // in days
}

export interface AvailabilitySlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

export interface ZoomAccount {
  id: string;
  email: string;
  accountName: string;
  connected: boolean;
}

export interface Review {
  id: string;
  userName: string;
  userInitials: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  shortBio: string;
  fullBio: string;
  experience: number;
  specialties: string[];
  expertise: string[];
  teachingStyle: string;
  certifications: string[];
  languages: string[];
  totalSessions: number;
  reviews: Review[];
  lastReviewDate: string;
  sessionTypes: SessionType[];
  availability: AvailabilitySlot[];
  zoomAccount: ZoomAccount | null;
}

export interface BookingData {
  id: string;
  teacherId: string;
  sessionType: SessionType;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  isRecurring?: boolean;
  recurringPattern?: 'weekly' | 'biweekly' | 'monthly';
  recurringEnd?: Date;
}

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund';
  amount: number;
  description: string;
  date: Date;
  sessionId?: string;
  packageId?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits: number;
  popular?: boolean;
  mostValue?: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'in-app';
  subject?: string;
  body: string;
  enabled: boolean;
  recipientType: 'student' | 'teacher' | 'both';
  triggerType: 'scheduled' | 'action';
  triggerAction?: 'booking_confirmed' | 'booking_cancelled' | 'booking_rescheduled' | 'booking_reminder';
  scheduledTime?: {
    when: 'before' | 'after' | 'same-day';
    time: number; // minutes
  };
  placeholders?: Record<string, string>;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    templates: NotificationTemplate[];
  };
  sms: {
    enabled: boolean;
    templates: NotificationTemplate[];
  };
  whatsapp: {
    enabled: boolean;
    phoneNumberId: string;
    accessToken: string;
    businessAccountId: string;
    verifyToken: string;
    autoReplyEnabled: boolean;
    autoReplyMessage: string;
    templates: NotificationTemplate[];
  };
  inApp: {
    enabled: boolean;
    templates: NotificationTemplate[];
  };
}

interface TeacherContextType {
  teachers: Teacher[];
  bookings: BookingData[];
  creditPackages: CreditPackage[];
  creditTransactions: CreditTransaction[];
  userCredits: number;
  notificationSettings: NotificationSettings;
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  getTeacher: (id: string) => Teacher | undefined;
  bookSession: (booking: Omit<BookingData, 'id' | 'status'>) => void;
  getBooking: () => BookingData | null;
  purchaseCredits: (packageId: string) => void;
  addCreditPackage: (pkg: Omit<CreditPackage, 'id'>) => void;
  updateCreditPackage: (pkg: CreditPackage) => void;
  deleteCreditPackage: (id: string) => void;
  connectZoomAccount: (teacherId: string, account: Omit<ZoomAccount, 'id'>) => void;
  disconnectZoomAccount: (teacherId: string) => void;
  addTeacherAvailability: (teacherId: string, slot: Omit<AvailabilitySlot, 'id'>) => void;
  removeTeacherAvailability: (teacherId: string, slotId: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  addNotificationTemplate: (template: Omit<NotificationTemplate, 'id'>) => void;
  updateNotificationTemplate: (template: NotificationTemplate) => void;
  deleteNotificationTemplate: (id: string) => void;
  sendTestNotification: (templateId: string, recipientId: string) => void;
}

const TeacherContext = createContext<TeacherContextType>({
  teachers: [],
  bookings: [],
  creditPackages: [],
  creditTransactions: [],
  userCredits: 0,
  notificationSettings: {
    email: { enabled: false, templates: [] },
    sms: { enabled: false, templates: [] },
    whatsapp: {
      enabled: false,
      phoneNumberId: '',
      accessToken: '',
      businessAccountId: '',
      verifyToken: '',
      autoReplyEnabled: false,
      autoReplyMessage: '',
      templates: []
    },
    inApp: { enabled: false, templates: [] }
  },
  addTeacher: () => {},
  updateTeacher: () => {},
  deleteTeacher: () => {},
  getTeacher: () => undefined,
  bookSession: () => {},
  getBooking: () => null,
  purchaseCredits: () => {},
  addCreditPackage: () => {},
  updateCreditPackage: () => {},
  deleteCreditPackage: () => {},
  connectZoomAccount: () => {},
  disconnectZoomAccount: () => {},
  addTeacherAvailability: () => {},
  removeTeacherAvailability: () => {},
  updateNotificationSettings: () => {},
  addNotificationTemplate: () => {},
  updateNotificationTemplate: () => {},
  deleteNotificationTemplate: () => {},
  sendTestNotification: () => {},
});

// Sample data
const sampleTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Sarah Johnson',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.9,
    reviewCount: 183,
    shortBio: 'Specializes in Hatha and Restorative yoga with 14 years of experience.',
    fullBio: `I've been practicing yoga for over 18 years and teaching for 14 years. My journey began after recovering from a sports injury, and yoga became my path to healing both physically and mentally.

    I teach a mindful approach to yoga that focuses on proper alignment and breathing techniques. My classes are suitable for all levels, with modifications offered for beginners and advanced practitioners.

    I believe yoga should be accessible to everyone and create a supportive environment where students feel comfortable exploring their practice.`,
    experience: 14,
    specialties: ['Hatha Yoga', 'Restorative Yoga', 'Meditation', 'Yoga Therapy'],
    expertise: ['Stress Reduction', 'Back Pain', 'Joint Health', 'Flexibility', 'Mind-Body Connection', 'Proper Alignment'],
    teachingStyle: "My teaching style blends traditional Hatha techniques with gentle restorative poses. I focus on creating a supportive environment where students can explore their practice at their own pace. Each session includes mindfulness exercises and proper alignment guidance.",
    certifications: [
      'Registered Yoga Teacher (RYT-500)',
      'Yoga Therapy Certification, International Association of Yoga Therapists',
      'Meditation Teacher Training, Mindfulness Center'
    ],
    languages: ['English', 'Spanish'],
    totalSessions: 2451,
    reviews: [
      {
        id: 'review-1',
        userName: 'Michael P.',
        userInitials: 'MP',
        rating: 5,
        comment: 'Sarah helped me overcome chronic back pain through targeted yoga therapy. Her knowledge of anatomy and gentle approach made all the difference.',
        date: 'March 15, 2023'
      },
      {
        id: 'review-2',
        userName: 'Rebecca T.',
        userInitials: 'RT',
        rating: 5,
        comment: 'Wonderful teacher! Sarah creates a calm and supportive environment. I leave every session feeling refreshed and centered.',
        date: 'January 22, 2023'
      }
    ],
    lastReviewDate: 'March 15, 2023',
    sessionTypes: [
      {
        id: 'session-1',
        name: 'Personalized Yoga Session',
        type: 'video',
        duration: 60,
        price: 80,
        credits: 80,
        allowRecurring: true,
        minTimeBeforeBooking: 2,
        minTimeBeforeCancel: 4,
        minTimeBeforeReschedule: 6,
        maxAdvanceBookingDays: 30
      },
      {
        id: 'session-2',
        name: 'Yoga Therapy Consultation',
        type: 'video',
        duration: 90,
        price: 110,
        credits: 110,
        allowRecurring: true,
        minTimeBeforeBooking: 4,
        minTimeBeforeCancel: 8,
        minTimeBeforeReschedule: 12,
        maxAdvanceBookingDays: 45
      },
      {
        id: 'session-3',
        name: 'Quick Guidance Call',
        type: 'call',
        duration: 30,
        price: 45,
        credits: 45,
        allowRecurring: false,
        minTimeBeforeBooking: 1,
        minTimeBeforeCancel: 2,
        minTimeBeforeReschedule: 2,
        maxAdvanceBookingDays: 14
      }
    ],
    availability: [
      { 
        id: 'avail-1',
        day: 'monday', 
        startTime: '10:00', 
        endTime: '15:00',
        isRecurring: true
      },
      { 
        id: 'avail-2',
        day: 'wednesday', 
        startTime: '13:00', 
        endTime: '18:00',
        isRecurring: true
      },
      { 
        id: 'avail-3',
        day: 'friday', 
        startTime: '09:00', 
        endTime: '14:00',
        isRecurring: true
      }
    ],
    zoomAccount: {
      id: 'zoom-1',
      email: 'sarah.johnson@example.com',
      accountName: 'Sarah Johnson',
      connected: true
    }
  },
  {
    id: 'teacher-2',
    name: 'Raj Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2021&q=80',
    rating: 4.8,
    reviewCount: 142,
    shortBio: 'Experienced in Ashtanga and Vinyasa Flow with focus on strength building and mindfulness.',
    fullBio: `With over 12 years of teaching experience, I offer dynamic yoga sessions that blend traditional Ashtanga sequences with creative Vinyasa flows. My approach emphasizes the connection between movement and breath, creating a meditative flow state.

    Before becoming a full-time yoga teacher, I worked in a corporate environment and understand the physical and mental challenges of desk-bound professionals. My teaching is particularly effective for those looking to build strength, improve flexibility, and reduce stress from sedentary lifestyles.

    I believe in making yoga challenging yet accessible, and always emphasize proper alignment to prevent injury.`,
    experience: 12,
    specialties: ['Ashtanga Yoga', 'Vinyasa Flow', 'Power Yoga', 'Breathwork'],
    expertise: ['Strength Building', 'Flexibility', 'Athletic Performance', 'Stress Management', 'Corporate Wellness'],
    teachingStyle: "My sessions are dynamic and energizing, emphasizing the connection between breath and movement. I create challenging sequences that build strength and improve flexibility, while maintaining mindfulness throughout practice. Expect clear guidance, hands-on adjustments, and modifications for all levels.",
    certifications: [
      'Registered Yoga Teacher (RYT-500)',
      'Ashtanga Yoga Certification from K. Pattabhi Jois Ashtanga Yoga Institute',
      'Sports Yoga Specialist Certification'
    ],
    languages: ['English', 'Hindi'],
    totalSessions: 1876,
    reviews: [
      {
        id: 'review-3',
        userName: 'Jennifer K.',
        userInitials: 'JK',
        rating: 5,
        comment: 'Raj\'s classes are challenging but so rewarding! I\'ve gained significant strength and my flexibility has improved dramatically. Highly recommend!',
        date: 'April 2, 2023'
      },
      {
        id: 'review-4',
        userName: 'David M.',
        userInitials: 'DM',
        rating: 4,
        comment: 'Great instructor who really knows his stuff. The sessions are demanding but Raj provides good modifications for newer practitioners.',
        date: 'February 8, 2023'
      }
    ],
    lastReviewDate: 'April 2, 2023',
    sessionTypes: [
      {
        id: 'session-4',
        name: 'Dynamic Flow Session',
        type: 'video',
        duration: 60,
        price: 75,
        credits: 75,
        allowRecurring: true,
        minTimeBeforeBooking: 3,
        minTimeBeforeCancel: 6,
        minTimeBeforeReschedule: 8,
        maxAdvanceBookingDays: 30
      },
      {
        id: 'session-5',
        name: 'Strength & Flexibility Focus',
        type: 'video',
        duration: 75,
        price: 90,
        credits: 90,
        allowRecurring: true,
        minTimeBeforeBooking: 4,
        minTimeBeforeCancel: 8,
        minTimeBeforeReschedule: 10,
        maxAdvanceBookingDays: 45
      },
      {
        id: 'session-6',
        name: 'Quick Form Check',
        type: 'call',
        duration: 20,
        price: 35,
        credits: 35,
        allowRecurring: false,
        minTimeBeforeBooking: 1,
        minTimeBeforeCancel: 2,
        minTimeBeforeReschedule: 2,
        maxAdvanceBookingDays: 14
      }
    ],
    availability: [
      { 
        id: 'avail-4',
        day: 'tuesday', 
        startTime: '08:00', 
        endTime: '12:00',
        isRecurring: true
      },
      { 
        id: 'avail-5',
        day: 'thursday', 
        startTime: '14:00', 
        endTime: '19:00',
        isRecurring: true
      },
      { 
        id: 'avail-6',
        day: 'saturday', 
        startTime: '09:00', 
        endTime: '13:00',
        isRecurring: true
      }
    ],
    zoomAccount: {
      id: 'zoom-2',
      email: 'raj.patel@example.com',
      accountName: 'Raj Patel',
      connected: true
    }
  },
  {
    id: 'teacher-3',
    name: 'Maya Gonzalez',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 5.0,
    reviewCount: 98,
    shortBio: 'Specialized in Yin Yoga and meditation practices for stress relief and emotional balance.',
    fullBio: `I specialize in Yin Yoga and meditation practices, focusing on deep tissue release, stress reduction, and emotional balance. With 8 years of teaching experience, I help students develop a sustainable practice that benefits both body and mind.

    My approach is gentle yet transformative, emphasizing longer holds that target the connective tissues and quiet the mind. Each session is thoughtfully designed to address modern lifestyle challenges like stress, anxiety, and physical tension from sedentary habits.

    I create a nurturing space where students can slow down, tune inward, and develop greater body awareness and emotional resilience.`,
    experience: 8,
    specialties: ['Yin Yoga', 'Meditation', 'Mindfulness', 'Gentle Flow'],
    expertise: ['Stress Reduction', 'Anxiety Management', 'Emotional Balance', 'Deep Relaxation', 'Sleep Improvement'],
    teachingStyle: "My sessions are slow-paced and contemplative, focusing on longer holds and mindful awareness. I create a nurturing environment that encourages students to observe sensations in the body and fluctuations in the mind. Each class incorporates meditation techniques and breathwork to deepen the practice.",
    certifications: [
      'Registered Yoga Teacher (RYT-200)',
      'Yin Yoga Certification with Bernie Clark',
      'Mindfulness Meditation Teacher Certification'
    ],
    languages: ['English', 'Spanish'],
    totalSessions: 854,
    reviews: [
      {
        id: 'review-5',
        userName: 'Sophia L.',
        userInitials: 'SL',
        rating: 5,
        comment: 'Maya\'s yin sessions have been transformative for my stress levels. Her gentle guidance and knowledge have helped me develop a consistent practice that works with my busy schedule.',
        date: 'May 10, 2023'
      },
      {
        id: 'review-6',
        userName: 'Thomas W.',
        userInitials: 'TW',
        rating: 5,
        comment: 'The meditation techniques Maya taught me have helped me manage my anxiety better than anything else I\'ve tried. Her calm presence and clear instructions make the practice accessible.',
        date: 'March 24, 2023'
      }
    ],
    lastReviewDate: 'May 10, 2023',
    sessionTypes: [
      {
        id: 'session-7',
        name: 'Yin Yoga Session',
        type: 'video',
        duration: 75,
        price: 85,
        credits: 85,
        allowRecurring: true,
        minTimeBeforeBooking: 3,
        minTimeBeforeCancel: 6,
        minTimeBeforeReschedule: 8,
        maxAdvanceBookingDays: 30
      },
      {
        id: 'session-8',
        name: 'Meditation & Mindfulness',
        type: 'video',
        duration: 45,
        price: 60,
        credits: 60,
        allowRecurring: true,
        minTimeBeforeBooking: 2,
        minTimeBeforeCancel: 4,
        minTimeBeforeReschedule: 6,
        maxAdvanceBookingDays: 30
      },
      {
        id: 'session-9',
        name: 'Stress Relief Guidance',
        type: 'call',
        duration: 30,
        price: 50,
        credits: 50,
        allowRecurring: false,
        minTimeBeforeBooking: 2,
        minTimeBeforeCancel: 3,
        minTimeBeforeReschedule: 3,
        maxAdvanceBookingDays: 14
      }
    ],
    availability: [
      { 
        id: 'avail-7',
        day: 'monday', 
        startTime: '15:00', 
        endTime: '20:00',
        isRecurring: true
      },
      { 
        id: 'avail-8',
        day: 'wednesday', 
        startTime: '09:00', 
        endTime: '13:00',
        isRecurring: true
      },
      { 
        id: 'avail-9',
        day: 'friday', 
        startTime: '14:00', 
        endTime: '18:00',
        isRecurring: true
      }
    ],
    zoomAccount: {
      id: 'zoom-3',
      email: 'maya.gonzalez@example.com',
      accountName: 'Maya Gonzalez',
      connected: true
    }
  }
];

// Sample credit packages
const sampleCreditPackages: CreditPackage[] = [
  {
    id: 'pkg-1',
    name: 'Starter Pack',
    price: 50,
    credits: 50
  },
  {
    id: 'pkg-2',
    name: 'Standard Pack',
    price: 100,
    credits: 110,
    popular: true
  },
  {
    id: 'pkg-3',
    name: 'Premium Pack',
    price: 200,
    credits: 240,
    mostValue: true
  },
  {
    id: 'pkg-4',
    name: 'Pro Pack',
    price: 500,
    credits: 650
  }
];

// Sample notification templates
const sampleNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'notif-1',
    name: 'Booking Confirmation',
    type: 'email',
    subject: 'Your booking is confirmed - %service_name%',
    body: `<p>Hello %customer_full_name%,</p>
<p>Your booking with %employee_full_name% has been confirmed for %appointment_date_time%.</p>
<p>Class: %service_name%</p>
<p>With: %employee_full_name%</p>
<p>When: %appointment_date_time%</p>
<p>Zoom Link: %zoom_join_url%</p>
<p>We look forward to seeing you!</p>`,
    enabled: true,
    recipientType: 'student',
    triggerType: 'action',
    triggerAction: 'booking_confirmed'
  },
  {
    id: 'notif-2',
    name: 'Reminder: 30 min before',
    type: 'email',
    subject: 'Reminder: %service_name% coming up in 30 minutes at %appointment_date_time%',
    body: `<p>Hello %customer_full_name%,</p>
<p>Your appointment is coming up in 30 minutes:</p>
<ul>
<li>Class: %service_name%</li>
<li>When: %appointment_date_time%</li>
<li>With: %employee_full_name%</li>
<li>Class Link: %zoom_join_url%</li>
</ul>
<p>We use Zoom for classes. If you don't have Zoom installed please click on the meeting link above and download it.</p>
<p><strong>Points to be taken care of for the session:</strong></p>
<ul>
<li>Avoid eating a heavy meal at least 3 hours prior to the session.</li>
<li>A Yoga Mat will be a great help.</li>
<li>We suggest that you use a tablet, laptop, or TV for this session. Bigger the screen better the experience.</li>
<li>We highly recommend the use of wireless earbuds/Air Pods to listen and interact with the teacher</li>
<li>Set up your device and yoga mat at least 6 steps away from each other.</li>
</ul>`,
    enabled: true,
    recipientType: 'student',
    triggerType: 'scheduled',
    scheduledTime: {
      when: 'before',
      time: 30
    }
  },
  {
    id: 'notif-3',
    name: 'Booking Confirmed',
    type: 'whatsapp',
    body: `Namaste, %customer_full_name%!

Your booking has been confirmed:

• Class: %service_name%
• When: %appointment_date_time%
• With: %employee_full_name%

We look forward to seeing you!`,
    enabled: true,
    recipientType: 'student',
    triggerType: 'action',
    triggerAction: 'booking_confirmed'
  }
];

export const TeacherProvider = ({ children }: { children: ReactNode }) => {
  const [teachers, setTeachers] = useState<Teacher[]>(sampleTeachers);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [currentBooking, setCurrentBooking] = useState<BookingData | null>(null);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>(sampleCreditPackages);
  const [userCredits, setUserCredits] = useState<number>(100);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([
    {
      id: 'trans-1',
      type: 'purchase',
      amount: 100,
      description: 'Initial credit purchase',
      date: new Date(new Date().setDate(new Date().getDate() - 30))
    }
  ]);
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      templates: sampleNotificationTemplates.filter(t => t.type === 'email')
    },
    sms: {
      enabled: false,
      templates: []
    },
    whatsapp: {
      enabled: false,
      phoneNumberId: '',
      accessToken: '',
      businessAccountId: '',
      verifyToken: '',
      autoReplyEnabled: false,
      autoReplyMessage: 'Dear %customer_full_name%, This message does not have an option for responding. If you need additional information about your booking, please contact us at %company_phone%',
      templates: sampleNotificationTemplates.filter(t => t.type === 'whatsapp')
    },
    inApp: {
      enabled: true,
      templates: []
    }
  });
  
  const { toast } = useToast();
  
  const addTeacher = (teacher: Teacher) => {
    setTeachers([...teachers, teacher]);
  };
  
  const updateTeacher = (updatedTeacher: Teacher) => {
    setTeachers(teachers.map(teacher => 
      teacher.id === updatedTeacher.id ? updatedTeacher : teacher
    ));
  };
  
  const deleteTeacher = (id: string) => {
    setTeachers(teachers.filter(teacher => teacher.id !== id));
  };
  
  const getTeacher = (id: string) => {
    return teachers.find(teacher => teacher.id === id);
  };
  
  const bookSession = (bookingData: Omit<BookingData, 'id' | 'status'>) => {
    const newBooking = {
      id: `booking-${Date.now()}`,
      ...bookingData,
      status: 'scheduled' as const
    };
    
    setBookings([...bookings, newBooking]);
    setCurrentBooking(newBooking);
    
    // Deduct credits
    const creditsToDeduct = bookingData.sessionType.credits;
    setUserCredits(prev => prev - creditsToDeduct);
    
    // Add transaction record
    const teacher = getTeacher(bookingData.teacherId);
    addCreditTransaction({
      type: 'usage',
      amount: -creditsToDeduct,
      description: `Booking with ${teacher?.name} - ${bookingData.sessionType.name}`,
      date: new Date(),
      sessionId: newBooking.id
    });
    
    // Send notifications
    const emailTemplate = notificationSettings.email.templates.find(t => t.triggerAction === 'booking_confirmed');
    if (notificationSettings.email.enabled && emailTemplate && emailTemplate.enabled) {
      // In a real app, this would send an actual email
      console.log(`Sending email notification: ${emailTemplate.subject}`);
    }
    
    const whatsappTemplate = notificationSettings.whatsapp.templates.find(t => t.triggerAction === 'booking_confirmed');
    if (notificationSettings.whatsapp.enabled && whatsappTemplate && whatsappTemplate.enabled) {
      // In a real app, this would send a WhatsApp message
      console.log(`Sending WhatsApp notification`);
    }
    
    toast({
      title: "Session booked!",
      description: `Your session with ${getTeacher(bookingData.teacherId)?.name} has been scheduled.`,
    });
  };
  
  const getBooking = () => {
    return currentBooking;
  };
  
  const purchaseCredits = (packageId: string) => {
    const pkg = creditPackages.find(p => p.id === packageId);
    if (!pkg) return;
    
    setUserCredits(prev => prev + pkg.credits);
    
    // Add transaction record
    addCreditTransaction({
      type: 'purchase',
      amount: pkg.credits,
      description: `Purchased ${pkg.name} (${pkg.credits} credits)`,
      date: new Date(),
      packageId
    });
    
    toast({
      title: "Credits purchased!",
      description: `${pkg.credits} credits have been added to your account.`,
    });
  };
  
  const addCreditTransaction = (transaction: Omit<CreditTransaction, 'id'>) => {
    const newTransaction = {
      id: `trans-${Date.now()}`,
      ...transaction
    };
    
    setCreditTransactions(prev => [...prev, newTransaction]);
  };
  
  const addCreditPackage = (pkg: Omit<CreditPackage, 'id'>) => {
    const newPackage = {
      id: `pkg-${Date.now()}`,
      ...pkg
    };
    
    setCreditPackages([...creditPackages, newPackage]);
    
    toast({
      title: "Package created",
      description: `${newPackage.name} package has been added.`
    });
  };
  
  const updateCreditPackage = (updatedPkg: CreditPackage) => {
    setCreditPackages(creditPackages.map(pkg => 
      pkg.id === updatedPkg.id ? updatedPkg : pkg
    ));
    
    toast({
      title: "Package updated",
      description: `${updatedPkg.name} package has been updated.`
    });
  };
  
  const deleteCreditPackage = (id: string) => {
    setCreditPackages(creditPackages.filter(pkg => pkg.id !== id));
    
    toast({
      title: "Package deleted",
      description: "Credit package has been deleted."
    });
  };
  
  const connectZoomAccount = (teacherId: string, account: Omit<ZoomAccount, 'id'>) => {
    const newZoomAccount: ZoomAccount = {
      id: `zoom-${Date.now()}`,
      ...account
    };
    
    setTeachers(teachers.map(teacher => 
      teacher.id === teacherId ? { ...teacher, zoomAccount: newZoomAccount } : teacher
    ));
  };
  
  const disconnectZoomAccount = (teacherId: string) => {
    setTeachers(teachers.map(teacher => 
      teacher.id === teacherId ? { ...teacher, zoomAccount: null } : teacher
    ));
  };
  
  const addTeacherAvailability = (teacherId: string, slot: Omit<AvailabilitySlot, 'id'>) => {
    const newSlot: AvailabilitySlot = {
      id: `avail-${Date.now()}`,
      ...slot
    };
    
    setTeachers(teachers.map(teacher => 
      teacher.id === teacherId ? 
      { ...teacher, availability: [...teacher.availability, newSlot] } : 
      teacher
    ));
  };
  
  const removeTeacherAvailability = (teacherId: string, slotId: string) => {
    setTeachers(teachers.map(teacher => 
      teacher.id === teacherId ? 
      { ...teacher, availability: teacher.availability.filter(s => s.id !== slotId) } : 
      teacher
    ));
  };
  
  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({
      ...prev,
      ...settings
    }));
    
    toast({
      title: "Notification settings updated",
      description: "Your notification settings have been saved."
    });
  };
  
  const addNotificationTemplate = (template: Omit<NotificationTemplate, 'id'>) => {
    const newTemplate: NotificationTemplate = {
      id: `template-${Date.now()}`,
      ...template
    };
    
    setNotificationSettings(prev => {
      const section = template.type === 'email' ? 'email' : 
                      template.type === 'sms' ? 'sms' : 
                      template.type === 'whatsapp' ? 'whatsapp' : 'inApp';
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          templates: [...prev[section].templates, newTemplate]
        }
      };
    });
    
    toast({
      title: "Template added",
      description: `${template.name} notification template has been created.`
    });
  };
  
  const updateNotificationTemplate = (template: NotificationTemplate) => {
    setNotificationSettings(prev => {
      const section = template.type === 'email' ? 'email' : 
                      template.type === 'sms' ? 'sms' : 
                      template.type === 'whatsapp' ? 'whatsapp' : 'inApp';
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          templates: prev[section].templates.map(t => 
            t.id === template.id ? template : t
          )
        }
      };
    });
    
    toast({
      title: "Template updated",
      description: `${template.name} notification template has been updated.`
    });
  };
  
  const deleteNotificationTemplate = (id: string) => {
    setNotificationSettings(prev => {
      const updatedSettings = { ...prev };
      
      // Check each section for the template
      ['email', 'sms', 'whatsapp', 'inApp'].forEach((section) => {
        const sectionKey = section as keyof NotificationSettings;
        if (updatedSettings[sectionKey].templates.some(t => t.id === id)) {
          updatedSettings[sectionKey] = {
            ...updatedSettings[sectionKey],
            templates: updatedSettings[sectionKey].templates.filter(t => t.id !== id)
          };
        }
      });
      
      return updatedSettings;
    });
    
    toast({
      title: "Template deleted",
      description: "The notification template has been removed."
    });
  };
  
  const sendTestNotification = (templateId: string, recipientId: string) => {
    // Find template in any section
    let template: NotificationTemplate | undefined;
    let section: keyof NotificationSettings | undefined;
    
    ['email', 'sms', 'whatsapp', 'inApp'].forEach((s) => {
      const sectionKey = s as keyof NotificationSettings;
      const found = notificationSettings[sectionKey].templates.find(t => t.id === templateId);
      if (found) {
        template = found;
        section = sectionKey;
      }
    });
    
    if (!template || !section) {
      toast({
        title: "Error",
        description: "Template not found",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send an actual notification
    toast({
      title: "Test notification sent",
      description: `A test ${section} notification has been sent.`
    });
  };
  
  return (
    <TeacherContext.Provider value={{
      teachers,
      bookings,
      creditPackages,
      creditTransactions,
      userCredits,
      notificationSettings,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      getTeacher,
      bookSession,
      getBooking,
      purchaseCredits,
      addCreditPackage,
      updateCreditPackage,
      deleteCreditPackage,
      connectZoomAccount,
      disconnectZoomAccount,
      addTeacherAvailability,
      removeTeacherAvailability,
      updateNotificationSettings,
      addNotificationTemplate,
      updateNotificationTemplate,
      deleteNotificationTemplate,
      sendTestNotification
    }}>
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeachers = () => useContext(TeacherContext);
