import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { TeacherProvider } from './contexts/TeacherContext';
import Index from './pages/Index';
import Teachers from './pages/Teachers';
import TeacherProfile from './pages/TeacherProfile';
import TeacherBooking from './pages/TeacherBooking';
import BookingConfirmation from './pages/BookingConfirmation';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminTeachers from './pages/AdminTeachers';
import AdminCredits from './pages/AdminCredits';
import PaymentSuccess from './pages/payment-success';

function App() {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={null}>
      <TeacherProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<Index />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/:id" element={<TeacherProfile />} />
            <Route path="/teachers/:id/booking" element={<TeacherBooking />} />
            <Route path="/teachers/:id/booking/confirmation" element={<BookingConfirmation />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/teachers" element={<AdminTeachers />} />
            <Route path="/admin/credits" element={<AdminCredits />} />
			<Route path="/payment-success" element={<PaymentSuccess />} />
          </Routes>
        </BrowserRouter>
      </TeacherProvider>
    </SessionContextProvider>
  );
}

export default App;
