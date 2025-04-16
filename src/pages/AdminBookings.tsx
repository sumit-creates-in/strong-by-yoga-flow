
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeachers } from '@/contexts/TeacherContext';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Search, 
  Calendar, 
  CircleDollarSign, 
  Clock, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  MessageCircle,
  Repeat,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminBookings = () => {
  const { bookings, getTeacher, teachers } = useTeachers();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Filter and sort bookings
  const filteredBookings = bookings.filter(booking => {
    const teacher = getTeacher(booking.teacherId);
    const matchesSearch = 
      teacher?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.sessionType.name.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'all' ||
      booking.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });
  
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'credits':
        comparison = a.sessionType.credits - b.sessionType.credits;
        break;
      case 'duration':
        comparison = a.sessionType.duration - b.sessionType.duration;
        break;
      case 'teacher':
        const teacherA = getTeacher(a.teacherId);
        const teacherB = getTeacher(b.teacherId);
        comparison = teacherA && teacherB ? 
          teacherA.name.localeCompare(teacherB.name) : 0;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleCancelBooking = (booking: any) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmCancel = () => {
    if (selectedBooking) {
      // In a real app, this would update the booking status in the DB
      toast({
        title: "Booking cancelled",
        description: `The booking has been cancelled and credits have been refunded.`
      });
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Status badge color based on booking status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  // Booking stats
  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(b => b.status === 'scheduled').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  
  // Calculate total credits used
  const totalCreditsUsed = bookings.reduce((sum, booking) => 
    sum + booking.sessionType.credits, 0);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Manage Bookings</h1>
            <p className="text-gray-600">
              Track and manage all 1-on-1 session bookings
            </p>
          </div>
        </div>
        
        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingBookings}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedBookings}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Credits Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalCreditsUsed}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input
              placeholder="Search by teacher or session type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="w-full md:w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Bookings table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="px-0 font-semibold flex items-center"
                    onClick={() => handleSort('teacher')}
                  >
                    Teacher
                    <ArrowUpDown size={16} className="ml-2" />
                  </Button>
                </TableHead>
                <TableHead>Session Type</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="px-0 font-semibold flex items-center"
                    onClick={() => handleSort('date')}
                  >
                    Date & Time
                    <ArrowUpDown size={16} className="ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="px-0 font-semibold flex items-center"
                    onClick={() => handleSort('duration')}
                  >
                    Duration
                    <ArrowUpDown size={16} className="ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="px-0 font-semibold flex items-center"
                    onClick={() => handleSort('credits')}
                  >
                    Credits
                    <ArrowUpDown size={16} className="ml-2" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBookings.length > 0 ? (
                sortedBookings.map((booking) => {
                  const teacher = getTeacher(booking.teacherId);
                  
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                            <img 
                              src={teacher?.avatarUrl || "/placeholder.svg"} 
                              alt={teacher?.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{teacher?.name}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          {booking.sessionType.name}
                          {booking.isRecurring && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Repeat size={14} className="mr-1" />
                              {booking.recurringPattern} until {booking.recurringEnd ? 
                                format(booking.recurringEnd, 'MMM d, yyyy') : 'N/A'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {format(booking.date, 'MMM d, yyyy')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {booking.time}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1 text-gray-500" />
                          <span>{booking.sessionType.duration} min</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center">
                          <CircleDollarSign size={16} className="mr-1 text-gray-500" />
                          <span>{booking.sessionType.credits}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusBadgeColor(booking.status)}>
                          {booking.status === 'scheduled' && 'Scheduled'}
                          {booking.status === 'completed' && 'Completed'}
                          {booking.status === 'cancelled' && 'Cancelled'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            
                            {booking.status === 'scheduled' && (
                              <>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2" size={14} />
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <CheckCircle2 className="mr-2" size={14} />
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCancelBooking(booking)}>
                                  <XCircle className="mr-2" size={14} />
                                  Cancel Booking
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {booking.status === 'completed' && (
                              <DropdownMenuItem>
                                <MessageCircle className="mr-2" size={14} />
                                Send Feedback Request
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem>
                              <MessageCircle className="mr-2" size={14} />
                              Message Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    {searchQuery || statusFilter !== 'all' ? 
                      'No bookings match your filters' : 
                      'No bookings have been made yet'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Cancel Booking Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? 
              This will refund the credits to the student's account.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-4 border-y">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Teacher:</span>
                  <span className="font-medium">{getTeacher(selectedBooking.teacherId)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Session:</span>
                  <span className="font-medium">{selectedBooking.sessionType.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Time:</span>
                  <span className="font-medium">
                    {format(selectedBooking.date, 'MMM d, yyyy')} at {selectedBooking.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Credits to refund:</span>
                  <span className="font-medium text-green-600">
                    {selectedBooking.sessionType.credits} credits
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-3 sm:justify-center">
            <DialogClose asChild>
              <Button variant="outline">Keep Booking</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmCancel}
            >
              <XCircle className="mr-2" size={16} />
              Cancel & Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminBookings;
