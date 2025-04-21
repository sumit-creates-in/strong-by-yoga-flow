import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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
  type?: 'video' | 'call' | 'chat'; // Add type property
  bookingRestrictions: {
    minTimeBeforeBooking: number; // hours
    maxAdvanceBookingPeriod: number; // days
    minTimeBeforeCancelling: number; // hours
    minTimeBeforeRescheduling: number; // hours
  };
  credits?: number; // Make credits optional for backward compatibility
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'in-app';
  subject?: string;
  body: string;
  enabled: boolean;
  recipientType: 'student' | 'teacher' | 'both'; // Changed from recipients array to recipientType
  triggerType: 'action' | 'scheduled';
  triggerAction?: 'booking_confirmed' | 'booking_cancelled' | 'booking_rescheduled' | 'booking_reminder';
  scheduledTime?: {
    when: 'before' | 'after' | 'same-day';
    time: number;
  };
  timing?: { // Keep for backwards compatibility
    type: 'before' | 'after';
    minutes: number;
  };
  recipients?: ('user' | 'teacher')[]; // Keep for backwards compatibility
}

// Add booking data interface
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
  shortBio?: string;
  fullBio?: string;
  teachingStyle?: string;
  reviews?: any[]; // Add reviews property
  lastReviewDate?: string; // Add lastReviewDate property
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
export interface TeacherContextProps {
  teachers: Teacher[];
  bookings: BookingData[];
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  getTeacher: (id: string) => Teacher | undefined;
  
  // Add notification-related methods
  updateNotificationTemplate: (template: NotificationTemplate) => void;
  deleteNotificationTemplate: (id: string) => void;
  sendTestNotification: (templateId: string, recipient: string) => void;
  notificationSettings?: any; // Add this property
  updateNotificationSettings: (settings: any) => void; // Add this method
  
  // Add teacher availability methods
  addTeacherAvailability: (teacherId: string, availability: AvailabilitySlot) => void;
  removeTeacherAvailability: (teacherId: string, dayIndex: number) => void;
  
  // Add zoom account methods
  connectZoomAccount: (teacherId: string, email: string) => void;
  disconnectZoomAccount: (teacherId: string) => void;
  
  // Add credit-related properties
  userCredits: number;
  creditTransactions: CreditTransaction[];
  creditPackages: CreditPackage[];
  addCreditPackage: (pkg: Omit<CreditPackage, 'id'>) => void;
  updateCreditPackage: (pkg: CreditPackage) => void;
  deleteCreditPackage: (id: string) => void;
  purchaseCredits?: (packageId: string) => void; // Add this method
  
  // Add booking methods
  bookSession: (bookingData: any) => BookingData;
  getBooking: () => BookingData | null;
  getUserBookings: (userId: string) => BookingData[];
  cancelBooking: (bookingId: string) => void;
  rescheduleBooking: (bookingId: string, newDate: Date, newTime: string) => void;
  joinSession: (bookingId: string) => string;
}

const TeacherContext = createContext<TeacherContextProps | undefined>(undefined);

// Create provider
interface TeacherProviderProps {
  children: ReactNode;
}

