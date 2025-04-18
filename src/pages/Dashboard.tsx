
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, 
  Users, 
  Bookmark, 
  Calendar, 
  CreditCard, 
  ArrowRight,
  Clock,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import { useTeachers } from '@/contexts/TeacherContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { classes } = useYogaClasses();
  const { userCredits, teachers, getUserBookings } = useTeachers();
  
  // Get upcoming bookings
  const userBookings = getUserBookings?.() || [];
  const upcomingBookings = userBookings.filter(booking => 
    booking.status === 'confirmed' && new Date(booking.date) >= new Date()
  ).slice(0, 3);
  
  // Mock data for recently watched classes
  const recentlyWatchedClasses = classes.slice(0, 3);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Welcome back, {currentUser?.displayName || 'Yogi'}</h1>
          <p className="text-gray-600">Your yoga journey continues. Here's what's happening.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 font-normal">Your Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-3xl font-bold">{userCredits}</span>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pricing">Buy More</Link>
                </Button>
              </div>
              <Progress value={70} className="h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 font-normal">Classes Completed</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-3xl font-bold">24</span>
              <PlayCircle size={32} className="text-yoga-blue" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 font-normal">1-on-1 Sessions</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-3xl font-bold">{userBookings.length}</span>
              <Users size={32} className="text-yoga-blue" />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming 1-on-1 Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming 1-on-1 Sessions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-bookings" className="flex items-center">
                  View All <ArrowRight className="ml-1" size={16} />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => {
                    const teacher = teachers.find(t => t.id === booking.teacherId);
                    return (
                      <div key={booking.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                        <CalendarDays className="text-yoga-blue mt-1" size={18} />
                        <div className="flex-grow">
                          <p className="font-medium">{booking.sessionType.name}</p>
                          <p className="text-sm text-gray-600">with {teacher?.name}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {new Date(booking.date).toLocaleDateString()} at {booking.time}
                          </div>
                        </div>
                        <Link to={`/my-bookings`}>
                          <Button variant="outline" size="sm">Details</Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500">No upcoming sessions</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link to="/teachers">Book a Session</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recently Watched */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recently Watched Classes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/classes" className="flex items-center">
                  View All <ArrowRight className="ml-1" size={16} />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentlyWatchedClasses.length > 0 ? (
                <div className="space-y-4">
                  {recentlyWatchedClasses.map((yogaClass) => (
                    <div key={yogaClass.id} className="flex items-start space-x-3">
                      <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={yogaClass.thumbnailUrl || "/placeholder.svg"} 
                          alt={yogaClass.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium line-clamp-1">{yogaClass.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {yogaClass.teacher}
                        </p>
                        <div className="flex items-center mt-1">
                          <Progress value={75} className="h-1 w-24 mr-2" />
                          <span className="text-xs text-gray-500">18:45 left</span>
                        </div>
                      </div>
                      <Link to={`/classes/${yogaClass.id}`}>
                        <Button variant="outline" size="sm">Continue</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <PlayCircle className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500">No recently watched classes</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link to="/classes">Browse Classes</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Access Buttons */}
          <Link to="/classes" className="flex-1">
            <Card className="hover:border-yoga-blue hover:shadow-md transition-all">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <PlayCircle size={36} className="text-yoga-blue mb-2" />
                <h3 className="font-medium">Browse Classes</h3>
                <p className="text-sm text-gray-500">Explore our library of yoga classes</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/teachers" className="flex-1">
            <Card className="hover:border-yoga-blue hover:shadow-md transition-all">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Users size={36} className="text-yoga-blue mb-2" />
                <h3 className="font-medium">Book 1-on-1 Sessions</h3>
                <p className="text-sm text-gray-500">Schedule time with our expert teachers</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/my-bookings" className="flex-1">
            <Card className="hover:border-yoga-blue hover:shadow-md transition-all">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <CalendarDays size={36} className="text-yoga-blue mb-2" />
                <h3 className="font-medium">Manage Bookings</h3>
                <p className="text-sm text-gray-500">View and manage your scheduled sessions</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
