
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Repeat, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useYogaClasses, YogaClass } from '@/contexts/YogaClassContext';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    filteredClasses, 
    joinClass, 
    userMembership, 
    formatClassDateTime,
    formatClassDate, 
    formatRecurringPattern,
    isClassLive,
    isClassVisible
  } = useYogaClasses();
  const navigate = useNavigate();
  const [isMembershipDialogOpen, setIsMembershipDialogOpen] = useState(false);

  // Get upcoming classes (including today, next several days)
  const upcomingClasses = filteredClasses
    .filter((yogaClass) => {
      const classDate = new Date(yogaClass.date);
      const now = new Date();
      return classDate >= now && isClassVisible(yogaClass);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6); // Limit to 6 classes
  
  const handleJoinClass = (yogaClass: YogaClass) => {
    if (userMembership.active) {
      joinClass(yogaClass.id);
    } else {
      setIsMembershipDialogOpen(true);
    }
  };

  const ClassCard = ({ yogaClass }: { yogaClass: YogaClass }) => {
    const isLive = isClassLive(yogaClass);
    const canJoin = new Date() <= new Date(yogaClass.date);
    const recurringText = formatRecurringPattern(yogaClass.recurringPattern);
    const formattedDate = formatClassDate(yogaClass.date);
    const formattedTime = format(new Date(yogaClass.date), 'h:mm a');
    
    return (
      <Card className="yoga-card h-full flex flex-col shadow-md overflow-hidden">
        {yogaClass.imageUrl && (
          <div className="w-full h-40 relative overflow-hidden">
            <img 
              src={yogaClass.imageUrl} 
              alt={yogaClass.name} 
              className="w-full h-full object-cover"
            />
            {isLive && (
              <div className="absolute top-2 left-2 bg-red-500 text-white py-1 px-2 rounded-md flex items-center shadow-lg animate-pulse">
                <Zap size={14} className="mr-1.5" />
                <span className="font-medium">LIVE</span>
              </div>
            )}
          </div>
        )}
        <CardContent className="pt-6 flex flex-col h-full">
          <div className="flex flex-col flex-grow">
            <h3 className="text-xl font-semibold mb-2">{yogaClass.name}</h3>
            
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
            
            <div className="mb-3 flex flex-wrap">
              {yogaClass.tags.map((tag) => (
                <span key={tag} className="yoga-tag">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="mt-auto">
              {canJoin && (
                <Button 
                  className="w-full bg-yoga-blue text-white hover:bg-yoga-blue/90 flex items-center justify-center"
                  onClick={() => handleJoinClass(yogaClass)}
                >
                  {isLive ? 'Join Live Now' : 'Join Class'}
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {user?.profile?.first_name || user?.email || "Yogi"}!
            </h1>
            <p className="text-gray-600">
              Here's your upcoming yoga sessions
            </p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0 yoga-button"
            onClick={() => navigate('/classes')}
          >
            Browse All Classes
          </Button>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Classes</h2>
          {upcomingClasses.length > 0 ? (
            <div className="md:px-6 lg:px-10 xl:px-12">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {upcomingClasses.map((yogaClass) => (
                    <CarouselItem key={yogaClass.id} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <ClassCard yogaClass={yogaClass} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 md:left-0" />
                <CarouselNext className="right-2 md:right-0" />
              </Carousel>
            </div>
          ) : (
            <div className="yoga-card bg-yoga-light-blue/30 text-center py-12">
              <p className="text-xl">No upcoming classes</p>
              <p className="text-gray-600 mt-2">
                Check back soon or contact your instructor
              </p>
            </div>
          )}
          
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              className="text-yoga-blue border-yoga-blue hover:bg-yoga-blue hover:text-white"
              onClick={() => navigate('/classes')}
            >
              View All Classes
            </Button>
          </div>
        </div>

        {/* Membership Dialog */}
        <Dialog open={isMembershipDialogOpen} onOpenChange={setIsMembershipDialogOpen}>
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
                onClick={() => setIsMembershipDialogOpen(false)}
              >
                Later
              </Button>
              <Button
                className="bg-yoga-blue hover:bg-yoga-blue/90"
                onClick={() => {
                  setIsMembershipDialogOpen(false);
                  navigate('/pricing');
                }}
              >
                View Plans
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Dashboard;
