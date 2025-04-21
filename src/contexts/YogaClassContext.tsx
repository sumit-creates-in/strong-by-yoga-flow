import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { format, addDays, isToday, isTomorrow, isAfter, subMinutes, addMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Define types
export type RecurringPattern = {
  isRecurring: boolean;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  frequency?: 'daily' | 'weekly';
};

export type YogaClass = {
  id: string;
  name: string;
  teacher: string;
  description: string;
  date: string; // ISO string date
  duration: number; // in minutes
  tags: string[];
  joinLink: string;
  imageUrl?: string;
  recurringPattern?: RecurringPattern;
  isEnrolled?: boolean;
};

export type UserMembership = {
  active: boolean;
  expiryDate?: Date;
  type?: string;
};

export type MembershipTier = {
  id: string;
  name: string;
  price: number;
  duration: number; // in months
  features: string[];
  popular?: boolean;
};

type YogaClassContextType = {
  classes: YogaClass[];
  addClass: (classData: Omit<YogaClass, 'id'>) => void;
  editClass: (id: string, classData: Partial<YogaClass>) => void;
  deleteClass: (id: string) => void;
  getClass: (id: string) => YogaClass | undefined;
  joinClass: (id: string) => Promise<void>;
  filteredClasses: YogaClass[];
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  viewMode: 'card' | 'calendar';
  setViewMode: React.Dispatch<React.SetStateAction<'card' | 'calendar'>>;
  userMembership: UserMembership;
  setUserMembership: React.Dispatch<React.SetStateAction<UserMembership>>;
  formatClassDateTime: (date: string) => string;
  formatRecurringPattern: (pattern: RecurringPattern | undefined) => string;
  formatClassDate: (date: string) => string;
  membershipTiers: MembershipTier[];
  purchaseMembership: (tierId: string) => Promise<void>;
  isClassLive: (yogaClass: YogaClass) => boolean;
  isClassVisible: (yogaClass: YogaClass) => boolean;
  checkEnrollmentStatus: () => Promise<void>;
};

type FilterOptions = {
  tags: string[];
  teacher: string;
  timeSlot: '' | 'morning' | 'afternoon' | 'evening';
  search: string;
};

// Helper function to get day names
export const getDayNames = (days: number[]): string[] => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map(day => dayNames[day]);
};

