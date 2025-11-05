# Deployment Checklist

## Completed Updates

### 1. Subscription Management ✅
- **What was done:**
  - Created Stripe Customer Portal integration
  - Users with Entrepreneur plan can now manage their subscription
  - Added "Manage Billing & Cancel Subscription" button in Settings
  - Created new edge function: `create-portal-session`

- **Edge Function Deployed:** ✅ `create-portal-session`

### 2. Notification Preferences ✅
- **What was done:**
  - Implemented database storage for notification preferences
  - Toggles now save to database in real-time
  - Preferences persist across sessions
  - Three preferences: Weekly Hustle Digest, Product Updates, Special Offers

- **Database Migration Required:** 📝 `003_add_notification_preferences.sql`

### 3. Footer Updates ✅
- **What was done:**
  - Replaced "Careers" with "Blog"
  - Created new BlogPage component with sample blog posts
  - Added newsletter signup section

---

## Required Database Migrations

You need to run these SQL migrations in your Supabase Dashboard:

### Migration 1: Fix Subscriptions Upsert
**File:** `supabase/migrations/002_fix_subscriptions_upsert.sql`

```sql
-- Add unique constraint for stripe_subscription_id to enable proper upsert
ALTER TABLE subscriptions
ADD CONSTRAINT unique_stripe_subscription_id
UNIQUE (stripe_subscription_id);

-- Also make user_id + stripe_subscription_id unique as a user can only have one active subscription
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_stripe
ON subscriptions(user_id, stripe_subscription_id);
```

**Purpose:** Fixes the subscription tier update issue by enabling proper upsert operations.

---

### Migration 2: Add Notification Preferences
**File:** `supabase/migrations/003_add_notification_preferences.sql`

```sql
-- Add notification_preferences column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"weekly": true, "product": false, "offers": true}'::jsonb;

-- Add index for faster queries on notification preferences
CREATE INDEX IF NOT EXISTS idx_user_profiles_notifications
ON user_profiles USING GIN (notification_preferences);

-- Set default notification preferences for existing users who don't have it
UPDATE user_profiles
SET notification_preferences = '{"weekly": true, "product": false, "offers": true}'::jsonb
WHERE notification_preferences IS NULL;
```

**Purpose:** Enables storage and retrieval of user notification preferences.

---

## How to Apply Migrations

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy the contents of each migration file
4. Paste and execute them one at a time
5. Verify successful execution

---

## Deployed Edge Functions

The following edge functions have been deployed:

1. ✅ `stripe-webhook` - Handles Stripe webhook events (updated with dynamic plan mapping)
2. ✅ `create-checkout-session` - Creates Stripe checkout sessions
3. ✅ `create-portal-session` - Creates Stripe customer portal sessions (NEW)
4. ✅ `delete-user` - Handles account deletion

---

## Stripe Configuration Required

### Enable Customer Portal in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** > **Billing** > **Customer Portal**
3. Enable the portal and configure:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to view invoices
   - ✅ Allow customers to cancel subscriptions
   - Configure cancellation options (immediate vs. end of period)

---

## Testing the New Features

### Test Subscription Management
1. Subscribe to Entrepreneur plan
2. After successful payment, verify account upgrades to "entrepreneur"
3. Go to Settings > Subscription & Billing
4. Click "Manage Billing & Cancel Subscription"
5. Should redirect to Stripe Customer Portal
6. Test updating payment method, viewing invoices, etc.

### Test Notification Preferences
1. Go to Settings > Notification Preferences
2. Toggle each preference (Weekly, Product, Offers)
3. Refresh the page
4. Verify toggles retain their state

### Test Blog Page
1. Click "Blog" in footer
2. Should show new blog page with sample articles
3. Verify all links work
4. Test newsletter signup form

---

## What's Fixed

### Subscription Tier Update Issue
- **Problem:** After subscribing to Entrepreneur plan, account stayed on "free (hustler)" plan
- **Root Cause:**
  1. Webhook used synchronous `constructEvent` instead of async `constructEventAsync`
  2. Plan name was hardcoded to 'entrepreneur' instead of mapping from price ID
  3. Missing unique constraints for upsert operations

- **Solution:**
  1. ✅ Changed to `constructEventAsync` in webhook
  2. ✅ Added price ID to plan name mapping
  3. ✅ Created migration for unique constraints
  4. ✅ Redeployed webhook function

---

## Next Steps

1. **Run Database Migrations** (REQUIRED)
   - Execute `002_fix_subscriptions_upsert.sql`
   - Execute `003_add_notification_preferences.sql`

2. **Configure Stripe Customer Portal** (REQUIRED)
   - Enable portal in Stripe Dashboard
   - Configure cancellation settings

3. **Test Everything**
   - Make a test subscription
   - Verify tier updates correctly
   - Test portal access
   - Toggle notification preferences
   - Visit blog page

---

## File Changes Summary

### New Files Created
- `supabase/functions/create-portal-session/index.ts` - Stripe portal session handler
- `supabase/migrations/002_fix_subscriptions_upsert.sql` - Fix upsert operations
- `supabase/migrations/003_add_notification_preferences.sql` - Add notification storage
- `components/pages/BlogPage.tsx` - New blog page
- `verify-subscription.sh` - Subscription verification script

### Modified Files
- `supabase/functions/stripe-webhook/index.ts` - Fixed async issue, added plan mapping
- `components/Dashboard.tsx` - Added subscription management, notification persistence
- `components/Footer.tsx` - Replaced Careers with Blog
- `App.tsx` - Updated routing for Blog page

---

## Support

If you encounter any issues:
1. Check Supabase function logs
2. Check Stripe webhook logs
3. Run `./verify-subscription.sh` for diagnostics
4. Check browser console for errors

---

**Last Updated:** November 3, 2025
