# 🚨 DEPLOY THIS EDGE FUNCTION MANUALLY

## Step-by-Step Instructions

Since CLI deployment requires authentication you'll need to do yourself, here's how to deploy via the web dashboard:

---

## 1. Go to Your Supabase Dashboard

Open: **https://bbzuoynbdzutgslcvyqw.supabase.co**

Or: https://app.supabase.com → Select your project

---

## 2. Navigate to Edge Functions

1. In the left sidebar, click **"Edge Functions"**
2. Look for one of these options:
   - **"New Function"** button
   - **"Create Function"** button
   - **"Add Function"** button
   - **"Deploy"** or **"Deploy Function"** button
   - A plus sign **"+"** button
   
If you don't see any of these buttons, scroll down to **"Option B: Zip Upload"** below! ⬇️

---

## 3. Create the Function

- **Function Name:** `delete-user`
- **Language:** Deno

---

## 4. Copy This Code

**COPY THIS ENTIRE CODE:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get Supabase client to verify the requesting user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Delete the user using admin client
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      throw deleteError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

---

## 5. Set Environment Variables (Secrets)

In the Supabase Dashboard:

1. Go to **Settings** → **API**
2. Find **"service_role secret"** 
3. Copy it (it's LONG, starts with `eyJ...`)

Then:

1. Go back to **Edge Functions** → **delete-user**
2. Click on the function settings
3. Look for **"Environment Variables"** or **"Secrets"** section
4. Add this secret:

**Key:** `SUPABASE_SERVICE_ROLE_KEY`  
**Value:** *(paste the service_role key you copied)*

---

## 6. Configure Function Access

1. Still in the function settings
2. Find **"Verify JWT"** toggle
3. Make sure it's **CHECKED** ✅
4. This ensures only authenticated users can call it

---

## 7. Deploy

Click **"Deploy"** button

Wait for it to deploy... you should see:
- ✅ Function deployed successfully
- Function URL: `https://bbzuoynbdzutgslcvyqw.supabase.co/functions/v1/delete-user`

---

## 8. Test It!

1. Open your app: http://localhost:3001/
2. Log in
3. Go to **Dashboard** → **Settings**
4. Scroll to **"Danger Zone"**
5. Click **"Delete My Account"**
6. Click again to confirm
7. Confirm the final prompt

**Result:** Account should be permanently deleted! 🎉

---

## If You Get Errors

### "Function not found"
- The function wasn't deployed correctly
- Try deploying again

### "Service role key not set"
- Make sure you added `SUPABASE_SERVICE_ROLE_KEY` as a secret
- Check the value is correct

### "User not authenticated"
- Make sure "Verify JWT" is enabled
- User must be logged in

### Check Logs
In Supabase Dashboard:
1. Go to **Edge Functions** → **delete-user**
2. Click **"Logs"** tab
3. Look for any error messages

---

## ⬇️ OPTION B: Zip Upload (If No Button Appears)

If you don't see a "Create Function" button, use the zip upload method:

### 1. Download the Zip File

A zip file has been created in your project folder:
**Location:** `/Users/gnotnuk/Documents/nectar/delete-user.zip`

### 2. Upload to Supabase

1. Go to **Edge Functions** in your Supabase Dashboard
2. Look for one of these options:
   - **"Deploy from archive"**
   - **"Upload Function"**
   - **"Import"**
   - Or a drag-and-drop area
3. Select `delete-user.zip` from your computer
4. Click **"Deploy"** or **"Upload"**

### 3. Set the Service Role Secret

After uploading:

1. Click on the **delete-user** function
2. Go to **Settings** or **Configuration**
3. Find **"Secrets"** or **"Environment Variables"**
4. Add:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Your service role key (from Settings → API → service_role secret)

### 4. Enable JWT Verification

In the function settings, make sure **"Verify JWT"** is **enabled** ✅

### 5. Done!

Now test account deletion in your app!

---

## 🚨 If You Still Can't Find It

Try the CLI method instead:

1. Open Terminal in `/Users/gnotnuk/Documents/nectar`
2. Run these commands:

```bash
# Get your access token from https://app.supabase.com/account/tokens
export SUPABASE_ACCESS_TOKEN=your_access_token_here

# Link your project
supabase link --project-ref bbzuoynbdzutgslcvyqw

# Deploy the function
supabase functions deploy delete-user
```

---

## That's It!

Once deployed, account deletion will work permanently.

No more "failed to delete account" errors! ✨

