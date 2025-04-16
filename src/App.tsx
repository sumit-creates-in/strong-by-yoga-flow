
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { YogaClassProvider } from "./contexts/YogaClassContext";
import { TeacherProvider } from "./contexts/TeacherContext";
import AuthGuard from "./components/AuthGuard";

// Pages
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import ClassDetail from "./pages/ClassDetail";
import Profile from "./pages/Profile";
import AdminClasses from "./pages/AdminClasses";
import AdminUsers from "./pages/AdminUsers";
import AdminTeachers from "./pages/AdminTeachers";
import AdminZoomSettings from "./pages/AdminZoomSettings";
import AdminCredits from "./pages/AdminCredits";
import AdminBookings from "./pages/AdminBookings";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import TeachersList from "./pages/TeachersList";
import TeacherDetail from "./pages/TeacherDetail";
import TeacherBooking from "./pages/TeacherBooking";
import BookingConfirmation from "./pages/BookingConfirmation";
import TeacherLearn from "./pages/TeacherLearn";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <YogaClassProvider>
          <TeacherProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/classes" element={<AuthGuard><Classes /></AuthGuard>} />
              <Route path="/classes/:id" element={<AuthGuard><ClassDetail /></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
              <Route path="/pricing" element={<AuthGuard><Pricing /></AuthGuard>} />
              
              {/* Teacher Routes */}
              <Route path="/teachers" element={<AuthGuard><TeachersList /></AuthGuard>} />
              <Route path="/teachers/:id" element={<AuthGuard><TeacherDetail /></AuthGuard>} />
              <Route path="/teachers/:id/book" element={<AuthGuard><TeacherBooking /></AuthGuard>} />
              <Route path="/teachers/:id/booking/confirmation" element={<AuthGuard><BookingConfirmation /></AuthGuard>} />
              <Route path="/teachers/learn" element={<AuthGuard><TeacherLearn /></AuthGuard>} />
              
              {/* Admin Routes */}
              <Route path="/admin/classes" element={<AuthGuard><AdminClasses /></AuthGuard>} />
              <Route path="/admin/bookings" element={<AuthGuard><AdminBookings /></AuthGuard>} />
              <Route path="/admin/users" element={<AuthGuard><AdminUsers /></AuthGuard>} />
              <Route path="/admin/teachers" element={<AuthGuard><AdminTeachers /></AuthGuard>} />
              <Route path="/admin/zoom-settings" element={<AuthGuard><AdminZoomSettings /></AuthGuard>} />
              <Route path="/admin/credits" element={<AuthGuard><AdminCredits /></AuthGuard>} />
              
              {/* Redirects */}
              <Route path="/" element={<Index />} />
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TeacherProvider>
        </YogaClassProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
