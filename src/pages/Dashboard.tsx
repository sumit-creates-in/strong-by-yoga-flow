import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Repeat, ChevronRight, Zap, Coins, CreditCard, History } from 'lucide-react';
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
import ClassJoinPrompt from '@/components/ClassJoinPrompt';
import TeacherShowcase from '@/components/TeacherShowcase';
import { useTeachers } from '@/contexts/TeacherContext';
import CreditHistoryModal from '@/components/CreditHistoryModal';
import JoinClassButton from '@/components/JoinClassButton';
import AdminRoleDebugger from '@/components/AdminRoleDebugger';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    filteredClasses, 
    formatClassDateTime,
    formatClassDate, 
    formatRecurringPattern,
    isClassLive,
    isClassVisible
  } = useYogaClasses();
  const { userCredits } = useTeachers();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<YogaClass | null>(null);
  const [isJoinPromptOpen, setIsJoinPromptOpen] = useState(false);
  const [isCreditHistoryOpen, setIsCreditHistoryOpen] = useState(false);

  // Get upcoming classes (including today, next several days)
  // Sort classes by date/time to ensure consistent ordering
  const upcomingClasses = filteredClasses
    .filter((yogaClass) => {
      const classDate = new Date(yogaClass.date);
      const now = new Date();
      const classEndTime = new Date(classDate);
      classEndTime.setMinutes(classDate.getMinutes() + yogaClass.duration);
      
      // Include classes that haven't ended yet (either upcoming or currently live)
      return (classEndTime >= now) && isClassVisible(yogaClass);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  const ClassCard = ({ yogaClass }: { yogaClass: YogaClass }) => {
    const isLive = isClassLive(yogaClass);
    const formattedDate = formatClassDate(yogaClass.date);
    const formattedTime = format(new Date(yogaClass.date), 'h:mm a');
    const recurringText = formatRecurringPattern(yogaClass.recurringPattern);
    
    return (
      <Card className="h-full flex flex-col">
        <div className="h-40 overflow-hidden rounded-t-lg">
          <img 
            src={yogaClass.imageUrl || 'https://images.unsplash.com/photo-1599447292180-45fd84092ef4?q=80&w=580'} 
            alt={yogaClass.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
          {isLive && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse">
              LIVE NOW
            </div>
          )}
        </div>
        
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
            
            <div className="mt-auto">
              <JoinClassButton 
                yogaClass={yogaClass}
                className="w-full bg-yoga-blue text-white hover:bg-yoga-blue/90 flex items-center justify-center"
                buttonText={isLive ? 'Join Live Now' : 'Join Now'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Layout>
      <AdminRoleDebugger />
      
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {user?.profile?.first_name || user?.email || "Yogi"}!
            </h1>
            <p className="text-gray-600">
              Here's your upcoming yoga sessions
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            {/* Credit Balance Card */}
            <div className="bg-white rounded-lg shadow flex items-center px-4 py-2 border">
              <Coins className="h-5 w-5 text-amber-500 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Credits</div>
                <div className="font-semibold">{userCredits}</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2"
                onClick={() => setIsCreditHistoryOpen(true)}
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              className="yoga-button"
              onClick={() => navigate('/classes')}
            >
              Browse All Classes
            </Button>
          </div>
        </div>
        
        {/* Teacher Showcase */}
        <TeacherShowcase />
        
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

        {/* Credit History Modal */}
        <CreditHistoryModal
          open={isCreditHistoryOpen}
          onOpenChange={setIsCreditHistoryOpen}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
