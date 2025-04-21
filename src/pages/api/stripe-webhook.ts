import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Map Stripe price IDs to membership tiers and durations
const PRICE_TO_MEMBERSHIP_MAP: Record<string, { tier: string; duration: number }> = {
  'price_1MODwUGyB07x246GMkPzLsx7': { tier: 'membership-monthly', duration: 1 },
  'price_1RwGRKHDLcNJqASMjlUXz385': { tier: 'membership-sixmonth', duration: 6 },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: err.message });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get the price ID from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        
        if (!priceId || !PRICE_TO_MEMBERSHIP_MAP[priceId]) {
          throw new Error('Invalid price ID or membership mapping not found');
        }

        const { tier, duration } = PRICE_TO_MEMBERSHIP_MAP[priceId];
        const userId = session.client_reference_id;

        if (!userId) {
          throw new Error('User ID not found in session');
        }

        // Calculate membership dates
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + duration);

        // First, check if there's an existing active membership
        const { data: existingMembership } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (existingMembership) {
          // Update existing membership
          const { error: updateError } = await supabase
            .from('memberships')
            .update({
              tier: tier,
              is_active: true,
              start_date: startDate.toISOString(),
              expiry_date: expiryDate.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingMembership.id);

          if (updateError) {
            throw updateError;
          }
        } else {
          // Create new membership
          const { error: insertError } = await supabase
            .from('memberships')
            .insert({
              user_id: userId,
              tier: tier,
              is_active: true,
              start_date: startDate.toISOString(),
              expiry_date: expiryDate.toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            throw insertError;
          }
        }

        console.log(`Membership activated for user ${userId}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.client_reference_id;

        if (userId) {
          // Deactivate the membership
          const { error } = await supabase
            .from('memberships')
            .update({
              is_active: false,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('is_active', true);

          if (error) {
            throw error;
          }

          console.log(`Membership deactivated for user ${userId}`);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
} 