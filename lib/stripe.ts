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
    console.log('createCheckoutSession called with priceId:', priceId);

    // Get the current user's session token
    const { data: { session } } = await supabase.auth.getSession();
    console.log('User session:', session?.user?.id);

    if (!session) {
      throw new Error('User not authenticated');
    }

    console.log('Invoking create-checkout-session Edge Function...');

    // Get Supabase URL for function endpoint
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    // Make direct fetch call to get actual error response body
    const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        priceId,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      }),
    });

    const responseData = await response.json();
    console.log('Edge Function response:', { status: response.status, data: responseData });

    if (!response.ok) {
      // Extract actual error message from response body
      const errorMessage = responseData?.error || responseData?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('Edge Function error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Check if response contains error field (shouldn't happen if response.ok, but just in case)
    if (responseData.error) {
      console.error('Edge Function returned error in data:', responseData.error);
      throw new Error(responseData.error);
    }

    if (!responseData.url) {
      throw new Error('No checkout URL returned from Edge Function. Check function logs for details.');
    }

    return {
      sessionId: responseData.sessionId,
      url: responseData.url,
      error: null
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return {
      sessionId: null,
      url: null,
      error: error.message || 'Failed to create checkout session. Please ensure Edge Functions are deployed to Supabase.'
    };
  }
};

export const redirectToCheckout = async (url: string) => {
  window.location.href = url;
};

