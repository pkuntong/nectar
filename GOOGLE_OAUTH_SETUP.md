# 🔐 Google OAuth Setup Guide

This guide will help you enable Google Sign-In for your Nectar Forge application.

## Quick Overview

1. **Get Google Client ID & Secret** from Google Cloud Console
2. **Enable Google Provider** in Supabase Dashboard
3. **Add Redirect URIs** to Google Cloud Console
4. **Test** the integration

---

## Step 1: Get Your Google Client ID & Secret

### 1.1 Go to Google Cloud Console

Visit: [https://console.cloud.google.com](https://console.cloud.google.com)

### 1.2 Create or Select a Project

- If you don't have a project, click **"Create Project"**
- Give it a name (e.g., "Nectar Forge")
- Click **"Create"**

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Fill in the required fields:
   - **App name**: Nectar Forge
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **"Save and Continue"**
5. Skip scopes for now (click **"Save and Continue"**)
6. Add test users if needed (click **"Save and Continue"**)
7. Review and click **"Back to Dashboard"**

### 1.4 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Give it a name: **"Nectar Forge Web Client"**

### 1.5 Add Authorized Redirect URIs

⚠️ **CRITICAL STEP** - This is required for OAuth to work!

1. In the **"Authorized redirect URIs"** section, click **"+ ADD URI"**
2. Add this EXACT redirect URI (replace with your actual Supabase project ID):
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```
   **Example:** `https://bbzuoynbdzutgslcvyqw.supabase.co/auth/v1/callback`

3. **Optional** - For local development, you can also add:
   ```
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   ```

**How to find your Supabase project ID:**
- Go to Supabase Dashboard → Settings → API
- Your project URL looks like: `https://xxxxx.supabase.co`
- Use that `xxxxx` part in the redirect URI

**⚠️ If you already created credentials:**
- Click on your existing OAuth client ID in the credentials list
- Click **"Edit"**
- Add the redirect URI above
- Click **"Save"**

### 1.6 Save Your Credentials

1. Click **"Create"**
2. **Copy and save**:
   - **Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Client Secret** (click "Show" to reveal it)

⚠️ **Keep these secure!** You'll need them for the next step.

---

## Step 2: Enable Google Provider in Supabase

### 2.1 Go to Supabase Dashboard

Visit: [https://supabase.com/dashboard](https://supabase.com/dashboard)

### 2.2 Navigate to Authentication Settings

1. Select your project
2. Go to **Authentication** → **Providers**
3. Find **"Google"** in the list of providers

### 2.3 Configure Google Provider

1. Click on **"Google"**
2. Toggle **"Enable Google provider"** to **ON**
3. Enter your credentials:
   - **Client ID (Client Key)**: Paste your Google Client ID
   - **Client Secret (Secret Key)**: Paste your Google Client Secret
   - ⚠️ **IMPORTANT**: Make sure BOTH fields are filled in before clicking Save
4. Click **"Save"** - You should see a success message

✅ Google OAuth is now enabled!

**⚠️ Common Mistake**: If you only enter the Client ID and forget the Client Secret, you'll get the error: `"Unsupported provider: missing OAuth secret"`. Make sure BOTH fields are filled!

---

## Step 3: Test Your Setup

### 3.1 Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to your login page
3. Click **"Sign in with Google"**
4. You should be redirected to Google's sign-in page
5. After signing in, you'll be redirected back to your dashboard

### 3.2 Troubleshooting

**Issue: "missing OAuth secret" or "validation_failed"**
- ⚠️ **Most Common Issue**: You didn't save the Client Secret in Supabase
- Go back to Supabase Dashboard → Authentication → Providers → Google
- Make sure BOTH Client ID AND Client Secret are entered
- Click "Save" again
- Wait a few seconds for the changes to propagate

**Issue: "Redirect URI mismatch" or "doesn't comply with Google's OAuth 2.0 policy"**
- ⚠️ **Most Common Issue**: The Supabase redirect URI is not added to Google Cloud Console
- Go to Google Cloud Console → APIs & Services → Credentials
- Click on your OAuth client ID → **Edit**
- In "Authorized redirect URIs", add: `https://your-project.supabase.co/auth/v1/callback`
  - Replace `your-project` with your actual Supabase project ID (e.g., `bbzuoynbdzutgslcvyqw`)
- Click **Save**
- The redirect URI must match EXACTLY (including `https://`, no trailing slash)
- Wait a few minutes for changes to propagate

**Issue: "Invalid client"**
- Double-check your Client ID and Client Secret in Supabase
- Make sure there are no extra spaces when copying
- Try copying and pasting again

**Issue: "Access blocked"**
- If your OAuth consent screen is in "Testing" mode, add your email as a test user
- Or publish your app (if you're ready for production)

---

## Important Notes

### Security

- ✅ **Client Secret** should NEVER be exposed in client-side code
- ✅ Supabase handles the OAuth flow securely on the backend
- ✅ Your Client Secret is stored securely in Supabase's dashboard

### Redirect URIs

You need to add redirect URIs in **two places**:

1. **Google Cloud Console** - Authorized redirect URIs
2. **Supabase** - Automatically handles redirects (no manual configuration needed)

### Production Checklist

Before going live:

- [ ] Update redirect URIs in Google Cloud Console to your production domain
- [ ] Publish your OAuth consent screen (if ready)
- [ ] Test Google Sign-In on production
- [ ] Verify users can sign in and access the dashboard

---

## Need Help?

- **Google Cloud Console Docs**: [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- **Supabase Docs**: [Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- **Your Client ID**: Check the setup component in your app

---

## Quick Reference

**Where to find your Client ID:**
- Google Cloud Console → APIs & Services → Credentials

**Where to configure Supabase:**
- Supabase Dashboard → Authentication → Providers → Google

**Redirect URI format:**
- Development: `http://localhost:3000/auth/callback`
- Production: `https://yourdomain.com/auth/callback`
- Supabase: `https://your-project.supabase.co/auth/v1/callback`

