# 🚨 PRODUCTION READINESS AUDIT - Nectar App

**Audit Date:** November 5, 2025
**Audited By:** Senior Full-Stack Engineer
**Status:** ⚠️ REQUIRES FIXES BEFORE PRODUCTION

---

## 🔴 CRITICAL ISSUES (Must Fix Before Production)

### 1. **HARDCODED STRIPE TEST PRICE IDs**
**Location:** `lib/stripe.ts:14-15` and `supabase/functions/stripe-webhook/index.ts:16-18`

```typescript
// ❌ CRITICAL: These are TEST mode price IDs
export const STRIPE_PRICES = {
  free: 'price_1SOM6aDPosqqbsKxdrWWe834',
  entrepreneur: 'price_1SOM7DDPosqqbsKx8lBviJSS'
};
```

**Impact:** Customers will be charged in TEST mode, not LIVE mode. No real payments will be processed.

**Fix Required:**
1. Create LIVE mode prices in Stripe Dashboard (after switching to live mode)
2. Update both files with live price IDs
3. Use environment variables instead:
```typescript
export const STRIPE_PRICES = {
  free: import.meta.env.VITE_STRIPE_PRICE_FREE || 'price_xxx',
  entrepreneur: import.meta.env.VITE_STRIPE_PRICE_ENTREPRENEUR || 'price_xxx'
};
```

---

### 2. **SENSITIVE SECRETS EXPOSED TO FRONTEND**
**Location:** `vite.config.ts:18-24`

```typescript
// ❌ CRITICAL SECURITY ISSUE
define: {
  'process.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.SUPABASE_SERVICE_ROLE_KEY),
  'process.env.STRIPE_SECRET_KEY': JSON.stringify(env.STRIPE_SECRET_KEY),
  'process.env.STRIPE_WEBHOOK_SECRET': JSON.stringify(env.STRIPE_WEBHOOK_SECRET),
  'process.env.SENTRY_AUTH_TOKEN': JSON.stringify(env.SENTRY_AUTH_TOKEN)
}
```

**Impact:** These secrets will be bundled into your frontend JavaScript and exposed to all users. Anyone can:
- Access your database with admin privileges (SERVICE_ROLE_KEY)
- Create fraudulent charges (STRIPE_SECRET_KEY)
- Send fake webhook events (WEBHOOK_SECRET)

**Fix Required:**
1. Remove ALL secret keys from `vite.config.ts`
2. Only expose `VITE_*` prefixed public keys:
```typescript
// ✅ SAFE - Only public keys
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
  'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
  'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
  'process.env.VITE_SENTRY_DSN': JSON.stringify(env.VITE_SENTRY_DSN),
}
```
3. Ensure backend secrets are ONLY in Supabase Edge Function secrets (already correct)

---

### 3. **SENTRY TRACE RATE AT 100%**
**Location:** `lib/sentry.ts:21`

```typescript
// ❌ Will send 100% of transactions to Sentry (expensive!)
tracesSampleRate: 1.0,
```

**Impact:**
- Huge Sentry bills in production
- Performance impact from excessive tracking
- Hit rate limits quickly

**Fix Required:**
```typescript
// ✅ Sample only 10% of transactions in production
tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
```

---

## 🟡 HIGH PRIORITY ISSUES

### 4. **Excessive Console Logging**
**Files Affected:** 13 files with `console.log`, `console.error`, `console.warn`

**Locations:**
- `lib/stripe.ts:20, 24, 30, 52, 57, 63, 77`
- `components/Dashboard.tsx` (multiple)
- `supabase/functions/stripe-webhook/index.ts` (multiple)
- All edge functions

**Impact:**
- Exposes internal logic to users via browser console
- Performance overhead
- Potential security information leakage

**Fix Required:**
Create a production-safe logger:
```typescript
// lib/logger.ts
const isDev = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  error: (...args: any[]) => console.error(...args), // Always log errors
  warn: (...args: any[]) => isDev && console.warn(...args),
};
```

