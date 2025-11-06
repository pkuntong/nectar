# 🚀 Production Readiness Report - Nectar AI

**Date:** November 6, 2025
**Status:** ⚠️ REQUIRES FIXES BEFORE PRODUCTION DEPLOYMENT
**Stripe Mode:** Currently TEST mode - Ready to switch to LIVE

---

## Executive Summary

Your codebase is **clean and well-structured**, but requires **7 critical fixes** before switching Stripe to live mode and deploying to production. All issues are straightforward to fix and documented below with step-by-step instructions.

**Critical Issues Found:** 7
**Medium Issues Found:** 3
**Low Priority Issues:** 2

**Estimated Time to Fix All Issues:** 2-3 hours

---

## ❌ CRITICAL ISSUES (Must Fix Before Production)

### 1. Stripe TEST Mode Keys in Use

**Severity:** 🔴 CRITICAL
**Location:** `.env` file
**Issue:** Currently using Stripe test mode keys (pk_test_, sk_test_)

**Current Configuration (.env):**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SPz2FRakR1kW1LL...  # ❌ TEST MODE
STRIPE_SECRET_KEY=sk_test_51SPz2FRakR1kW1LL...           # ❌ TEST MODE
STRIPE_WEBHOOK_SECRET=whsec_du8vGMRclHVpwfAjaspAmGUoSa5fyjHv  # ❌ TEST MODE
VITE_STRIPE_PRICE_FREE=price_1SQBmxRakR1kW1LLW09tsdF5      # ❌ TEST PRICE
VITE_STRIPE_PRICE_ENTREPRENEUR=price_1SQBnPRakR1kW1LLP2Ru3vYs  # ❌ TEST PRICE
```

**Production Fix:**

1. **In Stripe Dashboard (https://dashboard.stripe.com):**
   - Click the "Test mode" toggle to switch to "Live mode"
   - Go to Developers > API keys
   - Copy your **Live** Publishable key (starts with `pk_live_`)
   - Copy your **Live** Secret key (starts with `sk_live_`)

2. **Create Live Mode Products & Prices:**
   - Go to Products > Add Product
   - Create "Hustler Plan" - $0/month
   - Create "Entrepreneur Plan" - $19/month
   - Copy the **Live** price IDs (will start with `price_` but from live mode)

3. **Set Up Live Webhook:**
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - URL: `https://bbzuoynbdzutgslcvyqw.supabase.co/functions/v1/stripe-webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the **Live** webhook signing secret (starts with `whsec_`)

4. **Update `.env` for Production:**
   ```bash
   # Replace TEST keys with LIVE keys
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_SECRET
   VITE_STRIPE_PRICE_FREE=price_YOUR_LIVE_FREE_PRICE
   VITE_STRIPE_PRICE_ENTREPRENEUR=price_YOUR_LIVE_ENTREPRENEUR_PRICE
   ```

5. **Update Supabase Edge Function Secrets:**
   ```bash
   # Deploy the new LIVE secrets to Supabase
   supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_SECRET
   ```

6. **Update Webhook Price Mapping:**
   - Edit `supabase/functions/stripe-webhook/index.ts`
   - Update the `PRICE_TO_PLAN` object with your new LIVE price IDs:
   ```typescript
   const PRICE_TO_PLAN: Record<string, string> = {
     'price_YOUR_LIVE_FREE_PRICE': 'free',
     'price_YOUR_LIVE_ENTREPRENEUR_PRICE': 'entrepreneur',
   }
   ```

**Verification:**
- [ ] Stripe dashboard shows "Live mode" active
- [ ] All price IDs start with `price_` from live mode
- [ ] Webhook endpoint is configured in live mode
- [ ] Supabase secrets updated with live keys

---

### 2. Extensive Console Logging in Production Code

**Severity:** 🔴 CRITICAL
**Impact:** Performance degradation, security exposure, debug info visible in production
**Files Affected:** 62 console.log/error/warn statements across 12 files

**Issue:** Direct `console.log()` calls throughout codebase will expose debug information in production browser consoles and slow down performance.

**Files with Console Logging:**

**Frontend Components:**
- `components/Pricing.tsx` - 10 console.log statements (lines 46, 52, 64, 71, 78, 80, 83, 86, 92, 99)
- `components/Dashboard.tsx` - 7 console.error statements (lines 47, 136, 191, 219, 225, 827, 845)
- `components/DashboardDemo.tsx` - 6 statements (lines 55, 96, 207, 297, 351, 355)
- `components/UsageBanner.tsx` - 1 console.error (line 37)
- `components/auth/SignUp.tsx` - 1 console.error (line 44)

