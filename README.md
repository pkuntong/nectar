<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Nectar - AI-Powered Side Hustle Generator

An AI-powered platform that helps users discover personalized side hustle opportunities.

## 🚀 What's Been Set Up

Your Nectar application is now fully integrated with:

- ✅ **Supabase** - User authentication and database
- ✅ **Stripe** - Payment processing and subscriptions
- ✅ **Resend** - Transactional email service
- ✅ **Sentry** - Error tracking and monitoring
- ✅ **Gemini AI** - AI-powered recommendations

## 📋 Current Status

### What Works Right Now
- Sign up and login (with Supabase)
- User session management
- All UI components
- Dashboard for logged-in users
- Sentry error tracking (when configured)

### What Needs Setup
1. **Supabase credentials** - Required to run the app
2. **Stripe products** - For payment processing
3. **Edge Functions deployment** - For payments and emails
4. **Resend API key** - For sending emails
5. **Sentry DSN** - For error tracking (optional)

## 🎯 Quick Start

### Absolute Minimum (10 minutes)
Just want to see it run with auth?

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create Supabase project** at [supabase.com](https://supabase.com)

3. **Add credentials to `.env`:**
   ```env
   VITE_SUPABASE_URL=your_url_here
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```

4. **Run the SQL** from [QUICKSTART.md](QUICKSTART.md) in Supabase SQL Editor

5. **Start dev server:**
   ```bash
   npm run dev
   ```

You now have a working app with authentication! 🎉

### Full Setup (1-2 hours)
Want payments and emails too?

Follow the **[QUICKSTART.md](QUICKSTART.md)** guide for step-by-step instructions.

## 📚 Documentation

We've created comprehensive guides for you:

### Start Here
- **[QUICKSTART.md](QUICKSTART.md)** - Get running in minutes
- **[API_INTEGRATION_STATUS.md](API_INTEGRATION_STATUS.md)** - See what's integrated

### Detailed Guides
- **[SETUP.md](SETUP.md)** - Complete setup instructions for all services
- **[STRIPE_SETUP.md](STRIPE_SETUP.md)** - Create Stripe products step-by-step
- **[DEPLOY_EDGE_FUNCTIONS.md](DEPLOY_EDGE_FUNCTIONS.md)** - Deploy backend functions
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Technical integration details

## 🏗️ Architecture

```
Frontend (React + Vite)
├── Supabase Auth (sign up/login)
├── Stripe (payments)
└── Sentry (error tracking)

Backend (Supabase Edge Functions)
├── create-checkout-session (Stripe)
├── stripe-webhook (Stripe events)
└── send-email (Resend)

Database (Supabase PostgreSQL)
├── auth.users (managed by Supabase)
├── user_profiles (custom)
└── subscriptions (custom)
```

## 🔑 Environment Variables

Your `.env` file has been created from `.env.example`. You need to fill in:

**Required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Optional (but recommended):**
- `GEMINI_API_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `VITE_SENTRY_DSN`

**Note:** Never commit `.env` to Git. It's already in `.gitignore`.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 What's Included

### Components
- `Header` - Navigation with login/signup
- `Hero` - Landing page hero section
- `Features` - Feature showcase
- `Pricing` - Subscription plans with Stripe integration
- `Dashboard` - User dashboard (requires auth)
- `Login` - Login form
- `SignUp` - Registration form

### Integrations
- `lib/supabase.ts` - Supabase client
- `lib/stripe.ts` - Stripe integration
- `lib/resend.ts` - Email templates (for reference)
- `lib/sentry.ts` - Error tracking

### Backend Functions
- `supabase/functions/create-checkout-session` - Stripe checkout
- `supabase/functions/stripe-webhook` - Handle Stripe events
- `supabase/functions/send-email` - Send transactional emails
- `supabase/functions/delete-user` - Permanently delete user accounts

## 🎨 Customization

### Update Branding
- Colors defined in `index.css`
- Logo and app name in components
- Email templates in `supabase/functions/send-email`

### Update Pricing
1. Create products in Stripe Dashboard
2. Update price IDs in `lib/stripe.ts`
3. Adjust pricing display in `components/Pricing.tsx`

## 🚢 Deployment

### Frontend
Deploy to:
- Vercel (recommended)
- Netlify
- Cloudflare Pages

### Backend (Edge Functions)
Deploy to Supabase:
```bash
supabase functions deploy
```

See [DEPLOY_EDGE_FUNCTIONS.md](DEPLOY_EDGE_FUNCTIONS.md) for details.

## 🔒 Security

- ✅ Environment variables properly separated (public vs private)
- ✅ Sensitive operations (payments, emails) in Edge Functions
- ✅ Row Level Security enabled on database tables
- ✅ Supabase Auth handles password security
- ✅ Stripe handles payment security
- ✅ HTTPS enforced in production

## 📊 Database Schema

### user_profiles
- `id` - References auth.users
- `full_name` - User's name
- `subscription_tier` - Current plan (free/entrepreneur)
- `stripe_customer_id` - Stripe customer reference

### subscriptions
- `id` - Unique ID
- `user_id` - References auth.users
- `stripe_subscription_id` - Stripe subscription reference
- `status` - Subscription status
- `plan_name` - Plan type

## 🧪 Testing

### Test Authentication
1. Sign up with a test email
2. Log in
3. Access dashboard

### Test Payments (in Test Mode)
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Test Emails
Sign up with your real email to receive welcome message.

## 🐛 Troubleshooting

See [QUICKSTART.md](QUICKSTART.md#getting-help) for common issues and solutions.

**Common Issues:**
- Missing environment variables → Check `.env` file
- Stripe not working → Update price IDs in `lib/stripe.ts`
- Emails not sending → Deploy Edge Functions and set Resend key

## 📱 Features

### Current
- User authentication (email/password)
- Subscription tiers (Free & Paid)
- Stripe checkout integration
- Email notifications
- Error tracking with Sentry

### Coming Soon
- AI-powered side hustle recommendations
- User analytics dashboard
- Progress tracking
- Community features

## 🤝 Support

- Check the documentation files in this repository
- Review error messages in console
- Check Sentry dashboard for errors
- Refer to service documentation:
  - [Supabase Docs](https://supabase.com/docs)
  - [Stripe Docs](https://stripe.com/docs)
  - [Resend Docs](https://resend.com/docs)

---

## Next Steps

1. **Read [QUICKSTART.md](QUICKSTART.md)** to get started
2. **Set up Supabase** (required)
3. **Configure Stripe** (for payments)
4. **Deploy Edge Functions** (for full functionality)
5. **Test everything** works
6. **Launch your app!** 🚀

Need help? Start with the QUICKSTART guide and work through the setup step by step.

**Happy building! 💪**
