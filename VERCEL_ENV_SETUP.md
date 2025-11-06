# Vercel Environment Variables Setup

Your app needs these environment variables configured in Vercel to run properly.

## Quick Setup Steps

1. **Go to your Vercel project dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Navigate to your project: **nectar**
   - Click on **Settings** → **Environment Variables**

2. **Add these required variables:**

### Required Variables (Must Have)

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

### Optional but Recommended

```
VITE_STRIPE_PRICE_FREE=price_xxx
VITE_STRIPE_PRICE_ENTREPRENEUR=price_xxx
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
```

3. **Set Environment Scope:**
   - For each variable, select:
     - ✅ **Production**
     - ✅ **Preview** (optional, but recommended)
     - ✅ **Development** (optional)

4. **Redeploy:**
   - After adding variables, go to **Deployments**
   - Click the **3 dots** on the latest deployment
   - Select **Redeploy**
   - Or push a new commit to trigger auto-deploy

## Where to Get Your Keys

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Stripe
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Switch to **Live mode** (or Test mode for testing)
3. Go to **Developers** → **API keys**
4. Copy:
   - **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
   - Create products/prices for `VITE_STRIPE_PRICE_FREE` and `VITE_STRIPE_PRICE_ENTREPRENEUR`

### Groq (Optional)
1. Go to [console.groq.com](https://console.groq.com)
2. Create an API key
3. Add as `VITE_GROQ_API_KEY`

### Gemini (Optional)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Get API key
3. Add as `GEMINI_API_KEY`

## Important Notes

- ⚠️ **Never commit `.env` files** - they're already in `.gitignore`
- ✅ **Vercel encrypts** all environment variables
- ✅ **Variables are injected** at build time
- 🔄 **Redeploy required** after adding new variables

## Verification

After redeploying, your app should load without the environment variable errors.

