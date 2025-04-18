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
  expertise: string[];
  certifications: string[];
  sessionTypes: SessionType[];
  availability: Availability[];
  zoomAccount: ZoomAccount;
  imageUrl?: string;
  pricing: Pricing;
  languages: string[];
	education: string;
	location: string;
	experience: number;
  ratings: Ratings;
  teachingStyle: string;
  notificationSettings: NotificationSettings;
  reviews: Review[];
  lastReviewDate?: string;
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
  connected: boolean;
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
  inApp: InAppSettings;
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

export type NotificationChannelType = 'email' | 'sms' | 'whatsapp' | 'inApp';

interface TeacherContextProps {
  teachers: Teacher[];
  specialties: Specialty[];
  sessionTypes: SessionType[];
  addTeacher: (teacher: Teacher) => Promise<void>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addSpecialty: (specialty: Specialty) => Promise<void>;
  updateSpecialty: (specialty: Specialty) => Promise<void>;
  deleteSpecialty: (id: string) => Promise<void>;
  addSessionType: (sessionType: SessionType) => Promise<void>;
  updateSessionType: (sessionType: SessionType) => Promise<void>;
  deleteSessionType: (id: string) => Promise<void>;
  updateNotificationSettings: (channelType: NotificationChannelType, settings: any) => Promise<void>;
}

const TeacherContext = createContext<TeacherContextProps | undefined>(undefined);

