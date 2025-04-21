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

  // Helper function to sync user information to profiles table
  const syncUserToProfiles = async (userData: User) => {
    try {
      console.log('Syncing user to profiles table:', userData);
      // Get user metadata
      const metadata = userData.user_metadata || {};
      
      // Create profile data object
      const profileData = {
        id: userData.id,
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        email: userData.email || '',
        phone: metadata.phone || null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('Syncing profile data:', profileData);
      
      // Upsert the profile data
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });
        
      if (error) {
        console.error('Error syncing user profile:', error);
      } else {
        console.log('User profile synced successfully');
      }
    } catch (error) {
      console.error('Error in syncUserToProfiles:', error);
    }
  };

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

  // Update user state
  const updateUserState = async (session: Session | null) => {
    if (session?.user) {
      // First, make sure the user is synced to profiles
      await syncUserToProfiles(session.user);
      
      // Now fetch the profile
      const profile = await fetchUserProfile(session.user.id);
      
      // Determine if user is admin
      const isAdmin = 
        session.user.email === 'admin@strongbyyoga.com' || 
        session.user.email === 'sumit_204@yahoo.com';
      
      setUser({
        ...session.user,
        profile,
        role: isAdmin ? 'admin' : 'user'
      });
    } else {
      setUser(null);
    }
    
    setSession(session);
    setIsLoading(false);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Ensure the user profile is synced
      if (data.user) {
        await syncUserToProfiles(data.user);
      }
      
      toast({
        title: 'Logged in',
        description: 'You have been logged in successfully.',
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
      
      console.log('User signup data:', data);
      
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
        
        // Create extended profile data with custom fields
        const extendedProfileData = {
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          avatar_url: null,  // Match the required schema
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Custom metadata fields (not in the default schema)
          email: email,
          phone: phone,
          initial_credits: userCredits
        };
        
        console.log('Creating profile with data:', extendedProfileData);
        
        // Insert the profile data - use upsert to handle if profile already exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert(extendedProfileData)
          .select();
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        } else {
          console.log('Profile created successfully:', profileData);
        }
      }
      
      toast({
        title: 'Registration successful',
        description: `Welcome to Strong By Yoga! You've received 100 credits to get started.`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
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
        redirectTo: `${window.location.origin}/login/reset-password`
      });
      
      if (error) throw error;
      
      toast({
        title: 'Reset link sent',
        description: 'Check your email for the password reset link.',
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Reset failed',
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
