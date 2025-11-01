# 🚀 Deploy Delete-User Function in Terminal

The Supabase CLI is now updated! Here's how to deploy:

## Step 1: Get Access Token

1. Go to: **https://app.supabase.com**
2. Click your **profile icon** (top right)
3. Click **"Account"** or **"Access Tokens"**
4. Under **"Personal Access Tokens"**, click **"Generate new token"**
5. Give it a name: `nectar-deploy`
6. Click **"Generate token"**
7. **Copy the token** (starts with `sbp_...`)

## Step 2: Login to CLI

Open Terminal in: `/Users/gnotnuk/Documents/nectar`

```bash
cd /Users/gnotnuk/Documents/nectar

supabase login
```

Paste your access token when prompted.

## Step 3: Link Project

```bash
supabase link --project-ref bbzuoynbdzutgslcvyqw
```

## Step 4: Get Service Role Key

1. Go to: https://bbzuoynbdzutgslcvyqw.supabase.co
2. Click **Settings** → **API**
3. Find **"service_role secret"** (it's LONG)
4. Copy it

## Step 5: Set Secret

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="paste_your_service_role_key_here"
```

(Replace `paste_your_service_role_key_here` with the actual key you copied)

## Step 6: Deploy!

```bash
supabase functions deploy delete-user
```

You should see:
```
Deployed Function delete-user
Function URL: https://bbzuoynbdzutgslcvyqw.supabase.co/functions/v1/delete-user
```

## Step 7: Configure Function

1. Go to: https://bbzuoynbdzutgslcvyqw.supabase.co
2. Click **Edge Functions**
3. Click **delete-user**
4. Go to **Settings**
5. Enable **"Verify JWT"** ✅

## Step 8: Test!

1. Open your app: http://localhost:3001/
2. Log in
3. Go to **Dashboard** → **Settings**
4. Click **"Delete My Account"**
5. Confirm twice
6. Success! ✨

---

## If You Get Errors

### "Access denied"
- Make sure you generated an access token
- Try logging out and back in: `supabase logout` then `supabase login`

### "Project not found"
- Check your project-ref: `bbzuoynbdzutgslcvyqw`
- Try linking again: `supabase link --project-ref bbzuoynbdzutgslcvyqw`

### "Secret already exists"
- That's fine! You can skip that step or overwrite it

### "Deployment failed"
- Check logs: `supabase functions logs delete-user`
- Make sure service role key is set correctly

---

## Quick Commands

```bash
# Login
supabase login

# Link project
supabase link --project-ref bbzuoynbdzutgslcvyqw

# Set secret (replace with your actual key)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_key_here"

# Deploy
supabase functions deploy delete-user

# View logs
supabase functions logs delete-user

# List all functions
supabase functions list
```

---

That's it! Once deployed, account deletion will work! 🎉

