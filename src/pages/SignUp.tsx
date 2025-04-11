
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signup, isLoading } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setPasswordError('');
    await signup(name, email, phone, password);
  };
  
  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digits
    let input = e.target.value.replace(/\D/g, '');
    
    // Format with dashes
    if (input.length > 0) {
      if (input.length <= 3) {
        setPhone(input);
      } else if (input.length <= 6) {
        setPhone(`${input.slice(0, 3)}-${input.slice(3)}`);
      } else {
        setPhone(`${input.slice(0, 3)}-${input.slice(3, 6)}-${input.slice(6, 10)}`);
      }
    } else {
      setPhone('');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yoga-light-yellow p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-yoga-blue flex items-center justify-center">
            <span className="text-5xl mr-2">🧘</span>
            Strong By Yoga
          </h1>
          <p className="text-gray-600">Create an account to start your yoga journey</p>
        </div>
        
        <div className="yoga-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-gray-700 text-lg">
                Full Name
              </label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="yoga-input w-full"
                required
              />
            </div>
            
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
              <label htmlFor="phone" className="block text-gray-700 text-lg">
                Phone Number
              </label>
              <Input
                id="phone"
                placeholder="123-456-7890"
                value={phone}
                onChange={handlePhoneChange}
                className="yoga-input w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-gray-700 text-lg">
                Password
              </label>
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
            
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-gray-700 text-lg">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`yoga-input w-full ${
                  passwordError ? 'border-red-500' : ''
                }`}
                required
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="yoga-button w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-yoga-blue hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