Replace all `console.log` with conditional logging.

---

### 5. **Using `alert()` for Error Messages**
**Files:** `Dashboard.tsx`, `Pricing.tsx`, `DashboardDemo.tsx`, `DashboardHeader.tsx`

**Count:** 19 instances

**Impact:**
- Poor UX (blocking dialogs)
- Not mobile-friendly
- Looks unprofessional

**Fix Required:**
Implement toast notifications:
```bash
npm install react-hot-toast
```

Replace all `alert()` calls with toast notifications.

---

### 6. **Missing Rate Limiting**
**Location:** All Supabase Edge Functions

**Impact:**
- Vulnerable to abuse and DoS attacks
- No protection against spam signups
- Unlimited API calls possible

**Fix Required:**
Add rate limiting to edge functions:
```typescript
// Use Upstash Redis or Supabase built-in rate limiting
import { rateLimit } from '@upstash/ratelimit'
```

---

### 7. **No Content Security Policy (CSP)**
**Location:** `index.html`

**Impact:**
- Vulnerable to XSS attacks
- No protection against malicious scripts
- Fails security audits

**Fix Required:**
Add CSP meta tag to `index.html`:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://js.stripe.com;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               connect-src 'self' https://*.supabase.co https://api.stripe.com;
               img-src 'self' data: https:;">
```

---

## 🟢 MEDIUM PRIORITY ISSUES

### 8. **Tailwind CDN in Production**
**Location:** `index.html:8`

```html
<!-- ❌ Using CDN instead of build process -->
<script src="https://cdn.tailwindcss.com"></script>
```

**Impact:**
- Slower page loads
- Larger bundle size (entire Tailwind loaded)
- Not optimized (unused CSS included)

**Fix Required:**
Install Tailwind properly:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

### 9. **No Environment Variable Validation**
**Impact:**
- App may start with missing configs
- Runtime errors instead of startup errors

**Fix Required:**
Create `lib/env.ts`:
```typescript
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
] as const;

