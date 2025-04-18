
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import TeachersList from './pages/TeachersList';
import TeacherDetail from './pages/TeacherDetail';
import TeacherBooking from './pages/TeacherBooking';
import BookingConfirmation from './pages/BookingConfirmation';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import TeacherLearn from './pages/TeacherLearn';
import Pricing from './pages/Pricing';
import MyBookings from './pages/MyBookings'; // Add this import
import AdminTeachers from './pages/AdminTeachers';
import AdminClasses from './pages/AdminClasses';
import AdminUsers from './pages/AdminUsers';
import AdminBookings from './pages/AdminBookings';
import AdminCredits from './pages/AdminCredits';
import AdminNotifications from './pages/AdminNotifications';
import AdminZoomSettings from './pages/AdminZoomSettings';
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import { TeacherProvider } from './contexts/TeacherContext';
import { YogaClassProvider } from './contexts/YogaClassContext';

function App() {
  return (
    <Router>
      <TeacherProvider>
        <YogaClassProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:id" element={<ClassDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/teachers" element={<TeachersList />} />
            <Route path="/teachers/:id" element={<TeacherDetail />} />
            <Route path="/teachers/:id/book" element={<TeacherBooking />} />
            <Route path="/teachers/learn" element={<TeacherLearn />} />
            <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-bookings" element={<MyBookings />} /> {/* Add this route */}
            </Route>
            
            {/* Admin Routes */}
            <Route element={<AdminGuard />}>
              <Route path="/admin/teachers" element={<AdminTeachers />} />
              <Route path="/admin/classes" element={<AdminClasses />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/credits" element={<AdminCredits />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/zoom" element={<AdminZoomSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </YogaClassProvider>
      </TeacherProvider>
    </Router>
  );
}

export default App;
