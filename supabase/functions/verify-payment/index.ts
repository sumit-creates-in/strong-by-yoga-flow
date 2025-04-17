
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the session to check payment status
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Payment not completed" 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Get credit amount from metadata
    const creditAmount = session.metadata?.creditAmount 
      ? parseInt(session.metadata.creditAmount, 10) 
      : 0;
    
    if (creditAmount <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid credit amount in session metadata" 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get user from auth header to add credits
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: true,
          verified: true,
          credits: creditAmount,
          message: "Payment verified but user is not authenticated to add credits" 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Initialize Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // For regular auth operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    
    if (!userData?.user?.id) {
      return new Response(
        JSON.stringify({ 
          success: true,
          verified: true,
          credits: creditAmount,
          message: "Payment verified but user could not be authenticated" 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // You could record the transaction in your Supabase database here
    const { data: transactionData, error: transactionError } = await supabaseAdmin
      .from("credit_transactions")
      .insert({
        user_id: userData.user.id,
        amount: creditAmount,
        type: "purchase",
        payment_id: session.id,
        status: "completed"
      })
      .select()
      .single();
    
    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: true,
        credits: creditAmount,
        user_id: userData.user.id,
        transaction_id: transactionData?.id,
        message: "Payment verified and credits ready to be added"
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
