
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types
export interface AvailabilitySlot {
  day: string;
  slots: {
    start: string;
    end: string;
  }[];
}

export interface ZoomAccount {
  email: string;
  isConnected: boolean;
}

export interface SessionType {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
  bookingRestrictions: {
    minTimeBeforeBooking: number; // hours
    maxAdvanceBookingPeriod: number; // days
    minTimeBeforeCancelling: number; // hours
    minTimeBeforeRescheduling: number; // hours
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject?: string;
  body: string;
  timing: {
    type: 'before' | 'after';
    minutes: number;
  };
  recipients: ('user' | 'teacher')[];
}

// Add credit transaction interface
export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund' | 'admin' | 'gift';
  amount: number;
  description: string;
  date: string;
}

// Add credit package interface
export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits: number;
  popular?: boolean;
  mostValue?: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  experience: number;
  totalSessions: number;
  specialties: string[];
  expertise: string[];
  certifications: string[];
  languages?: string[];
  sessionTypes: SessionType[];
  availability: AvailabilitySlot[];
  zoomAccount: ZoomAccount;
  notificationSettings: {
    email: {
      enabled: boolean;
      templates: NotificationTemplate[];
    };
    app: {
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
    sms: {
      enabled: boolean;
      templates: NotificationTemplate[];
    };
  };
}

// Create context
interface TeacherContextProps {
  teachers: Teacher[];
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  
  // Add credit-related properties
  userCredits: number;
  creditTransactions: CreditTransaction[];
  creditPackages: CreditPackage[];
  addCreditPackage: (pkg: Omit<CreditPackage, 'id'>) => void;
  updateCreditPackage: (pkg: CreditPackage) => void;
  deleteCreditPackage: (id: string) => void;
}

const TeacherContext = createContext<TeacherContextProps | undefined>(undefined);

// Create provider
interface TeacherProviderProps {
  children: ReactNode;
}

