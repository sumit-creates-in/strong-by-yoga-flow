import React, { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { useTeachers } from '@/contexts/TeacherContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const UpcomingSessions = () => {
  const navigate = useNavigate();
  const { bookings, getTeacher, getUserBookings, cancelBooking, rescheduleBooking, joinSession } = useTeachers();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for reschedule dialog
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  
  // State for cancel confirmation dialog
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  // Filter for current user's upcoming sessions (not cancelled and date is in the future)
  const userBookings = user ? getUserBookings(user.id) : [];
  
  const upcomingBookings = userBookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    return bookingDate > now && booking.status !== 'cancelled';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Handle joining a session
  const handleJoinSession = (bookingId: string) => {
    const meetingUrl = joinSession(bookingId);
    if (meetingUrl) {
      // Open the meeting URL in a new window
      window.open(meetingUrl, '_blank');
      
      toast({
        title: 'Joining session',
        description: 'Opening Zoom meeting in a new window',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Could not join session',
        description: 'There was an error joining the session. Please try again.',
      });
    }
  };

  // Handle opening the reschedule dialog
  const handleOpenReschedule = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    
    // Get the booking's current date to prefill the form
    const booking = userBookings.find(b => b.id === bookingId);
    if (booking) {
      const bookingDate = new Date(booking.date);
      setNewDate(bookingDate.toISOString().split('T')[0]);
      setNewTime(booking.time);
    }
    
    setIsRescheduleDialogOpen(true);
  };

  // Handle submitting the reschedule
  const handleReschedule = () => {
    if (!selectedBookingId || !newDate || !newTime) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please select a new date and time.',
      });
      return;
    }
    
    // Parse the new date and time
    const rescheduledDate = new Date(newDate);
    
    // Call the reschedule function
    rescheduleBooking(selectedBookingId, rescheduledDate, newTime);
    
    // Close the dialog and show success message
    setIsRescheduleDialogOpen(false);
    setSelectedBookingId(null);
    
    toast({
      title: 'Session rescheduled',
      description: 'Your session has been successfully rescheduled.',
    });
  };

  // Handle opening the cancel confirmation dialog
  const handleOpenCancelDialog = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setIsCancelDialogOpen(true);
  };

  // Handle confirming the cancellation
  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      cancelBooking(bookingToCancel);
      setIsCancelDialogOpen(false);
      
      toast({
        title: 'Session cancelled',
        description: 'Your session has been cancelled and your credits have been refunded.',
      });
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Upcoming Sessions</h1>
            <p className="text-gray-600">Manage your scheduled yoga sessions</p>
          </div>
          <Button onClick={() => navigate('/teachers')}>
            Book New Session
          </Button>
        </div>

        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Upcoming Sessions</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any upcoming sessions scheduled.
                </p>
                <Button onClick={() => navigate('/teachers')}>
                  Browse Teachers
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => {
              const teacher = getTeacher(booking.teacherId);
              if (!teacher) return null;

              const bookingDate = new Date(booking.date);
              const [hours, minutes] = booking.time.split(':');
              bookingDate.setHours(parseInt(hours), parseInt(minutes));

              // Check if session is starting soon (within next hour)
              const isStartingSoon = bookingDate.getTime() - new Date().getTime() <= 60 * 60 * 1000;

              return (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={teacher.avatarUrl}
                            alt={teacher.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-medium">{teacher.name}</h3>
                            <p className="text-sm text-gray-600">{teacher.title}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{format(bookingDate, 'MMMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{format(bookingDate, 'h:mm a')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-gray-500" />
                            <span>{booking.sessionType.name}</span>
                          </div>
                          <div>
                            <Badge variant={isStartingSoon ? "destructive" : "secondary"}>
                              {isStartingSoon ? (
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Starting Soon</span>
                                </div>
                              ) : (
                                format(bookingDate, "'in' d 'days'")
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleJoinSession(booking.id)}
                        >
                          Join Session
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenReschedule(booking.id)}
                        >
                          Reschedule
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleOpenCancelDialog(booking.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              Select a new date and time for your session.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">New Date</label>
              <input
                id="date"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium">New Time</label>
              <input
                id="time"
                type="time"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReschedule}>Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this session? Your credits will be refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Session</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Yes, Cancel Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default UpcomingSessions; 