export const TeacherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const auth = useAuth();

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!auth.currentUser) {
        console.error("No authenticated user");
        return;
      }

      const { data, error } = await supabase
        .from('teachers')
        .select('*');

      if (error) {
        console.error("Error fetching teachers:", error);
      } else {
        setTeachers(data || []);
      }
    };

    const fetchSpecialties = async () => {
      const { data, error } = await supabase
        .from('specialties')
        .select('*');

      if (error) {
        console.error("Error fetching specialties:", error);
      } else {
        setSpecialties(data || []);
      }
    };

    const fetchSessionTypes = async () => {
      const { data, error } = await supabase
        .from('session_types')
        .select('*');

      if (error) {
        console.error("Error fetching session types:", error);
      } else {
        setSessionTypes(data || []);
      }
    };

    if (auth.currentUser) {
      fetchTeachers();
      fetchSpecialties();
      fetchSessionTypes();
    }
  }, [auth.currentUser]);

  const addTeacher = async (teacher: Teacher) => {
    if (!auth.currentUser) {
      console.error("No authenticated user");
      return;
    }

    const { error } = await supabase
      .from('teachers')
      .insert([teacher]);

    if (error) {
      console.error("Error adding teacher:", error);
    } else {
      setTeachers([...teachers, teacher]);
    }
  };

  const updateTeacher = async (teacher: Teacher) => {
    if (!auth.currentUser) {
      console.error("No authenticated user");
      return;
    }

    const { error } = await supabase
      .from('teachers')
      .update(teacher)
      .eq('id', teacher.id);

    if (error) {
      console.error("Error updating teacher:", error);
    } else {
      setTeachers(teachers.map(t => t.id === teacher.id ? teacher : t));
    }
  };

  const deleteTeacher = async (id: string) => {
    if (!auth.currentUser) {
      console.error("No authenticated user");
      return;
    }

    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting teacher:", error);
    } else {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  const addSpecialty = async (specialty: Specialty) => {
    if (!auth.currentUser) {
      console.error("No authenticated user");
      return;
    }

    const { error } = await supabase
      .from('specialties')
      .insert([specialty]);

    if (error) {
      console.error("Error adding specialty:", error);
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };

  const updateSpecialty = async (specialty: Specialty) => {
    if (!auth.currentUser) {
      console.error("No authenticated user");
      return;
    }

    const { error } = await supabase
      .from('specialties')
      .update(specialty)
      .eq('id', specialty.id);

    if (error) {
      console.error("Error updating specialty:", error);
    } else {
      setSpecialties(specialties.map(s => s.id === specialty.id ? specialty : s));
    }
  };

  const deleteSpecialty = async (id: string) => {
    if (!auth.currentUser) {
      console.error("No authenticated user");
      return;
    }

    const { error } = await supabase
      .from('specialties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting specialty:", error);
    } else {
      setSpecialties(specialties.filter(s => s.id !== id));
    }
  };

  const addSessionType = async (sessionType: SessionType) => {
    if (!auth.currentUser) {
      console.error("No authenticated user");
      return;
    }

    const { error } = await supabase
      .from('session_types')
      .insert([sessionType]);

    if (error) {
      console.error("Error adding session type:", error);
    } else {
      setSessionTypes([...sessionTypes, sessionType]);
    }
  };

  const updateSessionType = async (sessionType: SessionType) => {
    if (!auth.currentUser) {
      console.error("No authenticated user");
      return;
    }

    const { error } = await supabase
      .from('session_types')
      .update(sessionType)
      .eq('id', sessionType.id);

    if (error) {
      console.error("Error updating session type:", error);
    } else {
      setSessionTypes(sessionTypes.map(st => st.id === sessionType.id ? sessionType : st));
    }
  };

  const deleteSessionType = async (id: string) => {
    if (!auth.currentUser) {
      console.error("No authenticated user");
      return;
    }

    const { error } = await supabase
      .from('session_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting session type:", error);
    } else {
      setSessionTypes(sessionTypes.filter(st => st.id !== id));
    }
  };

  const emailTemplates: NotificationTemplate[] = [
    {
      id: "booking-confirmation",
      name: "Booking Confirmation",
      subject: "Your Yoga Session is Confirmed!",
      body: `Hi {{userName}},\n\nYour yoga session with {{teacherName}} is confirmed for {{date}} at {{time}}.\n\nSee you soon!\nStrong By Yoga Team`,
      timing: {
        type: "before",
        minutes: 0,
      },
      recipients: ["teacher", "user"],
      type: "email",
      enabled: true,
      recipientType: "both",
      triggerType: "action"
    },
    {
      id: "session-reminder",
      name: "Session Reminder",
      subject: "Reminder: Your Yoga Session is Approaching!",
      body: `Hi {{userName}},\n\nThis is a friendly reminder that your yoga session with {{teacherName}} is scheduled for tomorrow at {{time}}.\n\nPrepare to relax and rejuvenate!\nStrong By Yoga Team`,
      timing: {
        type: "before",
        minutes: 1440,
      },
      recipients: ["teacher", "user"],
      type: "email",
      enabled: true,
      recipientType: "both",
      triggerType: "scheduled"
    },
    {
      id: "feedback-request",
      name: "Feedback Request",
      subject: "We'd Love to Hear About Your Experience!",
      body: `Hi {{userName}},\n\nThank you for attending the yoga session with {{teacherName}}.\n\nWe'd appreciate it if you could share your feedback to help us improve.\n\nClick here to leave a review: [Link]\nStrong By Yoga Team`,
      timing: {
        type: "after",
        minutes: 60,
      },
      recipients: ["teacher", "user"],
      type: "email",
      enabled: true,
      recipientType: "both",
      triggerType: "action"
    },
    {
      id: "cancellation-notification",
      name: "Cancellation Notification",
      subject: "Important: Your Yoga Session Has Been Cancelled",
      body: `Hi {{userName}},\n\nWe regret to inform you that your yoga session with {{teacherName}} on {{date}} at {{time}} has been cancelled.\n\nWe apologize for any inconvenience caused.\nStrong By Yoga Team`,
      timing: {
        type: "before",
        minutes: 0,
      },
      recipients: ["teacher", "user"],
      type: "email",
      enabled: true,
      recipientType: "both",
      triggerType: "action"
    },
  ];

  const updateNotificationSettings = async (channelType: NotificationChannelType, settings: any) => {
    if (!auth.currentUser) {
      console.error("No authenticated user");
      return;
    }
    
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('user_id', auth.currentUser.id)
      .single();
    
    if (teacherError) {
      console.error("Error fetching teacher for notification settings update:", teacherError);
      return;
    }
    
    const updatedNotificationSettings = {
      ...teacher.notification_settings,
      [channelType]: {
        ...(channelType === 'whatsapp' ? {
          enabled: settings.enabled,
          phoneNumberId: settings.phoneNumberId || '',
          accessToken: settings.accessToken || '',
          businessAccountId: settings.businessAccountId || '',
          verifyToken: settings.verifyToken || '',
          autoReplyEnabled: settings.autoReplyEnabled || false,
          autoReplyMessage: settings.autoReplyMessage || '',
          templates: settings.templates || []
        } : {
          enabled: settings.enabled,
          templates: settings.templates || []
        })
      }
    };
    
    const { error: updateError } = await supabase
      .from('teachers')
      .update({
        notification_settings: updatedNotificationSettings
      })
      .eq('id', teacher.id);
    
    if (updateError) {
      console.error("Error updating notification settings:", updateError);
      return;
    }
    
    setTeachers(prevTeachers => 
      prevTeachers.map(t => 
        t.id === teacher.id ? 
        {
          ...t,
          notificationSettings: {
            ...t.notificationSettings,
            [channelType]: channelType === 'whatsapp' ? {
              enabled: settings.enabled,
              phoneNumberId: settings.phoneNumberId || '',
              accessToken: settings.accessToken || '',
              businessAccountId: settings.businessAccountId || '',
              verifyToken: settings.verifyToken || '',
              autoReplyEnabled: settings.autoReplyEnabled || false,
              autoReplyMessage: settings.autoReplyMessage || '',
              templates: settings.templates || []
            } : {
              enabled: settings.enabled,
              templates: settings.templates || []
            }
          }
        } : t
      )
    );
  };

  const value: TeacherContextProps = {
    teachers,
    specialties,
    sessionTypes,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addSpecialty,
    updateSpecialty,
    deleteSpecialty,
    addSessionType,
    updateSessionType,
    deleteSessionType,
    updateNotificationSettings,
  };

  return (
    <TeacherContext.Provider value={value}>
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error("useTeacher must be used within a TeacherProvider");
  }
  return context;
};
