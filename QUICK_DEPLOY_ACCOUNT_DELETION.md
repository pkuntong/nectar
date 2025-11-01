# Quick Guide: Deploy Account Deletion

## The Issue

Account deletion is failing because the `delete-user` Edge Function hasn't been deployed yet to Supabase.

## Quick Fix (5 minutes)

### Step 1: Check if you have Supabase CLI

```bash
which supabase
```

If not installed, install it:
```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase CLI

```bash
supabase login
```

This will open your browser for authentication.

### Step 3: Find Your Project Reference ID

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Click on your project
3. Look at the URL: `https://app.supabase.com/project/YOUR-PROJECT-REF`
4. Or go to Settings → General → Reference ID

### Step 4: Link Your Project

```bash
supabase link --project-ref YOUR-PROJECT-REF
```

Replace `YOUR-PROJECT-REF` with the actual ID from step 3.

### Step 5: Set the Service Role Key

Get your service role key from:
1. Supabase Dashboard → Settings → API
2. Look for "service_role secret" (keep this secret!)

Then run:
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 6: Deploy the Delete-User Function

```bash
supabase functions deploy delete-user
```

Wait for it to deploy. You should see:
```
Deployed Function delete-user
Function URL: https://your-project.supabase.co/functions/v1/delete-user
```

### Step 7: Test It

1. Go to your app: http://localhost:3001/
2. Log in
3. Go to Dashboard → Settings
4. Scroll to "Danger Zone"
5. Click "Delete My Account"
6. Confirm twice
7. Your account should be permanently deleted!

## Troubleshooting

### Error: "Not logged in"
**Solution:** Run `supabase login` again

### Error: "Could not find project"
**Solution:** Check your project reference ID and try linking again

### Error: "Secret already exists"
**Solution:** That's fine, you can update it or skip this step

### Error: "Deployment failed"
**Solution:** Check the logs with:
```bash
supabase functions logs delete-user --follow
```

### Still can't delete account
**Solution:** Check your browser console (F12) for the exact error message

## Verify Deployment

Check that the function is deployed:
```bash
supabase functions list
```

You should see `delete-user` in the list.

Or check in your Supabase Dashboard:
1. Go to Edge Functions
2. You should see `delete-user` listed

## That's It!

Once deployed, account deletion will work permanently. The function will:
- ✅ Verify the user is authenticated
- ✅ Use admin privileges to delete the account
- ✅ Sign out the user automatically
- ✅ Redirect to homepage

## Need Help?

See the full documentation:
- [ACCOUNT_DELETION_SETUP.md](ACCOUNT_DELETION_SETUP.md) - Detailed setup guide
- [DEPLOY_EDGE_FUNCTIONS.md](DEPLOY_EDGE_FUNCTIONS.md) - Deploy all Edge Functions
- [API_INTEGRATION_STATUS.md](API_INTEGRATION_STATUS.md) - Integration status

