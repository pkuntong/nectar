# Fix: Stripe Error on Vercel Live Site

## 🔴 Error
```
Error: Stripe is not properly configured. Please add required environment variables in Vercel.
```

## 🔍 Root Cause

Vercel environment variables are **NOT automatically available at build time** unless configured correctly. Even though you added them in Vercel, they need to be:
1. Set for the correct environment (Production)
2. Available during build
3. The site needs to be redeployed

## ✅ Step-by-Step Fix

### Step 1: Verify Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `nectar` project
3. Go to **Settings** → **Environment Variables**
4. Check that ALL of these exist:

```bash
# Required Stripe Variables
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51SNkpSRm39dS6XFYQ5TYksPUYx2dYFj8Hx8z9fsKmxyQnxj48BZGkdkSPestaakNVqV4lgPEthO2YQ1Pgoovxl1M005hfdnNIz
VITE_STRIPE_PRICE_FREE=price_1SQAuARm39dS6XFYdI25ZNcH
VITE_STRIPE_PRICE_ENTREPRENEUR=price_1SQAumRm39dS6XFYItaRfLQr

# Other Required Variables
VITE_SUPABASE_URL=https://bbzuoynbdzutgslcvyqw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJienVveW5iZHp1dGdzbGN2eXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NzU3NzIsImV4cCI6MjA3NzM1MTc3Mn0.arYnHThA2ja9rqEO0stDLtiDkBzYbDG8FtgKT3Uoq8c
VITE_GROQ_API_KEY=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
GEMINI_API_KEY=AIzaSyBnkHu-XO1MJTOSkcMTDfjYT0tOId5Xnpk
VITE_SENTRY_DSN=https://f74f8d19c5afb1e508b941fb5b3d2af7@o4510275544940545.ingest.us.sentry.io/4510275934748672
```

### Step 2: Check Environment Selection

**CRITICAL:** Each variable must be checked for **Production** environment!

For EACH variable above:
- ✅ Check **Production** checkbox
- ✅ Optionally check **Preview** for testing
- ✅ Optionally check **Development** for local builds

### Step 3: Force Redeploy

After adding/updating environment variables:

**Option A: Redeploy via Dashboard**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **⋯** (three dots)
4. Click **Redeploy**
5. Select **Use existing Build Cache** = OFF
6. Click **Redeploy**

**Option B: Push a commit**
```bash
git commit --allow-empty -m "Trigger Vercel rebuild with env vars"
git push origin main
```

### Step 4: Verify Build Logs

1. After deployment starts, click on the deployment
2. Go to **Building** tab
3. Look for environment variable logs
4. You should see Vite picking up the variables

### Step 5: Test Live Site

1. Visit https://nectarforge.app
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Look for any Stripe errors
5. Try to access the pricing page
6. Try to upgrade (if logged in)

## 🔍 Debugging Commands

### Check what Vercel has
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# List environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.production.local
```

### Check if variables are in build
After deployment, check the build logs for:
```
transforming...
✓ 532 modules transformed.
```

If you see warnings about missing env vars, they weren't loaded.

## 🚨 Common Issues

### Issue 1: Variables exist but not for Production
**Problem:** Variables added but "Production" wasn't checked
**Fix:** Edit each variable, check "Production", save, redeploy

### Issue 2: Old build cache
**Problem:** Vercel is using cached build without new env vars
**Fix:** Redeploy with "Use existing Build Cache" = OFF

### Issue 3: Wrong variable names
**Problem:** Typo in variable name (e.g., `VITE_STRIPE_PRICE_ENTREPENEUR`)
**Fix:** Delete and recreate with exact names above

### Issue 4: Empty values
**Problem:** Variable exists but value is empty
**Fix:** Delete variable, re-add with correct value

### Issue 5: Trailing/Leading spaces
**Problem:** Copied value with extra spaces
**Fix:** Trim value, ensure no spaces: `pk_live_...` not ` pk_live_... `

## 📋 Checklist

Before redeploying:
- [ ] All 7 required variables exist in Vercel
- [ ] Each variable has "Production" checked
- [ ] Values match your .env file exactly
- [ ] No trailing/leading spaces in values
- [ ] Keys start with correct prefix (VITE_ for client-side)

After redeploying:
- [ ] Build completed successfully (green ✓)
- [ ] No errors in build logs
- [ ] Live site loads without Stripe error
- [ ] Browser console has no errors
- [ ] Pricing page loads correctly

## 🔧 Alternative: Use Vercel CLI

If dashboard isn't working, use CLI:

```bash
# Set individual variable
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Then paste value when prompted

# Or import from file
vercel env pull .env.production.local
vercel env push .env.production.local production
```

## 🎯 Expected Result

After fix:
- ✅ No Stripe configuration errors
- ✅ Pricing page loads
- ✅ Checkout works
- ✅ Console shows no errors

## 📞 Still Not Working?

If you've done all the above and it still fails:

1. **Check browser console** on live site:
   - Press F12
   - Go to Console tab
   - Look for the actual error message
   - Send me the error

2. **Check Vercel build logs**:
   - Go to deployment
   - Look for "transforming..." section
   - Check if any warnings about Stripe

3. **Verify API keys are LIVE mode**:
   - Stripe publishable key should start with `pk_live_` (not `pk_test_`)
   - Price IDs should start with `price_` (and be from live mode)

4. **Test with Preview deployment**:
   - Create a new branch
   - Push to GitHub
   - Check if Preview deployment works
   - If yes, issue is with Production env vars only

## 💡 Quick Test

Run this in your browser console on nectarforge.app:

```javascript
console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
console.log('Free Price:', import.meta.env.VITE_STRIPE_PRICE_FREE);
console.log('Entrepreneur Price:', import.meta.env.VITE_STRIPE_PRICE_ENTREPRENEUR);
```

If any show `undefined`, that variable isn't being built into your app.

---

## Summary

The most likely cause is that you added the environment variables to Vercel but didn't:
1. **Check the "Production" checkbox** for each variable
2. **Redeploy** the site after adding them

Fix these two things and your site should work! 🚀
