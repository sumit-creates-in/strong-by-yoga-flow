
import React, { createContext, useState, useContext, useEffect } from 'react';
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
  
  // If not recurring, just return the original class
  if (!baseClass.recurringPattern?.isRecurring || !baseClass.recurringPattern.daysOfWeek?.length) {
    return [baseClass];
  }

  const baseDate = new Date(baseClass.date);
  const baseDayOfWeek = baseDate.getDay();
  
  // Loop through the specified number of weeks
  for (let week = 0; week < weeks; week++) {
    // Loop through each day of the week in the recurring pattern
    baseClass.recurringPattern.daysOfWeek?.forEach(dayOfWeek => {
      // Skip the base instance as it's already included
      if (week === 0 && dayOfWeek === baseDayOfWeek) return;
      
      // Calculate how many days to add to the base date
      let daysToAdd = dayOfWeek - baseDayOfWeek;
      if (daysToAdd < 0) daysToAdd += 7; // Wrap around to the next week
      daysToAdd += week * 7; // Add weeks
      
      // Create the new date for this instance
      const newDate = addDays(baseDate, daysToAdd);
      
      // Create a new class instance with the calculated date
      const instance: YogaClass = {
        ...baseClass,
        id: `${baseClass.id}-${format(newDate, 'yyyy-MM-dd')}`,
        date: newDate.toISOString(),
      };
      
      instances.push(instance);
    });
  }

  // Include the original instance
  instances.push(baseClass);
  
  // Sort by date
  return instances.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Sample class data
const initialClasses: YogaClass[] = [
  {
    id: '1',
    name: 'Morning Flow',
    teacher: 'Sarah Johnson',
    description: 'Start your day with an energizing flow that will wake up your body and mind. Suitable for all levels.',
    date: new Date().toISOString(),
    duration: 60,
    tags: ['Morning', 'All Levels', 'Vinyasa'],
    joinLink: 'https://zoom.us/j/123456789',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=900',
    recurringPattern: {
      isRecurring: true,
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
      frequency: 'weekly'
    }
  },
  {
    id: '2',
    name: 'Gentle Restorative',
    teacher: 'Michael Chen',
    description: 'Unwind and restore with this gentle practice focused on deep relaxation and stress relief.',
    date: new Date().toISOString(),
    duration: 75,
    tags: ['Evening', 'Beginners', 'Restorative'],
    joinLink: 'https://zoom.us/j/987654321',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=900',
    recurringPattern: {
      isRecurring: true,
      daysOfWeek: [2, 4], // Tuesday, Thursday
      frequency: 'weekly'
    }
  },
  {
    id: '3',
    name: 'Power Yoga',
    teacher: 'Alex Rivera',
    description: 'Build strength and endurance in this challenging power yoga class. Previous yoga experience recommended.',
    date: addDays(new Date(), 1).toISOString(),
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
    date: addDays(new Date(), 2).toISOString(),
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
    date: addDays(new Date(), 3).toISOString(),
    duration: 45,
    tags: ['Evening', 'All Levels', 'Meditation'],
    joinLink: 'https://zoom.us/j/789123456',
    imageUrl: 'https://images.unsplash.com/photo-1536623975707-c4b3b2af565d?q=80&w=900',
  },
];

// Membership tiers
const initialMembershipTiers: MembershipTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 19.99,
    duration: 1, // 1 month
    features: [
      'Access to live classes',
      '5 classes per month',
      'Basic support',
      'Community forum access'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49.99,
    duration: 1, // 1 month
    popular: true,
    features: [
      'Unlimited live classes',
      'Class recordings for 7 days',
      'Priority support',
      'Community forum access',
      'Personal guidance from teachers'
    ]
  },
  {
    id: 'yearly',
    name: 'Annual Plan',
    price: 399.99,
    duration: 12, // 12 months
    features: [
      'All Premium features',
      '2 months free',
      'Exclusive workshops',
      'Personal progress tracking',
      'Custom program development'
    ]
  }
];

// Create context
const YogaClassContext = createContext<YogaClassContextType | undefined>(undefined);

