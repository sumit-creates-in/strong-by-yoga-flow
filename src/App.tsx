
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { YogaClassProvider } from "./contexts/YogaClassContext";
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
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <YogaClassProvider>
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
              
              {/* Admin Routes */}
              <Route path="/admin/classes" element={<AuthGuard><AdminClasses /></AuthGuard>} />
              <Route path="/admin/users" element={<AuthGuard><AdminUsers /></AuthGuard>} />
              
              {/* Redirects */}
              <Route path="/" element={<Index />} />
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </YogaClassProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
