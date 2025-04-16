
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { useTeachers, BookingData, SessionType } from '@/contexts/TeacherContext';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminBookings = () => {
  const { bookings, teachers, getTeacher } = useTeachers();
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const { toast } = useToast();
  
  // Mock users data
  const mockUsers = [
    { id: 'user1', name: 'John Doe', email: 'john@example.com' },
    { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: 'user3', name: 'Robert Johnson', email: 'robert@example.com' },
  ];
  
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
    
    const sessionType = teacher.sessionTypes.find(s => s.id === selectedSessionType);
    if (!sessionType) return;
    
    // In a real app, this would book the session using the API
    toast({
      title: "Session booked",
      description: `Successfully booked a ${sessionType.name} with ${teacher.name} for the selected user.`
    });
    setIsBookDialogOpen(false);
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
                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No upcoming bookings found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Session Type</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking) => {
                            const teacher = getTeacher(booking.teacherId);
                            return (
                              <TableRow key={booking.id}>
                                <TableCell>John Doe</TableCell>
                                <TableCell>{teacher?.name || 'Unknown Teacher'}</TableCell>
                                <TableCell>{booking.sessionType.name}</TableCell>
                                <TableCell>
                                  {format(booking.date, 'MMM d, yyyy')} at {booking.time}
                                </TableCell>
                                <TableCell>
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {booking.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">Reschedule</Button>
                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                      Cancel
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="past">
              <Card>
                <CardHeader>
                  <CardTitle>Past Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500">No past bookings found</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cancelled">
              <Card>
                <CardHeader>
                  <CardTitle>Cancelled Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500">No cancelled bookings found</p>
                  </div>
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
                    {mockUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
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
                    {teachers.map((teacher) => (
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
                        {session.name} ({session.duration} min) - {session.credits} credits
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
        </div>
      </Layout>
    </AdminGuard>
  );
};

export default AdminBookings;
