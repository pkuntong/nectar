# Complete Setup Guide for Nectar

This guide will walk you through setting up all the integrations for your Nectar application.

## Prerequisites

- Node.js installed (v18 or higher)
- npm or yarn package manager
- Git

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Environment Variables Setup

A `.env` file has been created from `.env.example`. You need to replace the placeholder values with your actual API keys.

### Required API Keys:

1. **Gemini API Key** (for AI features)
2. **Supabase** (for authentication and database)
3. **Stripe** (for payments)
4. **Resend** (for emails)
5. **Sentry** (for error tracking)

---

## Step 3: Supabase Setup

### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/)
2. Click "Start your project"
3. Create a new organization (if you don't have one)
4. Create a new project
5. Choose a database password and region

### 3.2 Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values to your `.env` file:
   - `VITE_SUPABASE_URL`: Your project URL
   - `VITE_SUPABASE_ANON_KEY`: Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep this secret!)

### 3.3 Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if desired

### 3.4 Create Database Tables (Optional but Recommended)

Run these SQL commands in the Supabase SQL Editor:

```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 4: Stripe Setup

### 4.1 Create a Stripe Account

1. Go to [stripe.com](https://stripe.com/)
2. Create an account
3. Complete your business profile

### 4.2 Get API Keys

1. In the Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your keys to `.env`:
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Publishable key (starts with `pk_test_`)
   - `STRIPE_SECRET_KEY`: Secret key (starts with `sk_test_`)

### 4.3 Create Products and Prices

Run these commands or use the Stripe Dashboard:

#### Option A: Using Stripe CLI

```bash
# Install Stripe CLI first: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Create Free Plan Product
stripe products create \
  --name="Side Hustler" \
  --description="Perfect for getting started with your first side hustle"

# Create Free Plan Price (copy the product ID from above)
stripe prices create \
  --product=prod_xxxxx \
  --unit-amount=0 \
  --currency=usd \
  --nickname="free"

# Create Paid Plan Product
stripe products create \
  --name="Entrepreneur" \
  --description="For serious side hustlers ready to scale"

# Create Paid Plan Price (copy the product ID from above)
stripe prices create \
  --product=prod_xxxxx \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month \
  --nickname="entrepreneur-monthly"
```

#### Option B: Using Stripe Dashboard

1. Go to **Products** in your Stripe Dashboard
2. Click **Add Product**
3. Create two products:

**Product 1: Side Hustler (Free Plan)**
- Name: Side Hustler
- Description: Perfect for getting started with your first side hustle
- Price: $0.00 (one-time)

**Product 2: Entrepreneur (Paid Plan)**
- Name: Entrepreneur
- Description: For serious side hustlers ready to scale
- Price: $29.00/month (recurring)

4. Copy the **Price IDs** (they start with `price_`)

### 4.4 Update Your Code with Price IDs

Edit [components/Pricing.tsx](components/Pricing.tsx) and update the price IDs:

```typescript
const STRIPE_PRICES = {
  free: 'price_xxxxxxxxxxxxx',      // Your free plan price ID
  entrepreneur: 'price_xxxxxxxxxxxxx' // Your entrepreneur plan price ID
};
```

### 4.5 Set Up Webhooks (for Production)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Step 5: Resend Email Setup

### 5.1 Create a Resend Account

1. Go to [resend.com](https://resend.com/)
2. Sign up for an account
3. Verify your email

### 5.2 Get API Key

1. In Resend Dashboard, go to **API Keys**
2. Create a new API key
3. Copy it to `.env` as `RESEND_API_KEY`

### 5.3 Verify Your Domain (For Production)

1. In Resend Dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown to your DNS provider
5. Wait for verification

### 5.4 Update Email "From" Address

Edit [lib/resend.ts](lib/resend.ts:26) and change the from address:

```typescript
from: options.from || 'Nectar <noreply@yourdomain.com>',
```

**Important for Development:**
- You can use `onboarding@resend.dev` for testing
- For production, use your verified domain

---

## Step 6: Sentry Error Tracking Setup

### 6.1 Create a Sentry Account

1. Go to [sentry.io](https://sentry.io/)
2. Sign up for an account
3. Create a new organization

### 6.2 Create a Project

1. Click **Create Project**
2. Select **React** as the platform
3. Name your project (e.g., "nectar")
4. Copy the DSN shown

### 6.3 Configure Environment Variables

1. Add your Sentry DSN to `.env` as `VITE_SENTRY_DSN`
2. For production builds with source maps:
   - Go to **Settings** → **Developer Settings** → **Auth Tokens**
   - Create a new auth token with `project:releases` scope
   - Add it to `.env` as `SENTRY_AUTH_TOKEN`

### 6.4 Adjust Sample Rates for Production

Edit [lib/sentry.ts](lib/sentry.ts) to reduce sample rates in production:

```typescript
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
replaysSessionSampleRate: 0.1,
replaysOnErrorSampleRate: 1.0,
```

---

## Step 7: Gemini AI Setup

### 7.1 Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy it to `.env` as `GEMINI_API_KEY`

---

## Step 8: Start Development Server

```bash
npm run dev
```

Your app should now be running at `http://localhost:3000`

---

## Step 9: Test the Integrations

### Test Authentication:
1. Click "Sign Up for Free"
2. Create an account with your email
3. Check your email for the welcome message (if Resend is configured)
4. Log out and log back in

### Test Sentry:
1. Check your Sentry dashboard for any errors
2. Errors are automatically captured and reported

### Test Stripe (requires backend):
1. Try to upgrade to a paid plan
2. You'll need to implement a backend API for full functionality

---

## Important Security Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Use test keys in development** - Use `sk_test_` and `pk_test_` keys
3. **Protect service role keys** - Never expose Supabase service role key in frontend
4. **HTTPS in production** - Always use HTTPS for production deployments
5. **Backend for sensitive operations** - Move Stripe checkout and email sending to backend in production

---

## Next Steps for Production

1. **Create a backend API** for:
   - Stripe checkout session creation
   - Webhook handling
   - Email sending
   - Protected operations

2. **Set up a backend framework** (recommended):
   - Supabase Edge Functions
   - Vercel Serverless Functions
   - Express.js + Node.js
   - Next.js API routes

3. **Configure Stripe webhooks** to update user subscriptions

4. **Set up proper email domain** in Resend

5. **Adjust Sentry sample rates** for production traffic

6. **Enable production mode** in Stripe Dashboard when ready

---

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure your `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after adding environment variables

### "Stripe not initialized"
- Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env`
- Make sure it starts with `pk_test_` or `pk_live_`

### "Resend API key not found"
- Add `RESEND_API_KEY` to `.env`
- For testing, this warning can be ignored

### "Sentry DSN not found"
- Add `VITE_SENTRY_DSN` to `.env`
- For testing, this warning can be ignored

### Emails not sending
- Resend requires a backend API for production use
- Use `onboarding@resend.dev` for testing
- Verify your domain in Resend for production

---

## Support

For issues or questions:
1. Check the console for error messages
2. Review the integration guide: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
3. Check Sentry for error details
4. Review each service's documentation

---

## Quick Reference

### Development URLs
- Local app: http://localhost:3000
- Supabase Dashboard: https://app.supabase.com
- Stripe Dashboard: https://dashboard.stripe.com
- Resend Dashboard: https://resend.com/emails
- Sentry Dashboard: https://sentry.io

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Sentry Docs](https://docs.sentry.io)