// Provider component
export function YogaClassProvider({ children }: { children: React.ReactNode }) {
  const [baseClasses, setBaseClasses] = useState<YogaClass[]>([]);
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

  // Helper function for checking if a class is currently live
  const isClassLive = (yogaClass: YogaClass): boolean => {
    const classDate = new Date(yogaClass.date);
    const now = new Date();
    
    // Class is live if current time is within the class duration
    return (
      isAfter(now, classDate) && 
      isAfter(addMinutes(classDate, yogaClass.duration), now)
    );
  };
  
  // Helper function for checking if a class should be visible (not 15+ minutes after start)
  const isClassVisible = (yogaClass: YogaClass): boolean => {
    const classDate = new Date(yogaClass.date);
    const now = new Date();
    
    // Hide class if it started more than 15 minutes ago
    return isAfter(addMinutes(classDate, 15), now);
  };

  // Helper function for formatting class time in user's timezone
  const formatClassDateTime = (date: string): string => {
    // Format date in user's timezone
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
        
        // Mark enrolled classes
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
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('expiry_date', { ascending: false })
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching membership:', error);
        return;
      }
      
      if (data) {
        setUserMembership({
          active: true,
          expiryDate: new Date(data.expiry_date),
          type: data.tier
        });
      }
    } catch (error) {
      console.error('Error checking membership status:', error);
    }
  };

  // Load initial classes
  useEffect(() => {
    setBaseClasses(initialClasses);
  }, []);

  // Generate expanded class instances for recurring classes
  useEffect(() => {
    const allInstances: YogaClass[] = [];
    
    baseClasses.forEach(baseClass => {
      const instances = generateRecurringInstances(baseClass);
      allInstances.push(...instances);
    });
    
    setExpandedClasses(allInstances);
  }, [baseClasses]);

  // Check enrollment status when user or classes change
  useEffect(() => {
    if (user && expandedClasses.length > 0) {
      checkEnrollmentStatus();
      checkMembershipStatus();
    }
  }, [user, expandedClasses.length]);

  // Add a new class
  const addClass = (classData: Omit<YogaClass, 'id'>) => {
    const newClassId = Math.random().toString(36).substr(2, 9);
    const newClass: YogaClass = {
      ...classData,
      id: newClassId,
    };
    
    setBaseClasses((prevClasses) => [...prevClasses, newClass]);
    
    toast({
      title: 'Class added',
      description: `${classData.name} has been added to the schedule.`,
    });
  };

  // Edit an existing class
  const editClass = (id: string, classData: Partial<YogaClass>) => {
    setBaseClasses(
      baseClasses.map((c) => (c.id === id ? { ...c, ...classData } : c))
    );
    
    toast({
      title: 'Class updated',
      description: `The class has been updated successfully.`,
    });
  };

  // Delete a class
  const deleteClass = (id: string) => {
    const classToDelete = baseClasses.find(c => c.id === id);
    setBaseClasses(baseClasses.filter((c) => c.id !== id));
    
    toast({
      title: 'Class deleted',
      description: `${classToDelete?.name || 'The class'} has been removed from the schedule.`,
    });
  };

  // Get a specific class by ID
  const getClass = (id: string) => {
    return expandedClasses.find((c) => c.id === id);
  };

  // Join a class
  const joinClass = async (id: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please log in to join classes.',
      });
      return;
    }
    
    try {
      // Check if user is already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('class_enrollments')
        .select()
        .eq('user_id', user.id)
        .eq('class_id', id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw checkError;
      }
      
      if (existingEnrollment) {
        toast({
          title: 'Already enrolled',
          description: 'You are already enrolled in this class.',
        });
        return;
      }
      
      // Add enrollment
      const { error } = await supabase
        .from('class_enrollments')
        .insert({
          user_id: user.id,
          class_id: id
        });
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setExpandedClasses(classes =>
        classes.map(c => 
          c.id === id ? { ...c, isEnrolled: true } : c
        )
      );
      
      const joinedClass = expandedClasses.find(c => c.id === id);
      
      toast({
        title: 'Class joined',
        description: `You've successfully joined ${joinedClass?.name}. Check your email for details.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error joining class',
        description: error.message || 'Something went wrong',
      });
    }
  };

  // Purchase a membership
  const purchaseMembership = async (tierId: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please log in to purchase a membership.',
      });
      return;
    }
    
    const tier = membershipTiers.find(t => t.id === tierId);
    
    if (!tier) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selected membership plan not found.',
      });
      return;
    }
    
    try {
      // Calculate expiry date based on duration
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + tier.duration);
      
      // Store membership in database
      const { error } = await supabase
        .from('memberships')
        .insert({
          user_id: user.id,
          tier: tier.name,
          expiry_date: expiryDate.toISOString(),
          payment_id: `demo-${Date.now()}`
        });
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setUserMembership({
        active: true,
        type: tier.name,
        expiryDate
      });
      
      toast({
        title: 'Membership Activated',
        description: `Your ${tier.name} membership is now active until ${format(expiryDate, 'MMMM d, yyyy')}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error purchasing membership',
        description: error.message || 'Something went wrong',
      });
    }
  };

  // Apply filters to get filtered classes
  const filteredClasses = expandedClasses
    .filter((yogaClass) => {
      // Filter out classes that are 15+ minutes after start
      if (!isClassVisible(yogaClass)) {
        return false;
      }
      
      // Filter by tags
      if (filters.tags.length > 0 && !filters.tags.some(tag => yogaClass.tags.includes(tag))) {
        return false;
      }

      // Filter by teacher
      if (filters.teacher && yogaClass.teacher !== filters.teacher) {
        return false;
      }

      // Filter by time slot
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

      // Filter by search term
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
    });

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
