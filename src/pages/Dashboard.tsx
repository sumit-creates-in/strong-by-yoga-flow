
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Clock,
  ChevronRight,
  Play,
  Timer,
  Clock3,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeachers } from '@/contexts/TeacherContext';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

const Dashboard = () => {
  const auth = useAuth();
  const { bookings } = useTeachers();
  const { classes } = useYogaClasses();
  
  // Filter bookings to show only upcoming ones for this user
  const userBookings = bookings
    ? bookings
        .filter(
          (booking) => 
            booking.userId === auth.user?.id && 
            new Date(booking.date) >= new Date()
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  // Get only the next 3 bookings
  const upcomingBookings = userBookings.slice(0, 3);
  
  // Show only the first 4 classes
  const featuredClasses = classes ? classes.slice(0, 4) : [];

  // Get user's full name from profile
  const userName = auth.user?.profile ? 
    `${auth.user.profile.first_name || ''} ${auth.user.profile.last_name || ''}`.trim() : 
    '';

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">
          Welcome{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-gray-500">
          Here's an overview of your upcoming sessions and activities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="md:col-span-8 space-y-6">
          {/* Upcoming Bookings Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Upcoming Sessions</h2>
              <Link 
                to="/my-bookings" 
                className="text-yoga-blue flex items-center hover:underline"
              >
                View all <ChevronRight size={16} />
              </Link>
            </div>
            
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-start space-x-4 mb-3 md:mb-0">
                          <div className="w-12 h-12 rounded-full bg-yoga-blue/10 flex items-center justify-center text-yoga-blue">
                            <Users size={24} />
                          </div>
                          <div>
                            <h3 className="font-medium">1-on-1 Session</h3>
                            <p className="text-sm text-gray-500">With {booking.teacherId}</p>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Calendar size={14} className="mr-1" />
                              {format(new Date(booking.date), 'MMMM d, yyyy')} • 
                              <Clock size={14} className="ml-2 mr-1" />
                              {booking.time}
                            </div>
                          </div>
                        </div>
                        <Link to={`/booking-confirmation/${booking.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500 mb-4">
                    You don't have any upcoming sessions.
                  </p>
                  <Button asChild>
                    <Link to="/teachers">Book a Session</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
          
          {/* Featured Classes Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Featured Classes</h2>
              <Link 
                to="/classes" 
                className="text-yoga-blue flex items-center hover:underline"
              >
                View all <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredClasses.length > 0 ? (
                featuredClasses.map((yogaClass) => (
                  <Card key={yogaClass.id}>
                    <CardContent className="p-0">
                      <div className="aspect-video relative rounded-t-md overflow-hidden">
                        <img 
                          src={yogaClass.imageUrl || "/placeholder.svg"} 
                          alt={yogaClass.name || "Class"} 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Button 
                            size="icon" 
                            className="rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm"
                          >
                            <Play className="h-5 w-5 text-white" fill="white" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate">{yogaClass.name || "Yoga Class"}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock3 size={14} className="mr-1" />
                            <span>{yogaClass.duration || 60} min</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen size={14} className="mr-1" />
                            <span>All Levels</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-gray-50 border-dashed col-span-2">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">
                      No classes available at the moment.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>
        
        {/* Sidebar */}
        <div className="md:col-span-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Credits Available</p>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      0
                    </span>
                    <Link to="/pricing" className="ml-2 text-xs text-yoga-blue hover:underline">
                      Buy More
                    </Link>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
                  <p className="text-2xl font-bold">
                    {bookings ? bookings.filter(b => b.userId === auth.user?.id).length : 0}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Practice Hours</p>
                  <p className="text-2xl font-bold">
                    {bookings 
                      ? Math.round(bookings.filter(b => 
                          b.userId === auth.user?.id && 
                          new Date(b.date) <= new Date()
                        ).reduce((total, b) => total + ((b.sessionType?.duration || 60)/60), 0)
                      )
                      : 0}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link 
                    to="/teachers" 
                    className="text-yoga-blue hover:underline flex items-center"
                  >
                    <Users size={14} className="mr-2" />
                    Find a Teacher
                  </Link>
                  <Link 
                    to="/classes" 
                    className="text-yoga-blue hover:underline flex items-center"
                  >
                    <Play size={14} className="mr-2" />
                    Browse Classes
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-yoga-blue hover:underline flex items-center"
                  >
                    <Timer size={14} className="mr-2" />
                    Manage Your Profile
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