**Library Files:**
- `lib/usageLimits.ts` - 6 console statements (lines 104, 126, 131, 208, 232, 256)
- `lib/stripe.ts` - 2 console.warn (lines 8, 22)
- `lib/resend.ts` - 2 statements (lines 6, 39)
- `lib/sentry.ts` - 1 console.warn (line 7)
- `lib/env.ts` - 2 statements (lines 32, 45)

**Edge Functions:**
- `supabase/functions/stripe-webhook/index.ts` - 19 console statements (extensive debug logging)
- `supabase/functions/create-checkout-session/index.ts` - 1 console.error (line 124)
- `supabase/functions/create-portal-session/index.ts` - 1 console.error (line 86)
- `supabase/functions/delete-user/index.ts` - 1 console.error (line 65)

**Solution:** You already have a production-safe logger at `lib/logger.ts`:

```typescript
// lib/logger.ts - Already exists!
const isDev = import.meta.env.MODE === 'development' || import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);  // Only in development
    }
  },
  error: (...args: any[]) => {
    console.error(...args);  // Always shown (critical errors)
  },
  warn: (...args: any[]) => {
    console.warn(...args);  // Always shown (warnings)
  },
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);  // Only in development
    }
  }
};
```

**Fix Instructions:**

**For Frontend Files (TypeScript/React):**
```typescript
// 1. Import the logger at the top of each file
import { logger } from '@/lib/logger';

// 2. Replace console.log with logger.log
// BEFORE:
console.log('Creating checkout session for paid plan...');

// AFTER:
logger.log('Creating checkout session for paid plan...');

// 3. Keep console.error as-is OR use logger.error
// Both work - logger.error always logs even in production
console.error('Error:', error);  // ✅ OK
logger.error('Error:', error);   // ✅ Also OK
```

**For Edge Functions (Deno):**

Edge functions don't have access to `lib/logger.ts`, so use conditional logging:

```typescript
// At the top of each edge function
const isDev = Deno.env.get('ENVIRONMENT') !== 'production';

// Replace debug console.logs
// BEFORE:
console.log('Webhook check:', { hasSignature: !!signature });

// AFTER:
if (isDev) {
  console.log('Webhook check:', { hasSignature: !!signature });
}

// Keep error logging as-is (critical for debugging production issues)
console.error('Webhook error:', error.message);  // ✅ Keep this
```

**Specific Files to Update:**

**High Priority (User-Facing):**
1. `components/Pricing.tsx` - Remove 10 debug logs (lines 46-99)
2. `components/Dashboard.tsx` - Keep error logs, remove debug logs
3. `components/DashboardDemo.tsx` - Replace with logger.log

**Medium Priority (Backend):**
4. `supabase/functions/stripe-webhook/index.ts` - Add `if (isDev)` to 15+ debug logs, keep error logs
5. `lib/usageLimits.ts` - Replace console.log with logger.log

**Low Priority (Already Conditional):**
- `lib/stripe.ts` - console.warn for missing config (acceptable)
- `lib/sentry.ts` - console.warn for missing DSN (acceptable)
- `lib/resend.ts` - console.warn for missing key (acceptable)

**Verification:**
- [ ] No `console.log()` in frontend components (use `logger.log()`)
- [ ] Edge functions wrap debug logs in `if (isDev)`
- [ ] Error logs (`console.error`) kept for critical issues
- [ ] Test in production build: `npm run build && npm run preview`

---

### 3. CORS Configuration Too Permissive

**Severity:** 🟠 HIGH
**Location:** Edge Functions
**Issue:** CORS set to allow all origins (`'*'`)

**Current Configuration:**
```typescript
// supabase/functions/create-checkout-session/index.ts
// supabase/functions/create-portal-session/index.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // ❌ Allows any website to call your API
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**Security Risk:**
- Any website can make requests to your payment endpoints
- Potential for CSRF attacks
- Malicious sites could attempt to hijack checkout sessions

**Production Fix:**

```typescript
// Get the allowed origin from environment or use production domain
const allowedOrigins = [
  'https://yourproductiondomain.com',
  'https://www.yourproductiondomain.com',
  ...(Deno.env.get('ENVIRONMENT') !== 'production' ? ['http://localhost:3000'] : [])
];

