#!/bin/bash

echo "🚀 Quick Deploy - Supabase Edge Functions"
echo ""
echo "First, create an access token:"
echo "👉 https://supabase.com/dashboard/account/tokens"
echo ""
read -p "Have you created a token? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create a token first, then run this script again."
    exit 1
fi

echo ""
read -p "Paste your access token here: " TOKEN
echo ""

# Login with token
echo "Logging in..."
export SUPABASE_ACCESS_TOKEN=$TOKEN

# Deploy functions
echo ""
echo "Deploying functions..."
echo ""

supabase functions deploy create-checkout-session --project-ref getekqgyhwmbhyznamli --no-verify-jwt
supabase functions deploy create-portal-session --project-ref getekqgyhwmbhyznamli --no-verify-jwt
supabase functions deploy stripe-webhook --project-ref getekqgyhwmbhyznamli --no-verify-jwt
supabase functions deploy delete-user --project-ref getekqgyhwmbhyznamli --no-verify-jwt

echo ""
echo "🎉 Done! Check output above for any errors."
echo ""
echo "Next: Set up Stripe webhook (see DEPLOY_EDGE_FUNCTIONS.md)"
