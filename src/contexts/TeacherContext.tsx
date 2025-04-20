import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
  shortBio?: string; // Added missing fields
  fullBio?: string;
  teachingStyle?: string;
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
  // Load initial data from localStorage or use default data
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const savedTeachers = localStorage.getItem('teachers');
    return savedTeachers ? JSON.parse(savedTeachers) : [];
  });

  // Save to localStorage whenever teachers change
  useEffect(() => {
    localStorage.setItem('teachers', JSON.stringify(teachers));
  }, [teachers]);

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

  // Get the current authenticated user from the AuthContext
  const { user } = useAuth();

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
    localStorage.setItem('creditTransactions', JSON.stringify(creditTransactions));
    
    // If we have a user, save user-specific transactions
    if (user) {
      localStorage.setItem(`creditTransactions_${user.id}`, JSON.stringify(creditTransactions));
    }
  }, [creditTransactions, user?.id]);

  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>(() => {
    const savedPackages = localStorage.getItem('creditPackages');
    return savedPackages ? JSON.parse(savedPackages) : [];
  });

  useEffect(() => {
    localStorage.setItem('creditPackages', JSON.stringify(creditPackages));
  }, [creditPackages]);

  // Context methods
  const addTeacher = (teacher: Teacher) => {
    console.log("Adding new teacher:", teacher);
    setTeachers(prevTeachers => [...prevTeachers, teacher]);
  };

  const updateTeacher = (id: string, updatedTeacherData: Partial<Teacher>) => {
    console.log("Updating teacher with id:", id, "Data:", updatedTeacherData);
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
          const updatedTemplates = notificationSettings[channel].templates.filter(t => t.id !== id);
          if (updatedTemplates.length !== notificationSettings[channel].templates.length) {
            notificationSettings[channel] = {
              ...notificationSettings[channel],
              templates: updatedTemplates
            };
            break;
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
              slots: [...updatedAvailability[existingDayIndex].slots, ...availability.slots]
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

  // Booking methods
  const bookSession = (bookingData: any): BookingData => {
    // Create a new booking with the current user's ID
    const newBooking: BookingData = {
      id: `booking-${Date.now()}`,
      teacherId: bookingData.teacherId,
      userId: user?.id || 'guest-user', // Use the authenticated user's ID
      sessionType: bookingData.sessionType,
      date: bookingData.date,
      time: bookingData.time,
      status: 'confirmed',
      credits: bookingData.sessionType.credits || bookingData.sessionType.price || 0
    };
    
    console.log("Creating new booking:", newBooking);
    
    // Add booking to bookings list
    setBookings(prevBookings => [...prevBookings, newBooking]);
    
    // Update latest booking for confirmation page
    setLatestBooking(newBooking);
    
    // Deduct credits
    setUserCredits(prev => prev - (newBooking.credits || 0));
    
    // Add credit transaction
    const transaction: CreditTransaction = {
      id: `transaction-${Date.now()}`,
      type: 'usage',
      amount: -(newBooking.credits || 0),
      description: `${newBooking.sessionType.name} with ${getTeacher(newBooking.teacherId)?.name}`,
      date: new Date().toISOString()
    };
    
    setCreditTransactions(prev => [...prev, transaction]);
    
    return newBooking;
  };

  const getBooking = (): BookingData | null => {
    return latestBooking;
  };

  // New method to get user-specific bookings
  const getUserBookings = (userId: string): BookingData[] => {
    return bookings.filter(booking => booking.userId === userId);
  };

  // Cancel booking method
  const cancelBooking = (bookingId: string) => {
    setBookings(prevBookings =>
      prevBookings.map(booking => {
        if (booking.id === bookingId) {
          return {
            ...booking,
            status: 'cancelled'
          };
        }
        return booking;
      })
    );
    
    // Add a transaction to refund credits
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const transaction: CreditTransaction = {
        id: `transaction-${Date.now()}`,
        type: 'refund',
        amount: booking.credits,
        description: `Refund for cancelled ${booking.sessionType.name}`,
        date: new Date().toISOString()
      };
      
      setCreditTransactions(prev => [...prev, transaction]);
      setUserCredits(prev => prev + booking.credits);
    }
  };
  
  // Reschedule booking method
  const rescheduleBooking = (bookingId: string, newDate: Date, newTime: string) => {
    setBookings(prevBookings =>
      prevBookings.map(booking => {
        if (booking.id === bookingId) {
          return {
            ...booking,
            date: newDate,
            time: newTime
          };
        }
        return booking;
      })
    );
  };
  
  // Join session method
  const joinSession = (bookingId: string): string => {
    // Get the booking and teacher
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return '';
    
    const teacher = getTeacher(booking.teacherId);
    if (!teacher) return '';
    
    // Generate a Zoom meeting URL (in a real app, this would come from your backend)
    const meetingUrl = `https://zoom.us/j/${Math.floor(Math.random() * 9000000) + 1000000}`;
    
    return meetingUrl;
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
        getUserBookings,
        cancelBooking,
        rescheduleBooking,
        joinSession
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