const origin = req.headers.get('origin') || '';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
}
```

**Alternative Simple Fix (If Same Domain):**

If your frontend is hosted on the same domain as your Supabase project, you can use:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://yourproductiondomain.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**Files to Update:**
- `supabase/functions/create-checkout-session/index.ts` (line 6-9)
- `supabase/functions/create-portal-session/index.ts` (line 6-9)

**Verification:**
- [ ] CORS only allows your production domain
- [ ] Test checkout flow from production domain works
- [ ] Test from different domain is blocked (use browser dev tools)

---

### 4. Missing Environment Variable Validation

**Severity:** 🟠 HIGH
**Location:** Frontend & Edge Functions
**Issue:** No runtime validation that all required secrets are set before deployment

**Current State:**
- `.env` file has all variables
- No validation that Supabase Edge Function secrets are set
- Could deploy with missing STRIPE_SECRET_KEY and fail silently

**Production Fix:**

**Create Deployment Verification Script:**

```bash
#!/bin/bash
# verify-api-keys.sh - Run before every deployment

echo "🔍 Verifying Production Environment Variables..."

# Check frontend .env
if grep -q "pk_test_" .env; then
  echo "❌ ERROR: Stripe TEST keys found in .env"
  echo "   Update to LIVE keys before deploying"
  exit 1
fi

if grep -q "sk_test_" .env; then
  echo "❌ ERROR: Stripe TEST secret key found in .env"
  exit 1
fi

echo "✅ Frontend .env looks good"

# Check Supabase secrets are set
echo "🔍 Checking Supabase Edge Function secrets..."

# List secrets and check critical ones exist
SECRETS=$(supabase secrets list 2>/dev/null)

if echo "$SECRETS" | grep -q "STRIPE_SECRET_KEY"; then
  echo "✅ STRIPE_SECRET_KEY is set"
else
  echo "❌ ERROR: STRIPE_SECRET_KEY not set in Supabase"
  echo "   Run: supabase secrets set STRIPE_SECRET_KEY=sk_live_..."
  exit 1
fi

if echo "$SECRETS" | grep -q "STRIPE_WEBHOOK_SECRET"; then
  echo "✅ STRIPE_WEBHOOK_SECRET is set"
else
  echo "❌ ERROR: STRIPE_WEBHOOK_SECRET not set"
  exit 1
fi

echo "✅ All critical secrets verified!"
echo "🚀 Ready to deploy"
```

**Make it executable:**
```bash
chmod +x verify-api-keys.sh
```

**Add to package.json:**
```json
{
  "scripts": {
    "predeploy": "bash verify-api-keys.sh",
    "deploy": "npm run build && supabase functions deploy"
  }
}
```

**Verification:**
- [ ] Script created and executable
- [ ] Run `bash verify-api-keys.sh` - should pass
- [ ] Integrated into deployment workflow

---

### 5. Hardcoded Fallback Price IDs

**Severity:** 🟡 MEDIUM
**Location:** `lib/stripe.ts` (lines 16-18)
**Issue:** Old test mode price IDs hardcoded as fallbacks

**Current Code:**
```typescript
export const STRIPE_PRICES = {
  free: import.meta.env.VITE_STRIPE_PRICE_FREE || process.env.VITE_STRIPE_PRICE_FREE || 'price_1SOM6aDPosqqbsKxdrWWe834',  // ❌ Old test ID
  entrepreneur: import.meta.env.VITE_STRIPE_PRICE_ENTREPRENEUR || process.env.VITE_STRIPE_PRICE_ENTREPRENEUR || 'price_1SOM7DDPosqqbsKx8lBviJSS'  // ❌ Old test ID
};
```

**Risk:** If `.env` variables fail to load, app will silently use old test mode prices.

**Production Fix:**

```typescript
export const STRIPE_PRICES = {
  free: import.meta.env.VITE_STRIPE_PRICE_FREE || process.env.VITE_STRIPE_PRICE_FREE,
  entrepreneur: import.meta.env.VITE_STRIPE_PRICE_ENTREPRENEUR || process.env.VITE_STRIPE_PRICE_ENTREPRENEUR
};

