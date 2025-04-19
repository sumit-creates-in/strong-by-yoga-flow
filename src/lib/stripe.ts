import { loadStripe, Stripe } from '@stripe/stripe-js';

// Helper function to get Stripe settings from localStorage
const getStripeSettings = () => {
  try {
    const settings = localStorage.getItem('stripeSettings');
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.error('Failed to load Stripe settings:', error);
  }
  return null;
};

/**
 * STRIPE PRODUCT AND PRICE SETUP GUIDE:
 * 
 * To create products and prices in Stripe:
 * 1. Log into your Stripe Dashboard (https://dashboard.stripe.com)
 * 2. Go to Products > + Add Product
 * 3. Create products for each membership tier and credit package:
 *    - Basic Membership: Create with monthly recurring price of $19.99
 *    - Premium Membership: Create with monthly recurring price of $49.99
 *    - Annual Membership: Create with yearly recurring price of $399.99
 *    - For credit packages: Create products for Starter, Standard, Premium, and Ultimate
 * 
 * 4. After creating each product, copy the price_id values from your Stripe Dashboard
 *    and update the MEMBERSHIP_PRICE_MAP and CREDIT_PRICE_MAP below
 * 
 * For development/testing, we're using a single test price ID for all products.
 * In production, each product should have its own unique price ID.
 */

// Membership tiers map to Stripe price IDs
const MEMBERSHIP_PRICE_MAP = {
  'membership-monthly': 'price_1MODwUGyB07x246GMkPzLsx7', // Monthly membership price ID
  'membership-sixmonth': 'price_1RwGRKHDLcNJqASMjlUXz385', // Six-month membership price ID (test price)
  'membership-annual': 'price_1RwGRKHDLcNJqASMjlUXz385' // Annual membership price ID (test price)
};

// Credit packages map to Stripe price IDs
const CREDIT_PRICE_MAP = {
  'starter': 'price_1RwGRKHDLcNJqASMjlUXz385', // Test price ID - $1.00 test price
  'standard': 'price_1RwGRKHDLcNJqASMjlUXz385', // Test price ID - $1.00 test price
  'premium': 'price_1RwGRKHDLcNJqASMjlUXz385', // Test price ID - $1.00 test price
  'ultimate': 'price_1RwGRKHDLcNJqASMjlUXz385' // Test price ID - $1.00 test price
};

let stripePromise: Promise<Stripe | null>;

/**
 * Get a Stripe instance initialized with the stored publishable key
 */
export const getStripe = async (): Promise<Stripe | null> => {
  // Clear the existing promise to force a refresh when settings change
  stripePromise = null;
  
  const settings = getStripeSettings();
  if (!settings || !settings.activationStatus) {
    console.error('Stripe is not configured or not activated');
    return null;
  }
  
  // Get the appropriate publishable key based on mode
  const publishableKey = settings.isLiveMode
    ? settings.publishableKey
    : settings.testPublishableKey;
  
  if (!publishableKey) {
    console.error('Stripe publishable key is missing');
    return null;
  }
  
  try {
    stripePromise = loadStripe(publishableKey);
    return stripePromise;
  } catch (error) {
    console.error('Error loading Stripe:', error);
    return null;
  }
};

/**
 * Create a checkout session for single class purchase
 */
export const createClassCheckoutSession = async (classId: string, price: number, successUrl: string, cancelUrl: string) => {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }
  
  // Since we can't use price_data directly with redirectToCheckout, 
  // we'll use a fixed price ID for the demo and adjust the quantity
  // In a real app, you would use your backend to create a checkout session
  try {
    // Using a predefined test price ID for demo purposes
    const testPriceId = 'price_1RwGRKHDLcNJqASMjlUXz385'; // $1 test price
    
    const { error } = await stripe.redirectToCheckout({
      mode: 'payment',
      lineItems: [
        {
          price: testPriceId,
          quantity: price, // Set quantity to the price amount
        },
      ],
      successUrl,
      cancelUrl,
    });
    
    if (error) {
      console.error('Stripe checkout error:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};

/**
 * Create a checkout session for membership purchase
 */
export const createMembershipCheckoutSession = async (membershipId: string, successUrl: string, cancelUrl: string) => {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }

  // Get the price ID for this membership tier
  const priceId = MEMBERSHIP_PRICE_MAP[membershipId];
  if (!priceId) {
    throw new Error(`No price ID found for membership ${membershipId}`);
  }
  
  try {
    const { error } = await stripe.redirectToCheckout({
      mode: 'subscription', // Use subscription mode for memberships
      lineItems: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      successUrl,
      cancelUrl,
    });
    
    if (error) {
      console.error('Stripe checkout error:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};

/**
 * Create a checkout session for credit purchase
 */
export const createCreditCheckoutSession = async (
  packageId: string, 
  credits: number, 
  price: number,
  successUrl: string, 
  cancelUrl: string
) => {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }

  try {
    // Check if this is a predefined package or custom credits
    if (packageId.startsWith('custom-')) {
      // For custom credit amounts, use a predefined $1 test price and set quantity
      // In a real app, you would use a backend API to create a checkout session
      const testPriceId = 'price_1RwGRKHDLcNJqASMjlUXz385'; // $1 test price
      
      const { error } = await stripe.redirectToCheckout({
        mode: 'payment',
        lineItems: [
          {
            price: testPriceId,
            quantity: price, // Set quantity to match the price
          },
        ],
        successUrl,
        cancelUrl,
      });
      
      if (error) {
        console.error('Stripe checkout error:', error);
        throw new Error(error.message);
      }
    } else {
      // Predefined package - use the mapped price ID
      const priceId = CREDIT_PRICE_MAP[packageId];
      if (!priceId) {
        throw new Error(`No price ID found for credit package ${packageId}`);
      }
      
      const { error } = await stripe.redirectToCheckout({
        mode: 'payment',
        lineItems: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        successUrl,
        cancelUrl,
      });
      
      if (error) {
        console.error('Stripe checkout error:', error);
        throw new Error(error.message);
      }
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};

/**
 * Test Stripe functionality
 * This can be used to verify Stripe is properly configured
 */
export const testStripeConnection = async (): Promise<boolean> => {
  try {
    const stripe = await getStripe();
    return !!stripe;
  } catch (error) {
    console.error('Stripe connection test failed:', error);
    return false;
  }
}; 