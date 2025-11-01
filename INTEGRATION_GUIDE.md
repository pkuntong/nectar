# Integration Guide

## Supabase Authentication

This project is integrated with Supabase for user authentication.

### Environment Variables

The following environment variables are required in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Features Implemented

1. **User Sign Up**: Users can create accounts with email and password
2. **User Login**: Users can log in with email and password
3. **Session Management**: Automatic session handling with Supabase
4. **Logout**: Users can sign out of their accounts
5. **Auth State Persistence**: User session persists across page reloads
6. **Profile Updates**: Users can update their name and email
7. **Account Deletion**: Users can permanently delete their accounts

### Files Modified

- `lib/supabase.ts`: Supabase client configuration
- `components/auth/Login.tsx`: Login form with Supabase auth
- `components/auth/SignUp.tsx`: Sign up form with Supabase auth
- `App.tsx`: Auth state management and user session handling
- `components/Dashboard.tsx`: Profile updates and account deletion
- `supabase/functions/delete-user/index.ts`: Edge function for secure account deletion

### Usage

Users can:
1. Click "Sign Up for Free" to create a new account
2. Click "Login" to sign in with existing credentials
3. View their dashboard when logged in
4. Log out from the dashboard

---

## Stripe Integration

This project is integrated with Stripe for payment processing.

### Environment Variables

The following environment variables are required in your `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Features Implemented

1. **Pricing Plans**: Two subscription plans (Free and Paid)
2. **Stripe Checkout**: Redirect to Stripe for secure payment processing
3. **Payment Flow**: Handles subscription checkout for the Entrepreneur plan

### Files Modified

- `lib/stripe.ts`: Stripe client configuration and checkout utilities
- `components/Pricing.tsx`: Pricing plans with Stripe integration

### Usage

1. Users select a pricing plan
2. Free plan activates immediately (if user is authenticated)
3. Paid plan redirects to Stripe Checkout (requires backend API)
4. After successful payment, user is redirected back

### Important Notes

1. **Backend Required**: The current Stripe integration requires a backend API endpoint to create checkout sessions securely
2. **Price IDs**: Update the Stripe price IDs in `components/Pricing.tsx` with your actual Stripe price IDs
3. **Webhook Setup**: Configure Stripe webhooks to handle payment events on your server

### Next Steps for Production

1. Create a backend API endpoint for creating Stripe checkout sessions
2. Update the `createCheckoutSession` function in `lib/stripe.ts` to call your API
3. Set up Stripe webhooks to handle payment confirmations
4. Update user subscription status in your database after successful payment

---

## Resend Email Service

This project is integrated with [Resend](https://resend.com/) for transactional emails.

### Environment Variables

The following environment variable is required in your `.env` file:

```env
RESEND_API_KEY=re_xxxxxxxxx
```

### Features Implemented

1. **Welcome Emails**: Automatically sent to new users after signup
2. **Password Reset Emails**: Email templates for password recovery
3. **Email Templates**: Beautiful HTML email templates with your branding

### Files Modified

- `lib/resend.ts`: Resend client configuration and email utilities
- `components/auth/SignUp.tsx`: Sends welcome email after successful signup

### Email Templates

- **Welcome Email**: Sent when a new user signs up
- **Password Reset Email**: Template ready for password reset flow

### Usage

```typescript
import { sendWelcomeEmail, sendPasswordResetEmail } from './lib/resend';

// Send welcome email
await sendWelcomeEmail('user@example.com', 'John Doe');

// Send password reset email
await sendPasswordResetEmail('user@example.com', 'https://yourapp.com/reset?token=xxx');
```

### Important Notes

1. **Domain Setup**: Update the `from` email address in `lib/resend.ts` with your verified domain
2. **Production**: In production, email sending should ideally be done via a backend API to keep API keys secure
3. **Email Verification**: Configure your domain in Resend dashboard to enable sending from custom domains

### Next Steps

1. Get your API key from [Resend Dashboard](https://resend.com/api-keys)
2. Verify your domain in Resend for production use
3. Update the `from` email address in `lib/resend.ts`
4. Consider moving email sending to a backend API for production

---

## Sentry Error Monitoring

This project is integrated with [Sentry](https://sentry.io/) for error tracking and monitoring.

### Environment Variables

The following environment variables are required in your `.env` file:

```env
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
```

### Features Implemented

1. **Error Tracking**: Automatic error capture and reporting
2. **Error Boundaries**: React Error Boundaries to catch component errors
3. **Session Replay**: User session replay for debugging (configurable)
4. **Performance Monitoring**: Track performance metrics and transactions

### Files Modified

- `lib/sentry.ts`: Sentry initialization and configuration
- `index.tsx`: Sentry initialization and Error Boundary
- `App.tsx`: Wrapped with Sentry profiler

### Configuration

Sentry is configured with:
- **Error Sample Rate**: 100% of errors in development, adjust for production (e.g., 0.1 for 10%)
- **Session Replay**: 10% of sessions, 100% of sessions with errors
- **Browser Tracing**: Enabled for performance monitoring
- **Environment**: Automatically set based on build mode

### Usage

```typescript
import * as Sentry from '@sentry/react';

// Capture exceptions manually
try {
  // some code
} catch (error) {
  Sentry.captureException(error);
}

// Add user context
Sentry.setUser({ id: '123', email: 'user@example.com' });

// Add custom tags
Sentry.setTag('subscription_tier', 'premium');
```

### Important Notes

1. **DSN**: Get your DSN from your Sentry project settings
2. **Source Maps**: Consider setting up source maps for better error tracking in production
3. **Privacy**: Session replay masks all text and blocks media by default
4. **Rate Limits**: Adjust sample rates in production to manage volume

### Next Steps

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project and get your DSN
3. Add your DSN to `.env` file
4. For production builds, configure source maps upload using `SENTRY_AUTH_TOKEN`

---

## Database Setup (Supabase)

You may want to create the following tables in your Supabase database:

### Users Table
Automatically managed by Supabase Auth

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Profile Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

