
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface EmailLoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

const EmailLoginForm: React.FC<EmailLoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword
}) => {
  const { login, isLoading } = useAuth();
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };
  
  return (
    <form onSubmit={handleEmailLogin} className="space-y-6">
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
  );
};

export default EmailLoginForm;
