import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, startOfWeek } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  ChevronLeft, 
  Clock, 
  Video, 
  Phone, 
  MessageCircle, 
  Calendar as CalendarIcon, 
  Check,
  CreditCard,
  Coins,
  Repeat
} from 'lucide-react';
import { useTeachers } from '@/contexts/TeacherContext';
import Layout from '@/components/Layout';
import LowCreditsDialog from '@/components/LowCreditsDialog';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TeacherBooking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTeacher, bookSession, userCredits } = useTeachers();
  
  const [teacher, setTeacher] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedSessionType, setSelectedSessionType] = useState<any>(null);
  const [isLowCreditsModalOpen, setIsLowCreditsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Recurring booking options
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [recurringEnd, setRecurringEnd] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  
  useEffect(() => {
    if (id) {
      const teacherData = getTeacher(id);
      if (teacherData) {
        setTeacher(teacherData);
        if (teacherData.sessionTypes && teacherData.sessionTypes.length > 0) {
          // Make sure sessionTypes are correctly formatted with credits
          const sessionTypes = teacherData.sessionTypes.map((type: any) => {
            return {
              ...type,
              credits: type.credits || type.price || 0
            };
          });
          setSelectedSessionType(sessionTypes[0]);
        }
      }
    }
  }, [id, getTeacher]);
  
  // Reset recurring booking when session type changes
  useEffect(() => {
    if (selectedSessionType && !selectedSessionType.allowRecurring) {
      setIsRecurring(false);
    }
  }, [selectedSessionType]);
  
  // When a date is selected, calculate available times based on teacher availability
  useEffect(() => {
    if (teacher && selectedDate) {
      const dayOfWeek = selectedDate.getDay();
      const dayName = dayNames[dayOfWeek].toLowerCase();
      
      // Find availability for this day (case-insensitive)
      const dayAvailability = teacher.availability.filter(
        (slot: any) => slot.day.toLowerCase() === dayName
      );
      
      // Generate time slots in 15-minute increments
      const times: string[] = [];
      
      dayAvailability.forEach((slot: any) => {
        // Check if slot has slots array or direct startTime/endTime properties
        if (slot.slots && Array.isArray(slot.slots)) {
          slot.slots.forEach((timeSlot: any) => {
            if (!timeSlot || !timeSlot.start || !timeSlot.end) return;
            
            let [startHour, startMinute] = timeSlot.start.split(':').map(Number);
            const [endHour, endMinute] = timeSlot.end.split(':').map(Number);
            
            if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) return;
            
            // Convert to minutes for easier calculation
            let currentTimeInMinutes = startHour * 60 + startMinute;
            const endTimeInMinutes = endHour * 60 + endMinute;
            
            // Generate 15-minute slots
            while (currentTimeInMinutes + 15 <= endTimeInMinutes) {
              const hours = Math.floor(currentTimeInMinutes / 60);
              const minutes = currentTimeInMinutes % 60;
              times.push(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
              );
              currentTimeInMinutes += 15;
            }
          });
        } else if (slot.startTime && slot.endTime) {
          // Direct startTime/endTime format
          let [startHour, startMinute] = slot.startTime.split(':').map(Number);
          const [endHour, endMinute] = slot.endTime.split(':').map(Number);
          
          if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) return;
          
          // Convert to minutes for easier calculation
          let currentTimeInMinutes = startHour * 60 + startMinute;
          const endTimeInMinutes = endHour * 60 + endMinute;
          
          // Generate 15-minute slots
          while (currentTimeInMinutes + 15 <= endTimeInMinutes) {
            const hours = Math.floor(currentTimeInMinutes / 60);
            const minutes = currentTimeInMinutes % 60;
            times.push(
              `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
            );
            currentTimeInMinutes += 15;
          }
        }
      });
      
      setAvailableTimes(times);
      setSelectedTime(null);
    }
  }, [teacher, selectedDate]);
  
  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  const handleSessionTypeSelect = (sessionType: any) => {
    setSelectedSessionType(sessionType);
  };
  
  const isBookingAllowed = () => {
    if (!selectedSessionType || !selectedDate || !selectedTime) return false;
    
    // Check if booking window is within allowed range
    const now = new Date();
    const bookingDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    bookingDate.setHours(hours, minutes, 0, 0);
    
    // Check if booking is too close to start time
    const minTimeBeforeBooking = selectedSessionType.bookingRestrictions?.minTimeBeforeBooking || 0;
    const minTimeBeforeBookingMs = minTimeBeforeBooking * 60 * 60 * 1000;
    if (bookingDate.getTime() - now.getTime() < minTimeBeforeBookingMs) {
      return false;
    }
    
    // Check if booking is too far in advance
    const maxAdvanceBookingDays = selectedSessionType.bookingRestrictions?.maxAdvanceBookingPeriod || 30;
    const maxAdvanceBookingMs = maxAdvanceBookingDays * 24 * 60 * 60 * 1000;
    if (bookingDate.getTime() - now.getTime() > maxAdvanceBookingMs) {
      return false;
    }
    
    return true;
  };
  
  const getBookingDisabledReason = () => {
    if (!selectedDate || !selectedTime || !selectedSessionType) {
      return "Please select a date, time, and session type";
    }
    
    const now = new Date();
    const bookingDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    bookingDate.setHours(hours, minutes, 0, 0);
    
    const minTimeBeforeBooking = selectedSessionType.bookingRestrictions?.minTimeBeforeBooking || 0;
    const minTimeBeforeBookingMs = minTimeBeforeBooking * 60 * 60 * 1000;
    
    if (bookingDate.getTime() - now.getTime() < minTimeBeforeBookingMs) {
      return `Booking must be made at least ${minTimeBeforeBooking} hours in advance`;
    }
    
    const maxAdvanceBookingDays = selectedSessionType.bookingRestrictions?.maxAdvanceBookingPeriod || 30;
    const maxAdvanceBookingMs = maxAdvanceBookingDays * 24 * 60 * 60 * 1000;
    
    if (bookingDate.getTime() - now.getTime() > maxAdvanceBookingMs) {
      return `Booking cannot be made more than ${maxAdvanceBookingDays} days in advance`;
    }
    
    return "";
  };

  const handleBookSession = () => {
    if (!isBookingAllowed()) {
      toast({
        title: "Unable to book",
        description: getBookingDisabledReason(),
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedSessionType.credits) {
      toast({
        title: "Session configuration error",
        description: "This session doesn't have credits configured properly.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedSessionType.credits > userCredits) {
      setIsLowCreditsModalOpen(true);
      return;
    }

    processBooking();
  };

  const processBooking = () => {
    if (isSubmitting) return; // Prevent double submission
    
    if (teacher && selectedDate && selectedTime && selectedSessionType) {
      setIsSubmitting(true);
      
      const bookingData = {
        teacherId: teacher.id,
        sessionType: selectedSessionType,
        date: selectedDate,
        time: selectedTime,
        isRecurring: isRecurring && selectedSessionType.allowRecurring,
        recurringPattern: isRecurring ? recurringPattern : undefined,
        recurringEnd: isRecurring ? recurringEnd : undefined
      };
      
      try {
        bookSession(bookingData);
        
        toast({
          title: "Session Booked!",
          description: `Your ${selectedSessionType.name} with ${teacher.name} is confirmed.`,
          duration: 5000
        });
        
        // Redirect to confirmation page
        navigate(`/booking/confirmation`);
      } catch (error) {
        console.error("Error booking session:", error);
        toast({
          title: "Booking Error",
          description: "Could not book the session. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  if (!teacher) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading teacher information...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate(`/teachers/${id}`)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Teacher Profile
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full overflow-hidden">
                <img 
                  src={teacher.avatarUrl} 
                  alt={teacher.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{teacher.name}</h1>
                <p className="text-gray-600">{teacher.shortBio || teacher.title}</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Select Session Type</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {teacher.sessionTypes.map((sessionType: any) => (
                  <div 
                    key={sessionType.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSessionType?.id === sessionType.id 
                        ? 'border-2 border-yoga-blue bg-yoga-light-blue/10' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleSessionTypeSelect(sessionType)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        {(sessionType.type === 'video' || !sessionType.type) && 
                          <Video className="h-5 w-5 text-yoga-blue" />
                        }
                        {sessionType.type === 'call' && 
                          <Phone className="h-5 w-5 text-yoga-blue" />
                        }
                        {sessionType.type === 'chat' && 
                          <MessageCircle className="h-5 w-5 text-yoga-blue" />
                        }
                        
                        <div>
                          <h3 className="font-medium">{sessionType.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <Clock size={14} />
                            <span>{sessionType.duration} minutes</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold flex items-center">
                          <Coins size={16} className="text-amber-500 mr-1" />
                          <span>{sessionType.credits || sessionType.price} credits</span>
                        </div>
                        {sessionType.allowRecurring && (
                          <div className="flex items-center text-xs text-gray-500 mt-1 justify-end">
                            <Repeat size={12} className="mr-1" />
                            <span>Recurring allowed</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedSessionType?.id === sessionType.id && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Check size={16} className="text-green-500 mr-1" />
                            <span className="text-green-500 text-sm">Selected</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Book {sessionType.bookingRestrictions?.minTimeBeforeBooking || 0}h+ in advance, up to {sessionType.bookingRestrictions?.maxAdvanceBookingPeriod || 30} days ahead
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Select Date & Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border shadow"
                      disabled={(date) => {
                        // Disable dates in the past
                        return date < new Date(new Date().setHours(0, 0, 0, 0));
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium mb-4">Available Times for {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : ''}</h3>
                    
                    {availableTimes.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <CalendarIcon className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-gray-500">
                          No available time slots for this date
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableTimes.map((time) => {
                          // Check if this time slot is available based on booking restrictions
                          const timeDate = new Date(selectedDate || new Date());
                          const [hours, minutes] = time.split(':').map(Number);
                          timeDate.setHours(hours, minutes, 0, 0);
                          
                          const now = new Date();
                          const minTimeMs = selectedSessionType?.bookingRestrictions?.minTimeBeforeBooking 
                            ? selectedSessionType.bookingRestrictions.minTimeBeforeBooking * 60 * 60 * 1000 
                            : 0;
                          
                          const isDisabled = timeDate.getTime() - now.getTime() < minTimeMs;
                          
                          return (
                            <button
                              key={time}
                              className={`py-2 px-1 sm:px-3 rounded-md text-center transition-colors text-sm ${
                                isDisabled
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : selectedTime === time
                                    ? 'bg-yoga-blue text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => !isDisabled && handleTimeSelect(time)}
                              disabled={isDisabled}
                            >
                              {formatTimeDisplay(time)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedSessionType?.allowRecurring && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Repeat className="h-5 w-5 text-yoga-blue" />
                        <h3 className="font-medium">Recurring Booking</h3>
                      </div>
                      <Switch 
                        checked={isRecurring}
                        onCheckedChange={setIsRecurring}
                      />
                    </div>
                    
                    {isRecurring && (
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Repeats</Label>
                            <Select
                              value={recurringPattern}
                              onValueChange={(value: "weekly" | "biweekly" | "monthly") => 
                                setRecurringPattern(value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select repeat pattern" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Until</Label>
                            <Calendar
                              mode="single"
                              selected={recurringEnd}
                              onSelect={setRecurringEnd}
                              className="rounded-md border shadow"
                              disabled={(date) => {
                                // Disable dates in the past and less than a week from now
                                const minDate = new Date();
                                minDate.setDate(minDate.getDate() + 7);
                                return date < minDate;
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="bg-yoga-light-blue/20 p-4 rounded-md">
                          <p className="text-sm text-yoga-blue">
                            You're scheduling a recurring {recurringPattern} session with {teacher.name} 
                            until {recurringEnd ? format(recurringEnd, 'MMMM d, yyyy') : 'unknown date'}.
                            Each occurrence will use {selectedSessionType?.credits || selectedSessionType?.price || 0} credits.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Session Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Session:</span>
                    <span className="font-medium">{selectedSessionType?.name || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">
                      {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium">
                      {selectedTime ? formatTimeDisplay(selectedTime) : 'Not selected'}
                    </span>
                  </div>
                  {isRecurring && selectedSessionType?.allowRecurring && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Repeats:</span>
                      <span className="font-medium">
                        {recurringPattern === 'weekly' ? 'Weekly' : 
                         recurringPattern === 'biweekly' ? 'Every 2 weeks' : 'Monthly'}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Coins size={16} className="mr-2 text-amber-500" /> 
                        <span className="font-medium">Credits Required:</span>
                      </div>
                      <Badge className="bg-amber-500">
                        {selectedSessionType?.credits || selectedSessionType?.price || '0'} credits
                      </Badge>
                    </div>
                    
                    {isRecurring && selectedSessionType?.allowRecurring && recurringEnd && (
                      <div className="mt-2 text-sm text-gray-500">
                        <p className="italic">
                          *Total for recurring sessions will be calculated at checkout
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="py-3 px-4 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Coins size={16} className="mr-2 text-indigo-500" />
                      <span className="font-medium">Your credits:</span>
                    </div>
                    <span className="font-bold">{userCredits}</span>
                  </div>
                  
                  {selectedSessionType && (
                    <>
                      {(selectedSessionType.credits || selectedSessionType.price) > userCredits ? (
                        <div className="mt-2 text-sm text-red-600">
                          You need {(selectedSessionType.credits || selectedSessionType.price) - userCredits} more credits for this session
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-green-600">
                          You have enough credits for this session
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  disabled={!isBookingAllowed() || isSubmitting}
                  onClick={handleBookSession}
                  title={!isBookingAllowed() ? getBookingDisabledReason() : ''}
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Book Session
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/pricing')}
                  disabled={isSubmitting}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Purchase Credits
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      <LowCreditsDialog
        open={isLowCreditsModalOpen}
        onOpenChange={setIsLowCreditsModalOpen}
        requiredCredits={selectedSessionType?.credits || selectedSessionType?.price || 0}
        onProceed={processBooking}
      />
    </Layout>
  );
};

export default TeacherBooking;
