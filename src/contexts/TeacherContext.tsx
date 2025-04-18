
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Teacher {
  id: string;
  user_id?: string;
  name: string;
  title: string;
  bio: string;
  specialties: Specialty[];
  expertise: Expertise[];
  certifications: string[];
  sessionTypes: SessionType[];
  availability: string;
  zoomAccount: ZoomAccount;
  imageUrl?: string;
  pricing?: Pricing;
  languages: string[];
  education?: string;
  location?: string;
  experience: number;
  ratings?: Ratings;
  teachingStyle: string;
  notificationSettings: NotificationSettings;
  reviews: Review[];
  lastReviewDate?: string;
  rating?: number;
  reviewCount?: number;
  avatarUrl?: string;
}

export interface Expertise {
  id: string;
  name: string;
}

export interface Specialty {
  id: string;
  name: string;
}

export interface SessionType {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface Availability {
  id: string;
  day: string;
  times: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

export interface ZoomAccount {
  email: string;
  isConnected: boolean;
}

export interface Pricing {
  oneOnOne: number;
  group: number;
}

export interface Ratings {
  average: number;
  count: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  rating: number;
  comment: string;
  date: string;
}

export interface NotificationSettings {
  email: EmailSettings;
  sms: SMSSettings;
  whatsapp: WhatsAppSettings;
  app: InAppSettings;
}

export interface EmailSettings {
  enabled: boolean;
  templates: NotificationTemplate[];
}

export interface SMSSettings {
  enabled: boolean;
  templates: NotificationTemplate[];
}

export interface WhatsAppSettings {
  enabled: boolean;
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
  verifyToken: string;
  autoReplyEnabled: boolean;
  autoReplyMessage: string;
  templates: NotificationTemplate[];
}

export interface InAppSettings {
  enabled: boolean;
  templates: NotificationTemplate[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'in-app' | 'whatsapp' | 'sms';
  enabled: boolean;
  recipientType: 'teacher' | 'student' | 'both';
  triggerType: 'scheduled' | 'action';
  timing: {
    type: 'before' | 'after';
    minutes: number;
  };
  recipients: ('teacher' | 'user')[];
}

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits: number;
  popular?: boolean;
  mostValue?: boolean;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund' | 'gift';
  description: string;
  date: string;
  orderId?: string;
}

export type NotificationChannelType = 'email' | 'sms' | 'whatsapp' | 'app';

interface TeacherContextProps {
  teachers: Teacher[];
  specialties: Specialty[];
  sessionTypes: SessionType[];
  userCredits?: number; 
  userMembership?: any;
  creditPackages?: CreditPackage[];
  creditTransactions?: CreditTransaction[];
  getTeacher: (id: string) => Promise<Teacher | null>;
  addTeacher: (teacher: Teacher) => Promise<void>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addSpecialty: (specialty: Specialty) => Promise<void>;
  updateSpecialty: (specialty: Specialty) => Promise<void>;
  deleteSpecialty: (id: string) => Promise<void>;
  addSessionType: (sessionType: SessionType) => Promise<void>;
  updateSessionType: (sessionType: SessionType) => Promise<void>;
  deleteSessionType: (id: string) => Promise<void>;
  addCreditPackage?: (data: any) => void;
  updateCreditPackage?: (data: any) => void;
  deleteCreditPackage?: (id: string) => void;
  updateNotificationSettings: (channelType: NotificationChannelType, settings: any) => Promise<void>;
}

const TeacherContext = createContext<TeacherContextProps | undefined>(undefined);

export const TeacherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [userCredits, setUserCredits] = useState<number>(30); // Mock credits
  const [userMembership, setUserMembership] = useState({ active: false });
  const { user } = useAuth();

