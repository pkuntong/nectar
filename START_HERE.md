# 🚀 START HERE: Deploy Delete Function

## Quick Method (Recommended!)

### 1️⃣ Open Supabase Dashboard

Go to: **https://bbzuoynbdzutgslcvyqw.supabase.co**

### 2️⃣ Deploy Function

1. Click **"Edge Functions"** in the left sidebar
2. Click **"Deploy new function"**
3. Click **"Via Editor"**
4. You'll see an editor with starter code

### 3️⃣ Copy the Code

Open the file `EASY_DEPLOY_NOW.md` in this folder and copy ALL the code from it.

**OR** copy this entire code block:

<details>
<summary>Click to expand and copy the code</summary>

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

</details>

### 4️⃣ Paste & Deploy

1. **DELETE all the default code** in the editor
2. **PASTE** the code you copied
3. Function name: **`delete-user`**
4. Click **"Deploy"**

Wait for it to deploy... ✅

### 5️⃣ Add Secret

After deployment:

1. Click on the **`delete-user`** function
2. Find **"Secrets"** section
3. Click **"Add Secret"**
4. Key: **`SUPABASE_SERVICE_ROLE_KEY`**
5. Value: Get it from **Settings → API → service_role secret**
6. Save

### 6️⃣ Enable JWT

1. In function settings, find **"Verify JWT"**
2. Turn it **ON** ✅

### 7️⃣ Test!

1. Open: http://localhost:3001/
2. Log in
3. Go to **Dashboard → Settings**
4. Click **"Delete My Account"**
5. Confirm twice
6. **Success!** 🎉

---

## Need More Help?

- **Quick walkthrough:** EASY_DEPLOY_NOW.md
- **Terminal method:** DEPLOY_IN_TERMINAL.md
- **Full details:** COPY_THIS_FUNCTION.md

---

That's it! Your account deletion is now working! ✨

