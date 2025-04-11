
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

// Define user type
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
};

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@strongbyyoga.com',
    phone: '1234567890',
    role: 'admin',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    role: 'user',
  },
];

// Create the context
type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('yogaUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (in a real app, this would be a server call)
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // In a real app, you would validate the password here
      // For this demo, we'll just accept any password
      
      // Set the logged-in user
      setUser(foundUser);
      localStorage.setItem('yogaUser', JSON.stringify(foundUser));
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${foundUser.name}!`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9), // Generate random ID
        name,
        email,
        phone,
        role: 'user',
      };
      
      // In a real app, you would save this to a database
      MOCK_USERS.push(newUser);
      
      // Set the logged-in user
      setUser(newUser);
      localStorage.setItem('yogaUser', JSON.stringify(newUser));
      
      toast({
        title: 'Registration successful',
        description: `Welcome to Strong By Yoga, ${name}!`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('yogaUser');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
    navigate('/login');
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('No account found with this email');
      }
      
      // In a real app, you would send a password reset email
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
      
      navigate('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Password reset failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isAuthenticated: !!user,
      isLoading,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
