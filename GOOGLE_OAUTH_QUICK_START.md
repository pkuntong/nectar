# 🚀 Quick Access: Google OAuth Setup

## How to Access the Setup Page

You can access the Google OAuth setup page in two ways:

### Option 1: Direct URL (Recommended)
Open your browser and navigate to:
```
http://localhost:3000/#google-oauth-setup
```
(Replace with your production URL when deployed)

### Option 2: Programmatically
In your browser console, run:
```javascript
window.location.hash = 'google-oauth-setup';
```

---

## What You'll See

1. **Input Form**: Enter your Google Client ID and Client Secret
2. **Setup Instructions**: Step-by-step guide with:
   - How to get your Google Client ID from Google Cloud Console
   - How to enable Google provider in Supabase
   - Copy buttons for easy credential copying
   - Testing instructions

---

## Quick Steps Summary

1. **Get Google Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth credentials
   - Copy Client ID and Client Secret

2. **Enter Credentials**
   - Access the setup page: `/#google-oauth-setup`
   - Enter your Client ID and Secret
   - Click "Continue to Setup Instructions"

3. **Configure Supabase**
   - Follow the on-screen instructions
   - Enable Google provider in Supabase Dashboard
   - Paste your credentials
   - Save

4. **Test**
   - Go to login page
   - Click "Sign in with Google"
   - Verify it works!

---

## Files Created

- `components/GoogleOAuthSetup.tsx` - Main setup component
- `components/pages/GoogleOAuthSetupPage.tsx` - Page wrapper
- `GOOGLE_OAUTH_SETUP.md` - Detailed documentation

---

## Need Help?

See the full guide: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

