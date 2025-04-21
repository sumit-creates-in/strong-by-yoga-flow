import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Repeat, ChevronRight, Zap, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useYogaClasses, YogaClass } from '@/contexts/YogaClassContext';
import { format } from 'date-fns';
import ClassJoinPrompt from '@/components/ClassJoinPrompt';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import JoinClassButton from '@/components/JoinClassButton';
import { useAuth } from '@/contexts/AuthContext';
import AdminRoleDebugger from '@/components/AdminRoleDebugger';
import { Select } from '@/components/ui/select';

const Classes = () => {
  const {
    classes,
    filteredClasses,
    setFilters,
    viewMode,
    setViewMode,
    formatClassDateTime,
    formatClassDate,
    formatRecurringPattern,
    joinClass,
    userMembership,
    isClassLive
  } = useYogaClasses();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<YogaClass | null>(null);
  const [isJoinPromptOpen, setIsJoinPromptOpen] = useState(false);
  const [isMembershipDialogOpen, setIsMembershipDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const [isCheckingMembership, setIsCheckingMembership] = useState(true);
  const navigate = useNavigate();

  // Extract unique tags from all classes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    filteredClasses.forEach(yogaClass => {
      yogaClass.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [filteredClasses]);
  
  // Sort classes by date and time
  const sortedClasses = useMemo(() => {
    return [...filteredClasses].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [filteredClasses]);

  // Filter classes based on search and tags
  const displayedClasses = useMemo(() => {
    return sortedClasses.filter((yogaClass) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = yogaClass.name.toLowerCase().includes(searchLower);
      const teacherMatch = yogaClass.teacher.toLowerCase().includes(searchLower);
      const descMatch = yogaClass.description.toLowerCase().includes(searchLower);
      const searchMatch = !searchTerm || nameMatch || teacherMatch || descMatch;
      
      // Tags filter
      const tagsMatch = selectedTags.length === 0 || 
                        selectedTags.some(tag => yogaClass.tags.includes(tag));
      
      return searchMatch && tagsMatch;
    });
  }, [sortedClasses, searchTerm, selectedTags]);

  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  useEffect(() => {
    // Set a short timeout to avoid flickering for quick responses
    const timer = setTimeout(() => {
      setIsCheckingMembership(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleJoinClass = (yogaClass: YogaClass) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!userMembership.active) {
      setShowMembershipDialog(true);
      return;
    }

    // If user has active membership, allow joining the class
    navigate(`/class/${yogaClass.id}`);
  };

  if (isCheckingMembership) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-yoga-blue" />
          <span className="ml-2">Checking membership status...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminRoleDebugger />
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">Yoga Classes</h1>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search classes, teachers, or styles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Button 
            variant="outline" 
            className="flex gap-2"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={18} />
            Filter {selectedTags.length > 0 && `(${selectedTags.length})`}
          </Button>
        </div>
        
        {/* Filter tags */}
        {isFilterOpen && (
          <div className="flex flex-wrap gap-2 pb-2">
            {allTags.map(tag => (
              <Badge 
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedTags.includes(tag) 
                    ? "bg-yoga-blue text-white" 
                    : "hover:bg-yoga-blue/10"
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedTags([])}
                className="text-gray-500 hover:text-red-500"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
        
        {/* Class Cards */}
        {displayedClasses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedClasses.map((yogaClass) => {
              const isLive = isClassLive(yogaClass);
              const canJoin = new Date() <= new Date(yogaClass.date);
              const recurringText = formatRecurringPattern(yogaClass.recurringPattern);
              const formattedDate = formatClassDate(yogaClass.date);
              const formattedTime = format(new Date(yogaClass.date), 'h:mm a');
              
              return (
                <Card key={yogaClass.id} className="yoga-card h-full flex flex-col shadow-md overflow-hidden">
                  <div className="w-full h-40 relative overflow-hidden">
                    <img 
                      src={yogaClass.imageUrl || "/placeholder.svg"} 
                      alt={yogaClass.name} 
                      className="w-full h-full object-cover"
                    />
                    {isLive && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white py-1 px-2 rounded-md flex items-center shadow-lg animate-pulse">
                        <Zap size={14} className="mr-1.5" />
                        <span className="font-medium">LIVE</span>
                      </div>
                    )}
                    
                    {/* Tags overlay on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-1 flex flex-wrap gap-1 bg-gradient-to-t from-black/70 to-transparent">
                      {yogaClass.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs font-medium bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <CardContent className="pt-6 flex flex-col flex-grow">
                    <Link to={`/classes/${yogaClass.id}`}>
                      <h2 className="text-xl font-semibold mb-2 hover:text-yoga-blue transition-colors">
                        {yogaClass.name}
                      </h2>
                    </Link>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2 text-yoga-blue flex-shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock size={16} className="mr-2 text-yoga-blue flex-shrink-0" />
                        <span>{formattedTime} ({yogaClass.duration} mins)</span>
                      </div>
                      
                      {recurringText && (
                        <div className="flex items-center text-gray-600">
                          <Repeat size={16} className="mr-2 text-yoga-blue flex-shrink-0" />
                          <span>{recurringText}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <span className="font-medium">Teacher:</span> {yogaClass.teacher}
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">{yogaClass.description}</p>
                    
                    <div className="mt-auto flex flex-col md:flex-row gap-2">
                      {canJoin && (
                        <JoinClassButton 
                          yogaClass={yogaClass}
                          className="yoga-button flex-1 flex items-center justify-center"
                          buttonText={isLive ? 'Join Live Now' : 'Join Class'}
                        />
                      )}
                      
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/classes/${yogaClass.id}`)}
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="yoga-card bg-yoga-light-blue/30 text-center py-12">
            <p className="text-xl">No classes match your search</p>
            <p className="text-gray-600 mt-2">
              Try adjusting your filters or search terms
            </p>
            
            <Button 
              className="mt-4"
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedTags([]);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
        
        {/* Membership Dialog */}
        <Dialog open={showMembershipDialog} onOpenChange={setShowMembershipDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Membership Required</DialogTitle>
              <DialogDescription>
                You need an active membership to join yoga classes. Would you like to get a membership now?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium">
                Benefits of membership:
              </p>
              <ul className="list-disc pl-5 text-sm pt-2">
                <li>Access to all live yoga classes</li>
                <li>Recordings of past sessions</li>
                <li>Personal guidance from instructors</li>
                <li>Monthly progress tracking</li>
              </ul>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowMembershipDialog(false)}
              >
                Later
              </Button>
              <Button
                className="bg-yoga-blue hover:bg-yoga-blue/90"
                onClick={() => {
                  setShowMembershipDialog(false);
                  navigate('/pricing');
                }}
              >
                View Plans
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Class Join Prompt */}
        {selectedClass && (
          <ClassJoinPrompt
            isOpen={isJoinPromptOpen}
            onClose={() => setIsJoinPromptOpen(false)}
            classDate={selectedClass.date}
            className={selectedClass.name}
            joinLink={selectedClass.joinLink}
          />
        )}
      </div>
    </Layout>
  );
};

export default Classes;