requiredEnvVars.forEach(key => {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
```

---

### 10. **Missing Error Boundaries**
**Location:** `App.tsx`

**Impact:**
- App crashes completely on errors
- No graceful error handling
- Poor UX

**Fix Required:**
Wrap app in Sentry Error Boundary:
```typescript
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

---

### 11. **No Loading States for Stripe Operations**
**Impact:**
- Users may click multiple times
- No feedback during payment processing
- Could create duplicate charges

**Fix Already Implemented:** ✅ `upgrading` and `loading` states exist in Dashboard.tsx

---

### 12. **Stripe Customer Portal Not Configured**
**Status:** Mentioned in DEPLOYMENT_CHECKLIST.md

**Fix Required:**
1. Enable in Stripe Dashboard → Settings → Billing → Customer Portal
2. Configure cancellation settings
3. Add allowed redirect URLs

---

## 🔵 LOW PRIORITY / NICE TO HAVE

### 13. **Missing robots.txt**
**Impact:** SEO implications, crawlers may index unwanted pages

**Fix:**
Create `public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /dashboard
Sitemap: https://yournectar.com/sitemap.xml
```

---

### 14. **No sitemap.xml**
**Impact:** Reduced SEO performance

---

### 15. **Missing OpenGraph Meta Tags**
**Location:** `index.html`

**Impact:**
- Poor social media sharing previews
- Less professional appearance

**Fix:**
```html
<meta property="og:title" content="Nectar - AI Side Hustle Generator">
<meta property="og:description" content="AI-powered income streams">
<meta property="og:image" content="/og-image.png">
<meta property="og:url" content="https://yournectar.com">
<meta name="twitter:card" content="summary_large_image">
```

---

### 16. **No Analytics Tracking**
**Status:** Google Analytics or other analytics not detected

**Recommendation:** Add Google Analytics or Plausible

---

## ✅ GOOD PRACTICES FOUND

1. ✅ `.env` is in `.gitignore`
2. ✅ Environment variables use `VITE_` prefix for public keys
3. ✅ Supabase RLS policies are enabled
4. ✅ Sentry error tracking integrated
5. ✅ Edge functions use proper CORS headers
6. ✅ Database migrations are versioned
7. ✅ Webhook signature verification using `constructEventAsync`
8. ✅ Subscription tier mapping is dynamic
9. ✅ Auth state management with Supabase
10. ✅ Protected routes via user state

---

## 📋 PRE-PRODUCTION CHECKLIST

### Before Switching to Stripe Live Mode

#### A. Environment Variables
- [ ] Update `.env` with LIVE Stripe keys
- [ ] Remove secret keys from `vite.config.ts`
- [ ] Set production Sentry DSN
- [ ] Update Supabase URLs if using different project

#### B. Stripe Configuration
- [ ] Switch Stripe dashboard to Live mode
- [ ] Create new LIVE mode price IDs:
  - Free tier price ID
  - Entrepreneur tier price ID
- [ ] Update `lib/stripe.ts` with live price IDs
- [ ] Update `supabase/functions/stripe-webhook/index.ts` with live price IDs
- [ ] Configure Stripe webhook endpoint with LIVE webhook secret
- [ ] Enable Customer Portal in Stripe Dashboard
- [ ] Test a $0.50 charge in live mode to verify

#### C. Supabase Edge Functions
- [ ] Deploy all functions to production Supabase project:
  ```bash
  supabase functions deploy stripe-webhook
  supabase functions deploy create-checkout-session
  supabase functions deploy create-portal-session
  supabase functions deploy delete-user
  ```
- [ ] Set Edge Function secrets in production:
  ```bash
  supabase secrets set STRIPE_SECRET_KEY=sk_live_...
  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
  supabase secrets set RESEND_API_KEY=re_...
  ```
- [ ] Verify function logs show no errors

#### D. Database
- [ ] Run all migrations in production database:
  - `001_complete_database_setup.sql`
  - `002_fix_subscriptions_upsert.sql`
  - `003_add_notification_preferences.sql`
- [ ] Verify RLS policies are active
- [ ] Test database access with test user account

#### E. Security
- [ ] Fix `vite.config.ts` secret exposure
- [ ] Remove all `console.log` or use conditional logger
- [ ] Add CSP headers
- [ ] Enable HTTPS redirect
- [ ] Add rate limiting to edge functions

#### F. Code Quality
- [ ] Replace all `alert()` with toast notifications
- [ ] Add error boundaries
- [ ] Reduce Sentry trace sample rate to 0.1
- [ ] Install Tailwind properly (remove CDN)

#### G. SEO & Analytics
- [ ] Add OpenGraph meta tags
- [ ] Create robots.txt
- [ ] Add Google Analytics
- [ ] Create sitemap.xml

#### H. Testing
- [ ] Test complete signup flow in incognito
- [ ] Test Stripe checkout with live mode test card
- [ ] Test subscription upgrade
- [ ] Test subscription cancellation via portal
- [ ] Test account deletion
- [ ] Test all notification preferences
- [ ] Test blog page
- [ ] Verify email sending works
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit (target >90 score)

#### I. Monitoring
- [ ] Verify Sentry is receiving events
- [ ] Set up Sentry alerts for critical errors
- [ ] Monitor Stripe webhook delivery
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)

#### J. Legal & Compliance
- [ ] Update Privacy Policy with actual business info
- [ ] Update Terms of Service with actual business info
- [ ] Ensure GDPR compliance
- [ ] Add cookie consent banner if needed

---

## 🚀 DEPLOYMENT STEPS (Step-by-Step)

### Phase 1: Pre-Deployment (Do This First)

1. **Fix Critical Security Issues**
   ```bash
   # Edit vite.config.ts - remove secret keys
   # Edit lib/sentry.ts - reduce trace rate
   ```

2. **Update Stripe Price IDs to Environment Variables**
   ```bash
   # Add to .env
   VITE_STRIPE_PRICE_FREE=price_xxx
   VITE_STRIPE_PRICE_ENTREPRENEUR=price_xxx
   ```

3. **Install Proper Tailwind**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   # Remove CDN from index.html
   ```

4. **Build and Test Locally**
   ```bash
   npm run build
   npm run preview
   ```

### Phase 2: Stripe Setup

5. **Switch Stripe to Live Mode**
   - Go to Stripe Dashboard
   - Toggle "Viewing test data" to "OFF"
   - Note: You'll need to re-create products and prices

6. **Create Live Mode Prices**
   - Create "Free" product (can be $0 or skip)
   - Create "Entrepreneur" product
   - Copy live mode price IDs

7. **Update Code with Live Price IDs**
   ```typescript
   // lib/stripe.ts
   export const STRIPE_PRICES = {
     free: import.meta.env.VITE_STRIPE_PRICE_FREE,
     entrepreneur: import.meta.env.VITE_STRIPE_PRICE_ENTREPRENEUR
   };
   ```

8. **Configure Stripe Webhook for Production**
   - Add endpoint: `https://YOUR_SUPABASE_URL/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook signing secret

### Phase 3: Supabase Production Setup

9. **Deploy Edge Functions**
   ```bash
   supabase link --project-ref YOUR_PROD_PROJECT
   supabase functions deploy stripe-webhook
   supabase functions deploy create-checkout-session
   supabase functions deploy create-portal-session
   supabase functions deploy delete-user
   ```

10. **Set Production Secrets**
    ```bash
    supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
    supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
    supabase secrets set RESEND_API_KEY=re_YOUR_KEY
    ```

11. **Run Database Migrations**
    - Open Supabase Dashboard → SQL Editor
    - Run each migration file in order

### Phase 4: Frontend Deployment

12. **Update Production Environment Variables**
    ```bash
    # In your hosting platform (Vercel/Netlify)
    VITE_SUPABASE_URL=https://your-prod-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your_prod_anon_key
    VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
    VITE_STRIPE_PRICE_FREE=price_xxx
    VITE_STRIPE_PRICE_ENTREPRENEUR=price_xxx
    VITE_SENTRY_DSN=https://your_sentry_dsn
    GEMINI_API_KEY=your_gemini_key
    ```

13. **Deploy to Production**
    ```bash
    # If using Vercel
    vercel --prod

    # If using Netlify
    netlify deploy --prod
    ```

### Phase 5: Post-Deployment Verification

14. **Test Everything**
    - [ ] Open site in incognito
    - [ ] Sign up with test email
    - [ ] Verify email confirmation works
    - [ ] Try to upgrade to Entrepreneur (use test card: 4242 4242 4242 4242)
    - [ ] Verify webhook fires and tier updates
    - [ ] Access subscription portal
    - [ ] Test cancellation
    - [ ] Check Sentry for errors

15. **Monitor First 24 Hours**
    - Watch Sentry dashboard
    - Check Stripe dashboard for payments
    - Monitor Supabase logs
    - Check analytics

---

## 🎯 FINAL RECOMMENDATION

**DO NOT GO TO PRODUCTION** until the following are fixed:

1. ❌ Remove secret keys from vite.config.ts
2. ❌ Update hardcoded Stripe price IDs to live mode
3. ❌ Reduce Sentry trace sample rate
4. ❌ Remove or conditionally hide console.logs
5. ❌ Replace alert() calls with proper UI feedback

**ESTIMATED TIME TO FIX:** 2-4 hours

**RISK LEVEL IF DEPLOYED NOW:** 🔴 CRITICAL

---

## 📞 Questions or Need Help?

If you have questions about any of these issues or need help implementing the fixes, let me know and I can assist with:
- Writing the fixed code
- Creating the proper environment variable structure
- Setting up deployment configurations
- Testing the production build

---

**Report Generated:** November 5, 2025
**Next Review:** After fixes are implemented
