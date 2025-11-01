# ⚡ Deploy Account Deletion NOW

## Quick Steps

The Edge Function needs to be deployed. Follow these steps:

### 1. Get Supabase Access Token

1. Go to https://app.supabase.com
2. Click your profile (top right)
3. Go to "Access Tokens"
4. Generate a new token
5. Copy it

### 2. Set the Token

```bash
export SUPABASE_ACCESS_TOKEN=your_token_here
```

### 3. Link Your Project

```bash
supabase link --project-ref bbzuoynbdzutgslcvyqw
```

### 4. Set the Service Role Key

Get it from: Supabase Dashboard → Settings → API → service_role secret

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 5. Deploy!

```bash
supabase functions deploy delete-user
```

### 6. Test

1. Go to http://localhost:3001
2. Log in
3. Dashboard → Settings → Delete Account
4. Confirm twice
5. Done! ✨

## Alternative: Manual Deployment

If CLI doesn't work, you can deploy via the Supabase Dashboard:

### Option A: Via Dashboard UI

1. Go to your Supabase Dashboard
2. Navigate to "Edge Functions"
3. Click "Create a new function"
4. Name it: `delete-user`
5. Copy the contents of `supabase/functions/delete-user/index.ts`
6. Paste into the code editor
7. Click "Deploy"

### Option B: Zip Upload

1. Create a zip file with just the `delete-user` function:
   ```bash
   cd supabase/functions
   zip -r delete-user.zip delete-user/
   ```

2. In Supabase Dashboard → Edge Functions
3. Click "Deploy from archive"
4. Upload the zip file
5. Set environment variables (secrets):
   - `SUPABASE_SERVICE_ROLE_KEY`: your service role key

## Get Your Service Role Key

1. Go to https://bbzuoynbdzutgslcvyqw.supabase.co
2. Click "Settings" → "API"
3. Find "service_role secret"
4. Copy it (keep it secret!)

## Troubleshooting

### Still not working?

1. Check the function logs in Supabase Dashboard
2. Check browser console for errors
3. Make sure the function has JWT verification enabled
4. Ensure the service role key is set as a secret

### Don't have access?

Ask the project owner to add you as a collaborator or deploy the function themselves.

## Success!

Once deployed, account deletion will:
- ✅ Work immediately
- ✅ Permanently delete accounts
- ✅ Sign users out automatically
- ✅ Redirect to homepage

No more "failed to delete" errors! 🎉

