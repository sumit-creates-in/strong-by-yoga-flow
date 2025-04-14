
// Follow this setup guide to integrate the Supabase Edge Functions with your Supabase project:
// https://supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, otp } = await req.json()
    
    console.log(`Verifying OTP ${otp} for ${phoneNumber}`)

    // This is a mock implementation. In a real app, you'd:
    // 1. Look up the stored OTP for this phone number
    // 2. Compare it with the submitted OTP
    // 3. Check if it's expired
    // 4. Mark it as used to prevent replay attacks
    
    // For demo purposes, we'll consider "123456" as a valid OTP
    const isValid = otp === "123456"
    
    if (!isValid) {
      throw new Error("Invalid OTP")
    }
    
    // Example mock response
    const response = {
      success: true,
      message: `Phone number ${phoneNumber} verified successfully`,
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
