// Follow this setup guide: https://supabase.com/docs/guides/functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Webhook event type:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        if (!userId) {
          console.error('No user_id in session metadata')
          break
        }

        // Get subscription details
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          // Save subscription to database
          await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_name: subscription.items.data[0].price.nickname || 'entrepreneur',
          })

          // Update user profile
          await supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_tier: subscription.items.data[0].price.nickname || 'entrepreneur'
            })
            .eq('id', userId)
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
          await supabaseAdmin.from('subscriptions').upsert({
            user_id: profile.id,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_name: subscription.items.data[0].price.nickname || 'entrepreneur',
          })

          // Update user profile tier
          await supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_tier: subscription.status === 'active'
                ? (subscription.items.data[0].price.nickname || 'entrepreneur')
                : 'free'
            })
            .eq('id', profile.id)
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
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('stripe_subscription_id', subscription.id)

          // Downgrade to free tier
          await supabaseAdmin
            .from('user_profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', profile.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        // You can add email notification here
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)
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
