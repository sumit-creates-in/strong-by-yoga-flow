import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useYogaClass } from '@/contexts/YogaClassContext';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const BookingConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { getBooking, booking } = useYogaClass();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      // Call getBooking with the bookingId parameter
      getBooking(bookingId);
    }
  }, [bookingId]);

  useEffect(() => {
    if (booking || !bookingId) {
      setIsLoading(false);
    }
  }, [booking, bookingId]);

  const handleDashboardNavigation = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return <div className="text-center">Loading booking confirmation...</div>;
  }

  if (!booking) {
    return <div className="text-center">Booking not found.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-yoga-light-yellow p-4">
      <div className="w-full max-w-md yoga-card">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-yoga-blue">Booking Confirmed!</h1>
          <p className="text-gray-600">Your session is successfully booked.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-500" size={20} />
            <span className="font-semibold">Date:</span>
            <span>{new Date(booking.date).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold">Time:</span>
            <span>{booking.time}</span>
          </div>

          {booking.teacher && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Teacher:</span>
              <span>{booking.teacher.name}</span>
            </div>
          )}

          {booking.yogaClass && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Class:</span>
              <span>{booking.yogaClass.name}</span>
            </div>
          )}

          {currentUser && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Student:</span>
              <span>{currentUser.name || 'Guest'}</span>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button className="yoga-button w-full" onClick={handleDashboardNavigation}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