  // Mock function to fetch a teacher by ID - in a real app, this would call Supabase
  const getTeacher = async (id: string): Promise<Teacher | null> => {
    // This is mock data for development
    const mockTeacher: Teacher = {
      id,
      name: "Jane Yoga",
      title: "Advanced Yoga Instructor",
      bio: "Teaching yoga for 10 years with a focus on healing and mindfulness.",
      specialties: [{ id: "1", name: "Vinyasa Flow" }, { id: "2", name: "Yin Yoga" }],
      expertise: [{ id: "1", name: "Mindfulness" }, { id: "2", name: "Therapeutic Yoga" }],
      certifications: ["200-hour YTT", "500-hour YTT"],
      sessionTypes: [
        { id: "1", name: "Private Session", description: "One-on-one personalized yoga", price: 75, duration: 60 },
        { id: "2", name: "Group Class", description: "Small group yoga session", price: 25, duration: 60 }
      ],
      availability: "Mon, Wed, Fri 8AM-5PM",
      zoomAccount: { email: "jane@example.com", isConnected: true },
      languages: ["English", "Spanish"],
      experience: 10,
      teachingStyle: "Calming and restorative",
      notificationSettings: {
        email: { enabled: true, templates: [] },
        sms: { enabled: false, templates: [] },
        whatsapp: {
          enabled: false,
          phoneNumberId: "",
          accessToken: "",
          businessAccountId: "",
          verifyToken: "",
          autoReplyEnabled: false,
          autoReplyMessage: "",
          templates: []
        },
        app: { enabled: true, templates: [] }
      },
      reviews: [
        {
          id: "1",
          userId: "user1",
          userName: "Sarah M.",
          userInitials: "SM",
          rating: 5,
          comment: "Jane is an amazing teacher! Her classes are both challenging and relaxing.",
          date: "2023-12-10"
        }
      ],
      lastReviewDate: "2023-12-10",
      location: "San Francisco, CA",
      rating: 4.9,
      reviewCount: 24,
      avatarUrl: "/placeholder.svg"
    };
    
    return mockTeacher;
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!user) {
        return;
      }