export const TeacherProvider: React.FC<TeacherProviderProps> = ({ children }) => {
  // Mock teachers data
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: 'teacher-1',
      name: 'Jennifer Williams',
      title: 'Yoga Therapist & Meditation Coach',
      bio: 'With over 15 years of experience in yoga therapy and meditation, I help students find balance, heal injuries, and develop a sustainable practice that supports their specific needs. My approach combines traditional yoga with modern therapeutic techniques.',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 4.9,
      reviewCount: 124,
      experience: 15,
      totalSessions: 1240,
      specialties: ['Yoga Therapy', 'Meditation', 'Stress Reduction'],
      expertise: ['Injury Recovery', 'Anxiety Management', 'Prenatal Yoga'],
      certifications: ['C-IAYT', 'E-RYT 500', 'RPYT'],
      languages: ['English', 'Spanish'],
      sessionTypes: [
        {
          id: 'session-1',
          name: '1:1 Yoga Therapy Session',
          description: 'Personalized session focused on your specific needs and goals, incorporating therapeutic yoga techniques.',
          duration: 60,
          price: 85,
          isActive: true,
          bookingRestrictions: {
            minTimeBeforeBooking: 24, // 24 hours
            maxAdvanceBookingPeriod: 30, // 30 days
            minTimeBeforeCancelling: 24, // 24 hours
            minTimeBeforeRescheduling: 24, // 24 hours
          },
        },
        {
          id: 'session-2',
          name: 'Meditation Coaching',
          description: 'Learn meditation techniques tailored to your lifestyle and goals with personalized guidance.',
          duration: 45,
          price: 65,
          isActive: true,
          bookingRestrictions: {
            minTimeBeforeBooking: 12, // 12 hours
            maxAdvanceBookingPeriod: 60, // 60 days
            minTimeBeforeCancelling: 12, // 12 hours
            minTimeBeforeRescheduling: 12, // 12 hours
          },
        }
      ],
      availability: [
        {
          day: 'Monday',
          slots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '18:00' }
          ]
        },
        {
          day: 'Wednesday',
          slots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '18:00' }
          ]
        },
        {
          day: 'Friday',
          slots: [
            { start: '09:00', end: '16:00' }
          ]
        }
      ],
      zoomAccount: {
        email: 'jennifer@strongbyyoga.com',
        isConnected: true
      },
      notificationSettings: {
        email: {
          enabled: true,
          templates: [
            {
              id: 'email-1',
              name: 'Session Reminder',
              subject: 'Reminder: Your yoga session is coming up',
              body: 'Hi {{name}}, this is a reminder that your {{sessionType}} with {{teacherName}} is scheduled for {{date}} at {{time}}. Please be ready 5 minutes before the start time. Looking forward to seeing you!',
              timing: {
                type: 'before',
                minutes: 1440 // 24 hours
              },
              recipients: ['user', 'teacher']
            },
            {
              id: 'email-2',
              name: 'Session Feedback',
              subject: 'How was your yoga session?',
              body: 'Hi {{name}}, thank you for attending the {{sessionType}} with {{teacherName}}. We hope you enjoyed it! Please take a moment to provide feedback on your experience.',
              timing: {
                type: 'after',
                minutes: 60 // 1 hour
              },
              recipients: ['user']
            }
          ]
        },
        app: {
          enabled: true,
          templates: [
            {
              id: 'app-1',
              name: 'Session Reminder',
              body: 'Your {{sessionType}} with {{teacherName}} is tomorrow at {{time}}.',
              timing: {
                type: 'before',
                minutes: 1440 // 24 hours
              },
              recipients: ['user', 'teacher']
            },
            {
              id: 'app-2',
              name: 'Session Starting Soon',
              body: 'Your {{sessionType}} with {{teacherName}} starts in 15 minutes.',
              timing: {
                type: 'before',
                minutes: 15
              },
              recipients: ['user', 'teacher']
            }
          ]
        },
        whatsapp: {
          enabled: false,
          phoneNumberId: '',
          accessToken: '',
          businessAccountId: '',
          verifyToken: 'strongbyyoga_verify_token',
          autoReplyEnabled: true,
          autoReplyMessage: 'Thank you for contacting Strong By Yoga. We will get back to you shortly.',
          templates: [
            {
              id: 'whatsapp-1',
              name: 'Session Reminder',
              body: 'Hi {{name}}, your yoga session with {{teacherName}} is scheduled for tomorrow at {{time}}. Click the link to join: {{zoomLink}}',
              timing: {
                type: 'before',
                minutes: 1440 // 24 hours
              },
              recipients: ['user']
            }
          ]
        },
        sms: {
          enabled: false,
          templates: [
            {
              id: 'sms-1',
              name: 'Session Reminder',
              body: 'Your yoga session with {{teacherName}} is scheduled for tomorrow at {{time}}. Reply YES to confirm.',
              timing: {
                type: 'before',
                minutes: 1440 // 24 hours
              },
              recipients: ['user']
            }
          ]
        }
      }
    },
    {
      id: 'teacher-2',
      name: 'David Chen',
      title: 'Vinyasa Flow & Mobility Specialist',
      bio: 'I specialize in vinyasa flow yoga with a focus on mobility and functional movement. My classes are dynamic and accessible to all levels, helping students develop strength, flexibility and body awareness.',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 4.7,
      reviewCount: 98,
      experience: 8,
      totalSessions: 780,
      specialties: ['Vinyasa Flow', 'Mobility Training', 'Functional Movement'],
      expertise: ['Athletic Performance', 'Flexibility', 'Core Strength'],
      certifications: ['E-RYT 200', 'NASM-CPT', 'FRC Mobility Specialist'],
      languages: ['English', 'Mandarin'],
      sessionTypes: [
        {
          id: 'session-3',
          name: 'Mobility Assessment & Training',
          description: 'Comprehensive assessment of your movement patterns followed by a personalized mobility routine.',
          duration: 75,
          price: 95,
          isActive: true,
          bookingRestrictions: {
            minTimeBeforeBooking: 48, // 48 hours
            maxAdvanceBookingPeriod: 60, // 60 days
            minTimeBeforeCancelling: 48, // 48 hours
            minTimeBeforeRescheduling: 48, // 48 hours
          },
        },
        {
          id: 'session-4',
          name: 'Vinyasa Flow Private Session',
          description: 'Private vinyasa yoga session tailored to your level and goals, focusing on fluid movement and breath.',
          duration: 60,
          price: 80,
          isActive: true,
          bookingRestrictions: {
            minTimeBeforeBooking: 24, // 24 hours
            maxAdvanceBookingPeriod: 30, // 30 days
            minTimeBeforeCancelling: 24, // 24 hours
            minTimeBeforeRescheduling: 24, // 24 hours
          },
        }
      ],
      availability: [
        {
          day: 'Tuesday',
          slots: [
            { start: '07:00', end: '12:00' },
            { start: '16:00', end: '20:00' }
          ]
        },
        {
          day: 'Thursday',
          slots: [
            { start: '07:00', end: '12:00' },
            { start: '16:00', end: '20:00' }
          ]
        },
        {
          day: 'Saturday',
          slots: [
            { start: '09:00', end: '15:00' }
          ]
        }
      ],
      zoomAccount: {
        email: 'david@strongbyyoga.com',
        isConnected: true
      },
      notificationSettings: {
        email: {
          enabled: true,
          templates: [
            {
              id: 'email-1',
              name: 'Session Reminder',
              subject: 'Reminder: Your yoga session is coming up',
              body: 'Hi {{name}}, this is a reminder that your {{sessionType}} with {{teacherName}} is scheduled for {{date}} at {{time}}. Please be ready 5 minutes before the start time. Looking forward to seeing you!',
              timing: {
                type: 'before',
                minutes: 1440 // 24 hours
              },
              recipients: ['user', 'teacher']
            }
          ]
        },
        app: {
          enabled: true,
          templates: [
            {
              id: 'app-1',
              name: 'Session Reminder',
              body: 'Your {{sessionType}} with {{teacherName}} is tomorrow at {{time}}.',
              timing: {
                type: 'before',
                minutes: 1440 // 24 hours
              },
              recipients: ['user', 'teacher']
            }
          ]
        },
        whatsapp: {
          enabled: false,
          phoneNumberId: '',
          accessToken: '',
          businessAccountId: '',
          verifyToken: 'strongbyyoga_verify_token',
          autoReplyEnabled: true,
          autoReplyMessage: 'Thank you for contacting Strong By Yoga. We will get back to you shortly.',
          templates: []
        },
        sms: {
          enabled: false,
          templates: []
        }
      }
    }
  ]);

  // Add credit-related state
  const [userCredits, setUserCredits] = useState<number>(100);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([
    {
      id: 'transaction-1',
      type: 'purchase',
      amount: 100,
      description: 'Initial credit purchase',
      date: '2025-03-15T10:00:00Z'
    },
    {
      id: 'transaction-2',
      type: 'usage',
      amount: -15,
      description: 'Meditation session with David Chen',
      date: '2025-03-20T14:30:00Z'
    },
    {
      id: 'transaction-3',
      type: 'refund',
      amount: 15,
      description: 'Refund for cancelled session',
      date: '2025-03-22T09:15:00Z'
    }
  ]);

  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([
    {
      id: 'package-1',
      name: 'Starter Pack',
      price: 29,
      credits: 40,
      popular: true,
    },
    {
      id: 'package-2',
      name: 'Standard Pack',
      price: 49,
      credits: 75,
    },
    {
      id: 'package-3',
      name: 'Premium Pack',
      price: 99,
      credits: 160,
      mostValue: true,
    }
  ]);

  // Context methods
  const addTeacher = (teacher: Teacher) => {
    setTeachers(prevTeachers => [...prevTeachers, teacher]);
  };

  const updateTeacher = (id: string, updatedTeacherData: Partial<Teacher>) => {
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher =>
        teacher.id === id ? { ...teacher, ...updatedTeacherData } : teacher
      )
    );
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prevTeachers => prevTeachers.filter(teacher => teacher.id !== id));
  };

  // Credit package methods
  const addCreditPackage = (pkg: Omit<CreditPackage, 'id'>) => {
    const newPackage = {
      ...pkg,
      id: `package-${Date.now()}`
    };
    setCreditPackages(prevPackages => [...prevPackages, newPackage]);
  };

  const updateCreditPackage = (pkg: CreditPackage) => {
    setCreditPackages(prevPackages =>
      prevPackages.map(p => (p.id === pkg.id ? pkg : p))
    );
  };

  const deleteCreditPackage = (id: string) => {
    setCreditPackages(prevPackages => prevPackages.filter(p => p.id !== id));
  };

  return (
    <TeacherContext.Provider 
      value={{ 
        teachers, 
        addTeacher, 
        updateTeacher, 
        deleteTeacher,
        userCredits,
        creditTransactions,
        creditPackages,
        addCreditPackage,
        updateCreditPackage,
        deleteCreditPackage
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
};

// Create hook
export const useTeachers = () => {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeachers must be used within a TeacherProvider');
  }
  return context;
};
