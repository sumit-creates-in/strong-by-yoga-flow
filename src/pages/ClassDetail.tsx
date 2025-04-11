
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, Users, UserCheck, ChevronLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const ClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getClass, joinClass } = useYogaClasses();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const yogaClass = getClass(id || '');
  
  if (!yogaClass) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Class not found</h1>
          <p className="text-gray-600 mb-6">
            The class you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/classes')} className="yoga-button">
            Browse All Classes
          </Button>
        </div>
      </Layout>
    );
  }
  
  const isClassInFuture = new Date() <= new Date(yogaClass.date);
  const formattedDate = format(new Date(yogaClass.date), 'EEEE, MMMM d, yyyy');
  const formattedTime = format(new Date(yogaClass.date), 'h:mm a');
  const endTime = format(
    new Date(new Date(yogaClass.date).getTime() + yogaClass.duration * 60000),
    'h:mm a'
  );
  
  const handleJoinClass = () => {
    if (!isClassInFuture) {
      toast({
        variant: 'destructive',
        title: 'Cannot join class',
        description: 'This class has already ended.',
      });
      return;
    }
    
    joinClass(yogaClass.id);
    
    // In a real app, this would open the video conferencing link
    window.open(yogaClass.joinLink, '_blank');
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="flex items-center text-yoga-blue mb-6"
          onClick={() => navigate('/classes')}
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Classes
        </Button>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-grow">
            <Card className="yoga-card">
              <CardContent className="pt-6">
                <h1 className="text-3xl font-bold mb-6">{yogaClass.name}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">When</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-700">
                        <Calendar size={18} className="mr-2 text-yoga-blue" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Clock size={18} className="mr-2 text-yoga-blue" />
                        <span>
                          {formattedTime} - {endTime} ({yogaClass.duration} minutes)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Participants</h3>
                    <div className="flex items-center text-gray-700">
                      <Users size={18} className="mr-2 text-yoga-blue" />
                      <span>
                        {yogaClass.currentParticipants}{' '}
                        {yogaClass.maxParticipants && (
                          <>/ {yogaClass.maxParticipants} participants</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Teacher</h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-yoga-light-blue flex items-center justify-center text-yoga-blue font-bold text-xl mr-3">
                      {yogaClass.teacher[0]}
                    </div>
                    <div>
                      <div className="font-medium">{yogaClass.teacher}</div>
                      <div className="text-gray-600 text-sm">Yoga Instructor</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Class Type</h3>
                  <div className="flex flex-wrap">
                    {yogaClass.tags.map((tag) => (
                      <span key={tag} className="yoga-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {yogaClass.description}
                  </p>
                </div>
                
                {isClassInFuture && (
                  <Button 
                    onClick={handleJoinClass} 
                    className="yoga-button w-full md:w-auto"
                    disabled={!isClassInFuture}
                  >
                    <UserCheck size={20} className="mr-2" />
                    Join Now
                  </Button>
                )}
                
                {!isClassInFuture && (
                  <div className="bg-gray-100 p-4 rounded-lg text-gray-700">
                    This class has already ended and is no longer available to join.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full lg:w-1/3">
            <Card className="yoga-card">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Preparation Tips</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <div className="bg-yoga-light-blue rounded-full p-1 text-yoga-blue mr-2 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>Join 5-10 minutes before the class starts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-yoga-light-blue rounded-full p-1 text-yoga-blue mr-2 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>Prepare your mat and props in advance</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-yoga-light-blue rounded-full p-1 text-yoga-blue mr-2 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>Wear comfortable clothing</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-yoga-light-blue rounded-full p-1 text-yoga-blue mr-2 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>Have water nearby</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-yoga-light-blue rounded-full p-1 text-yoga-blue mr-2 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>Find a quiet space with good internet connection</span>
                  </li>
                </ul>
                
                <div className="mt-6 pt-6 border-t border-yoga-light-blue">
                  <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
                  <p className="text-gray-700 mb-4">
                    Having trouble joining the class or have questions?
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-yoga-blue text-yoga-blue hover:bg-yoga-blue hover:text-white"
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClassDetail;
