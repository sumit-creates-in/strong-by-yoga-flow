import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface RequestBody {
  userId: string;
  role: 'admin' | 'user' | 'teacher';
}

serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    // This gives us admin privileges for the operation
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error. Missing Supabase URL or service role key.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize the Supabase client with service role key for admin privileges
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const { userId, role } = await req.json() as RequestBody;

    if (!userId || !role) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: userId and role are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update user metadata with the new role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: { role } }
    );

    if (error) {
      console.error('Error updating user role:', error);
      return new Response(
        JSON.stringify({ 
          error: `Failed to update user role: ${error.message}` 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Also update the profile table for consistency, if you have a "role" column
    try {
      const isAdmin = role === 'admin';
      const isTeacher = role === 'teacher';
      
      await supabaseAdmin
        .from('profiles')
        .update({
          is_admin: isAdmin,
          is_teacher: isTeacher
        })
        .eq('id', userId);
    } catch (profileError) {
      console.error('Warning: Could not update profile role:', profileError);
      // Continue anyway since the auth update was successful
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `User role updated to ${role} successfully`,
        data
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred while processing the request' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}); 