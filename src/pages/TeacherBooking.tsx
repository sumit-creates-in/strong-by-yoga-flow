
import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  Video,
  Phone,
  MessageCircle,
  Check
} from 'lucide-react';
import { format, addDays, startOfDay, isEqual } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { useTeachers } from '@/contexts/TeacherContext';
import { useToast } from '@/components/ui/use-toast';

const TeacherBooking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sessionTypeId = searchParams.get('type');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTeacher, bookSession } = useTeachers();
  const teacher = getTeacher(id || '');
  
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState(
    sessionTypeId ? 
    teacher?.sessionTypes.find(s => s.id === sessionTypeId) || teacher?.sessionTypes[0] : 
    teacher?.sessionTypes[0]
  );
  
  // Generate date range for the next 7 days
  const dateRange = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i));
  
  // Mock available times
  const availableTimes = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];
  
  if (!teacher) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Teacher not found</h2>
          <Button onClick={() => navigate('/teachers')}>Back to Teachers</Button>
        </div>
      </Layout>
    );
  }
  
  const handleBookSession = () => {
    if (!selectedSessionType || !selectedDate || !selectedTime) {
      toast({
        title: "Booking Error",
        description: "Please select a session type, date and time",
        variant: "destructive"
      });
      return;
    }
    
    bookSession({
      teacherId: teacher.id,
      sessionType: selectedSessionType,
      date: selectedDate,
      time: selectedTime
    });
    
    // Navigate to confirmation page
    navigate(`/teachers/${teacher.id}/booking/confirmation`);
  };
  
  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="mr-2" size={18} />;
      case 'call':
        return <Phone className="mr-2" size={18} />;
      case 'chat':
        return <MessageCircle className="mr-2" size={18} />;
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="mb-4 pl-0"
          onClick={() => navigate(`/teachers/${teacher.id}`)}
        >
          <ChevronLeft className="mr-1" size={18} />
          Back to {teacher.name}'s profile
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Booking */}
          <div className="md:col-span-2 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold">Book a session with {teacher.name}</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Select Session Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {teacher.sessionTypes.map((session) => (
                    <Button
                      key={session.id}
                      variant={selectedSessionType?.id === session.id ? "default" : "outline"}
                      className={`w-full justify-start h-auto py-3 px-4 ${
                        selectedSessionType?.id === session.id ? "bg-yoga-blue" : ""
                      }`}
                      onClick={() => setSelectedSessionType(session)}
                    >
                      <div className="flex-1 text-left">
                        <div className="flex items-start mb-1">
                          {getSessionTypeIcon(session.type)}
                          <span className="font-medium">{session.name}</span>
                          {selectedSessionType?.id === session.id && (
                            <Check className="ml-auto" size={18} />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-gray-500">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            <span className="text-sm">{session.duration} mins</span>
                          </div>
                          <span className="font-medium">${session.price}</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(addDays(currentDate, -7))}
                    disabled={isEqual(startOfDay(currentDate), startOfDay(new Date()))}
                  >
                    <ChevronLeft size={16} />
                    Previous week
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(addDays(currentDate, 7))}
                  >
                    Next week
                    <ChevronRight size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {dateRange.map((date) => {
                    const dayStr = format(date, 'EEE');
                    const dayNum = format(date, 'd');
                    const isSelected = isEqual(date, selectedDate);
                    const isToday = isEqual(date, startOfDay(new Date()));
                    
                    return (
                      <Button
                        key={dayNum}
                        variant={isSelected ? "default" : "outline"}
                        className={`
                          h-auto flex flex-col py-2
                          ${isSelected ? "bg-yoga-blue" : ""}
                          ${isToday && !isSelected ? "border-yoga-blue text-yoga-blue" : ""}
                        `}
                        onClick={() => setSelectedDate(date)}
                      >
                        <span className="text-xs">{dayStr}</span>
                        <span className="text-lg font-bold">{dayNum}</span>
                      </Button>
                    );
                  })}
                </div>
                
                <CardTitle className="mb-4">Select Time</CardTitle>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      className={selectedTime === time ? "bg-yoga-blue" : ""}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img 
                      src={teacher.avatarUrl || "/placeholder.svg"} 
                      alt={teacher.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{teacher.name}</h3>
                    <Badge className="mt-1 bg-pink-500">Yoga Therapist</Badge>
                  </div>
                </div>
                
                <div className="border-t border-b border-gray-200 py-4 space-y-3">
                  {selectedSessionType && (
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        {getSessionTypeIcon(selectedSessionType.type)}
                        <span>{selectedSessionType.name}</span>
                      </div>
                      <span className="font-medium">${selectedSessionType.price}</span>
                    </div>
                  )}
                  
                  {selectedDate && (
                    <div className="flex items-center">
                      <Calendar className="mr-2" size={18} />
                      <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  {selectedTime && (
                    <div className="flex items-center">
                      <Clock className="mr-2" size={18} />
                      <span>{selectedTime}</span>
                    </div>
                  )}
                </div>
                
                {selectedSessionType && (
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${selectedSessionType.price}</span>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={!selectedSessionType || !selectedDate || !selectedTime}
                  onClick={handleBookSession}
                >
                  Book Session
                </Button>
                
                <p className="text-gray-500 text-sm text-center">
                  You won't be charged yet. Payment will be processed after your session is confirmed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherBooking;
