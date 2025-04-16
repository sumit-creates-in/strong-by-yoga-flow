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

interface TeacherContextType {
  teachers: Teacher[];
  bookings: BookingData[];
  creditPackages: CreditPackage[];
  creditTransactions: CreditTransaction[];
  userCredits: number;
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
}

const TeacherContext = createContext<TeacherContextType>({
  teachers: [],
  bookings: [],
  creditPackages: [],
  creditTransactions: [],
  userCredits: 0,
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
      { day: 'monday', startTime: '10:00', endTime: '15:00' },
      { day: 'wednesday', startTime: '13:00', endTime: '18:00' },
      { day: 'friday', startTime: '09:00', endTime: '14:00' }
    ],
    zoomEmail: 'sarah.johnson@example.com',
    zoomConnected: true
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
      { day: 'tuesday', startTime: '08:00', endTime: '12:00' },
      { day: 'thursday', startTime: '14:00', endTime: '19:00' },
      { day: 'saturday', startTime: '09:00', endTime: '13:00' }
    ],
    zoomEmail: 'raj.patel@example.com',
    zoomConnected: true
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
      { day: 'monday', startTime: '15:00', endTime: '20:00' },
      { day: 'wednesday', startTime: '09:00', endTime: '13:00' },
      { day: 'friday', startTime: '14:00', endTime: '18:00' }
    ],
    zoomEmail: 'maya.gonzalez@example.com',
    zoomConnected: true
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
  
  return (
    <TeacherContext.Provider value={{
      teachers,
      bookings,
      creditPackages,
      creditTransactions,
      userCredits,
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
      removeTeacherAvailability
    }}>
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeachers = () => useContext(TeacherContext);
