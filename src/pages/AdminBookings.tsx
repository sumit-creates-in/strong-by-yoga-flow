import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { useTeachers, BookingData, SessionType } from '@/contexts/TeacherContext';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { CalendarIcon, Edit, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const AdminBookings = () => {
  const { bookings = [], teachers = [], getTeacher } = useTeachers();
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [allBookings, setAllBookings] = useState<BookingData[]>([]);
  const { toast } = useToast();
  
  // Replace mock data with users from database
  const [users, setUsers] = useState<any[]>([]);

  // Load bookings when component mounts
  useEffect(() => {
    setAllBookings(bookings);
  }, [bookings]);
  
  // Fetch users from database on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load users. Please try again later.'
        });
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  // Filter bookings based on status
  const upcomingBookings = allBookings.filter(booking => 
    booking.status === 'confirmed' && isAfter(new Date(booking.date), new Date())
  );
  
  const pastBookings = allBookings.filter(booking => 
    booking.status === 'completed' || 
    (booking.status === 'confirmed' && isBefore(new Date(booking.date), new Date()))
  );
  
  const cancelledBookings = allBookings.filter(booking => 
    booking.status === 'cancelled'
  );
  
  const handleBookForUser = () => {
    if (!selectedTeacherId || !selectedUserId || !selectedSessionType || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all booking details",
        variant: "destructive"
      });
      return;
    }
    
    const teacher = getTeacher(selectedTeacherId);
    if (!teacher) return;
    
    // Find the session type from the selected teacher
    const sessionType = teacher.sessionTypes && teacher.sessionTypes.find(s => s.id === selectedSessionType);
    if (!sessionType) return;
    
    // In a real app, this would book the session using the API
    toast({
      title: "Session booked",
      description: `Successfully booked a ${sessionType.name} with ${teacher.name} for the selected user.`
    });
    setIsBookDialogOpen(false);
  };
  
  const handleEditBooking = (booking: BookingData) => {
    setSelectedBooking(booking);
    setSelectedTeacherId(booking.teacherId);
    setSelectedSessionType(booking.sessionType.id);
    setSelectedUserId(booking.userId);
    setSelectedDate(new Date(booking.date));
    setSelectedTime(booking.time);
    setIsEditDialogOpen(true);
  };
  
  const handleSaveBookingChanges = () => {
    if (!selectedBooking || !selectedTeacherId || !selectedSessionType || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all booking details",
        variant: "destructive"
      });
      return;
    }
    
    const teacher = getTeacher(selectedTeacherId);
    if (!teacher) return;
    
    // Find the session type from the selected teacher
    const sessionType = teacher.sessionTypes && teacher.sessionTypes.find(s => s.id === selectedSessionType);
    if (!sessionType) return;
    
    // Update the booking in the local state
    const updatedBookings = allBookings.map(booking => {
      if (booking.id === selectedBooking.id) {
        return {
          ...booking,
          teacherId: selectedTeacherId,
          userId: selectedUserId,
          sessionType: sessionType,
          date: selectedDate,
          time: selectedTime
        };
      }
      return booking;
    });
    
    setAllBookings(updatedBookings);
    
    // In a real app, this would update the booking in the database
    toast({
      title: "Booking updated",
      description: "The booking has been successfully updated."
    });
    
    setIsEditDialogOpen(false);
  };
  
  const handleCancelBooking = (bookingId: string) => {
    // Update the booking status to cancelled
    const updatedBookings = allBookings.map(booking => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          status: 'cancelled' as const
        };
      }
      return booking;
    });
    
    setAllBookings(updatedBookings);
    
    // In a real app, this would update the booking in the database
    toast({
      title: "Booking cancelled",
      description: "The booking has been cancelled successfully."
    });
  };
  
  const getTeacherSessionTimes = (teacherId: string) => {
    const teacher = getTeacher(teacherId);
    if (!teacher) return [];
    
    // Generate time slots from 8 AM to 8 PM in 30-minute increments
    const timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        timeSlots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    
    return timeSlots;
  };
  
  const getAvailableSessionTypes = (teacherId: string) => {
    const teacher = getTeacher(teacherId);
    return teacher?.sessionTypes || [];
  };
  
  const renderBookingTable = (bookingsToDisplay: BookingData[], showActions = true) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Session Type</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookingsToDisplay.map((booking) => {
            const teacher = getTeacher(booking.teacherId);
            const user = users.find(u => u.id === booking.userId);
            const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown User';
            const userEmail = user?.email;
            
            return (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <div>{userName}</div>
                    {userEmail && <div className="text-xs text-gray-500">{userEmail}</div>}
                  </div>
                </TableCell>
                <TableCell>{teacher?.name || 'Unknown Teacher'}</TableCell>
                <TableCell>{booking.sessionType.name}</TableCell>
                <TableCell>
                  {booking.date instanceof Date ? 
                    format(booking.date, 'MMM d, yyyy') : 
                    format(new Date(booking.date), 'MMM d, yyyy')} at {booking.time}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditBooking(booking)}
                        className="flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <X size={14} />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
  
  return (
    <AdminGuard>
      <Layout>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Manage Bookings</h1>
              <p className="text-gray-500">View and manage all 1-on-1 session bookings</p>
            </div>
            <Button 
              onClick={() => setIsBookDialogOpen(true)}
              className="mt-4 md:mt-0"
            >
              Book Session for User
            </Button>
          </div>
          
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No upcoming bookings found</p>
                    </div>
                  ) : renderBookingTable(upcomingBookings)}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="past">
              <Card>
                <CardHeader>
                  <CardTitle>Past Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {pastBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No past bookings found</p>
                    </div>
                  ) : renderBookingTable(pastBookings, false)}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cancelled">
              <Card>
                <CardHeader>
                  <CardTitle>Cancelled Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {cancelledBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No cancelled bookings found</p>
                    </div>
                  ) : renderBookingTable(cancelledBookings, false)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Book Session Dialog */}
          <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Book Session for User</DialogTitle>
                <DialogDescription>
                  Create a new 1-on-1 session booking for a user
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="user">User</Label>
                  <select 
                    id="user"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <select 
                    id="teacher"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={selectedTeacherId}
                    onChange={(e) => {
                      setSelectedTeacherId(e.target.value);
                      setSelectedSessionType("");
                    }}
                  >
                    <option value="">Select a teacher</option>
                    {teachers && teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="sessionType">Session Type</Label>
                  <select 
                    id="sessionType"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={selectedSessionType}
                    onChange={(e) => setSelectedSessionType(e.target.value)}
                    disabled={!selectedTeacherId}
                  >
                    <option value="">Select a session type</option>
                    {getAvailableSessionTypes(selectedTeacherId).map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name} ({session.duration} min) - {session.credits || session.price} {session.credits ? 'credits' : '$'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <select
                    id="time"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!selectedTeacherId}
                  >
                    <option value="">Select a time</option>
                    {getTeacherSessionTimes(selectedTeacherId).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBookDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleBookForUser}>Book Session</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Edit Booking Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Booking</DialogTitle>
                <DialogDescription>
                  Update the details for this booking
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-user">User</Label>
                  <select 
                    id="edit-user"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-teacher">Teacher</Label>
                  <select 
                    id="edit-teacher"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={selectedTeacherId}
                    onChange={(e) => {
                      setSelectedTeacherId(e.target.value);
                      setSelectedSessionType("");
                    }}
                  >
                    <option value="">Select a teacher</option>
                    {teachers && teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-sessionType">Session Type</Label>
                  <select 
                    id="edit-sessionType"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={selectedSessionType}
                    onChange={(e) => setSelectedSessionType(e.target.value)}
                    disabled={!selectedTeacherId}
                  >
                    <option value="">Select a session type</option>
                    {getAvailableSessionTypes(selectedTeacherId).map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name} ({session.duration} min) - {session.credits || session.price} {session.credits ? 'credits' : '$'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-time">Time</Label>
                  <select
                    id="edit-time"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!selectedTeacherId}
                  >
                    <option value="">Select a time</option>
                    {getTeacherSessionTimes(selectedTeacherId).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveBookingChanges}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </AdminGuard>
  );
};

export default AdminBookings;
