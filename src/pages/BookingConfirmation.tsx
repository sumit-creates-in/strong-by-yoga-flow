import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, Video, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { useTeachers } from '@/contexts/TeacherContext';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { getBooking } = useTeachers();
  const booking = getBooking();

  if (!booking) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">No Booking Found</h2>
                <p className="text-gray-600 mb-6">
                  We couldn't find any recent booking information.
                </p>
                <Button onClick={() => navigate('/teachers')}>
                  Browse Teachers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Booking Confirmed!</h2>
                <p className="text-gray-600">Your session has been successfully booked</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Session Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">
                        {format(new Date(booking.date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{booking.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Session Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Video className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Session Type</p>
                      <p className="font-medium">{booking.sessionType.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {booking.sessionType.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-lg">🎓</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Credits Used</p>
                      <p className="font-medium">{booking.credits} credits</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/teachers')}
                  >
                    Book Another Session
                  </Button>
                  <Button
                    onClick={() => navigate('/upcoming-sessions')}
                  >
                    View My Sessions <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BookingConfirmation;
