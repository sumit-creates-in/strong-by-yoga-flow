
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yoga-light-yellow p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-yoga-blue flex items-center justify-center">
            <span className="text-5xl mr-2">🧘</span>
            Strong By Yoga
          </h1>
          <p className="text-gray-600">Sign in to access your yoga classes</p>
        </div>
        
        <div className="yoga-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
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
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-gray-700 text-lg">
                  Password
                </label>
                <Link to="/forgot-password" className="text-yoga-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="yoga-input w-full"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="yoga-button w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-yoga-blue hover:underline">
                Sign up
              </Link>
            </p>
            
            {/* For demo purposes only */}
            <div className="mt-8 p-4 bg-yoga-light-blue/50 rounded-lg">
              <p className="font-semibold mb-2">Demo accounts:</p>
              <p>Admin: admin@strongbyyoga.com (any password)</p>
              <p>User: john@example.com (any password)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
