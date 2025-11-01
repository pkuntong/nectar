# Account Deletion Setup

This document explains how the permanent account deletion feature works and how to deploy it.

## Overview

The account deletion feature allows users to permanently delete their accounts and all associated data. This is handled securely through a Supabase Edge Function that uses admin privileges to delete the user from the database.

## Security

**Why an Edge Function?**
- Account deletion requires the `SUPABASE_SERVICE_ROLE_KEY`, which is a super-admin key
- This key should NEVER be exposed in frontend code
- By using an Edge Function, the service role key stays on the server-side
- The Edge Function verifies the user is authenticated before allowing deletion

## Architecture

```
Frontend (Dashboard)
    ↓
Click "Delete Account"
    ↓
supabase.functions.invoke('delete-user')
    ↓
Edge Function
    ├─ Verifies user is authenticated (via JWT)
    ├─ Gets user ID from session
    ├─ Creates admin Supabase client
    └─ Calls supabaseAdmin.auth.admin.deleteUser(user.id)
    ↓
User account permanently deleted
    ↓
Frontend signs out and redirects to home
```

## Deployment Steps

### 1. Deploy the Edge Function

Make sure you have the Supabase CLI installed and linked to your project:

```bash
# If not already done, link your project
supabase link --project-ref your-project-ref

# Deploy the delete-user function
supabase functions deploy delete-user
```

### 2. Verify Environment Variables

Make sure you have the `SUPABASE_SERVICE_ROLE_KEY` set as a secret:

```bash
# Check if it's set
supabase secrets list

# If not, set it
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

You can find your service role key in:
1. Supabase Dashboard
2. Settings → API
3. Look for "service_role secret" (keep this secure!)

### 3. Configure Function Access

In your Supabase Dashboard:
1. Go to **Edge Functions**
2. Click on **delete-user**
3. Under **Settings**
4. Make sure **Verify JWT** is **CHECKED**
   - This ensures only authenticated users can call the function
   - The function verifies the JWT token to ensure the user is logged in

### 4. Test the Function

You can test the deletion flow in your app:

1. Log in to your account
2. Go to Dashboard → Settings
3. Scroll to "Danger Zone"
4. Click "Delete My Account"
5. Click again to confirm
6. Confirm the final prompt
7. Your account should be permanently deleted

**Important:** After deletion, you should NOT be able to log back in with the same credentials.

## How It Works in Code

### Frontend (`components/Dashboard.tsx`)

```typescript
const handleDeleteAccount = async () => {
    // Double confirmation
    if (!deleteConfirm) {
        setDeleteConfirm(true);
        return;
    }
    
    if (!confirm('Are you absolutely sure?')) {
        setDeleteConfirm(false);
        return;
    }

    setLoading(true);
    try {
        // Call the Edge Function
        const { data, error } = await supabase.functions.invoke('delete-user', {
            method: 'POST',
        });

        if (error) throw error;
        
        alert('Account deleted. Redirecting...');
        await supabase.auth.signOut();
        window.location.href = '/';
    } catch (error: any) {
        alert('Failed to delete account: ' + error.message);
        setLoading(false);
        setDeleteConfirm(false);
    }
};
```

### Backend (`supabase/functions/delete-user/index.ts`)

```typescript
serve(async (req) => {
    try {
        // Get admin client with service role key
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        // Get regular client to verify requesting user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        );

        // Verify user is authenticated
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Delete the user
        await supabaseAdmin.auth.admin.deleteUser(user.id);

        return new Response(JSON.stringify({ success: true }));
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
});
```

## Troubleshooting

### Error: "Function not found"
**Solution:** The Edge Function hasn't been deployed yet. Run `supabase functions deploy delete-user`.

### Error: "Service role key not set"
**Solution:** Set the secret: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key`

### Error: "User not authenticated"
**Solution:** Make sure Verify JWT is enabled in the function settings, and that users are logged in when attempting deletion.

### Error: "401 Unauthorized"
**Solution:** The Authorization header might not be sent properly. Check that the Supabase client is correctly configured with the session.

### Account still exists after deletion
**Possible reasons:**
1. Edge Function deployment failed
2. Service role key is incorrect
3. Database connection issue
4. User was recreated immediately after (check auth logs)

**Check logs:**
```bash
supabase functions logs delete-user --follow
```

## Safety Features

1. **Double Confirmation**: User must click delete twice
2. **Final Prompt**: Browser confirmation dialog
3. **Loading State**: Button is disabled during deletion
4. **Error Handling**: Clear error messages if deletion fails
5. **Automatic Sign Out**: User is signed out after successful deletion
6. **Redirect**: User is redirected to homepage after deletion

## Legal Considerations

- Make sure account deletion complies with GDPR, CCPA, and other regulations
- Consider adding a "soft delete" option (mark as deleted vs permanent deletion)
- You may want to implement a grace period (e.g., 7 days) before permanent deletion
- Consider sending a confirmation email before deleting
- Store deletion logs for audit purposes

## Future Enhancements

- Add soft delete option (grace period before permanent deletion)
- Email confirmation before deletion
- Data export before deletion (GDPR right to data portability)
- Cascade deletion of related data (profiles, subscriptions, etc.)
- Admin audit logs for deletions

