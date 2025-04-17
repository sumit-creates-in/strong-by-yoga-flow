
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
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
  
  // If user is already logged in, redirect to dashboard
  // Otherwise redirect to login
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default Index;
