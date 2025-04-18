
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { TeacherProvider } from './contexts/TeacherContext';
import { supabase } from './integrations/supabase/client';
import Index from './pages/Index';
import TeachersList from './pages/TeachersList';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookingConfirmation from './pages/BookingConfirmation';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import PaymentSuccess from './pages/payment-success';
import NotFound from './pages/NotFound';
import TeacherDetail from './pages/TeacherDetail';
import TeacherBooking from './pages/TeacherBooking';

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={null}>
      <TeacherProvider>
        <Routes>
          <Route index element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teachers" element={<TeachersList />} />
          <Route path="/teachers/:id" element={<TeacherDetail />} />
          <Route path="/teachers/:id/booking" element={<TeacherBooking />} />
          <Route path="/teachers/:id/booking/confirmation" element={<BookingConfirmation />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TeacherProvider>
    </SessionContextProvider>
  );
}

export default App;
