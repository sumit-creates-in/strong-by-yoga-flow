import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  Video,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useTeachers } from '@/contexts/TeacherContext';
import { format } from 'date-fns';

const BookingConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTeacher, getBooking } = useTeachers();
  
  const booking = getBooking();
  const teacher = booking ? getTeacher(booking.teacherId) : null;

  useEffect(() => {
    // If no booking is found, redirect to teachers page
    if (!booking) {
      setTimeout(() => {
        navigate('/teachers');
      }, 2000);
    }
  }, [booking, navigate]);
  
  if (!booking || !teacher) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
          <p className="mb-4">Redirecting you to the teachers page...</p>
          <Button onClick={() => navigate('/teachers')}>Back to Teachers</Button>
        </div>
      </Layout>
    );
  }
  
  const getSessionTypeIcon = (type: any) => {
    if (!type) return <Video className="mr-2" size={20} />;
    
    switch (type) {
      case 'video':
        return <Video className="mr-2" size={20} />;
      case 'call':
        return <Phone className="mr-2" size={20} />;
      case 'chat':
        return <MessageCircle className="mr-2" size={20} />;
      default:
        return <Video className="mr-2" size={20} />;
    }
  };
  
  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your session with {teacher.name} has been scheduled.
          </p>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4 mb-4 sm:mb-0">
                <img 
                  src={teacher.avatarUrl || "/placeholder.svg"} 
                  alt={teacher.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{teacher.name}</h3>
                <p className="text-gray-500">{teacher.title}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                {getSessionTypeIcon(booking.sessionType.type)}
                <span className="font-medium">{booking.sessionType.name}</span>
                <span className="ml-auto">{booking.sessionType.duration} mins</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="mr-2 text-yoga-blue" size={20} />
                <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="mr-2 text-yoga-blue" size={20} />
                <span>{formatTimeDisplay(booking.time)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
            
            <div className="space-y-4">
              <div className="flex">
                <div className="bg-yoga-blue/10 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="font-semibold text-yoga-blue">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Check your email</h3>
                  <p className="text-gray-600">
                    We've sent a confirmation email with all session details. 
                    If you don't see it, check your spam folder.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="bg-yoga-blue/10 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="font-semibold text-yoga-blue">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Prepare for your session</h3>
                  <p className="text-gray-600">
                    Find a quiet, comfortable space. Have your yoga mat ready 
                    and wear comfortable clothing.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="bg-yoga-blue/10 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="font-semibold text-yoga-blue">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Join your session</h3>
                  <p className="text-gray-600">
                    {booking.sessionType.type === 'video' && 
                      "Click the link in the email to join your video session 5 minutes before start time."}
                    {booking.sessionType.type === 'call' && 
                      "You'll receive a call from your teacher at the scheduled time."}
                    {booking.sessionType.type === 'chat' && 
                      "Open the chat window from the link in your email at the scheduled time."}
                    {!booking.sessionType.type &&
                      "Click the link in the email to join your session 5 minutes before start time."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="flex-1 bg-yoga-blue"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/teachers')}
          >
            Book another session
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default BookingConfirmation;
