# Nectar Forge - AI-Powered Side Hustle Generator

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

**Production-ready AI platform that helps users discover personalized side hustle opportunities.**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)
- Google Cloud Console account (for OAuth)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nectar.git
cd nectar

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Fill in your environment variables (see below)
```

### Environment Variables

Create a `.env` file with:

```env
# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (Required for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_PRICE_FREE=price_xxx
VITE_STRIPE_PRICE_ENTREPRENEUR=price_xxx

# Optional
# Defaults to https://quaint-lion-604.convex.site/api/generate-hustles when not set
# If Convex CLI writes VITE_CONVEX_SITE_URL, the app derives /api/generate-hustles automatically.
VITE_CONVEX_GENERATE_HUSTLES_URL=https://your-deployment.convex.site/api/generate-hustles
VITE_GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SENTRY_DSN=your_sentry_dsn
```

Convex backend secrets used by HTTP actions are configured via CLI:

```bash
npx convex env set STRIPE_SECRET_KEY sk_live_or_sk_test_...
npx convex env set GROQ_API_KEY gsk_...
npx convex env set GEMINI_API_KEY your_gemini_key
```

### Database Setup

1. Go to your Supabase Dashboard → SQL Editor
2. Run the migration files from `supabase/migrations/` in order:
   - `001_complete_database_setup.sql`
   - `002_fix_subscriptions_upsert.sql`
   - `003_add_notification_preferences.sql`
   - `add_usage_tracking.sql`

### Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set secrets (required for Edge Functions)
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret
supabase secrets set RESEND_API_KEY=your_resend_key

# Deploy functions
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
supabase functions deploy send-email
supabase functions deploy delete-user
```

### Google OAuth Setup

1. Visit `/#google-oauth-setup` in your app
2. Follow the on-screen instructions to:
   - Get Google Client ID & Secret from Google Cloud Console
   - Enable Google provider in Supabase Dashboard
   - Add redirect URIs

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📚 Documentation

- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Google Sign-In setup guide
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Deploy to Vercel
- **[PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md)** - Production checklist

## 🏗️ Architecture

```
Frontend (React + Vite + TypeScript)
├── Supabase Auth (email/password + Google OAuth)
├── Stripe Checkout (subscriptions)
└── Sentry (error tracking)

Backend (Supabase Edge Functions - Deno)
├── create-checkout-session (Stripe checkout)
├── create-portal-session (Stripe customer portal)
├── stripe-webhook (Stripe event handling)
├── send-email (Resend email service)
└── delete-user (Account deletion)

Database (Supabase PostgreSQL)
├── auth.users (Supabase Auth)
├── user_profiles (user data)
├── subscriptions (Stripe subscriptions)
└── usage_tracking (API usage limits)
```

## 🎯 Features

### ✅ Implemented
- User authentication (email/password + Google OAuth)
- Subscription management (Free & Entrepreneur tiers)
- Stripe payment integration
- Email notifications (Resend)
- Error tracking (Sentry)
- Usage limits and tracking
- Responsive UI/UX
- Production-ready security

### 🔄 Coming Soon
- AI-powered side hustle recommendations
- Advanced analytics dashboard
- Progress tracking
- Community features

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚢 Deployment

### Frontend (Vercel - Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for details.

### Backend (Supabase Edge Functions)

Already deployed via Supabase CLI (see Deploy Edge Functions above).

## 🔒 Security

- ✅ Environment variables properly separated
- ✅ Sensitive operations in Edge Functions
- ✅ Row Level Security (RLS) enabled
- ✅ HTTPS enforced in production
- ✅ OAuth secrets stored securely
- ✅ Stripe webhook signature verification

## 📊 Database Schema

### `user_profiles`
- `id` (UUID, references auth.users)
- `full_name` (text)
- `subscription_tier` (enum: 'free', 'entrepreneur')
- `stripe_customer_id` (text, nullable)
- `created_at`, `updated_at` (timestamps)

### `subscriptions`
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `stripe_subscription_id` (text, unique)
- `stripe_price_id` (text)
- `status` (text)
- `plan_name` (text)
- `current_period_end` (timestamp)

### `usage_tracking`
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `action_type` (text)
- `count` (integer)
- `period_start`, `period_end` (timestamps)

## 🧪 Testing

### Test Authentication
- Sign up with email/password
- Sign in with Google OAuth
- Test password reset flow

### Test Payments (Stripe Test Mode)
- Use test card: `4242 4242 4242 4242`
- Test subscription creation
- Test subscription cancellation via portal

### Test Edge Functions
- Check Supabase Dashboard → Edge Functions → Logs
- Verify webhook events in Stripe Dashboard

## 🐛 Troubleshooting

**OAuth not working?**
- Check [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
- Verify redirect URIs in Google Cloud Console
- Ensure Client Secret is saved in Supabase

**Payments not working?**
- Verify Stripe keys are set correctly
- Check Edge Functions are deployed
- Verify webhook endpoint in Stripe Dashboard

**Database errors?**
- Run migrations in order
- Check RLS policies are enabled
- Verify service role key permissions

## 📦 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase Edge Functions (Deno)
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **Email:** Resend
- **Monitoring:** Sentry
- **AI:** Groq, Gemini

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here]

## 📞 Support

- Documentation: Check the `/docs` folder
- Issues: GitHub Issues
- Email: support@nectarforge.app

---

**Built with ❤️ for entrepreneurs and side hustlers**
