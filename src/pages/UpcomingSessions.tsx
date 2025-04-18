import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { useTeachers } from '@/contexts/TeacherContext';
import { useAuth } from '@/contexts/AuthContext';

const UpcomingSessions = () => {
  const navigate = useNavigate();
  const { bookings, getTeacher, getUserBookings } = useTeachers();
  const { user } = useAuth();

  // Filter for current user's upcoming sessions (not cancelled and date is in the future)
  const userBookings = user ? getUserBookings(user.id) : [];
  
  const upcomingBookings = userBookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    return bookingDate > now && booking.status !== 'cancelled';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
                        <Button variant="outline" size="sm">
                          Join Session
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
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
    </Layout>
  );
};

export default UpcomingSessions; 