# 🚨 Quick Fix: Add Stripe Price IDs to Vercel

Your live site at **nectarforge.app** is missing Stripe price IDs in Vercel environment variables.

## Quick Fix (2 minutes)

### Step 1: Get Your Stripe Price IDs

You need to find your Stripe Price IDs from your Stripe Dashboard:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **LIVE mode** (toggle in top right)
3. Go to **Products** → Click on your products
4. Copy the **Price ID** for each product:
   - **Free Plan** → Copy the Price ID (starts with `price_`)
   - **Entrepreneur Plan** → Copy the Price ID (starts with `price_`)

**Example Price IDs:**
```
VITE_STRIPE_PRICE_FREE=price_1SQBmxRakR1kW1LLW09tsdF5
VITE_STRIPE_PRICE_ENTREPRENEUR=price_1SQBnPRakR1kW1LLP2Ru3vYs
```

### Step 2: Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **nectar** project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

   **Variable 1:**
   - **Key:** `VITE_STRIPE_PRICE_FREE`
   - **Value:** `price_xxxxx` (your free plan price ID)
   - **Environment:** Select all (Production, Preview, Development)

   **Variable 2:**
   - **Key:** `VITE_STRIPE_PRICE_ENTREPRENEUR`
   - **Value:** `price_xxxxx` (your entrepreneur plan price ID)
   - **Environment:** Select all (Production, Preview, Development)

5. Click **Save** for each variable

### Step 3: Redeploy

After adding the variables:

1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on your latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**OR** just push a new commit to trigger auto-deploy:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Step 4: Verify

1. Visit your site: https://nectarforge.app
2. Check the browser console (F12) - the error should be gone
3. Try the pricing page - it should work now!

---

## All Required Vercel Environment Variables

Make sure you have ALL of these set in Vercel:

### Required:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY`
- ✅ `VITE_STRIPE_PRICE_FREE` ← **ADD THIS**
- ✅ `VITE_STRIPE_PRICE_ENTREPRENEUR` ← **ADD THIS**

### Optional (but recommended):
- `VITE_GROQ_API_KEY`
- `GEMINI_API_KEY`
- `VITE_SENTRY_DSN`

---

## Still Having Issues?

1. **Check Stripe Mode:** Make sure you're using **LIVE mode** price IDs (not test mode)
2. **Verify Price IDs:** Double-check the price IDs match exactly in Stripe Dashboard
3. **Redeploy:** After adding variables, you MUST redeploy for changes to take effect
4. **Check Logs:** Look at Vercel deployment logs for any errors

---

## Need Help?

- Check your Stripe Dashboard → Products → Prices
- Verify the price IDs are from LIVE mode (not test mode)
- Make sure you clicked "Save" after adding each variable in Vercel