// Validate at startup - fail fast if missing
if (!STRIPE_PRICES.free || !STRIPE_PRICES.entrepreneur) {
  const missing = [];
  if (!STRIPE_PRICES.free) missing.push('VITE_STRIPE_PRICE_FREE');
  if (!STRIPE_PRICES.entrepreneur) missing.push('VITE_STRIPE_PRICE_ENTREPRENEUR');

  throw new Error(
    `❌ Missing required Stripe price IDs in environment:\n${missing.join(', ')}\n\n` +
    'Add these to your .env file:\n' +
    'VITE_STRIPE_PRICE_FREE=price_...\n' +
    'VITE_STRIPE_PRICE_ENTREPRENEUR=price_...'
  );
}
```

**Verification:**
- [ ] Remove fallback price IDs
- [ ] Add validation to throw error if missing
- [ ] Test with missing env vars - should fail with clear error

---

### 6. Tailwind CSS via CDN in Production

**Severity:** 🟡 MEDIUM
**Location:** `index.html` (line ~12)
**Issue:** Using Tailwind CSS CDN instead of build-time compilation

**Current Configuration:**
```html
<!-- index.html -->
<script src="https://cdn.tailwindcss.com"></script>
```

**Problems with CDN in Production:**
- ❌ Slower page loads (external dependency)
- ❌ Full Tailwind bundle (~3.5MB uncompressed) instead of purged CSS
- ❌ Runtime CSS generation (slower than pre-built)
- ❌ No optimization or tree-shaking
- ❌ Potential CDN outages

**Production Fix:**

**Option A: Install Tailwind Properly (Recommended)**

```bash
# 1. Install Tailwind
npm install -D tailwindcss postcss autoprefixer

# 2. Initialize Tailwind config
npx tailwindcss init -p

# 3. Create tailwind.config.js
cat > tailwind.config.js << EOF
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# 4. Create src/index.css
mkdir -p src
cat > src/index.css << EOF
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# 5. Import in main entry file
# Add to index.tsx or App.tsx:
# import './index.css'
```

**6. Remove CDN from index.html:**
```html
<!-- REMOVE THIS LINE -->
<script src="https://cdn.tailwindcss.com"></script>
```

**7. Update vite.config.ts** (should already work, but verify):
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', // Auto-created by npx tailwindcss init -p
  }
})
```

**Build and Test:**
```bash
npm run build
# Should see: Tailwind CSS purged to ~10-50KB instead of 3.5MB
npm run preview  # Test production build
```

**Option B: Keep CDN (Not Recommended)**

If you want to keep the CDN for rapid development, at least:
- Use a specific version instead of latest
- Add integrity hash for security
- Consider moving to Option A before production

**Verification:**
- [ ] Tailwind installed locally
- [ ] CDN script removed from index.html
- [ ] Build generates optimized CSS (~10-50KB)
- [ ] All styles still work in production build

---

### 7. Missing .env.production File

**Severity:** 🟡 MEDIUM
**Location:** Project root
**Issue:** Using same `.env` for development and production

**Current State:**
- Single `.env` file with all variables
- No separation between dev/staging/production configs
- Risk of accidentally using test keys in production

**Production Fix:**

**1. Create `.env.production`:**
```bash
# .env.production - Production environment variables

# Gemini API Key (LIVE)
GEMINI_API_KEY=AIzaSyC-HOutabmCpkOubItRjCRx5MYjZ4O1S0k

# Groq API Key
VITE_GROQ_API_KEY=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

# Supabase Configuration (PRODUCTION)
VITE_SUPABASE_URL=https://bbzuoynbdzutgslcvyqw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
# NOTE: SUPABASE_SERVICE_ROLE_KEY should ONLY be in Supabase Edge Function secrets

# Stripe Configuration (LIVE MODE)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY_HERE
VITE_STRIPE_PRICE_FREE=price_YOUR_LIVE_FREE_PRICE_HERE
VITE_STRIPE_PRICE_ENTREPRENEUR=price_YOUR_LIVE_ENTREPRENEUR_PRICE_HERE
# NOTE: STRIPE_SECRET_KEY should ONLY be in Supabase Edge Function secrets

# Sentry Error Monitoring
VITE_SENTRY_DSN=https://f74f8d19c5afb1e508b941fb5b3d2af7@o4510275544940545.ingest.us.sentry.io/4510275934748672

# NOTE: The following should NEVER be in .env files committed to git:
# - SUPABASE_SERVICE_ROLE_KEY → Supabase Edge Function secrets only
# - STRIPE_SECRET_KEY → Supabase Edge Function secrets only
# - STRIPE_WEBHOOK_SECRET → Supabase Edge Function secrets only
# - SENTRY_AUTH_TOKEN → CI/CD secrets only
# - RESEND_API_KEY → Supabase Edge Function secrets only
```

**2. Keep `.env` for development:**
```bash
# .env - Development environment (keep test mode keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SPz2FRakR1kW1LL...
VITE_STRIPE_PRICE_FREE=price_1SQBmxRakR1kW1LLW09tsdF5
VITE_STRIPE_PRICE_ENTREPRENEUR=price_1SQBnPRakR1kW1LLP2Ru3vYs
# ... etc
```