// Generate class instances for recurring classes
const generateRecurringInstances = (baseClass: YogaClass, weeks: number = 4): YogaClass[] => {
  const instances: YogaClass[] = [];
  
  if (!baseClass.recurringPattern?.isRecurring || !baseClass.recurringPattern.daysOfWeek?.length) {
    return [baseClass];
  }

  const baseDate = new Date(baseClass.date);
  const baseDayOfWeek = baseDate.getDay();
  
  for (let week = 0; week < weeks; week++) {
    baseClass.recurringPattern.daysOfWeek?.forEach(dayOfWeek => {
      if (week === 0 && dayOfWeek === baseDayOfWeek) return;
      
      let daysToAdd = dayOfWeek - baseDayOfWeek;
      if (daysToAdd < 0) daysToAdd += 7;
      daysToAdd += week * 7;
      
      const newDate = addDays(baseDate, daysToAdd);
      
      const instance: YogaClass = {
        ...baseClass,
        id: `${baseClass.id}-${format(newDate, 'yyyy-MM-dd')}`,
        date: newDate.toISOString(),
      };
      
      instances.push(instance);
    });
  }

  instances.push(baseClass);
  
  return instances.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Sample class data with fixed dates that won't change
const initialClasses: YogaClass[] = [
  {
    id: '1',
    name: 'Morning Flow',
    teacher: 'Sarah Johnson',
    description: 'Start your day with an energizing flow that will wake up your body and mind. Suitable for all levels.',
    date: new Date('2025-04-15T08:00:00').toISOString(),
    duration: 60,
    tags: ['Morning', 'All Levels', 'Vinyasa'],
    joinLink: 'https://zoom.us/j/123456789',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=900',
    recurringPattern: {
      isRecurring: true,
      daysOfWeek: [1, 3, 5],
      frequency: 'weekly'
    }
  },
  {
    id: '2',
    name: 'Gentle Restorative',
    teacher: 'Michael Chen',
    description: 'Unwind and restore with this gentle practice focused on deep relaxation and stress relief.',
    date: new Date('2025-04-15T18:30:00').toISOString(),
    duration: 75,
    tags: ['Evening', 'Beginners', 'Restorative'],
    joinLink: 'https://zoom.us/j/987654321',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=900',
    recurringPattern: {
      isRecurring: true,
      daysOfWeek: [2, 4],
      frequency: 'weekly'
    }
  },
  {
    id: '3',
    name: 'Power Yoga',
    teacher: 'Alex Rivera',
    description: 'Build strength and endurance in this challenging power yoga class. Previous yoga experience recommended.',
    date: new Date('2025-04-16T14:00:00').toISOString(),
    duration: 60,
    tags: ['Afternoon', 'Advanced', 'Power'],
    joinLink: 'https://zoom.us/j/567891234',
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=900',
  },
  {
    id: '4',
    name: 'Yoga for Flexibility',
    teacher: 'Emma Wilson',
    description: 'Improve your flexibility and range of motion with this targeted practice focusing on safe, deep stretching.',
    date: new Date('2025-04-17T09:15:00').toISOString(),
    duration: 60,
    tags: ['Morning', 'All Levels', 'Flexibility'],
    joinLink: 'https://zoom.us/j/345678912',
    imageUrl: 'https://images.unsplash.com/photo-1593164842264-854604db2260?q=80&w=900',
  },
  {
    id: '5',
    name: 'Meditation & Breathwork',
    teacher: 'David Kumar',
    description: 'Calm your mind and connect with your breath in this meditation and pranayama practice.',
    date: new Date('2025-04-18T19:00:00').toISOString(),
    duration: 45,
    tags: ['Evening', 'All Levels', 'Meditation'],
    joinLink: 'https://zoom.us/j/789123456',
    imageUrl: 'https://images.unsplash.com/photo-1536623975707-c4b3b2af565d?q=80&w=900',
  },
];

// Membership tiers
const initialMembershipTiers: MembershipTier[] = [
  {
    id: 'membership-monthly',
    name: 'Monthly Membership',
    price: 39.99,
    duration: 1,
    features: [
      'Unlimited Group Classes',
      'Share Family Members',
      'Premium Workshops',
      'Recordings of Yoga Classes',
      'Body Weight Workout Series',
      'Weight Tracker Full Access'
    ]
  },
  {
    id: 'membership-sixmonth',
    name: '6 Months Membership',
    price: 34.99,
    duration: 6,
    features: [
      'Save $30',
      'Unlimited Group Classes',
      'Share Family Members',
      'Premium Workshops',
      'Recordings of Yoga Classes',
      'Body Weight Workout Series',
      'Weight Tracker Full Access'
    ]
  },
  {
    id: 'membership-annual',
    name: '1 Year Membership',
    price: 29.99,
    duration: 12,
    popular: true,
    features: [
      'Save $120',
      'Unlimited Group Classes',
      'Share Family Members',
      'Premium Workshops',
      'Recordings of Yoga Classes',
      'Body Weight Workout Series',
      'Weight Tracker Full Access'
    ]
  }
];

// Create context
const YogaClassContext = createContext<YogaClassContextType | undefined>(undefined);

// Provider component
export function YogaClassProvider({ children }: { children: React.ReactNode }) {
  const [baseClasses, setBaseClasses] = useState<YogaClass[]>(() => {
    // Load classes from localStorage if available
    const savedClasses = localStorage.getItem('yogaClasses');
    return savedClasses ? JSON.parse(savedClasses) : initialClasses;
  });
  const [expandedClasses, setExpandedClasses] = useState<YogaClass[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    tags: [],
    teacher: '',
    timeSlot: '',
    search: '',
  });
  const [viewMode, setViewMode] = useState<'card' | 'calendar'>('card');
  const [userMembership, setUserMembership] = useState<UserMembership>({
    active: false,
  });
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>(initialMembershipTiers);
  const { toast } = useToast();
  const { user } = useAuth();
  const classesLoaded = useRef(false);

  // Add useEffect for checking membership status
  useEffect(() => {
    if (user) {
      checkMembershipStatus();
    } else {
      setUserMembership({ active: false });
    }
  }, [user]);

  // Add interval to periodically check membership status
  useEffect(() => {
    if (user) {
      // Check immediately
      checkMembershipStatus();
      
      // Then check every minute
      const interval = setInterval(checkMembershipStatus, 60000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Save baseClasses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('yogaClasses', JSON.stringify(baseClasses));
  }, [baseClasses]);

  // Load initial classes only if none exist in localStorage
  useEffect(() => {
    if (!classesLoaded.current && baseClasses.length === 0) {
      setBaseClasses(initialClasses);
      classesLoaded.current = true;
    }
  }, [baseClasses.length]);

  // Helper function for checking if a class is currently live
  const isClassLive = (yogaClass: YogaClass): boolean => {
    const classDate = new Date(yogaClass.date);
    const now = new Date();
    const classEndTime = addMinutes(classDate, yogaClass.duration);
    
    // Class is live if current time is after class start AND before class end
    return (
      isAfter(now, classDate) && 
      isAfter(classEndTime, now)
    );
  };
  
  // Helper function for checking if a class should be visible 
  // (not finished more than 15 minutes ago)
  const isClassVisible = (yogaClass: YogaClass): boolean => {
    const classDate = new Date(yogaClass.date);
    const now = new Date();
    const classEndTime = addMinutes(classDate, yogaClass.duration);
    const bufferTimeAfterEnd = addMinutes(classEndTime, 15);
    
    // Class remains visible until 15 minutes after it ends
    return isAfter(bufferTimeAfterEnd, now);
  };

  // Helper function for formatting class time in user's timezone
  const formatClassDateTime = (date: string): string => {
    return formatInTimeZone(
      new Date(date), 
      Intl.DateTimeFormat().resolvedOptions().timeZone, 
      'EEEE, MMMM d, yyyy • h:mm a'
    );
  };

  // Format class date with "Today" and "Tomorrow" for upcoming days
  const formatClassDate = (date: string): string => {
    const dateObj = new Date(date);
    if (isToday(dateObj)) {
      return 'Today';
    } else if (isTomorrow(dateObj)) {
      return 'Tomorrow';
    } else {
      return formatInTimeZone(
        dateObj, 
        Intl.DateTimeFormat().resolvedOptions().timeZone, 
        'EEEE, MMMM d'
      );
    }
  };

  // Format recurring pattern as text (e.g., "Every Mon, Wed, Fri")
  const formatRecurringPattern = (pattern: RecurringPattern | undefined): string => {
    if (!pattern || !pattern.isRecurring || !pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
      return '';
    }

    const dayNames = getDayNames(pattern.daysOfWeek);
    
    if (pattern.frequency === 'daily') {
      return 'Every day';
    }

    if (dayNames.length === 1) {
      return `Every ${dayNames[0]}`;
    } 
    
    if (dayNames.length === 2) {
      return `Every ${dayNames[0]} & ${dayNames[1]}`;
    }
    
    const lastDay = dayNames.pop();
    return `Every ${dayNames.join(', ')} & ${lastDay}`;
  };

  // Generate expanded class instances for recurring classes
  useEffect(() => {
    const allInstances: YogaClass[] = [];
    
    baseClasses.forEach(baseClass => {
      const instances = generateRecurringInstances(baseClass);
      allInstances.push(...instances);
    });
    
    const sortedInstances = allInstances.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setExpandedClasses(sortedInstances);
  }, [baseClasses]);

  // Check user's enrollment status for all classes
  const checkEnrollmentStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching enrollments:', error);
        return;
      }
      
      if (data) {
        const enrolledClassIds = data.map(enrollment => enrollment.class_id);
        
        const updatedClasses = expandedClasses.map(yogaClass => ({
          ...yogaClass,
          isEnrolled: enrolledClassIds.includes(yogaClass.id)
        }));
        
        setExpandedClasses(updatedClasses);
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  // Check user's membership status
  const checkMembershipStatus = async () => {
    if (!user) {
      setUserMembership({ active: false });
      return;
    }
    
    try {
      console.log('Checking membership status for user:', user.id);
      
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('expiry_date', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No membership found - this is not an error
          console.log('No active membership found for user:', user.id);
          setUserMembership({ active: false });
          return;
        }
        
        console.error('Error fetching membership:', error);
        toast({
          title: "Error checking membership",
          description: "There was an error checking your membership status. Please try again later.",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        console.log('Found active membership:', data);
        const expiryDate = new Date(data.expiry_date);
        const now = new Date();
        
        if (now > expiryDate) {
          console.log('Membership expired:', { expiryDate, now });
          // Membership has expired, update it in the database
          const { error: updateError } = await supabase
            .from('memberships')
            .update({
              is_active: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.id);
            
          if (updateError) {
            console.error('Error updating expired membership:', updateError);
          }
          
          setUserMembership({ active: false });
          return;
        }
        
        const membershipData = {
          active: true,
          expiryDate,
          type: data.tier
        };
        
        setUserMembership(membershipData);
        console.log('Membership status updated:', membershipData);
      } else {
        console.log('No active membership found');
        setUserMembership({ active: false });
      }
    } catch (error) {
      console.error('Error in checkMembershipStatus:', error);
      toast({
        title: "Error checking membership",
        description: "There was an error checking your membership status. Please try again later.",
        variant: "destructive"
      });
    }
  };

  // Apply filters to get filtered classes
  const filteredClasses = expandedClasses
    .filter((yogaClass) => {
      if (!isClassVisible(yogaClass)) {
        return false;
      }
      
      if (filters.tags.length > 0 && !filters.tags.some(tag => yogaClass.tags.includes(tag))) {
        return false;
      }

      if (filters.teacher && yogaClass.teacher !== filters.teacher) {
        return false;
      }

      if (filters.timeSlot) {
        const hour = new Date(yogaClass.date).getHours();
        
        if (
          (filters.timeSlot === 'morning' && (hour < 5 || hour >= 12)) ||
          (filters.timeSlot === 'afternoon' && (hour < 12 || hour >= 17)) ||
          (filters.timeSlot === 'evening' && (hour < 17 || hour >= 21))
        ) {
          return false;
        }
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = yogaClass.name.toLowerCase().includes(searchLower);
        const teacherMatch = yogaClass.teacher.toLowerCase().includes(searchLower);
        const descriptionMatch = yogaClass.description.toLowerCase().includes(searchLower);
        const tagsMatch = yogaClass.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!(nameMatch || teacherMatch || descriptionMatch || tagsMatch)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  // Add class function
  const addClass = (classData: Omit<YogaClass, 'id'>) => {
    const newClass: YogaClass = {
      ...classData,
      id: `${Date.now()}`, // Generate a unique ID
    };
    
    setBaseClasses(prevClasses => {
      const updatedClasses = [...prevClasses, newClass];
      // No need to save to localStorage here as the useEffect will handle it
      return updatedClasses;
    });
    
    toast({
      title: "Class added",
      description: `${newClass.name} has been added to the schedule.`,
    });
  };

  // Edit class function
  const editClass = (id: string, classData: Partial<YogaClass>) => {
    setBaseClasses(prevClasses => {
      const updatedClasses = prevClasses.map(yogaClass => 
        yogaClass.id === id ? { ...yogaClass, ...classData } : yogaClass
      );
      // No need to save to localStorage here as the useEffect will handle it
      return updatedClasses;
    });
    
    toast({
      title: "Class updated",
      description: "The class has been updated successfully.",
    });
  };

  // Delete class function
  const deleteClass = (id: string) => {
    setBaseClasses(prevClasses => {
      const updatedClasses = prevClasses.filter(yogaClass => yogaClass.id !== id);
      // No need to save to localStorage here as the useEffect will handle it
      return updatedClasses;
    });
    
    toast({
      title: "Class deleted",
      description: "The class has been removed from the schedule.",
    });
  };

  // Get class by ID
  const getClass = (id: string): YogaClass | undefined => {
    return expandedClasses.find(yogaClass => yogaClass.id === id);
  };

  // Join class function
  const joinClass = async (id: string): Promise<void> => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: "Authentication required",
        description: "Please log in to join this class.",
      });
      return;
    }
    
    try {
      // In a real app, this would create an enrollment record in the database
      const { error } = await supabase
        .from('class_enrollments')
        .insert({
          user_id: user.id,
          class_id: id,
          enrolled_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error('Error joining class:', error);
        toast({
          variant: 'destructive',
          title: "Failed to join class",
          description: error.message,
        });
        return;
      }
      
      // Update local state
      setExpandedClasses(prevClasses =>
        prevClasses.map(yogaClass =>
          yogaClass.id === id ? { ...yogaClass, isEnrolled: true } : yogaClass
        )
      );
      
      toast({
        title: "Joined class",
        description: "You have successfully joined the class.",
      });
    } catch (error) {
      console.error('Error joining class:', error);
    }
  };

  // Purchase membership function
  const purchaseMembership = async (tierId: string): Promise<void> => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: "Authentication required",
        description: "Please log in to purchase a membership."
      });
      return;
    }
    
    try {
      // Get the selected membership tier
      const tier = membershipTiers.find(t => t.id === tierId);
      
      if (!tier) {
        toast({
          variant: 'destructive',
          title: "Invalid membership tier",
          description: "The selected membership tier doesn't exist."
        });
        return;
      }
      
      // Calculate expiry date (current date + duration in months)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + tier.duration);
      
      // Create membership record in the database
      const { error } = await supabase
        .from('memberships')
        .insert({
          user_id: user.id,
          tier: tier.id,
          is_active: true,
          start_date: new Date().toISOString(),
          expiry_date: expiryDate.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error purchasing membership:', error);
        toast({
          variant: 'destructive',
          title: "Failed to purchase membership",
          description: error.message
        });
        return;
      }
      
      // Update local state
      setUserMembership({
        active: true,
        expiryDate,
        type: tier.id
      });
      
      toast({
        title: "Membership activated",
        description: `Your ${tier.name} membership has been activated successfully.`
      });
    } catch (error) {
      console.error('Error purchasing membership:', error);
      toast({
        variant: 'destructive',
        title: "Failed to purchase membership",
        description: "An unexpected error occurred. Please try again later."
      });
    }
  };

  return (
    <YogaClassContext.Provider
      value={{
        classes: expandedClasses,
        addClass,
        editClass,
        deleteClass,
        getClass,
        joinClass,
        filteredClasses,
        setFilters,
        viewMode,
        setViewMode,
        userMembership,
        setUserMembership,
        formatClassDateTime,
        formatRecurringPattern,
        formatClassDate,
        membershipTiers,
        purchaseMembership,
        isClassLive,
        isClassVisible,
        checkEnrollmentStatus
      }}
    >
      {children}
    </YogaClassContext.Provider>
  );
}

// Custom hook to use the yoga class context
export function useYogaClasses() {
  const context = useContext(YogaClassContext);
  if (context === undefined) {
    throw new Error('useYogaClasses must be used within a YogaClassProvider');
  }
  return context;
}
