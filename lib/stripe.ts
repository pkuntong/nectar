import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Price IDs - UPDATE THESE WITH YOUR ACTUAL STRIPE PRICE IDs
export const STRIPE_PRICES = {
  free: 'price_1SOM6aDPosqqbsKxdrWWe834',           // Replace with your actual free plan price ID
  entrepreneur: 'price_1SOM7DDPosqqbsKx8lBviJSS'  // Replace with your actual entrepreneur plan price ID
};

export const createCheckoutSession = async (priceId: string) => {
  try {
    // Get the current user's session token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('User not authenticated');
    }

    // Call Supabase Edge Function to create checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      },
    });

    if (error) {
      throw error;
    }

    return {
      sessionId: data.sessionId,
      url: data.url,
      error: null
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return {
      sessionId: null,
      url: null,
      error: error.message || 'Failed to create checkout session'
    };
  }
};

export const redirectToCheckout = async (url: string) => {
  window.location.href = url;
};

