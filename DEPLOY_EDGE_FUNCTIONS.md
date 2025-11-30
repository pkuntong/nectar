# Deploy Edge Functions for Stripe

## Step 1: Get Required Secrets

### A. Stripe Secret Key (NOT the publishable key)

1. Go to: https://dashboard.stripe.com/apikeys
2. Find **Secret key** (starts with `sk_live_` or `sk_test_`)
3. Click "Reveal test key" or use live key
4. Copy the secret key

### B. Stripe Webhook Secret (You'll get this in Step 3)

### C. Supabase Service Role Key

1. Go to: https://supabase.com/dashboard/project/getekqgyhwmbhyznamli/settings/api
2. Find **service_role** key under "Project API keys"
3. Click "Reveal" and copy it

---

## Step 2: Add Secrets to Supabase

1. **Go to Edge Functions Secrets:**
   https://supabase.com/dashboard/project/getekqgyhwmbhyznamli/settings/functions

2. **Click "Add new secret"** and add these 4 secrets:

   | Name | Value |
   |------|-------|
   | `STRIPE_SECRET_KEY` | Your Stripe secret key (sk_...) |
   | `SUPABASE_URL` | https://getekqgyhwmbhyznamli.supabase.co |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service role key from step 1C |
   | `STRIPE_WEBHOOK_SECRET` | (Leave empty for now, add after Step 3) |

3. Click **Save** after each one

---

## Step 3: Deploy Edge Functions

You have two options:

### Option A: Deploy via Dashboard (Easier)

**Unfortunately, dashboard deploy isn't available for all accounts.**

Try this first:
1. Go to: https://supabase.com/dashboard/project/getekqgyhwmbhyznamli/functions
2. Look for a "Deploy function" or "New function" button
3. If you see it, upload each function folder

### Option B: Deploy via CLI (Most reliable)

Since you have permission issues, let me create a script:

```bash
# First, you need to get a proper access token
# Go to: https://supabase.com/dashboard/account/tokens
# Create a new access token
# Then run:

supabase login

# After logging in, deploy each function:
supabase functions deploy create-checkout-session --project-ref getekqgyhwmbhyznamli
supabase functions deploy create-portal-session --project-ref getekqgyhwmbhyznamli
supabase functions deploy stripe-webhook --project-ref getekqgyhwmbhyznamli
supabase functions deploy delete-user --project-ref getekqgyhwmbhyznamli
```

---

## Step 4: Set Up Stripe Webhook

After deploying, you need to tell Stripe where to send webhook events:

1. **Get your webhook URL:**
   ```
   https://getekqgyhwmbhyznamli.supabase.co/functions/v1/stripe-webhook
   ```

2. **Add webhook in Stripe:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click **"Add endpoint"**
   - URL: `https://getekqgyhwmbhyznamli.supabase.co/functions/v1/stripe-webhook`
   - Select these events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click **Add endpoint**

3. **Get the webhook signing secret:**
   - After creating the endpoint, click on it
   - Find **Signing secret** (starts with `whsec_`)
   - Copy it

4. **Add to Supabase secrets:**
   - Go back to: https://supabase.com/dashboard/project/getekqgyhwmbhyznamli/settings/functions
   - Update `STRIPE_WEBHOOK_SECRET` with the `whsec_...` value

---

## Step 5: Test It Works

1. Go to your app: http://localhost:3000/
2. Sign up / log in
3. Try to upgrade to Entrepreneur plan
4. Should redirect to Stripe checkout (no CORS error!)

---

## Troubleshooting

**"Function not found" error:**
- Functions aren't deployed yet - complete Step 3

**CORS error persists:**
- Secrets might be missing - verify all 4 secrets in Step 2

**"Invalid API key" in Stripe:**
- Check you're using SECRET key (`sk_...`), not publishable (`pk_...`)

**Webhook not receiving events:**
- Verify webhook URL is exact: `/functions/v1/stripe-webhook`
- Check webhook secret is correct in Supabase secrets
