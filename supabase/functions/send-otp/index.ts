
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
    const { phoneNumber, via } = await req.json()
    
    console.log(`Sending OTP to ${phoneNumber} via ${via}`)

    // This is a mock implementation. In a real app, you'd integrate with an SMS provider
    // like Twilio or use AWS SNS to send the OTP.
    // You'd also need to generate and store the OTP in a secure way.
    
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a production environment, we would:
    // 1. Store the OTP in a database with an expiry time
    // 2. Send the OTP via the selected channel (SMS or WhatsApp)
    
    let channel = "SMS";
    if (via === 'whatsapp') {
      channel = "WhatsApp";
      // Here you would use WhatsApp Business API or a service like Twilio to send WhatsApp messages
    } else {
      // Here you would use an SMS service like Twilio, AWS SNS, etc.
    }
    
    // Example mock response - in production, you'd actually send the message
    const response = {
      success: true,
      message: `OTP sent to ${phoneNumber} via ${channel}`,
      // In production, don't return the OTP in the response!
      // This is only for demonstration purposes
      otp: "123456", // In production, remove this line
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
