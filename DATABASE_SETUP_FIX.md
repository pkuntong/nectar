# 🚨 Quick Fix: Database Tables Don't Exist

The error `relation "user_profiles" does not exist` means you need to run the database migrations in Supabase.

## Quick Fix (5 minutes)

### Step 1: Go to Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Migrations in Order

Run these migration files **in order** (one at a time):

#### Migration 1: Complete Database Setup
1. Open `supabase/migrations/001_complete_database_setup.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Wait for "Success" message

#### Migration 2: Fix Subscriptions
1. Open `supabase/migrations/002_fix_subscriptions_upsert.sql`
2. Copy and paste into SQL Editor
3. Click **Run**

#### Migration 3: Notification Preferences
1. Open `supabase/migrations/003_add_notification_preferences.sql`
2. Copy and paste into SQL Editor
3. Click **Run**

#### Migration 4: Usage Tracking
1. Open `supabase/migrations/add_usage_tracking.sql`
2. Copy and paste into SQL Editor
3. Click **Run**

#### Migration 5: Hustle Outcomes (if exists)
1. Open `supabase/migrations/004_add_hustle_outcomes.sql` (if it exists)
2. Copy and paste into SQL Editor
3. Click **Run**

### Step 3: Verify Tables Exist

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'subscriptions', 'usage_tracking')
ORDER BY table_name;
```

You should see:
- `user_profiles`
- `subscriptions`
- `usage_tracking`

### Step 4: Test Your Query

Now try running your `get-user-list.sql` query again. It should work!

---

## Alternative: Run All Migrations at Once

If you prefer, you can combine all migrations into one file and run it:

1. Copy contents of all migration files in order
2. Paste into SQL Editor
3. Run once

**⚠️ Important:** Run migrations in the correct order (001, 002, 003, etc.)

---

## Still Having Issues?

1. **Check for errors:** Look at the error message in Supabase SQL Editor
2. **Check RLS policies:** Make sure Row Level Security is enabled
3. **Verify auth.users exists:** The `user_profiles` table references `auth.users`

If you see "relation auth.users does not exist", that's a Supabase issue - contact Supabase support.

---

## Need Help?

- Check Supabase Dashboard → Database → Tables to see what exists
- Look at the SQL Editor error messages for specific issues
- Verify you're in the correct Supabase project