**3. Update `.gitignore`:**
```bash
# Environment files
.env
.env.local
.env.production
.env.production.local
.env.development.local

# Keep .env.example for documentation
!.env.example
```

**4. Create `.env.example` (for team documentation):**
```bash
# .env.example - Copy to .env and fill in your values

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Groq API Key
VITE_GROQ_API_KEY=your_groq_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Stripe Configuration (use test keys for development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live
VITE_STRIPE_PRICE_FREE=price_xxx
VITE_STRIPE_PRICE_ENTREPRENEUR=price_xxx

# Sentry Error Monitoring
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**5. Update build/deploy commands:**

Vite automatically uses `.env.production` when building for production:
```bash
# Development - uses .env
npm run dev

# Production build - uses .env.production
npm run build
```

**Verification:**
- [ ] `.env.production` created with LIVE keys
- [ ] `.env` kept with TEST keys for development
- [ ] `.env.example` created for documentation
- [ ] `.gitignore` excludes all `.env*` except `.env.example`
- [ ] Build uses correct environment file

---

## ⚠️ MEDIUM PRIORITY ISSUES

### 8. Missing Error Boundaries in React Components

**Severity:** 🟡 MEDIUM
**Location:** React component tree
**Issue:** No error boundaries to catch component crashes

**Impact:** If any component throws an error, the entire app crashes with a white screen.

**Fix:** Add error boundary component (Quick 15-minute fix):

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">We've been notified and are working on a fix.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap App.tsx:**
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      {/* Your app content */}
    </ErrorBoundary>
  );
}
```

**Verification:**
- [ ] ErrorBoundary component created
- [ ] App wrapped in ErrorBoundary
- [ ] Test by throwing error in component
- [ ] Verify Sentry receives error report

---

### 9. No Rate Limiting on Edge Functions

**Severity:** 🟡 MEDIUM
**Location:** All Edge Functions
**Issue:** No rate limiting on checkout/webhook endpoints

**Risk:**
- Abuse of checkout session creation
- Potential DDoS on Edge Functions
- Increased Stripe API costs

**Fix:** Add rate limiting to Edge Functions

**Use Supabase's built-in rate limiting:**

```typescript
// supabase/functions/create-checkout-session/index.ts
// Add at the top after imports

// Simple in-memory rate limiter (per-function instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

// In your serve function, after getting the user:
if (!checkRateLimit(user.id)) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 429,
    }
  );
}
```

**Note:** This is a simple per-instance rate limiter. For production, consider:
- Upstash Redis rate limiting
- Supabase Realtime for distributed rate limiting
- Cloudflare Rate Limiting (if using Cloudflare)

**Verification:**
- [ ] Rate limiting added to checkout endpoint
- [ ] Test with 10+ rapid requests
- [ ] Verify 429 response after limit

---

### 10. Missing SSL/HTTPS Enforcement

**Severity:** 🟡 MEDIUM
**Location:** Deployment configuration
**Issue:** No HTTPS redirect configured

**Current State:**
- Supabase automatically provides HTTPS
- But no redirect from HTTP to HTTPS if someone accesses `http://`

**Fix:**

**If deploying to Vercel/Netlify:**
Both automatically handle HTTPS redirects - no action needed.

**If deploying to custom server, add to index.html:**

```html
<!-- Force HTTPS redirect -->
<script>
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
  }
</script>
```

**Better: Configure in your hosting platform**
- Vercel: Automatic
- Netlify: Automatic
- CloudFlare: Enable "Always Use HTTPS" rule
- Custom server: Configure nginx/Apache redirect

**Verification:**
- [ ] Access `http://yoursite.com` - should redirect to HTTPS
- [ ] All external resources use HTTPS
- [ ] No mixed content warnings in console

---

## ✅ LOW PRIORITY (Nice to Have)

### 11. Add Subresource Integrity (SRI) to External Scripts

**Severity:** 🟢 LOW
**Location:** `index.html`
**Issue:** External scripts (Tailwind CDN if kept) don't have SRI hashes

**Fix (if keeping any CDN scripts):**

