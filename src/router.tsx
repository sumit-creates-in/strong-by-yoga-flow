
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Teachers from '@/pages/Teachers';
import TeacherProfile from '@/pages/TeacherProfile';
import BookingConfirmation from '@/pages/BookingConfirmation';
import AdminTeachers from '@/pages/AdminTeachers';
import AdminNotifications from '@/pages/AdminNotifications';
import AdminUsers from '@/pages/AdminUsers';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />
  },
  {
    path: '/profile',
    element: <Profile />
  },
  {
    path: '/teachers',
    element: <Teachers />
  },
  {
    path: '/teachers/:id',
    element: <TeacherProfile />
  },
  {
    path: '/booking-confirmation',
    element: <BookingConfirmation />
  },
  {
    path: '/admin/teachers',
    element: <AdminTeachers />
  },
  {
    path: '/admin/notifications',
    element: <AdminNotifications />
  },
  {
    path: '/admin/users',
    element: <AdminUsers />
  }
]); 