      // Since we don't have a real Supabase setup for this demo, we'll use mock data
      const mockTeachers: Teacher[] = [
        {
          id: "1",
          name: "Jane Yoga",
          title: "Advanced Yoga Instructor",
          bio: "Teaching yoga for 10 years with a focus on healing and mindfulness.",
          specialties: [{ id: "1", name: "Vinyasa Flow" }, { id: "2", name: "Yin Yoga" }],
          expertise: [{ id: "1", name: "Mindfulness" }, { id: "2", name: "Therapeutic Yoga" }],
          certifications: ["200-hour YTT", "500-hour YTT"],
          sessionTypes: [
            { id: "1", name: "Private Session", description: "One-on-one personalized yoga", price: 75, duration: 60 },
            { id: "2", name: "Group Class", description: "Small group yoga session", price: 25, duration: 60 }
          ],
          availability: "Mon, Wed, Fri 8AM-5PM",
          zoomAccount: { email: "jane@example.com", isConnected: true },
          languages: ["English", "Spanish"],
          experience: 10,
          teachingStyle: "Calming and restorative",
          notificationSettings: {
            email: { enabled: true, templates: [] },
            sms: { enabled: false, templates: [] },
            whatsapp: {
              enabled: false,
              phoneNumberId: "",
              accessToken: "",
              businessAccountId: "",
              verifyToken: "",
              autoReplyEnabled: false,
              autoReplyMessage: "",
              templates: []
            },
            app: { enabled: true, templates: [] }
          },
          reviews: [
            {
              id: "1",
              userId: "user1",
              userName: "Sarah M.",
              userInitials: "SM",
              rating: 5,
              comment: "Jane is an amazing teacher! Her classes are both challenging and relaxing.",
              date: "2023-12-10"
            }
          ],
          lastReviewDate: "2023-12-10",
          rating: 4.9,
          reviewCount: 24,
          avatarUrl: "/placeholder.svg"
        },
        {
          id: "2",
          name: "Mark Mindful",
          title: "Meditation & Yoga Teacher",
          bio: "Specializing in meditation and mindful movement for stress relief.",
          specialties: [{ id: "3", name: "Restorative Yoga" }, { id: "4", name: "Meditation" }],
          expertise: [{ id: "3", name: "Stress Management" }, { id: "4", name: "Breathwork" }],
          certifications: ["300-hour YTT", "Meditation Certification"],
          sessionTypes: [
            { id: "3", name: "Meditation Session", description: "Guided meditation practice", price: 50, duration: 45 },
            { id: "4", name: "Restorative Yoga", description: "Gentle yoga for relaxation", price: 60, duration: 60 }
          ],
          availability: "Tue, Thu, Sat 9AM-6PM",
          zoomAccount: { email: "mark@example.com", isConnected: true },
          languages: ["English"],
          experience: 7,
          teachingStyle: "Mindful and gentle",
          notificationSettings: {
            email: { enabled: true, templates: [] },
            sms: { enabled: false, templates: [] },
            whatsapp: {
              enabled: false,
              phoneNumberId: "",
              accessToken: "",
              businessAccountId: "",
              verifyToken: "",
              autoReplyEnabled: false,
              autoReplyMessage: "",
              templates: []
            },
            app: { enabled: true, templates: [] }
          },
          reviews: [
            {
              id: "2",
              userId: "user2",
              userName: "John D.",
              userInitials: "JD",
              rating: 4,
              comment: "Mark's meditation sessions have really helped with my anxiety.",
              date: "2023-11-15"
            }
          ],
          lastReviewDate: "2023-11-15",
          rating: 4.7,
          reviewCount: 18,
          avatarUrl: "/placeholder.svg"
        },
        {
          id: "3",
          name: "Lisa Flow",
          title: "Vinyasa Flow Specialist",
          bio: "Dynamic flow yoga that connects breath with movement.",
          specialties: [{ id: "5", name: "Power Yoga" }, { id: "6", name: "Vinyasa Flow" }],
          expertise: [{ id: "5", name: "Strength Building" }, { id: "6", name: "Flexibility" }],
          certifications: ["500-hour YTT", "Anatomy Certification"],
          sessionTypes: [
            { id: "5", name: "Power Yoga", description: "Energetic yoga practice", price: 65, duration: 60 },
            { id: "6", name: "Flexibility Flow", description: "Flow focusing on increasing range of motion", price: 70, duration: 75 }
          ],
          availability: "Mon, Wed, Fri, Sun 7AM-7PM",
          zoomAccount: { email: "lisa@example.com", isConnected: true },
          languages: ["English", "French"],
          experience: 12,
          teachingStyle: "Energetic and flowing",
          notificationSettings: {
            email: { enabled: true, templates: [] },
            sms: { enabled: false, templates: [] },
            whatsapp: {
              enabled: false,
              phoneNumberId: "",
              accessToken: "",
              businessAccountId: "",
              verifyToken: "",
              autoReplyEnabled: false,
              autoReplyMessage: "",
              templates: []
            },
            app: { enabled: true, templates: [] }
          },
          reviews: [
            {
              id: "3",
              userId: "user3",
              userName: "Emily W.",
              userInitials: "EW",
              rating: 5,
              comment: "Lisa's flow classes are the highlight of my week!",
              date: "2023-12-03"
            }
          ],
          lastReviewDate: "2023-12-03",
          rating: 4.8,
          reviewCount: 35,
          avatarUrl: "/placeholder.svg"
        }
      ];

      setTeachers(mockTeachers);
      
      // Mock specialties
      setSpecialties([
        { id: "1", name: "Vinyasa Flow" }, 
        { id: "2", name: "Yin Yoga" },
        { id: "3", name: "Restorative Yoga" }, 
        { id: "4", name: "Meditation" },
        { id: "5", name: "Power Yoga" }, 
        { id: "6", name: "Hatha Yoga" }
      ]);
      
      // Mock session types
      setSessionTypes([
        { id: "1", name: "Private Session", description: "One-on-one personalized yoga", price: 75, duration: 60 },
        { id: "2", name: "Group Class", description: "Small group yoga session", price: 25, duration: 60 },
        { id: "3", name: "Meditation Session", description: "Guided meditation practice", price: 50, duration: 45 },
        { id: "4", name: "Restorative Yoga", description: "Gentle yoga for relaxation", price: 60, duration: 60 }
      ]);
      
