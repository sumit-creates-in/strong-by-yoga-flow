
import React, { createContext, useState, useContext, useEffect } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

// Define types
export type YogaClass = {
  id: string;
  name: string;
  teacher: string;
  description: string;
  date: Date;
  duration: number; // in minutes
  tags: string[];
  joinLink: string;
  maxParticipants?: number;
  currentParticipants: number;
  imageUrl?: string;
};

type YogaClassContextType = {
  classes: YogaClass[];
  addClass: (classData: Omit<YogaClass, 'id' | 'currentParticipants'>) => void;
  editClass: (id: string, classData: Partial<YogaClass>) => void;
  deleteClass: (id: string) => void;
  getClass: (id: string) => YogaClass | undefined;
  joinClass: (id: string) => void;
  filteredClasses: YogaClass[];
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  viewMode: 'card' | 'calendar';
  setViewMode: React.Dispatch<React.SetStateAction<'card' | 'calendar'>>;
};

type FilterOptions = {
  tags: string[];
  teacher: string;
  timeSlot: '' | 'morning' | 'afternoon' | 'evening';
  search: string;
};

// Sample class data
const initialClasses: YogaClass[] = [
  {
    id: '1',
    name: 'Morning Flow',
    teacher: 'Sarah Johnson',
    description: 'Start your day with an energizing flow that will wake up your body and mind. Suitable for all levels.',
    date: new Date(new Date().setHours(7, 30, 0, 0)),
    duration: 60,
    tags: ['Morning', 'All Levels', 'Vinyasa'],
    joinLink: 'https://zoom.us/j/123456789',
    currentParticipants: 8,
    maxParticipants: 20,
    imageUrl: '/assets/morning-flow.jpg',
  },
  {
    id: '2',
    name: 'Gentle Restorative',
    teacher: 'Michael Chen',
    description: 'Unwind and restore with this gentle practice focused on deep relaxation and stress relief.',
    date: new Date(new Date().setHours(18, 0, 0, 0)),
    duration: 75,
    tags: ['Evening', 'Beginners', 'Restorative'],
    joinLink: 'https://zoom.us/j/987654321',
    currentParticipants: 5,
    maxParticipants: 15,
    imageUrl: '/assets/restorative.jpg',
  },
  {
    id: '3',
    name: 'Power Yoga',
    teacher: 'Alex Rivera',
    description: 'Build strength and endurance in this challenging power yoga class. Previous yoga experience recommended.',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(12, 0, 0, 0),
    duration: 60,
    tags: ['Afternoon', 'Advanced', 'Power'],
    joinLink: 'https://zoom.us/j/567891234',
    currentParticipants: 12,
    maxParticipants: 20,
    imageUrl: '/assets/power-yoga.jpg',
  },
  {
    id: '4',
    name: 'Yoga for Flexibility',
    teacher: 'Emma Wilson',
    description: 'Improve your flexibility and range of motion with this targeted practice focusing on safe, deep stretching.',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).setHours(9, 0, 0, 0),
    duration: 60,
    tags: ['Morning', 'All Levels', 'Flexibility'],
    joinLink: 'https://zoom.us/j/345678912',
    currentParticipants: 7,
    imageUrl: '/assets/flexibility.jpg',
  },
  {
    id: '5',
    name: 'Meditation & Breathwork',
    teacher: 'David Kumar',
    description: 'Calm your mind and connect with your breath in this meditation and pranayama practice.',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).setHours(19, 30, 0, 0),
    duration: 45,
    tags: ['Evening', 'All Levels', 'Meditation'],
    joinLink: 'https://zoom.us/j/789123456',
    currentParticipants: 9,
    maxParticipants: 30,
    imageUrl: '/assets/meditation.jpg',
  },
];

// Create context
const YogaClassContext = createContext<YogaClassContextType | undefined>(undefined);

// Provider component
export function YogaClassProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    tags: [],
    teacher: '',
    timeSlot: '',
    search: '',
  });
  const [viewMode, setViewMode] = useState<'card' | 'calendar'>('card');
  const { toast } = useToast();

  // Load initial classes
  useEffect(() => {
    setClasses(initialClasses);
  }, []);

  // Add a new class
  const addClass = (classData: Omit<YogaClass, 'id' | 'currentParticipants'>) => {
    const newClass: YogaClass = {
      ...classData,
      id: Math.random().toString(36).substr(2, 9),
      currentParticipants: 0,
    };
    
    setClasses([...classes, newClass]);
    
    toast({
      title: 'Class added',
      description: `${classData.name} has been added to the schedule.`,
    });
  };

  // Edit an existing class
  const editClass = (id: string, classData: Partial<YogaClass>) => {
    setClasses(
      classes.map((c) => (c.id === id ? { ...c, ...classData } : c))
    );
    
    toast({
      title: 'Class updated',
      description: `The class has been updated successfully.`,
    });
  };

  // Delete a class
  const deleteClass = (id: string) => {
    const classToDelete = classes.find(c => c.id === id);
    setClasses(classes.filter((c) => c.id !== id));
    
    toast({
      title: 'Class deleted',
      description: `${classToDelete?.name || 'The class'} has been removed from the schedule.`,
    });
  };

  // Get a specific class by ID
  const getClass = (id: string) => {
    return classes.find((c) => c.id === id);
  };

  // Join a class
  const joinClass = (id: string) => {
    setClasses(
      classes.map((c) =>
        c.id === id ? { ...c, currentParticipants: c.currentParticipants + 1 } : c
      )
    );
    
    const joinedClass = classes.find(c => c.id === id);
    
    toast({
      title: 'Class joined',
      description: `You've successfully joined ${joinedClass?.name}. Check your email for details.`,
    });
  };

  // Apply filters to get filtered classes
  const filteredClasses = classes.filter((yogaClass) => {
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
      const hour = yogaClass.date.getHours();
      
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
        classes,
        addClass,
        editClass,
        deleteClass,
        getClass,
        joinClass,
        filteredClasses,
        setFilters,
        viewMode,
        setViewMode,
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
