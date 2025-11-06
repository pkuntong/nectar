// Follow this setup guide: https://supabase.com/docs/guides/functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

// Production-safe logging
const isDev = Deno.env.get('ENVIRONMENT') !== 'production';
const log = (...args: any[]) => isDev && console.log(...args);

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Price ID to plan name mapping
// These should match the VITE_STRIPE_PRICE_* variables in your frontend .env
const PRICE_TO_PLAN: Record<string, string> = {
  // Your CORRECT price IDs (Nectar Sandbox account: acct_1SPz2FRakR1kW1LL)
  'price_1SQBmxRakR1kW1LLW09tsdF5': 'free',      // Hustler Plan ($0)
  'price_1SQBnPRakR1kW1LLP2Ru3vYs': 'entrepreneur', // Entrepreneur Plan ($19)

  // Old test mode IDs (keeping for backwards compatibility)
  'price_1SOM6aDPosqqbsKxdrWWe834': 'free',
  'price_1SOM7DDPosqqbsKx8lBviJSS': 'entrepreneur',
}

// Helper function to get plan name from price ID
function getPlanFromPriceId(priceId: string): string {
  return PRICE_TO_PLAN[priceId] || 'free'
}

serve(async (req) => {
  // Log all incoming headers for debugging
  log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  })

  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  log('Webhook check:', {
    hasSignature: !!signature,
    hasSecret: !!webhookSecret,
    method: req.method,
  })

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret', {
      hasSignature: !!signature,
      hasSecret: !!webhookSecret
    })
    return new Response(
      JSON.stringify({ error: 'Missing signature or webhook secret' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)

    log('Webhook event verified successfully:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        log('checkout.session.completed:', {
          userId,
          mode: session.mode,
          hasSubscription: !!session.subscription
        })

        if (!userId) {
          console.error('No user_id in session metadata')
          break
        }

        // Get subscription details
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const priceId = subscription.items.data[0].price.id
          const planName = getPlanFromPriceId(priceId)

          log('Subscription details:', {
            subscriptionId: subscription.id,
            priceId,
            planName,
            status: subscription.status
          })

          // Save subscription to database
          const { error: subError } = await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_name: planName,
          }, {
            onConflict: 'stripe_subscription_id'
          })

          if (subError) {
            console.error('Error saving subscription:', subError)
          } else {
            log('Subscription saved successfully')
          }

          // Update user profile
          const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_tier: planName
            })
            .eq('id', userId)

          if (profileError) {
            console.error('Error updating profile:', profileError)
          } else {
            log(`Successfully updated user to ${planName} plan`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by Stripe customer ID
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (profile) {
          const priceId = subscription.items.data[0].price.id
          const planName = getPlanFromPriceId(priceId)

          log('Subscription updated:', {
            userId: profile.id,
            priceId,
            planName,
            status: subscription.status
          })

          const { error } = await supabaseAdmin.from('subscriptions').upsert({
            user_id: profile.id,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_name: planName,
          }, {
            onConflict: 'stripe_subscription_id'
          })

          if (error) {
            console.error('Error upserting subscription:', error)
          }

          // Update user profile tier - only set to plan if subscription is active
          const newTier = subscription.status === 'active' ? planName : 'free'
          const { error: updateError } = await supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_tier: newTier
            })
            .eq('id', profile.id)

          if (updateError) {
            console.error('Error updating tier:', updateError)
          } else {
            log(`Updated user tier to ${newTier}`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by Stripe customer ID
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (profile) {
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('stripe_subscription_id', subscription.id)

          if (error) {
            console.error('Error canceling subscription:', error)
          }

          // Downgrade to free tier
          const { error: downgradeError } = await supabaseAdmin
            .from('user_profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', profile.id)

          if (downgradeError) {
            console.error('Error downgrading to free:', downgradeError)
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        log('Payment succeeded for invoice:', invoice.id)
        // You can add email notification here
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        log('Payment failed for invoice:', invoice.id)
        // You can add email notification here
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
