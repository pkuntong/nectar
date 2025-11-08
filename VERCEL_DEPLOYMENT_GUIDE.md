# 🚀 Vercel Deployment Guide for Nectar Forge

## 🚨 CRITICAL: Your Live Site is Currently Broken

Your site at **https://nectarforge.app** is showing API errors because **environment variables are not set in Vercel**.

This guide will fix your broken deployment in **5 minutes**.

---

## Quick Fix (Do This NOW)

### Step 1: Go to Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your **nectar** project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add ALL Required Environment Variables

Copy and paste each variable below **exactly as shown**:

#### 🔑 AI API Keys (REQUIRED - Your app won't work without these)

```bash
# Variable Name: VITE_GROQ_API_KEY
# Value: (Get from https://console.groq.com/keys)
gsk_YOUR_GROQ_API_KEY_HERE

# Variable Name: GEMINI_API_KEY
# Value: (Get from https://makersuite.google.com/app/apikey)
YOUR_GEMINI_API_KEY_HERE
```

#### 🗄️ Supabase Configuration (REQUIRED)

```bash
# Variable Name: VITE_SUPABASE_URL
# Value: (Get from Supabase Dashboard → Settings → API)
https://your-project.supabase.co

# Variable Name: VITE_SUPABASE_ANON_KEY
# Value: (Get from Supabase Dashboard → Settings → API)
your_supabase_anon_key_here
```

#### 💳 Stripe Configuration (TEST MODE - You haven't switched to LIVE yet)

```bash
# Variable Name: VITE_STRIPE_PUBLISHABLE_KEY
# Value: (Get from Stripe Dashboard → Developers → API keys)
# For test mode: pk_test_...
# For live mode: pk_live_...
pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Variable Name: VITE_STRIPE_PRICE_FREE
# Value: (Create products in Stripe Dashboard → Products)
price_YOUR_FREE_PRICE_ID_HERE

# Variable Name: VITE_STRIPE_PRICE_ENTREPRENEUR
# Value: (Create products in Stripe Dashboard → Products)
price_YOUR_ENTREPRENEUR_PRICE_ID_HERE
```

#### 📊 Sentry Error Monitoring (OPTIONAL but recommended)

```bash
# Variable Name: VITE_SENTRY_DSN
# Value: (Get from Sentry → Settings → Projects → Your Project → Client Keys)
https://your_sentry_dsn_here@your_project.ingest.sentry.io/your_project_id
```

### Step 3: Set Environment Scope

For EACH variable you add:
- ✅ Check **Production**
- ✅ Check **Preview**
- ✅ Check **Development**

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. ✅ Check **"Use existing Build Cache"** (faster)
6. Click **"Redeploy"**

### Step 5: Verify It Works

After redeployment completes (~2 minutes):

1. Visit https://nectarforge.app
2. Open browser console (F12)
3. Try generating a side hustle idea
4. Should work with NO API errors!

---

## 📸 Visual Guide: How to Add Environment Variables

### Adding a Variable in Vercel:

1. Click **"Add"** button
2. **Name:** `VITE_GROQ_API_KEY` (exactly as shown, case-sensitive)
3. **Value:** Your actual Groq API key from https://console.groq.com/keys
4. **Environments:** Check ✅ Production, Preview, Development
5. Click **"Save"**
6. Repeat for all variables above

---

## ⚠️ IMPORTANT: When to Switch to Stripe LIVE Mode

You are currently using **Stripe TEST mode** keys. This means:
- ❌ No real charges will be processed
- ✅ You can test checkout flow safely
- ✅ Use test card: `4242 4242 4242 4242`, any future expiry, any CVC

**When ready for real payments:**
1. Follow the "Stripe Live Mode Switch" guide in `PRODUCTION_READINESS_REPORT.md`
2. Update these 3 Vercel environment variables:
   - `VITE_STRIPE_PUBLISHABLE_KEY` → Replace with `pk_live_...`
   - `VITE_STRIPE_PRICE_FREE` → Replace with live price ID
   - `VITE_STRIPE_PRICE_ENTREPRENEUR` → Replace with live price ID
3. Update Supabase Edge Function secrets (see guide)
4. Redeploy

---

## 🔒 Security Best Practices

