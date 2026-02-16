# Nectar Forge

AI-powered side-hustle generator built with React + Vite + Convex.

## Stack
- Frontend: React, TypeScript, Tailwind, Vite
- Backend: Convex HTTP actions (`convex/http.ts`)
- Payments: Stripe Checkout + Billing Portal (via Convex)
- AI Providers: Groq and Gemini (via Convex env keys)

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Environment
Copy `.env.example` and fill values:
```bash
cp .env.example .env.local
```

### 3. Convex setup
Use the deployment shown in `.env.local` or pass your own deployment name.

Set backend secrets in Convex:
```bash
npx convex env set STRIPE_SECRET_KEY sk_test_or_sk_live_... --deployment-name quaint-lion-604
npx convex env set STRIPE_WEBHOOK_SECRET whsec_... --deployment-name quaint-lion-604
npx convex env set GROQ_API_KEY gsk_... --deployment-name quaint-lion-604
npx convex env set GEMINI_API_KEY your_gemini_key --deployment-name quaint-lion-604
npx convex env set GOOGLE_CLIENT_ID your_google_oauth_client_id.apps.googleusercontent.com --deployment-name quaint-lion-604
npx convex env set RESEND_API_KEY re_... --deployment-name quaint-lion-604
npx convex env set RESEND_FROM_EMAIL noreply@yourdomain.com --deployment-name quaint-lion-604
```

### 4. Generate Convex code + deploy functions
```bash
CONVEX_DEPLOYMENT=quaint-lion-604 npx convex dev --once --typecheck disable
CONVEX_DEPLOYMENT=quaint-lion-604 npx convex deploy -y --typecheck disable
```

### 5. Run app
```bash
npm run dev
```

## Stripe Endpoints
Implemented in Convex HTTP routes:
- `POST /api/create-checkout-session`
- `POST /api/create-portal-session`
- `POST /api/stripe-webhook`

Stripe webhook URL:
- `https://quaint-lion-604.convex.site/api/stripe-webhook`

## Auth
- Email/password auth is implemented with Convex-backed session tokens.
- Email verification is required before password sign-in.
- Password reset flow is implemented via emailed reset links.
- Google sign-in is implemented through Google Identity credential verification in Convex (`POST /api/auth/google`).

## Signup Emails (Resend)
- The backend sends verification and password reset emails through Resend.
- Required: `RESEND_API_KEY`.
- Recommended: `RESEND_FROM_EMAIL` with a verified sender/domain in Resend.

## Build
```bash
npm run build
npm run preview
```

## Security
- Never put provider secret keys in frontend env vars (`VITE_*`).
- Run a local secret scan before pushing:
```bash
npm run security:scan-secrets
```
- To also scan git history:
```bash
npm run security:scan-secrets:history
```
