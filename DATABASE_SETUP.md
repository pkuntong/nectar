# Database Setup Guide

## Quick Setup (Recommended)

The easiest way to set up your database is to run the migration directly in the Supabase dashboard:

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/getekqgyhwmbhyznamli
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run the Migration
1. Copy the entire contents of `supabase/migrations/20241130_initial_schema.sql`
2. Paste it into the SQL editor
3. Click **Run** or press `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (Mac)

### Step 3: Verify Tables Were Created
1. Click on **Database** → **Tables** in the left sidebar
2. You should see three new tables:
   - `user_profiles`
   - `subscriptions`
   - `hustle_outcomes`

## What This Migration Does

### Creates Tables:
1. **user_profiles** - Stores user subscription and usage information
   - `id` - User ID (links to auth.users)
   - `subscription_tier` - 'free' or 'entrepreneur'
   - `usage_count` - Number of generations used this week
   - `usage_reset_date` - When the usage count resets
   - `notification_preferences` - User notification settings
   - `stripe_customer_id` - Stripe customer reference

2. **subscriptions** - Stores Stripe subscription details
   - `user_id` - User reference
   - `stripe_subscription_id` - Stripe subscription ID
   - `stripe_price_id` - Stripe price ID
   - `status` - Subscription status
   - `current_period_end` - Billing period end date
   - `plan_name` - Plan name ('free' or 'entrepreneur')

3. **hustle_outcomes** - Tracks user outcomes and progress on generated hustles
   - `user_id` - User reference
   - `hustle_name` - Name of the hustle
   - `took_action` - Whether user took action
   - `launched` - Whether user launched the hustle
   - `revenue` - Revenue generated from the hustle
   - `feedback` - User feedback and lessons learned

### Sets Up Security:
- **Row Level Security (RLS)** - Users can only access their own data
- **Automatic profile creation** - New users automatically get a profile
- **Timestamps** - Automatic created_at and updated_at tracking

## Verifying It Works

After running the migration:

1. **Test Signup**: Create a new account in your app
2. **Check Database**: Go to Database → Table Editor → user_profiles
3. **Verify**: You should see a new row with your user's data

## Usage Limits

The app enforces these limits:
- **Anonymous users**: 3 generations (stored in browser)
- **Free tier**: 5 generations per week (resets every 7 days)
- **Entrepreneur tier**: Unlimited generations

## Troubleshooting

### "Failed to fetch" error
- Make sure you've run the migration SQL
- Check that both tables exist in Database → Tables
- Verify RLS policies are enabled

### Usage not being tracked
- Check that the `handle_new_user()` trigger is working
- Manually verify a row exists in `user_profiles` for your user

### Can't upgrade subscription
- Make sure Edge Functions are deployed (see EDGE_FUNCTIONS_SETUP.md)
- Verify Stripe webhook is configured correctly

## Alternative: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link to your project (if not already linked)
supabase link --project-ref getekqgyhwmbhyznamli

# Push the migration
supabase db push

# Or run migrations manually
supabase db reset
```

## Next Steps

After setting up the database:
1. Test user signup and login
2. Try generating side hustles to verify usage tracking
3. Check that limits are enforced correctly
4. Set up Stripe webhook for subscriptions (if needed)
