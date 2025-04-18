
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Teacher, AvailabilitySlot, ZoomAccount, SessionType, NotificationTemplate, BookingData, CreditTransaction, CreditPackage, TeacherContextProps, NotificationSettings } from '@/types/teacher';

// Create context
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
          type: 'video',
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
          type: 'video',
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
              type: 'email',
              enabled: true,
              recipientType: 'both',
              triggerType: 'scheduled',
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
              type: 'email',
              enabled: true,
              recipientType: 'student',
              triggerType: 'scheduled',
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
              type: 'in-app',
              enabled: true,
              recipientType: 'both',
              triggerType: 'scheduled',
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
              type: 'in-app',
              enabled: true,
              recipientType: 'both',
              triggerType: 'scheduled',
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
              type: 'whatsapp',
              enabled: true,
              recipientType: 'student',
              triggerType: 'scheduled',
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
              type: 'sms',
              enabled: true,
              recipientType: 'student',
              triggerType: 'scheduled',
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
          type: 'video',
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
          type: 'video',
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
              type: 'email',
              enabled: true,
              recipientType: 'both',
              triggerType: 'scheduled',
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
              type: 'in-app',
              enabled: true,
              recipientType: 'both',
              triggerType: 'scheduled',
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

  // Mock bookings data
  const [bookings, setBookings] = useState<BookingData[]>([
    {
      id: 'booking-1',
      teacherId: 'teacher-1',
      userId: 'user1',
      sessionType: {
        id: 'session-1',
        name: '1:1 Yoga Therapy Session',
        description: 'Personalized session focused on your specific needs and goals, incorporating therapeutic yoga techniques.',
        duration: 60,
        price: 85,
        isActive: true,
        type: 'video',
        bookingRestrictions: {
          minTimeBeforeBooking: 24,
          maxAdvanceBookingPeriod: 30,
          minTimeBeforeCancelling: 24,
          minTimeBeforeRescheduling: 24,
        },
        credits: 15
      },
      date: new Date('2025-04-25'),
      time: '10:00',
      status: 'confirmed',
      credits: 15
    },
    {
      id: 'booking-2',
      teacherId: 'teacher-2',
      userId: 'user2',
      sessionType: {
        id: 'session-4',
        name: 'Vinyasa Flow Private Session',
        description: 'Private vinyasa yoga session tailored to your level and goals, focusing on fluid movement and breath.',
        duration: 60,
        price: 80,
        isActive: true,
        type: 'video',
        bookingRestrictions: {
          minTimeBeforeBooking: 24,
          maxAdvanceBookingPeriod: 30,
          minTimeBeforeCancelling: 24,
          minTimeBeforeRescheduling: 24,
        },
        credits: 12
      },
      date: new Date('2025-04-28'),
      time: '14:00',
      status: 'confirmed',
      credits: 12
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

  // Add the getTeacher function that was missing
  const getTeacher = (id: string): Teacher | undefined => {
    return teachers.find(teacher => teacher.id === id);
  };

  // Add notification-related methods
  const updateNotificationTemplate = (template: NotificationTemplate) => {
    // Implementation will update a notification template in the teacher's settings
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher => {
        const notificationSettings = { ...teacher.notificationSettings };
        
        // Find which channel this template belongs to
        for (const channel of ['email', 'app', 'whatsapp', 'sms'] as const) {
          if (notificationSettings[channel]) {
            const index = notificationSettings[channel].templates.findIndex(t => t.id === template.id);
            if (index >= 0) {
              const updatedTemplates = [...notificationSettings[channel].templates];
              updatedTemplates[index] = template;
              notificationSettings[channel] = {
                ...notificationSettings[channel],
                templates: updatedTemplates
              };
              break;
            }
          }
        }
        
        return { ...teacher, notificationSettings };
      })
    );
  };
  
  const deleteNotificationTemplate = (id: string) => {
    // Implementation will remove a notification template from the teacher's settings
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher => {
        const notificationSettings = { ...teacher.notificationSettings };
        
        // Find which channel this template belongs to
        for (const channel of ['email', 'app', 'whatsapp', 'sms'] as const) {
          if (notificationSettings[channel]) {
            const updatedTemplates = notificationSettings[channel].templates.filter(t => t.id !== id);
            if (updatedTemplates.length !== notificationSettings[channel].templates.length) {
              notificationSettings[channel] = {
                ...notificationSettings[channel],
                templates: updatedTemplates
              };
              break;
            }
          }
        }
        
        return { ...teacher, notificationSettings };
      })
    );
  };
  
  const sendTestNotification = (templateId: string, recipient: string) => {
    // Mock implementation that would send a test notification
    console.log(`Sending test notification for template ${templateId} to ${recipient}`);
    // In a real implementation, this would make an API call to send the notification
  };

  // Add notification settings update method
  const updateNotificationSettings = (settings: any) => {
    // This is a simplified implementation that would be replaced with actual API calls
    console.log('Updating notification settings:', settings);
  };
  
  // Add teacher availability methods
  const addTeacherAvailability = (teacherId: string, availability: AvailabilitySlot) => {
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher => {
        if (teacher.id === teacherId) {
          // Check if day already exists
          const existingDayIndex = teacher.availability.findIndex(a => a.day === availability.day);
          const updatedAvailability = [...teacher.availability];
          
          if (existingDayIndex >= 0) {
            // Update existing day
            updatedAvailability[existingDayIndex] = {
              ...updatedAvailability[existingDayIndex],
              slots: [...updatedAvailability[existingDayIndex].slots || [], ...(availability.slots || [])]
            };
          } else {
            // Add new day
            updatedAvailability.push(availability);
          }
          
          return { ...teacher, availability: updatedAvailability };
        }
        return teacher;
      })
    );
  };
  
  const removeTeacherAvailability = (teacherId: string, dayIndex: number) => {
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher => {
        if (teacher.id === teacherId) {
          const updatedAvailability = [...teacher.availability];
          updatedAvailability.splice(dayIndex, 1);
          return { ...teacher, availability: updatedAvailability };
        }
        return teacher;
      })
    );
  };
  
  // Add zoom account methods
  const connectZoomAccount = (teacherId: string, email: string) => {
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher => {
        if (teacher.id === teacherId) {
          return {
            ...teacher,
            zoomAccount: { email, isConnected: true }
          };
        }
        return teacher;
      })
    );
  };
  
  const disconnectZoomAccount = (teacherId: string) => {
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher => {
        if (teacher.id === teacherId) {
          return {
            ...teacher,
            zoomAccount: { ...teacher.zoomAccount, isConnected: false }
          };
        }
        return teacher;
      })
    );
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

  // Add booking methods
  const bookSession = (bookingData: any) => {
    // Implementation would create a booking and update credits
    console.log('Booking session:', bookingData);
  };

  const getBooking = (bookingId: string): BookingData | undefined => {
    return bookings.find(booking => booking.id === bookingId);
  };

  // Add credit purchase method
  const purchaseCredits = (amount: number | string) => {
    const creditAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount;
    if (isNaN(creditAmount) || creditAmount <= 0) return;
    
    setUserCredits(prev => prev + creditAmount);
    
    // Add transaction record
    const newTransaction: CreditTransaction = {
      id: `transaction-${Date.now()}`,
      type: 'purchase',
      amount: creditAmount,
      description: `Purchased ${creditAmount} credits`,
      date: new Date().toISOString()
    };
    
    setCreditTransactions(prev => [newTransaction, ...prev]);
  };

  return (
    <TeacherContext.Provider 
      value={{ 
        teachers, 
        bookings,
        addTeacher, 
        updateTeacher, 
        deleteTeacher,
        getTeacher,
        updateNotificationTemplate,
        deleteNotificationTemplate,
        sendTestNotification,
        addTeacherAvailability,
        removeTeacherAvailability,
        connectZoomAccount,
        disconnectZoomAccount,
        userCredits,
        creditTransactions,
        creditPackages,
        addCreditPackage,
        updateCreditPackage,
        deleteCreditPackage,
        bookSession,
        getBooking,
        purchaseCredits,
        updateNotificationSettings,
        notificationSettings: teachers[0]?.notificationSettings
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

// Export all the types from teacher.d.ts so they are available from TeacherContext.tsx
export type { 
  Teacher, 
  AvailabilitySlot, 
  ZoomAccount, 
  Review, 
  NotificationSettings, 
  SessionType, 
  NotificationTemplate, 
  TeacherContextProps, 
  CreditPackage, 
  CreditTransaction, 
  BookingData 
} from '@/types/teacher';