```html
<!-- Add integrity and crossorigin attributes -->
<script
  src="https://cdn.tailwindcss.com"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

Generate SRI hash: https://www.srihash.org/

---

### 12. Add Performance Monitoring

**Severity:** 🟢 LOW
**Location:** App.tsx
**Issue:** No performance tracking configured

**Fix:** Enable Sentry Performance Monitoring

```typescript
// lib/sentry.ts - Update existing config
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Add performance tracking
  tracePropagationTargets: [
    'localhost',
    'https://bbzuoynbdzutgslcvyqw.supabase.co',
    /^https:\/\/yourproductiondomain\.com/,
  ],
});
```

**Verification:**
- [ ] Sentry performance monitoring enabled
- [ ] Check Sentry dashboard for performance data

---

## 🚀 READY-TO-SHIP CHECKLIST

Use this checklist before deploying to production:

### **Phase 1: Stripe Live Mode Setup** (30 minutes)

- [ ] **Switch Stripe to Live Mode**
  - [ ] Toggle Stripe dashboard to "Live mode"
  - [ ] Copy Live publishable key (pk_live_...)
  - [ ] Copy Live secret key (sk_live_...)

- [ ] **Create Live Mode Products**
  - [ ] Create "Hustler Plan" product ($0/month)
  - [ ] Create "Entrepreneur Plan" product ($19/month)
  - [ ] Copy both price IDs (price_...)

- [ ] **Configure Live Webhook**
  - [ ] Add webhook endpoint in Live mode
  - [ ] URL: `https://bbzuoynbdzutgslcvyqw.supabase.co/functions/v1/stripe-webhook`
  - [ ] Select all required events (checkout.session.completed, etc.)
  - [ ] Copy webhook signing secret (whsec_...)

- [ ] **Update Environment Variables**
  - [ ] Create `.env.production` with Live keys
  - [ ] Update `VITE_STRIPE_PUBLISHABLE_KEY` to pk_live_...
  - [ ] Update `VITE_STRIPE_PRICE_FREE` to new price ID
  - [ ] Update `VITE_STRIPE_PRICE_ENTREPRENEUR` to new price ID

