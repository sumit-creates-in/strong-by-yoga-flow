
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://odhfdzormqlbfpeibgjy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kaGZkem9ybXFsYmZwZWliZ2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzU2MjYsImV4cCI6MjA1OTk1MTYyNn0.l9DNyNz-l40prX1d2t1TBZuEiwndL4874n7if-PatMA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
  }
});

// Helper function to get all users from auth.users (requires admin privileges)
export const fetchAllUsers = async () => {
  try {
    console.log('Fetching all users...');
    
    // First try to get auth users via admin API
    try {
      const { data: adminAuthData, error: adminAuthError } = await supabase.auth.admin.listUsers();
      
      if (!adminAuthError && adminAuthData?.users?.length > 0) {
        console.log('Successfully fetched users from admin API:', adminAuthData.users.length);
        return adminAuthData.users.map(user => ({
          ...user,
          email: user.email || '',
          role: user.user_metadata?.role || 'user'
        }));
      } else if (adminAuthError) {
        console.error('Admin API error:', adminAuthError);
      }
    } catch (err) {
      console.log('Admin API not available, falling back to profiles table');
    }
    
    // Use profiles table as fallback if admin API fails
    console.log('Fetching from profiles table...');
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
      
    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
    
    console.log('Profiles fetched:', profiles?.length || 0);
    
    // Add email info from localStorage if possible
    const profilesWithEmails = (profiles || []).map((profile: any) => {
      // Try to find email from other sources
      const emailKey = `user_email_${profile.id}`;
      const storedEmail = localStorage.getItem(emailKey) || '';
      
      return {
        ...profile,
        email: storedEmail,
        role: profile.is_admin ? 'admin' : 'user',
        status: 'active' as 'active' | 'inactive'
      };
    });
    
    return profilesWithEmails;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
