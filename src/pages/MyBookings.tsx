
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronRight,
  Search
} from 'lucide-react';
import { format, isAfter, parseISO, addDays } from 'date-fns';
import Layout from '@/components/Layout';
import { useTeachers, BookingData } from '@/contexts/TeacherContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const MyBookings = () => {
  const navigate = useNavigate();
  const { getUserBookings, getTeacher, cancelBooking, rescheduleBooking } = useTeachers();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  
  const bookings = getUserBookings?.() || [];
  
  // Generate available dates for rescheduling (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEEE, MMMM d, yyyy')
    };
  });
  
  // Generate available times for rescheduling
  const availableTimes = [
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' }
  ];
  
  const getSessionTypeIcon = (type: string | undefined) => {
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
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return null;
    }
  };
  
  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  const isUpcoming = (booking: BookingData) => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(
      parseInt(booking.time.split(':')[0]), 
      parseInt(booking.time.split(':')[1])
    );
    return isAfter(bookingDate, new Date()) && booking.status === 'confirmed';
  };
  
  const isPast = (booking: BookingData) => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(
      parseInt(booking.time.split(':')[0]), 
      parseInt(booking.time.split(':')[1])
    );
    return !isAfter(bookingDate, new Date()) || booking.status !== 'confirmed';
  };
  
  const handleCancelBooking = () => {
    if (selectedBooking && cancelBooking) {
      cancelBooking(selectedBooking.id);
      setCancelDialogOpen(false);
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled and your credits have been refunded."
      });
    }
  };
  
  const handleRescheduleBooking = () => {
    if (selectedBooking && rescheduleBooking && newDate && newTime) {
      rescheduleBooking(selectedBooking.id, new Date(newDate), newTime);
      setRescheduleDialogOpen(false);
      toast({
        title: "Booking rescheduled",
        description: "Your booking has been successfully rescheduled."
      });
    }
  };
  
  const openCancelDialog = (booking: BookingData) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };
  
  const openRescheduleDialog = (booking: BookingData) => {
    setSelectedBooking(booking);
    setRescheduleDialogOpen(true);
  };
  
  // Filter bookings based on search query
  const filteredBookings = bookings.filter(booking => {
    const teacher = getTeacher?.(booking.teacherId);
    const searchLower = searchQuery.toLowerCase();
    return (
      teacher?.name.toLowerCase().includes(searchLower) ||
      booking.sessionType.name.toLowerCase().includes(searchLower)
    );
  });
  
  const upcomingBookings = filteredBookings.filter(isUpcoming);
  const pastBookings = filteredBookings.filter(isPast);
  
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Bookings</h1>
            <p className="text-gray-600">Manage your 1-on-1 sessions with yoga teachers</p>
          </div>
          
          <Button 
            onClick={() => navigate('/teachers')}
            className="bg-yoga-blue hover:bg-yoga-blue/90"
          >
            Book New Session
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <Input
            placeholder="Search by teacher or session name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past & Cancelled ({pastBookings.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {upcomingBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingBookings.map((booking) => {
                  const teacher = getTeacher?.(booking.teacherId);
                  return (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardHeader className="p-6 pb-4 flex flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img 
                            src={teacher?.avatarUrl || "/placeholder.svg"} 
                            alt={teacher?.name || 'Teacher'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{teacher?.name}</CardTitle>
                          <p className="text-sm text-gray-500">{teacher?.title}</p>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6 pt-2 pb-4">
                        <div className="flex items-center mb-4">
                          {getSessionTypeIcon(booking.sessionType.type)}
                          <span className="font-medium">{booking.sessionType.name}</span>
                          <span className="ml-auto">{booking.sessionType.duration} mins</span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Calendar className="mr-2 text-gray-500" size={18} />
                            <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="mr-2 text-gray-500" size={18} />
                            <span>{formatTimeDisplay(booking.time)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 text-green-500" size={18} />
                            <span className="text-green-700">Session Confirmed</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-4 bg-gray-50 flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => openRescheduleDialog(booking)}
                        >
                          <CalendarIcon size={16} className="mr-1" />
                          Reschedule
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          onClick={() => openCancelDialog(booking)}
                        >
                          <XCircle size={16} className="mr-1" />
                          Cancel
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <CalendarIcon className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-medium mb-2">No upcoming bookings</h3>
                <p className="text-gray-600 mb-6">You don't have any upcoming sessions scheduled.</p>
                <Button 
                  onClick={() => navigate('/teachers')}
                  className="bg-yoga-blue hover:bg-yoga-blue/90"
                >
                  Book a Session
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {pastBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastBookings.map((booking) => {
                  const teacher = getTeacher?.(booking.teacherId);
                  return (
                    <Card key={booking.id} className="overflow-hidden opacity-75">
                      <CardHeader className="p-6 pb-4 flex flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img 
                            src={teacher?.avatarUrl || "/placeholder.svg"} 
                            alt={teacher?.name || 'Teacher'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-row justify-between w-full items-center">
                          <div>
                            <CardTitle className="text-lg">{teacher?.name}</CardTitle>
                            <p className="text-sm text-gray-500">{teacher?.title}</p>
                          </div>
                          <div>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6 pt-2 pb-4">
                        <div className="flex items-center mb-4">
                          {getSessionTypeIcon(booking.sessionType.type)}
                          <span className="font-medium">{booking.sessionType.name}</span>
                          <span className="ml-auto">{booking.sessionType.duration} mins</span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Calendar className="mr-2 text-gray-500" size={18} />
                            <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="mr-2 text-gray-500" size={18} />
                            <span>{formatTimeDisplay(booking.time)}</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      {booking.status === 'completed' && (
                        <CardFooter className="p-4 bg-gray-50 flex justify-center">
                          <Button variant="outline">
                            Leave Feedback
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-medium mb-2">No past bookings</h3>
                <p className="text-gray-600">You don't have any past or cancelled sessions.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? Your credits will be refunded to your account.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center mb-2">
                  {getSessionTypeIcon(selectedBooking.sessionType.type)}
                  <span className="font-medium">{selectedBooking.sessionType.name}</span>
                </div>
                
                <div className="flex items-center mb-2">
                  <Calendar className="mr-2 text-gray-500" size={16} />
                  <span>{format(new Date(selectedBooking.date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="mr-2 text-gray-500" size={16} />
                  <span>{formatTimeDisplay(selectedBooking.time)}</span>
                </div>
              </div>
              
              <p className="text-amber-600 flex items-center">
                <AlertCircle className="mr-2" size={16} />
                Cancellations must be made at least {selectedBooking.sessionType.bookingRestrictions.minTimeBeforeCancelling} hours in advance.
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Keep Booking</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reschedule Booking Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              Select a new date and time for your session.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-4 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center mb-2">
                  {getSessionTypeIcon(selectedBooking.sessionType.type)}
                  <span className="font-medium">{selectedBooking.sessionType.name}</span>
                </div>
                
                <div className="flex items-center mb-2">
                  <Calendar className="mr-2 text-gray-500" size={16} />
                  <span className="line-through">{format(new Date(selectedBooking.date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="mr-2 text-gray-500" size={16} />
                  <span className="line-through">{formatTimeDisplay(selectedBooking.time)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select New Date
                  </label>
                  <Select
                    value={newDate}
                    onValueChange={setNewDate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a date" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.map(date => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select New Time
                  </label>
                  <Select
                    value={newTime}
                    onValueChange={setNewTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map(time => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <p className="text-amber-600 flex items-center text-sm">
                <AlertCircle className="mr-2" size={16} />
                Reschedule requests must be made at least {selectedBooking.sessionType.bookingRestrictions.minTimeBeforeRescheduling} hours before the original session.
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleRescheduleBooking}
              disabled={!newDate || !newTime}
              className="bg-yoga-blue hover:bg-yoga-blue/90"
            >
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MyBookings;
