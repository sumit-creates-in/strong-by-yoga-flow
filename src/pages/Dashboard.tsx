
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useYogaClasses, YogaClass } from '@/contexts/YogaClassContext';
import { Card, CardContent } from '@/components/ui/card';

const Dashboard = () => {
  const { user } = useAuth();
  const { filteredClasses, joinClass } = useYogaClasses();
  const navigate = useNavigate();
  
  // Get today's classes
  const todayClasses = filteredClasses.filter(
    (yogaClass) => new Date(yogaClass.date).toDateString() === new Date().toDateString()
  );
  
  // Get upcoming classes (not today, next 7 days)
  const upcomingClasses = filteredClasses
    .filter((yogaClass) => {
      const classDate = new Date(yogaClass.date);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      return (
        classDate.toDateString() !== today.toDateString() &&
        classDate > today && 
        classDate <= nextWeek
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4); // Limit to 4 classes
  
  const ClassCard = ({ yogaClass, showJoin = true }: { yogaClass: YogaClass; showJoin?: boolean }) => {
    const isClassToday = new Date(yogaClass.date).toDateString() === new Date().toDateString();
    const canJoin = isClassToday && new Date() <= new Date(yogaClass.date);
    
    return (
      <Card className="yoga-card h-full flex flex-col">
        <CardContent className="pt-6 flex flex-col h-full">
          <div className="flex flex-col flex-grow">
            <h3 className="text-xl font-semibold mb-2">{yogaClass.name}</h3>
            
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar size={16} className="mr-2" />
              <span>{format(new Date(yogaClass.date), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center text-gray-600 mb-2">
              <Clock size={16} className="mr-2" />
              <span>
                {format(new Date(yogaClass.date), 'h:mm a')} • {yogaClass.duration} mins
              </span>
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
            
            {yogaClass.maxParticipants && (
              <div className="flex items-center text-gray-600 mb-3">
                <Users size={16} className="mr-2" />
                <span>
                  {yogaClass.currentParticipants} / {yogaClass.maxParticipants} participants
                </span>
              </div>
            )}
            
            <div className="mt-auto flex flex-wrap gap-2">
              <Button
                onClick={() => navigate(`/classes/${yogaClass.id}`)}
                variant="outline"
                className="flex-grow"
              >
                View Details
              </Button>
              
              {showJoin && canJoin && (
                <Button 
                  className="flex-grow bg-yoga-blue text-white hover:bg-yoga-blue/90"
                  onClick={() => joinClass(yogaClass.id)}
                >
                  Join Now
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
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Here's what's on your yoga schedule today and this week.
            </p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0 yoga-button"
            onClick={() => navigate('/classes')}
          >
            Browse All Classes
          </Button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Today's Classes</h2>
            {todayClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayClasses.map((yogaClass) => (
                  <ClassCard key={yogaClass.id} yogaClass={yogaClass} />
                ))}
              </div>
            ) : (
              <div className="yoga-card bg-yoga-light-blue/30 text-center py-12">
                <p className="text-xl">No classes scheduled for today</p>
                <p className="text-gray-600 mt-2">
                  Check out upcoming classes below or browse all classes
                </p>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Classes</h2>
            {upcomingClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {upcomingClasses.map((yogaClass) => (
                  <ClassCard key={yogaClass.id} yogaClass={yogaClass} showJoin={false} />
                ))}
              </div>
            ) : (
              <div className="yoga-card bg-yoga-light-blue/30 text-center py-12">
                <p className="text-xl">No upcoming classes this week</p>
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
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
