# 🚨 Quick Fix: Redirect URI Error

## Error Message
```
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
If you're the app developer, register the redirect URI in the Google Cloud Console.
Request details: redirect_uri=https://bbzuoynbdzutgslcvyqw.supabase.co/auth/v1/callback
```

## Quick Fix (2 Minutes)

### Step 1: Go to Google Cloud Console
1. Visit: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Select your project

### Step 2: Edit Your OAuth Credentials
1. Find your OAuth client ID in the list
2. Click on it (or click the **Edit** icon/pencil)
3. Scroll down to **"Authorized redirect URIs"**

### Step 3: Add the Redirect URI
1. Click **"+ ADD URI"**
2. Paste this EXACT URI (from your error message):
   ```
   https://bbzuoynbdzutgslcvyqw.supabase.co/auth/v1/callback
   ```
   ⚠️ **Important**: Copy it EXACTLY as shown - no extra spaces, no trailing slash

3. Click **"SAVE"** at the bottom

### Step 4: Wait & Test
- Wait 1-2 minutes for Google to update
- Try signing in with Google again

---

## Your Specific Redirect URI

Based on your error, you need to add:
```
https://bbzuoynbdzutgslcvyqw.supabase.co/auth/v1/callback
```

---

## Visual Guide

1. **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Click on your **OAuth 2.0 Client ID**
3. Scroll to **"Authorized redirect URIs"**
4. Click **"+ ADD URI"**
5. Paste: `https://bbzuoynbdzutgslcvyqw.supabase.co/auth/v1/callback`
6. Click **"SAVE"**

---

## Still Not Working?

- Make sure there are **no extra spaces** before or after the URI
- Make sure it's **exactly** `https://bbzuoynbdzutgslcvyqw.supabase.co/auth/v1/callback`
- Wait a few minutes - Google can take 2-5 minutes to update
- Try clearing your browser cache
- Make sure you're editing the **correct OAuth client ID** (the one you're using in Supabase)

---

## Need More Help?

See the full setup guide: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

