import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';
import { logger } from './logger';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// ✅ Price IDs from environment variables
// Update these in .env file when switching to Stripe LIVE mode
export const STRIPE_PRICES = {
  free: import.meta.env.VITE_STRIPE_PRICE_FREE || process.env.VITE_STRIPE_PRICE_FREE,
  entrepreneur: import.meta.env.VITE_STRIPE_PRICE_ENTREPRENEUR || process.env.VITE_STRIPE_PRICE_ENTREPRENEUR
};

// Validate price IDs are set - warn if missing but don't crash in production
if (!STRIPE_PRICES.free || !STRIPE_PRICES.entrepreneur) {
  const missing = [];
  if (!STRIPE_PRICES.free) missing.push('VITE_STRIPE_PRICE_FREE');
  if (!STRIPE_PRICES.entrepreneur) missing.push('VITE_STRIPE_PRICE_ENTREPRENEUR');

  const errorMessage = `❌ Missing required Stripe price IDs in environment:\n${missing.join(', ')}\n\n` +
    'Add these to your .env file:\n' +
    'VITE_STRIPE_PRICE_FREE=price_...\n' +
    'VITE_STRIPE_PRICE_ENTREPRENEUR=price_...';

  console.error(errorMessage);
  
  // In production, log but don't crash - pricing features will be disabled
  if (import.meta.env.MODE === 'production') {
    console.warn('Stripe pricing features will be disabled due to missing price IDs. Add them in Vercel environment variables.');
  } else {
    // In development, throw to catch issues early
    throw new Error(errorMessage);
  }
}

export const createCheckoutSession = async (priceId: string) => {
  // Check if Stripe is properly configured
  if (!stripePublishableKey || !STRIPE_PRICES.free || !STRIPE_PRICES.entrepreneur) {
    const error = 'Stripe is not properly configured. Please add required environment variables in Vercel.';
    logger.error(error);
    return {
      sessionId: null,
      url: null,
      error: error
    };
  }

  try {
    logger.log('createCheckoutSession called with priceId:', priceId);

    // Get the current user's session token
    const { data: { session } } = await supabase.auth.getSession();
    logger.log('User session:', session?.user?.id);

    if (!session) {
      throw new Error('User not authenticated');
    }

    logger.log('Invoking create-checkout-session Edge Function...');

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
    logger.log('Edge Function response:', { status: response.status, data: responseData });

    if (!response.ok) {
      // Extract actual error message from response body
      const errorMessage = responseData?.error || responseData?.message || `HTTP ${response.status}: ${response.statusText}`;
      logger.error('Edge Function error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Check if response contains error field (shouldn't happen if response.ok, but just in case)
    if (responseData.error) {
      logger.error('Edge Function returned error in data:', responseData.error);
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
    logger.error('Error creating checkout session:', error);
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

