import { loadStripe } from '@stripe/stripe-js';
import { logger } from './logger';

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export const STRIPE_PRICES = {
  free: import.meta.env.VITE_STRIPE_PRICE_FREE || process.env.VITE_STRIPE_PRICE_FREE,
  entrepreneur:
    import.meta.env.VITE_STRIPE_PRICE_ENTREPRENEUR || process.env.VITE_STRIPE_PRICE_ENTREPRENEUR,
};

if (!STRIPE_PRICES.free || !STRIPE_PRICES.entrepreneur) {
  const missing = [];
  if (!STRIPE_PRICES.free) missing.push('VITE_STRIPE_PRICE_FREE');
  if (!STRIPE_PRICES.entrepreneur) missing.push('VITE_STRIPE_PRICE_ENTREPRENEUR');
  console.warn(`Stripe price IDs missing: ${missing.join(', ')}`);
}

const getConvexSiteUrl = (): string => {
  const processEnvSiteUrl =
    typeof process !== 'undefined' && process.env ? process.env.VITE_CONVEX_SITE_URL : undefined;
  const processEnvGenerateUrl =
    typeof process !== 'undefined' && process.env ? process.env.VITE_CONVEX_GENERATE_HUSTLES_URL : undefined;

  const base =
    import.meta.env.VITE_CONVEX_SITE_URL ||
    processEnvSiteUrl ||
    import.meta.env.VITE_CONVEX_GENERATE_HUSTLES_URL ||
    processEnvGenerateUrl ||
    'https://quaint-lion-604.convex.site/api/generate-hustles';

  // Supports either VITE_CONVEX_SITE_URL or VITE_CONVEX_GENERATE_HUSTLES_URL style env.
  if (base.endsWith('/api/generate-hustles')) {
    return base.replace(/\/api\/generate-hustles$/, '');
  }
  return base.replace(/\/$/, '');
};

const callConvexStripeApi = async <T>(path: string, body: Record<string, unknown>): Promise<T> => {
  const url = `${getConvexSiteUrl()}${path}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `Stripe API call failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
};

const tryClientSideCheckoutRedirect = async (priceId: string): Promise<string | null> => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      return 'Stripe publishable key is missing.';
    }

    const result = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/dashboard?success=true`,
      cancelUrl: `${window.location.origin}/pricing?canceled=true`,
    });

    if (result.error) {
      return result.error.message || 'Stripe redirect failed.';
    }

    // If redirect succeeds, the page navigates away.
    return null;
  } catch (error: any) {
    return error?.message || 'Stripe redirect failed.';
  }
};

export const createCheckoutSession = async (
  priceId: string,
  options?: { email?: string }
): Promise<{ sessionId: string | null; url: string | null; error: string | null }> => {
  if (!priceId) {
    return {
      sessionId: null,
      url: null,
      error: 'Missing Stripe price ID for checkout.',
    };
  }

  try {
    const data = await callConvexStripeApi<{ sessionId?: string; url?: string }>(
      '/api/create-checkout-session',
      {
        priceId,
        email: options?.email ?? null,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      }
    );

    if (!data.url) {
      throw new Error('No checkout URL returned from Stripe.');
    }

    return {
      sessionId: data.sessionId ?? null,
      url: data.url,
      error: null,
    };
  } catch (error: any) {
    logger.error('Error creating checkout session:', error);
    const fallbackError = await tryClientSideCheckoutRedirect(priceId);
    if (!fallbackError) {
      return {
        sessionId: null,
        url: null,
        error: null,
      };
    }
    return {
      sessionId: null,
      url: null,
      error: error?.message || fallbackError || 'Failed to create checkout session.',
    };
  }
};

export const createPortalSession = async (
  options?: { email?: string; returnUrl?: string }
): Promise<{ url: string | null; error: string | null }> => {
  try {
    const data = await callConvexStripeApi<{ url?: string }>('/api/create-portal-session', {
      email: options?.email ?? null,
      returnUrl: options?.returnUrl ?? `${window.location.origin}/dashboard?tab=settings`,
    });

    if (!data.url) {
      throw new Error('No billing portal URL returned from Stripe.');
    }

    return {
      url: data.url,
      error: null,
    };
  } catch (error: any) {
    logger.error('Error creating portal session:', error);
    return {
      url: null,
      error: error?.message || 'Failed to create billing portal session.',
    };
  }
};

export const redirectToCheckout = async (url: string) => {
  window.location.href = url;
};
