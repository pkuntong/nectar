// Follow this setup guide: https://supabase.com/docs/guides/functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

// Production-safe logging
const isDev = Deno.env.get('ENVIRONMENT') !== 'production';
const log = (...args: any[]) => isDev && console.log(...args);

// CORS configuration - restrict to your production domain in production
// During development, allows localhost. In production, only allows your domain.
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = [
    'https://nectarforge.app',           // ✅ Production domain
    'https://www.nectarforge.app',       // ✅ Production domain with www
    'http://localhost:3000',             // Development
    'http://localhost:5173',             // Vite default port
    'https://bbzuoynbdzutgslcvyqw.supabase.co', // Supabase project URL
  ];

  // If request origin is in allowed list, use it. Otherwise, use first allowed origin.
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Default to localhost for development
  return allowedOrigins[0];
};

const getCorsHeaders = (requestOrigin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(requestOrigin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
})

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check for required environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set. Please add it in the Edge Function secrets.');
    }

    // Get Supabase environment variables (Supabase provides these automatically)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('PROJECT_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(`Missing Supabase configuration: SUPABASE_URL=${!!supabaseUrl}, SUPABASE_ANON_KEY=${!!supabaseAnonKey}`);
    }

    // Get Stripe instance
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Get Supabase client
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the session
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get request body
    const { priceId, successUrl, cancelUrl } = await req.json()

    if (!priceId) {
      throw new Error('Price ID is required')
    }

    // Get or create Stripe customer
    let customerId: string | undefined

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to database
      await supabaseClient
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Fetch price to determine if it's recurring (subscription) or one-time (payment)
    const price = await stripe.prices.retrieve(priceId);
    const isRecurring = price.recurring !== null;
    const mode = isRecurring ? 'subscription' : 'payment';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl || `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Edge Function error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