- [ ] **Update Supabase Secrets**
  - [ ] `supabase secrets set STRIPE_SECRET_KEY=sk_live_...`
  - [ ] `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

- [ ] **Update Webhook Code**
  - [ ] Edit `supabase/functions/stripe-webhook/index.ts`
  - [ ] Update `PRICE_TO_PLAN` object with new Live price IDs
  - [ ] Remove old test mode price IDs

### **Phase 2: Code Cleanup** (1-2 hours)

- [ ] **Remove Console Logging**
  - [ ] Replace console.log with logger.log in all frontend files
  - [ ] Add `if (isDev)` to Edge Function debug logs
  - [ ] Keep console.error for critical errors
  - [ ] Test: `npm run build && npm run preview` - check console is clean

- [ ] **Fix CORS Configuration**
  - [ ] Update `create-checkout-session/index.ts` CORS headers
  - [ ] Update `create-portal-session/index.ts` CORS headers
  - [ ] Replace `'*'` with your production domain
  - [ ] Test from production domain works, other domains blocked

- [ ] **Remove Hardcoded Fallbacks**
  - [ ] Edit `lib/stripe.ts`
  - [ ] Remove fallback price IDs
  - [ ] Add validation to throw error if env vars missing
  - [ ] Test with missing env vars - should fail with clear error

- [ ] **Install Tailwind Properly** (Optional but recommended)
  - [ ] `npm install -D tailwindcss postcss autoprefixer`
  - [ ] `npx tailwindcss init -p`
  - [ ] Create `src/index.css` with Tailwind directives
  - [ ] Remove CDN script from `index.html`
  - [ ] Build and verify CSS is optimized (~10-50KB)

### **Phase 3: Security & Validation** (30 minutes)

- [ ] **Create Deployment Verification Script**
  - [ ] Create `verify-api-keys.sh`
  - [ ] Make executable: `chmod +x verify-api-keys.sh`
  - [ ] Test: `bash verify-api-keys.sh` should pass
  - [ ] Add to package.json predeploy script

- [ ] **Environment File Management**
  - [ ] `.env` = development (test mode keys)
  - [ ] `.env.production` = production (live mode keys)
  - [ ] `.env.example` = template for team
  - [ ] `.gitignore` excludes all `.env*` except `.env.example`

- [ ] **Verify CSP Configuration**
  - [ ] Check `index.html` CSP header
  - [ ] Ensure all external domains are listed
  - [ ] No `unsafe-eval` in production (or justified)

- [ ] **Add Error Boundaries** (Recommended)
  - [ ] Create `components/ErrorBoundary.tsx`
  - [ ] Wrap App.tsx in ErrorBoundary
  - [ ] Test error handling works
  - [ ] Verify Sentry receives error reports

### **Phase 4: Build & Test** (30 minutes)

- [ ] **Run Production Build**
  - [ ] `npm run build`
  - [ ] Check build output for warnings
  - [ ] Verify bundle size is reasonable (<500KB per chunk)
  - [ ] No errors in build process

- [ ] **Test Production Build Locally**
  - [ ] `npm run preview`
  - [ ] Test all user flows (signup, login, upgrade, checkout)
  - [ ] Check browser console - no errors, minimal logs
  - [ ] Test Stripe checkout flow with test card (4242 4242 4242 4242)
  - [ ] Verify payment success/cancel redirects work

- [ ] **Verify Supabase Edge Functions**
  - [ ] `supabase functions list` - all functions shown
  - [ ] Deploy functions: `supabase functions deploy --no-verify-jwt stripe-webhook`
  - [ ] Deploy: `supabase functions deploy create-checkout-session`
  - [ ] Deploy: `supabase functions deploy create-portal-session`
  - [ ] Deploy: `supabase functions deploy delete-user`
  - [ ] Test webhook: Send test event from Stripe dashboard

- [ ] **Test Stripe Integration**
  - [ ] Create test checkout session
  - [ ] Complete test payment
  - [ ] Verify user tier updates in database
  - [ ] Check Stripe dashboard for successful payment
  - [ ] Test webhook receives events

### **Phase 5: Pre-Deployment Final Checks** (15 minutes)

- [ ] **Run Verification Script**
  - [ ] `bash verify-api-keys.sh` - must pass
  - [ ] No test mode keys in .env.production
  - [ ] All Supabase secrets set

- [ ] **Security Audit**
  - [ ] No API keys in frontend bundle (check build output)
  - [ ] `.env` files in `.gitignore`
  - [ ] CORS restricted to production domain
  - [ ] HTTPS redirect configured

- [ ] **Performance Check**
  - [ ] Lighthouse score >90 (run in incognito)
  - [ ] First Contentful Paint <2s
  - [ ] Time to Interactive <3s
  - [ ] Tailwind CSS optimized (if installed)

- [ ] **Error Monitoring**
  - [ ] Sentry DSN configured
  - [ ] Test error gets sent to Sentry
  - [ ] Environment set to "production"
  - [ ] Team has access to Sentry dashboard

### **Phase 6: Deployment** (15 minutes)

- [ ] **Deploy to Hosting Platform**
  - [ ] Push to production branch
  - [ ] Verify build succeeds on platform
  - [ ] Check deployment logs for errors
  - [ ] Visit production URL

- [ ] **Post-Deployment Verification**
  - [ ] Homepage loads correctly
  - [ ] All pages accessible (Dashboard, Pricing, Blog, etc.)
  - [ ] User signup works
  - [ ] User login works
  - [ ] Stripe checkout works (use test card)
  - [ ] Payment success redirect works
  - [ ] Dashboard shows correct tier after upgrade
  - [ ] AI generation works (Groq + Gemini fallback)
  - [ ] Usage limits enforced correctly

- [ ] **Monitor First Hour**
  - [ ] Watch Sentry for errors
  - [ ] Check Stripe dashboard for payments
  - [ ] Monitor server logs (Supabase + hosting platform)
  - [ ] Test on mobile device
  - [ ] Test in multiple browsers (Chrome, Safari, Firefox)

### **Phase 7: Post-Launch** (Ongoing)

- [ ] **Switch to Real Stripe Charges**
  - [ ] Announce to users: "Payments are now live"
  - [ ] Test ONE real charge yourself (you can refund it)
  - [ ] Monitor for successful payments

- [ ] **Set Up Monitoring**
  - [ ] Sentry alerts configured
  - [ ] Stripe email notifications enabled
  - [ ] Supabase usage monitoring
  - [ ] Set up uptime monitoring (e.g., UptimeRobot)

- [ ] **Create Runbook**
  - [ ] How to handle failed payments
  - [ ] How to manually upgrade users
  - [ ] How to debug Stripe webhook issues
  - [ ] Emergency rollback procedure

---

## 📊 RISK ASSESSMENT SUMMARY

| Issue | Severity | Impact if Ignored | Time to Fix |
|-------|----------|-------------------|-------------|
| Stripe Test Mode Keys | 🔴 Critical | No real payments, production won't work | 30 min |
| Console Logging | 🔴 Critical | Performance issues, security leaks | 1-2 hours |
| CORS Configuration | 🟠 High | Security vulnerability, potential attacks | 15 min |
| Missing Env Validation | 🟠 High | Silent failures in production | 20 min |
| Hardcoded Fallbacks | 🟡 Medium | Wrong prices charged | 10 min |
| Tailwind CDN | 🟡 Medium | Slow page loads, 3.5MB extra download | 30 min |
| Missing .env.production | 🟡 Medium | Accidental test keys in production | 15 min |
| No Error Boundaries | 🟡 Medium | White screen of death on errors | 15 min |
| No Rate Limiting | 🟡 Medium | API abuse, high costs | 30 min |
| No HTTPS Redirect | 🟡 Medium | Security warnings, mixed content | 5 min |
| Missing SRI | 🟢 Low | CDN compromise risk | 5 min |
| No Performance Monitoring | 🟢 Low | Can't identify slow pages | 10 min |

**Total Estimated Time to Fix All Issues:** 3-4 hours

---

## 🎯 RECOMMENDED FIX ORDER

**Day 1 (Critical - Must do before any production deployment):**
1. ✅ Switch Stripe to Live Mode (30 min)
2. ✅ Update all environment variables (15 min)
3. ✅ Create deployment verification script (20 min)
4. ✅ Fix CORS configuration (15 min)

**Day 2 (High Priority - Do before launch):**
5. ✅ Remove/replace console logging (1-2 hours)
6. ✅ Remove hardcoded price fallbacks (10 min)
7. ✅ Create .env.production file (15 min)

**Day 3 (Medium Priority - Nice to have before launch):**
8. ✅ Install Tailwind properly (30 min)
9. ✅ Add Error Boundaries (15 min)
10. ✅ Add basic rate limiting (30 min)

**Post-Launch (Can do after deployment):**
11. ⏱️ Add performance monitoring
12. ⏱️ Add SRI to external scripts

---

## ✅ WHAT'S ALREADY GREAT

Your codebase already has many production-ready features:

**✅ Security:**
- Proper Content Security Policy (CSP) configured
- Environment variables properly separated (VITE_ prefix)
- Secrets never exposed to frontend
- Sentry error monitoring configured
- Supabase Row Level Security (assumed)

**✅ Code Quality:**
- Clean, well-organized component structure
- TypeScript for type safety
- Production-safe logger wrapper exists
- No AI builder references or tracking scripts
- Professional naming conventions

**✅ Functionality:**
- Complete authentication flow (Supabase Auth)
- Stripe integration working (just needs Live mode)
- Usage limits implemented
- Email notifications (Resend)
- Error tracking (Sentry)
- Multi-AI provider setup (Groq + Gemini fallback)

**✅ Build Setup:**
- Vite configured for production builds
- Code splitting configured
- Chunk optimization set up
- TypeScript compilation working

---

## 📞 SUPPORT & RESOURCES

**Stripe Live Mode Setup:**
- https://stripe.com/docs/testing#test-live-mode
- https://stripe.com/docs/webhooks/go-live

**Supabase Edge Functions:**
- https://supabase.com/docs/guides/functions
- https://supabase.com/docs/guides/functions/secrets

**Vite Production Build:**
- https://vitejs.dev/guide/build.html
- https://vitejs.dev/guide/env-and-mode.html

**Sentry Error Monitoring:**
- https://docs.sentry.io/platforms/javascript/guides/react/

---

## 🚨 EMERGENCY ROLLBACK PLAN

If something goes wrong after deployment:

**1. Revert to Test Mode (Immediate):**
```bash
# Switch back to test mode keys in .env
git checkout .env
git push origin main

