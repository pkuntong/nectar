# 🎯 EASY: Deploy via Editor

Since you can click "Deploy new function", here's the easiest way:

## Steps

1. Click **"Deploy new function"** in Supabase Dashboard
2. Click **"Via Editor"** (Option 1)
3. You'll see a code editor with some starter code

## Replace ALL the Code

**DELETE everything in the editor** and paste this instead:

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

## Name the Function

- Function name: `delete-user`

## Deploy!

Click **"Deploy"** button

## Add Service Role Secret

After it deploys:

1. Go to the function settings (click on `delete-user`)
2. Find **"Secrets"** or **"Environment Variables"**
3. Click **"Add Secret"**
4. Key: `SUPABASE_SERVICE_ROLE_KEY`
5. Value: Get it from **Settings → API → service_role secret**
6. Save

## Enable JWT Verification

1. In function settings, find **"Verify JWT"** toggle
2. Make sure it's **ON** ✅

## Test It!

1. Go to your app: http://localhost:3001/
2. Log in
3. Dashboard → Settings
4. Click "Delete My Account"
5. Confirm twice
6. Success! 🎉

---

## That's It!

No terminal needed. No CLI. Just copy, paste, deploy! ✨

