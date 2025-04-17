
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-breathe">
          <span className="text-6xl">🧘</span>
        </div>
      </div>
    );
  }

  // Make sure we're checking for the admin role correctly
  if (!user || user.role !== 'admin') {
    console.log("User is not admin, redirecting to dashboard", user);
    // Redirect to dashboard if not an admin
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