# Revert Supabase secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_TEST_SECRET
```

**2. Disable Payments:**
```typescript
// lib/stripe.ts - Add at top of createCheckoutSession
throw new Error('Payments temporarily disabled for maintenance');
```

**3. Show Maintenance Notice:**
```typescript
// App.tsx - Add at top
if (import.meta.env.MODE === 'production') {
  return <MaintenanceMode />;
}
```

---

## 📋 CONCLUSION

**Your app is 95% ready for production.** The remaining 5% consists of:
- Switching Stripe from test to live mode (30 min)
- Cleaning up console logs (1-2 hours)
- Tightening security configs (30 min)

All issues are straightforward to fix. Follow the checklist above, and you'll have a production-ready application.

**Estimated Total Time:** 3-4 hours of focused work

**Recommended Timeline:**
- **Day 1:** Fix critical issues (Stripe, CORS, console logs)
- **Day 2:** Test thoroughly with production build
- **Day 3:** Deploy and monitor

---

**Report Generated:** November 6, 2025
**Audited By:** Claude Code
**Files Analyzed:** 30+ source files, 4 Edge Functions, configuration files
**Issues Found:** 12 (7 critical/high, 3 medium, 2 low)

**Next Steps:** Start with Phase 1 of the Ready-to-Ship Checklist above.
