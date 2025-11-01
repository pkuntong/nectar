# Quick Start Guide

Get Nectar up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works!)
- A Stripe account (test mode is fine)
- (Optional) Resend and Sentry accounts

## 1️⃣ Install Dependencies (2 minutes)

```bash
npm install
```

## 2️⃣ Set Up Supabase (5 minutes)

### Create Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for it to initialize (~2 minutes)

### Get Your Keys
1. Go to **Settings** → **API**
2. Copy these values to your `.env` file:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon public key

### Create Database Tables
1. Go to **SQL Editor** in Supabase
2. Run this SQL:

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

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

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

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Enable Email Auth
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider

## 3️⃣ Start Development Server (30 seconds)

```bash
npm run dev
```

Visit http://localhost:3000

**You can now:**
- ✅ Sign up for an account
- ✅ Log in
- ✅ View the dashboard

## 4️⃣ Set Up Stripe (10 minutes) - OPTIONAL

### Create Account
1. Go to [stripe.com](https://stripe.com) and sign up
2. Make sure you're in **Test Mode**

### Create Products
You need two products. Use the Stripe Dashboard:

**Product 1: Free Plan**
1. Go to **Products** → **Add Product**
2. Name: `Side Hustler`
3. Price: `$0.00` (one-time)
4. Click **Save**
5. **Copy the Price ID** (starts with `price_`)

**Product 2: Paid Plan**
1. Go to **Products** → **Add Product**
2. Name: `Entrepreneur`
3. Price: `$29.00/month` (recurring)
4. Click **Save**
5. **Copy the Price ID** (starts with `price_`)

### Update Your Code
Edit `lib/stripe.ts` (lines 13-16):

```typescript
export const STRIPE_PRICES = {
  free: 'price_YOUR_FREE_PRICE_ID',
  entrepreneur: 'price_YOUR_PAID_PRICE_ID'
};
```

### Add Stripe Keys
Go to **Developers** → **API Keys** in Stripe Dashboard

Add to `.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

## 5️⃣ Deploy Edge Functions (15 minutes) - OPTIONAL

For Stripe checkout and emails to work, you need to deploy Edge Functions.

### Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Deploy Functions

```bash
# Login
supabase login

# Link your project (get ref from project URL)
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set RESEND_API_KEY=re_xxxxx  # Optional
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxxxx  # From Settings → API

# Deploy
supabase functions deploy
```

**You can now:**
- ✅ Process Stripe payments
- ✅ Send welcome emails (if Resend is set up)

## 6️⃣ Set Up Sentry (5 minutes) - OPTIONAL

1. Go to [sentry.io](https://sentry.io) and create account
2. Create new project (select React)
3. Copy your DSN
4. Add to `.env`:
   ```env
   VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

**You can now:**
- ✅ Track errors in production
- ✅ Monitor performance

## 7️⃣ Set Up Resend (5 minutes) - OPTIONAL

1. Go to [resend.com](https://resend.com) and create account
2. Go to **API Keys** and create one
3. Add to Supabase secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxx
   ```

**You can now:**
- ✅ Send welcome emails on signup

## Your .env File

After all setup, your `.env` should look like this:

```env
# Gemini AI
GEMINI_API_KEY=your_key_here

# Supabase (Required)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Stripe (Optional - for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Resend (Optional - for emails)
RESEND_API_KEY=re_xxxxx

# Sentry (Optional - for error tracking)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxx
```

## Testing Your Setup

### Test Authentication
1. Click "Sign Up for Free"
2. Create account
3. Should see dashboard
4. Log out and log in again

### Test Stripe (if set up)
1. Log in
2. Go to pricing
3. Click "Entrepreneur" plan
4. Should redirect to Stripe
5. Use test card: `4242 4242 4242 4242`

### Test Emails (if set up)
1. Sign up with real email
2. Check inbox for welcome email

## What Works Without Optional Setup

**Minimal setup (just Supabase):**
- ✅ Sign up / Login
- ✅ User authentication
- ✅ Dashboard access
- ✅ All UI components

**With Stripe:**
- ✅ Payment processing
- ✅ Subscription management

**With Resend:**
- ✅ Welcome emails
- ✅ Transactional emails

**With Sentry:**
- ✅ Error tracking
- ✅ Performance monitoring

## Next Steps

1. **For detailed setup:** See [SETUP.md](SETUP.md)
2. **For Stripe products:** See [STRIPE_SETUP.md](STRIPE_SETUP.md)
3. **For Edge Functions:** See [DEPLOY_EDGE_FUNCTIONS.md](DEPLOY_EDGE_FUNCTIONS.md)
4. **For integration status:** See [API_INTEGRATION_STATUS.md](API_INTEGRATION_STATUS.md)

## Getting Help

### Common Issues

**"Missing Supabase environment variables"**
- Check `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server: `npm run dev`

**"Stripe not initialized"**
- Add `VITE_STRIPE_PUBLISHABLE_KEY` to `.env`
- Update Price IDs in `lib/stripe.ts`

**Edge Functions not working**
- Make sure they're deployed: `supabase functions list`
- Check secrets are set: `supabase secrets list`

### Support

- Check the detailed guides in the project
- Review error messages in browser console
- Check Sentry dashboard for errors (if set up)

## Ready to Launch? 🚀

Once everything works:

1. Switch Stripe to Live Mode
2. Update all API keys with production values
3. Deploy to your hosting platform
4. Set up custom domain
5. Configure Stripe webhooks with production URL

---

**Estimated Setup Time:**
- Minimal (just auth): 10 minutes
- With Stripe: 30 minutes
- Everything: 45 minutes

**You're all set! Start building your side hustle empire! 💪**
