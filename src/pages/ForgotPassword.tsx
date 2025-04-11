
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const { resetPassword, isLoading } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yoga-light-yellow p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-yoga-blue flex items-center justify-center">
            <span className="text-5xl mr-2">🧘</span>
            Strong By Yoga
          </h1>
          <p className="text-gray-600">Reset your password</p>
        </div>
        
        <div className="yoga-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <p className="text-gray-700 mb-4">
                Enter the email address associated with your account, and we'll send you a link to reset your password.
              </p>
              <label htmlFor="email" className="block text-gray-700 text-lg">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="yoga-input w-full"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="yoga-button w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending reset link...' : 'Reset Password'}
            </Button>
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-yoga-blue hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
