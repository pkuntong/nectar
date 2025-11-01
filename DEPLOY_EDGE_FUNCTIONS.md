# Deploying Supabase Edge Functions

This guide will help you deploy the Supabase Edge Functions for Stripe checkout, webhooks, email sending, and user account deletion.

## Prerequisites

1. Supabase account and project set up
2. Supabase CLI installed
3. All API keys configured in your Supabase project

## Install Supabase CLI

### macOS
```bash
brew install supabase/tap/supabase
```

### Windows (PowerShell)
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Linux
```bash
brew install supabase/tap/supabase
```

Or download from: https://github.com/supabase/cli/releases

## Step 1: Login to Supabase CLI

```bash
supabase login
```

This will open your browser for authentication.

## Step 2: Link Your Project

```bash
supabase link --project-ref your-project-ref
```

To find your project ref:
1. Go to your Supabase Dashboard
2. Look at the URL: `https://app.supabase.com/project/YOUR-PROJECT-REF`
3. Or go to Settings → General → Reference ID

## Step 3: Set Environment Variables (Secrets)

Edge Functions need access to your API keys. Set them as secrets:

```bash
# Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Stripe Webhook Secret (you'll get this after setting up webhooks)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Resend API Key
supabase secrets set RESEND_API_KEY=re_your_resend_api_key

# Supabase URL (usually set by default, but you can override)
supabase secrets set SUPABASE_URL=https://your-project.supabase.co

# Supabase Service Role Key (for admin operations)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

To view current secrets:
```bash
supabase secrets list
```

## Step 4: Deploy Edge Functions

Deploy all functions at once:

```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy send-email
supabase functions deploy delete-user
```

Or deploy all at once:
```bash
supabase functions deploy
```

## Step 5: Verify Deployment

After deployment, you'll see the function URLs. They'll look like:
```
https://your-project.supabase.co/functions/v1/create-checkout-session
https://your-project.supabase.co/functions/v1/stripe-webhook
https://your-project.supabase.co/functions/v1/send-email
https://your-project.supabase.co/functions/v1/delete-user
```

Test a function:
```bash
curl -i --location --request POST \
  'https://your-project.supabase.co/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"test@example.com","subject":"Test","type":"welcome"}'
```

## Step 6: Configure Stripe Webhook

Now that your Edge Function is deployed, set up Stripe to send webhooks to it:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter the URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update your secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
   ```

## Step 7: Enable Function Access

Make sure your Edge Functions can be called from your frontend:

1. Go to Supabase Dashboard → **Edge Functions**
2. Click on each function
3. Under **Settings**, ensure:
   - **Verify JWT** is checked (for authenticated requests)
   - Or uncheck for public functions (not recommended for sensitive operations)

For the functions in this project:
- `create-checkout-session`: **Requires JWT** (user must be authenticated)
- `stripe-webhook`: **No JWT** (Stripe calls this directly)
- `send-email`: **Requires JWT** (or call it server-side only)
- `delete-user`: **Requires JWT** (user must be authenticated)

## Step 8: Update Frontend Configuration

No changes needed in frontend code if using the same Supabase project, but verify:

1. Your `.env` has the correct `VITE_SUPABASE_URL`
2. Your `.env` has the correct `VITE_SUPABASE_ANON_KEY`
3. Update `STRIPE_PRICES` in [lib/stripe.ts](lib/stripe.ts) with your actual Price IDs

## Monitoring and Logs

### View Function Logs

```bash
# View logs for a specific function
supabase functions logs create-checkout-session

# Follow logs in real-time
supabase functions logs create-checkout-session --follow

# View logs for all functions
supabase functions logs
```

### View in Dashboard

1. Go to Supabase Dashboard → **Edge Functions**
2. Click on a function
3. Go to **Logs** tab

## Local Development and Testing

### Run Functions Locally

```bash
# Serve all functions locally
supabase functions serve

# Serve a specific function
supabase functions serve create-checkout-session --env-file .env
```

Functions will be available at:
- `http://localhost:54321/functions/v1/create-checkout-session`
- `http://localhost:54321/functions/v1/stripe-webhook`
- `http://localhost:54321/functions/v1/send-email`

### Test Locally

```bash
# Test create-checkout-session
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/create-checkout-session' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"priceId":"price_xxxxx"}'

# Test send-email
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"test@example.com","subject":"Test","type":"welcome"}'
```

## Troubleshooting

### Function Returns 401 Unauthorized

- Make sure you're sending the `Authorization: Bearer <ANON_KEY>` header
- Check that user is authenticated when calling `create-checkout-session`
- Verify JWT is enabled/disabled correctly for each function

### Stripe Webhook Fails

- Check the webhook signing secret is correct
- Verify the webhook URL is exactly: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- Check Stripe Dashboard → Webhooks → Your endpoint → Recent events
- View function logs: `supabase functions logs stripe-webhook`

### Email Not Sending

- Verify RESEND_API_KEY is set: `supabase secrets list`
- Check you're using a verified domain or `onboarding@resend.dev` for testing
- View function logs: `supabase functions logs send-email`

### Environment Variables Not Working

- Make sure you set secrets with `supabase secrets set`
- Secrets are different from local `.env` variables
- After updating secrets, redeploy: `supabase functions deploy`

### CORS Errors

The functions include CORS headers for all origins (`*`). If you need to restrict:

Edit each function's `corsHeaders`:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

## Updating Functions

When you make changes to function code:

```bash
# Deploy the updated function
supabase functions deploy create-checkout-session

# Or deploy all
supabase functions deploy
```

## Production Checklist

Before going to production:

- [ ] All secrets are set with production values
- [ ] Stripe webhook is configured and tested
- [ ] Database tables (`user_profiles`, `subscriptions`) are created
- [ ] Row Level Security (RLS) policies are enabled
- [ ] Function logs are monitored
- [ ] Test the complete checkout flow
- [ ] Test webhook handling with Stripe test events
- [ ] Verify emails are being sent
- [ ] Update Stripe Price IDs in `lib/stripe.ts`
- [ ] Switch Stripe to Live Mode (when ready)

## Costs

Supabase Edge Functions pricing:
- **Free tier**: 500,000 invocations/month
- **Pro tier**: 2,000,000 invocations/month included
- Additional: $2 per million invocations

For most applications, the free tier is sufficient to start.

## Support

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

## Quick Reference Commands

```bash
# Login
supabase login

# Link project
supabase link --project-ref your-ref

# Set secret
supabase secrets set KEY=value

# List secrets
supabase secrets list

# Deploy function
supabase functions deploy function-name

# View logs
supabase functions logs function-name

# Serve locally
supabase functions serve
```
