
// Follow this setup guide to integrate the Supabase Edge Functions with your Supabase project:
// https://supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber } = await req.json()
    
    console.log(`Logging in with phone number: ${phoneNumber}`)

    // This is a mock implementation. In a real app, you'd:
    // 1. Check if a user exists with this phone number
    // 2. If yes, log them in
    // 3. If no, maybe create a new user
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )
    
    // In a real application, you'd look up the user by phone number and sign them in
    // For demo purposes, we'll use a test account
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', phoneNumber)
      .single()
      
    if (userError && userError.code !== 'PGRST116') {
      throw new Error(`Error fetching user: ${userError.message}`)
    }
    
    // For demo purposes, return success
    const response = {
      success: true,
      message: `Logged in with phone number: ${phoneNumber}`,
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 400,
      },
    )
  }
})