      // Mock credit packages
      setCreditPackages([
        { id: "1", name: "Starter Package", price: 50, credits: 5, popular: true },
        { id: "2", name: "Regular Package", price: 90, credits: 10 },
        { id: "3", name: "Premium Package", price: 160, credits: 20, mostValue: true }
      ]);
      
      // Mock credit transactions
      setCreditTransactions([
        { id: "1", userId: user?.id || "", amount: 10, type: "purchase", description: "Purchased 10 credits", date: "2024-04-01" },
        { id: "2", userId: user?.id || "", amount: -1, type: "usage", description: "Booked session with Jane Yoga", date: "2024-04-03" },
        { id: "3", userId: user?.id || "", amount: 5, type: "purchase", description: "Purchased 5 credits", date: "2024-04-10" },
        { id: "4", userId: user?.id || "", amount: -1, type: "usage", description: "Booked session with Mark Mindful", date: "2024-04-12" },
        { id: "5", userId: user?.id || "", amount: 3, type: "gift", description: "Welcome bonus credits", date: "2024-03-15" }
      ]);
    };

    fetchTeachers();
  }, [user]);

  const addTeacher = async (teacher: Teacher) => {
    setTeachers([...teachers, teacher]);
  };

  const updateTeacher = async (teacher: Teacher) => {
    setTeachers(teachers.map(t => t.id === teacher.id ? teacher : t));
  };

  const deleteTeacher = async (id: string) => {
    setTeachers(teachers.filter(t => t.id !== id));
  };

  const addSpecialty = async (specialty: Specialty) => {
    setSpecialties([...specialties, specialty]);
  };

  const updateSpecialty = async (specialty: Specialty) => {
    setSpecialties(specialties.map(s => s.id === specialty.id ? specialty : s));
  };

  const deleteSpecialty = async (id: string) => {
    setSpecialties(specialties.filter(s => s.id !== id));
  };

  const addSessionType = async (sessionType: SessionType) => {
    setSessionTypes([...sessionTypes, sessionType]);
  };

  const updateSessionType = async (sessionType: SessionType) => {
    setSessionTypes(sessionTypes.map(st => st.id === sessionType.id ? sessionType : st));
  };

  const deleteSessionType = async (id: string) => {
    setSessionTypes(sessionTypes.filter(st => st.id !== id));
  };
  
  const addCreditPackage = (data: Omit<CreditPackage, 'id'>) => {
    const newPackage = {
      id: Math.random().toString(36).substring(2, 15),
      ...data
    };
    setCreditPackages([...creditPackages, newPackage]);
  };
  
  const updateCreditPackage = (data: CreditPackage) => {
    setCreditPackages(creditPackages.map(p => p.id === data.id ? data : p));
  };
  
  const deleteCreditPackage = (id: string) => {
    setCreditPackages(creditPackages.filter(p => p.id !== id));
  };

  const updateNotificationSettings = async (channelType: NotificationChannelType, settings: any) => {
    // In a real app, this would update notification settings in the database
    console.log('Updating notification settings:', channelType, settings);
  };

  const value: TeacherContextProps = {
    teachers,
    specialties,
    sessionTypes,
    userCredits,
    userMembership,
    creditPackages,
    creditTransactions,
    getTeacher,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addSpecialty,
    updateSpecialty,
    deleteSpecialty,
    addSessionType,
    updateSessionType,
    deleteSessionType,
    addCreditPackage,
    updateCreditPackage,
    deleteCreditPackage,
    updateNotificationSettings,
  };

  return (
    <TeacherContext.Provider value={value}>
      {children}
    </TeacherContext.Provider>
  );
};

// Export both useTeacher and useTeachers to fix the naming inconsistency
export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error("useTeacher must be used within a TeacherProvider");
  }
  return context;
};

// Alias for useTeacher to maintain backward compatibility
export const useTeachers = useTeacher;