### ✅ Safe to Expose (VITE_ prefix = frontend):
- `VITE_GROQ_API_KEY` - Groq has rate limiting, safe for frontend
- `VITE_SUPABASE_URL` - Public URL, protected by Row Level Security
- `VITE_SUPABASE_ANON_KEY` - Public key, has limited permissions
- `VITE_STRIPE_PUBLISHABLE_KEY` - Meant to be public
- `VITE_STRIPE_PRICE_*` - Just price IDs, public info
- `VITE_SENTRY_DSN` - Public error reporting endpoint

### ❌ NEVER Expose These (Backend only):
These should **ONLY** be in **Supabase Edge Function secrets**, NOT in Vercel:
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- `STRIPE_SECRET_KEY` - Can charge cards
- `STRIPE_WEBHOOK_SECRET` - Can forge webhooks
- `RESEND_API_KEY` - Can send emails
- `SENTRY_AUTH_TOKEN` - Can modify error tracking

**How to add Supabase Edge Function secrets:**
```bash
# Run these commands locally:
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
supabase secrets set RESEND_API_KEY=re_YOUR_KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_KEY
```

---

## 🐛 Troubleshooting

### Issue: "Still seeing API errors after redeployment"

**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check Vercel deployment logs for build errors

### Issue: "Module not found" or build errors

**Fix:**
1. Make sure you committed all files:
   ```bash
   git add .
   git commit -m "Fix production build"
   git push
   ```
2. Redeploy in Vercel

### Issue: "Environment variable not loading"

**Fix:**
1. Double-check spelling (case-sensitive!)
2. Make sure **Production** is checked
3. Must redeploy after adding variables (they don't apply to existing deployments)

### Issue: "Supabase connection errors"

**Fix:**
1. Verify `VITE_SUPABASE_URL` is correct (get from Supabase Dashboard → Settings → API)
2. Verify `VITE_SUPABASE_ANON_KEY` is the full JWT token (starts with `eyJ...`)
3. Check your Supabase dashboard project settings

### Issue: "Stripe checkout not working"

**Fix:**
1. Verify all 3 Stripe variables are set
2. Test mode keys should start with `pk_test_` and `sk_test_`
3. Price IDs should start with `price_`
4. Make sure Supabase Edge Functions are deployed:
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy create-portal-session
   supabase functions deploy stripe-webhook
   ```

---

## 📋 Deployment Checklist

Use this before every deployment:

- [ ] All environment variables set in Vercel
- [ ] Variables set for Production, Preview, Development
- [ ] `.env` file is in `.gitignore` (should NOT be committed)
- [ ] Latest code pushed to GitHub
- [ ] `npm run build` works locally with no errors
- [ ] Supabase Edge Functions deployed
- [ ] Stripe webhook configured (if using payments)

---

## 🚀 Continuous Deployment Setup

Vercel automatically deploys when you push to GitHub:

1. **Push to `main` branch** → Deploys to production (nectarforge.app)
2. **Push to any other branch** → Creates preview deployment
3. **Pull Request** → Automatic preview deployment with unique URL

### To deploy manually:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Run `npm run build`
3. Deploy to production
4. Update nectarforge.app

---

## 📞 Support

If you're still experiencing issues:

1. **Check Vercel deployment logs:**
   - Go to Deployments → Click on deployment → View logs

2. **Check browser console:**
   - F12 → Console tab
   - Look for specific error messages

3. **Verify environment variables:**
   - Settings → Environment Variables
   - Each variable should show "Production, Preview, Development"

4. **Test locally first:**
   ```bash
   npm run build
   npm run preview
   ```
   If it works locally but not on Vercel, it's an environment variable issue.

---

## ✅ Current Status

**After following this guide:**
- ✅ Environment variables properly configured
- ✅ Tailwind CSS optimized (30KB instead of 3.5MB CDN)
- ✅ Production-safe logging (no debug logs in production)
- ✅ CORS properly restricted
- ✅ Branding updated to "Nectar Forge"
- ✅ All security best practices followed

**Remaining (when ready for real payments):**
- ⏸️ Switch Stripe from TEST to LIVE mode
- ⏸️ Update production domain in CORS configuration
- ⏸️ Set ENVIRONMENT=production in Supabase Edge Functions

---

**Last Updated:** November 6, 2025
**Guide Version:** 1.0
**Deployment Platform:** Vercel
**Live URL:** https://nectarforge.app
