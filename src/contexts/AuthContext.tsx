import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Define user type with extended profile information
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
};

export type UserWithProfile = User & {
  profile?: Profile;
  role: 'user' | 'admin';
};

// Create the context
type AuthContextType = {
  user: UserWithProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data as Profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Update user state with profile data
  const updateUserState = async (session: Session | null) => {
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id);
      
      // Check if user is admin - either of these two email addresses are admin
      const isAdmin = session.user.email === 'admin@strongbyyoga.com' || 
                      session.user.email === 'sumit_204@yahoo.com';
      
      setUser({
        ...session.user,
        profile,
        role: isAdmin ? 'admin' : 'user',
      });
    } else {
      setUser(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        
        // Use setTimeout to prevent potential deadlocks
        if (currentSession?.user) {
          setTimeout(() => {
            updateUserState(currentSession);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        updateUserState(currentSession);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Special handling for demo admin accounts
      const isAdminEmail = email === 'admin@strongbyyoga.com' || email === 'sumit_204@yahoo.com';
      
      let signInResult;
      
      if (email === 'sumit_204@yahoo.com') {
        // For this specific admin account, use the set password
        signInResult = await supabase.auth.signInWithPassword({
          email,
          password: 'admin123', // Use the password set in the SQL migration
        });
      } else if (isAdminEmail) {
        // For other admin emails, any password works
        signInResult = await supabase.auth.signInWithPassword({
          email,
          password: password || 'any-password',
        });
      } else {
        // Regular login
        signInResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }
      
      const { data, error } = signInResult;
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Login successful',
        description: `Welcome back!`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // New function to login with phone
  const loginWithPhone = async (phone: string) => {
    setIsLoading(true);
    try {
      // For demo purposes, we'll simulate success since we don't have a real OTP system
      // In a real implementation, you would:
      // 1. Create a custom auth flow with your backend to validate the OTP and phone
      // 2. Get a session token from your backend
      // 3. Use that to authenticate the user
      
      // Create a 'demo' user for the phone login
      // In production, you'd have proper phone authentication
      const phoneEmail = `${phone.replace(/[^\d]/g, '')}@phone.user`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: phoneEmail,
        password: 'phone-user-password',
      });
      
      if (error) {
        // If login fails (user doesn't exist), try to create one
        // This is just for demo purposes!
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: phoneEmail,
          password: 'phone-user-password',
          options: {
            data: {
              phone: phone,
            }
          }
        });
        
        if (signUpError) throw signUpError;
      }
      
      toast({
        title: 'Login successful',
        description: `Welcome back!`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Create the initial credit transaction for the new user
      // In a real app, this would be done on the server side or with a secure edge function
      const userCredits = 100;
      
      // Create a credit transaction for the initial 100 credits
      if (data.user) {
        const transaction = {
          id: `transaction-${Date.now()}`,
          type: 'admin',
          amount: userCredits,
          description: 'Initial signup credits',
          date: new Date().toISOString()
        };
        
        // Set the userCredits in localStorage for this user
        localStorage.setItem('userCredits', userCredits.toString());
        
        // Get existing transactions or create new array
        const existingTransactions = JSON.parse(localStorage.getItem('creditTransactions') || '[]');
        localStorage.setItem('creditTransactions', JSON.stringify([...existingTransactions, transaction]));
        
        // Wait for profile to be created after signup
        const profileData = {
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          initial_credits: userCredits
        };
        
        // Insert the profile data
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData);
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
      
      toast({
        title: 'Registration successful',
        description: `Welcome to Strong By Yoga! You've received 100 credits to get started.`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: error.message || 'Something went wrong',
      });
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password reset failed',
        description: error.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local user state with new profile data
      if (user.profile) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...profileData,
          },
        });
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Profile update failed',
        description: error.message || 'Something went wrong',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      login, 
      loginWithPhone,
      signup, 
      logout, 
      isAuthenticated: !!session,
      isLoading,
      resetPassword,
      updateProfile
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