export const TeacherProvider: React.FC<TeacherProviderProps> = ({ children }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const { user } = useAuth();

  // Load teachers from Supabase on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select('*');

        if (error) {
          console.error('Error fetching teachers:', error);
          return;
        }

        // Transform the data to match our Teacher interface
        const transformedTeachers = data.map(teacher => ({
          ...teacher,
          specialties: teacher.specialties || [],
          expertise: teacher.expertise || [],
          certifications: teacher.certifications || [],
          languages: teacher.languages || ['English'],
          sessionTypes: [],  // These will need to be handled separately
          availability: [],  // These will need to be handled separately
          zoomAccount: {
            email: '',
            isConnected: false
          },
          notificationSettings: {
            email: { enabled: true, templates: [] },
            app: { enabled: true, templates: [] },
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
            sms: { enabled: false, templates: [] }
          }
        }));

        setTeachers(transformedTeachers);
      } catch (error) {
        console.error('Error in fetchTeachers:', error);
      }
    };

    fetchTeachers();
  }, []);

  // Bookings data with localStorage persistence but no mock data
  const [bookings, setBookings] = useState<BookingData[]>(() => {
    const savedBookings = localStorage.getItem('bookings');
    return savedBookings ? JSON.parse(savedBookings) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Latest booking for confirmation page
  const [latestBooking, setLatestBooking] = useState<BookingData | null>(() => {
    const savedLatestBooking = localStorage.getItem('latestBooking');
    return savedLatestBooking ? JSON.parse(savedLatestBooking) : null;
  });

  useEffect(() => {
    if (latestBooking) {
      localStorage.setItem('latestBooking', JSON.stringify(latestBooking));
    } else {
      localStorage.removeItem('latestBooking');
    }
  }, [latestBooking]);

  // Add credit-related state with localStorage persistence
  const [userCredits, setUserCredits] = useState<number>(() => {
    const savedCredits = localStorage.getItem('userCredits');
    return savedCredits ? parseInt(savedCredits) : 0;
  });

  // Update the userCredits whenever the user changes
  useEffect(() => {
    if (user) {
      // Try to get user-specific credits from localStorage
      const userSpecificCredits = localStorage.getItem(`userCredits_${user.id}`);
      if (userSpecificCredits) {
        setUserCredits(parseInt(userSpecificCredits));
      } else {
        // If no user-specific credits are found, use the default or global value
        const savedCredits = localStorage.getItem('userCredits');
        setUserCredits(savedCredits ? parseInt(savedCredits) : 0);
        
        // Store the credits for this specific user
        localStorage.setItem(`userCredits_${user.id}`, userCredits.toString());
      }
    }
  }, [user?.id]);

  // Update localStorage whenever userCredits changes
  useEffect(() => {
    // Save both the global credits (legacy) and user-specific credits
    localStorage.setItem('userCredits', userCredits.toString());
    
    // If we have a user, save user-specific credits
    if (user) {
      localStorage.setItem(`userCredits_${user.id}`, userCredits.toString());
    }
  }, [userCredits, user?.id]);

  // Credit transactions with localStorage persistence
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>(() => {
    // If we have a user, try to get user-specific transactions
    if (user) {
      const userTransactions = localStorage.getItem(`creditTransactions_${user.id}`);
      if (userTransactions) {
        return JSON.parse(userTransactions);
      }
    }
    
    // Fall back to global transactions
    const savedTransactions = localStorage.getItem('creditTransactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  // Update localStorage whenever creditTransactions changes
  useEffect(() => {
    // Save global transactions (legacy)
    localStorage.setItem('creditTransactions', JSON.stringify(creditTransactions));
    
    // If we have a user, save user-specific transactions
    if (user) {
      localStorage.setItem(`creditTransactions_${user.id}`, JSON.stringify(creditTransactions));
    }
  }, [creditTransactions, user?.id]);

  // Credit packages for purchase
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>(() => {
    const savedPackages = localStorage.getItem('creditPackages');
    
    if (savedPackages) {
      return JSON.parse(savedPackages);
    } else {
      // Default credit packages
      return [
        {
          id: 'basic',
          name: 'Basic',
          credits: 10,
          price: 100,
          popular: false,
          mostValue: false
        },
        {
          id: 'standard',
          name: 'Standard',
          credits: 25,
          price: 225,
          popular: true,
          mostValue: false
        },
        {
          id: 'premium',
          name: 'Premium',
          credits: 50,
          price: 400,
          popular: false,
          mostValue: true
        }
      ];
    }
  });

  // Update localStorage whenever creditPackages changes
  useEffect(() => {
    localStorage.setItem('creditPackages', JSON.stringify(creditPackages));
  }, [creditPackages]);

  // Notification settings from teacher 0 (temporary implementation)
  const [notificationSettings, setNotificationSettings] = useState<any>(() => {
    // Try to load notification settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    
    if (savedSettings) {
      return JSON.parse(savedSettings);
    } else if (teachers.length > 0 && teachers[0].notificationSettings) {
      // Get from first teacher if available
      return teachers[0].notificationSettings;
    } else {
      // Default notification settings
      return {
        email: {
          enabled: true,
          templates: [
            {
              id: "email-booking-confirmed",
              name: "Booking Confirmation",
              type: "email",
              subject: "Your session has been confirmed",
              body: "Dear %student_name%,\n\nYour session with %teacher_name% on %session_date% at %session_time% has been confirmed.\n\nThank you for using our platform!",
              enabled: true,
              recipientType: "student",
              triggerType: "action",
              triggerAction: "booking_confirmed",
              timing: { type: "before", minutes: 0 },
              recipients: ["user", "teacher"]
            },
            {
              id: "email-booking-reminder",
              name: "Session Reminder",
              type: "email",
              subject: "Reminder: Your upcoming session",
              body: "Dear %student_name%,\n\nThis is a friendly reminder that you have a session with %teacher_name% scheduled for tomorrow at %session_time%.\n\nThank you for using our platform!",
              enabled: true,
              recipientType: "both",
              triggerType: "scheduled",
              scheduledTime: { when: "before", time: 24 },
              timing: { type: "before", minutes: 1440 }
            }
          ]
        },
        app: {
          enabled: true,
          templates: [
            {
              id: "app-booking-confirmed",
              name: "Booking Confirmation",
              type: "in-app",
              body: "Your session with %teacher_name% on %session_date% at %session_time% has been confirmed.",
              enabled: true,
              recipientType: "student",
              triggerType: "action",
              triggerAction: "booking_confirmed",
              timing: { type: "before", minutes: 0 },
              recipients: ["user", "teacher"]
            },
            {
              id: "app-session-reminder",
              name: "Session Reminder",
              type: "in-app",
              body: "You have a session with %teacher_name% starting in 30 minutes.",
              enabled: true,
              recipientType: "both",
              triggerType: "scheduled",
              scheduledTime: { when: "before", time: 0.5 },
              timing: { type: "before", minutes: 30 },
              recipients: ["user", "teacher"]
            }
          ]
        },
        whatsapp: {
          enabled: false,
          phoneNumberId: "",
          accessToken: "",
          businessAccountId: "",
          verifyToken: "strongbyyoga_verify_token",
          autoReplyEnabled: false,
          autoReplyMessage: "",
          templates: [
            {
              id: "whatsapp-booking-confirmed",
              name: "Booking Confirmation",
              type: "whatsapp",
              body: "Your session with %teacher_name% on %session_date% at %session_time% has been confirmed.",
              enabled: true,
              recipientType: "student",
              triggerType: "action",
              triggerAction: "booking_confirmed",
              timing: { type: "before", minutes: 0 },
              recipients: ["user"]
            },
            {
              id: "whatsapp-session-reminder",
              name: "Session Reminder",
              type: "whatsapp",
              body: "You have a session with %teacher_name% starting in 2 hours.",
              enabled: true,
              recipientType: "student",
              triggerType: "scheduled",
              scheduledTime: { when: "before", time: 2 },
              timing: { type: "before", minutes: 120 },
              recipients: ["user"]
            }
          ]
        },
        sms: {
          enabled: false,
          templates: [
            {
              id: "sms-booking-confirmed",
              name: "Booking Confirmation",
              type: "sms",
              body: "Your session with %teacher_name% on %session_date% at %session_time% has been confirmed.",
              enabled: true,
              recipientType: "student",
              triggerType: "action",
              triggerAction: "booking_confirmed",
              timing: { type: "before", minutes: 0 },
              recipients: ["user", "teacher"]
            },
            {
              id: "sms-session-reminder",
              name: "Session Reminder",
              type: "sms",
              body: "You have a session with %teacher_name% starting in 1 hour.",
              enabled: true,
              recipientType: "student",
              triggerType: "scheduled",
              scheduledTime: { when: "before", time: 1 },
              timing: { type: "before", minutes: 60 },
              recipients: ["user", "teacher"]
            }
          ]
        }
      };
    }
  });

  // Save notification settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Function to update notification settings
  const updateNotificationSettings = (settings: any) => {
    if (!settings) return;
    
    setNotificationSettings((prevSettings: any) => {
      const updatedSettings = { ...prevSettings };
      
      // Update email settings
      if (settings.email) {
        updatedSettings.email = {
          ...updatedSettings.email,
          ...settings.email
        };
      }
      
      // Update app notification settings
      if (settings.app) {
        updatedSettings.app = {
          ...updatedSettings.app,
          ...settings.app
        };
      }
      
      // Update WhatsApp settings
      if (settings.whatsapp) {
        updatedSettings.whatsapp = {
          ...updatedSettings.whatsapp,
          ...settings.whatsapp
        };
      }
      
      // Update SMS settings
      if (settings.sms) {
        updatedSettings.sms = {
          ...updatedSettings.sms,
          ...settings.sms
        };
      }
      
      return updatedSettings;
    });
  };

  // Add the ability to purchase credit packages
  const purchaseCredits = (packageId: string) => {
    // Find the selected package
    const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
    
    if (!selectedPackage) {
      console.error(`Credit package with id ${packageId} not found`);
      return;
    }
    
    // In a real app, this would trigger a payment flow
    // For now, we'll just add the credits directly
    setUserCredits(prevCredits => prevCredits + selectedPackage.credits);
    
    // Add a transaction record
    const newTransaction: CreditTransaction = {
      id: `tr-${Date.now()}`,
      type: 'purchase',
      amount: selectedPackage.credits,
      description: `Purchased ${selectedPackage.name} credit package`,
      date: new Date().toISOString()
    };
    
    setCreditTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
  };

  // CRUD operations for teachers
  const addTeacher = async (teacher: Teacher) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert([{
          name: teacher.name,
          title: teacher.title,
          bio: teacher.bio,
          avatar_url: teacher.avatarUrl,
          short_bio: teacher.shortBio,
          full_bio: teacher.fullBio,
          experience: teacher.experience,
          specialties: teacher.specialties,
          expertise: teacher.expertise,
          certifications: teacher.certifications,
          languages: teacher.languages,
          teaching_style: teacher.teachingStyle
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding teacher:', error);
        return;
      }

      // Transform the returned data to match our Teacher interface
      const newTeacher = {
        ...teacher,
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setTeachers([...teachers, newTeacher]);
    } catch (error) {
      console.error('Error in addTeacher:', error);
    }
  };
  
  const updateTeacher = async (id: string, updatedTeacher: Partial<Teacher>) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          name: updatedTeacher.name,
          title: updatedTeacher.title,
          bio: updatedTeacher.bio,
          avatar_url: updatedTeacher.avatarUrl,
          short_bio: updatedTeacher.shortBio,
          full_bio: updatedTeacher.fullBio,
          experience: updatedTeacher.experience,
          specialties: updatedTeacher.specialties,
          expertise: updatedTeacher.expertise,
          certifications: updatedTeacher.certifications,
          languages: updatedTeacher.languages,
          teaching_style: updatedTeacher.teachingStyle
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating teacher:', error);
        return;
      }

      setTeachers(
        teachers.map(teacher =>
          teacher.id === id ? { ...teacher, ...updatedTeacher } : teacher
        )
      );
    } catch (error) {
      console.error('Error in updateTeacher:', error);
    }
  };
  
  const deleteTeacher = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting teacher:', error);
        return;
      }

      setTeachers(teachers.filter(teacher => teacher.id !== id));
    } catch (error) {
      console.error('Error in deleteTeacher:', error);
    }
  };
  
  const getTeacher = (id: string) => {
    return teachers.find(teacher => teacher.id === id);
  };

  // Notification template management
  const updateNotificationTemplate = (template: NotificationTemplate) => {
    // Update notification templates logic would go here
    console.log('Updating notification template:', template);
  };
  
  const deleteNotificationTemplate = (id: string) => {
    // Delete notification template logic would go here
    console.log('Deleting notification template:', id);
  };
  
  const sendTestNotification = (templateId: string, recipient: string) => {
    // Logic to send a test notification would go here
    console.log('Sending test notification:', templateId, 'to', recipient);
  };

  // Teacher availability management
  const addTeacherAvailability = (teacherId: string, availability: AvailabilitySlot) => {
    updateTeacher(teacherId, {
      availability: [...(getTeacher(teacherId)?.availability || []), availability]
    });
  };
  
  const removeTeacherAvailability = (teacherId: string, dayIndex: number) => {
    const teacher = getTeacher(teacherId);
    if (!teacher) return;
    
    const newAvailability = [...teacher.availability];
    newAvailability.splice(dayIndex, 1);
    
    updateTeacher(teacherId, { availability: newAvailability });
  };

  // Zoom account management
  const connectZoomAccount = (teacherId: string, email: string) => {
    updateTeacher(teacherId, {
      zoomAccount: { email, isConnected: true }
    });
  };
  
  const disconnectZoomAccount = (teacherId: string) => {
    updateTeacher(teacherId, {
      zoomAccount: { email: '', isConnected: false }
    });
  };

  // Credit package management
  const addCreditPackage = (pkg: Omit<CreditPackage, 'id'>) => {
    const newPackage: CreditPackage = {
      id: `pkg-${Date.now()}`,
      ...pkg
    };
    
    setCreditPackages([...creditPackages, newPackage]);
  };
  
  const updateCreditPackage = (pkg: CreditPackage) => {
    setCreditPackages(
      creditPackages.map(p => p.id === pkg.id ? pkg : p)
    );
  };
  
  const deleteCreditPackage = (id: string) => {
    setCreditPackages(creditPackages.filter(p => p.id !== id));
  };

  // Booking management
  const bookSession = (bookingData: any) => {
    // Create a new booking
    const newBooking: BookingData = {
      id: `booking-${Date.now()}`,
      teacherId: bookingData.teacherId,
      userId: bookingData.userId || user?.id || 'guest-user',
      sessionType: bookingData.sessionType,
      date: bookingData.date,
      time: bookingData.time,
      status: 'confirmed',
      credits: bookingData.sessionType.credits || bookingData.sessionType.price
    };
    
    // Add to bookings
    setBookings([...bookings, newBooking]);
    
    // Set as latest booking for confirmation page
    setLatestBooking(newBooking);
    
    // Deduct credits
    setUserCredits(prevCredits => 
      prevCredits - (bookingData.sessionType.credits || bookingData.sessionType.price)
    );
    
    // Add transaction
    const newTransaction: CreditTransaction = {
      id: `tr-${Date.now()}`,
      type: 'usage',
      amount: -(bookingData.sessionType.credits || bookingData.sessionType.price),
      description: `Booked ${bookingData.sessionType.name} with ${bookingData.teacherName || 'a teacher'}`,
      date: new Date().toISOString()
    };
    
    setCreditTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
    
    return newBooking;
  };
  
  const getBooking = () => {
    return latestBooking;
  };
  
  const getUserBookings = (userId: string) => {
    return bookings.filter(booking => booking.userId === userId);
  };
  
  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    // Update booking status
    setBookings(
      bookings.map(b => 
        b.id === bookingId 
          ? { ...b, status: 'cancelled' } 
          : b
      )
    );
    
    // Refund credits
    setUserCredits(prevCredits => prevCredits + booking.credits);
    
    // Add transaction
    const newTransaction: CreditTransaction = {
      id: `tr-${Date.now()}`,
      type: 'refund',
      amount: booking.credits,
      description: `Refund for cancelled booking`,
      date: new Date().toISOString()
    };
    
    setCreditTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
  };
  
  const rescheduleBooking = (bookingId: string, newDate: Date, newTime: string) => {
    setBookings(
      bookings.map(b => 
        b.id === bookingId 
          ? { ...b, date: newDate, time: newTime } 
          : b
      )
    );
  };
  
  const joinSession = (bookingId: string) => {
    // In a real app, this would generate or return a meeting join URL
    return `https://zoom.us/j/123456789?booking=${bookingId}`;
  };

  return (
    <TeacherContext.Provider value={{
      teachers,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      getTeacher,
      
      updateNotificationTemplate,
      deleteNotificationTemplate,
      sendTestNotification,
      notificationSettings,
      updateNotificationSettings,
      
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
      purchaseCredits,
      
      bookings,
      bookSession,
      getBooking,
      getUserBookings,
      cancelBooking,
      rescheduleBooking,
      joinSession
    }}>
      {children}
    </TeacherContext.Provider>
  );
};

// Custom hook for using the context
export const useTeachers = () => {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeachers must be used within a TeacherProvider');
  }
  return context;
};
