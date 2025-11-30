#!/bin/bash

echo "🚀 Deploying Supabase Edge Functions"
echo ""
echo "Attempting to deploy 4 functions..."
echo ""

# Check if logged in
echo "Checking authentication..."
supabase projects list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not authenticated with Supabase CLI"
    echo ""
    echo "To fix this:"
    echo "1. Get an access token: https://supabase.com/dashboard/account/tokens"
    echo "2. Create a new token"
    echo "3. Run: supabase login"
    echo "4. Paste the token when prompted"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Authenticated"
echo ""

# Deploy each function
FUNCTIONS=("create-checkout-session" "create-portal-session" "stripe-webhook" "delete-user")

for func in "${FUNCTIONS[@]}"; do
    echo "📦 Deploying $func..."
    supabase functions deploy $func --project-ref getekqgyhwmbhyznamli --no-verify-jwt
    if [ $? -eq 0 ]; then
        echo "✅ $func deployed successfully"
    else
        echo "❌ Failed to deploy $func"
    fi
    echo ""
done

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set up Stripe webhook (see DEPLOY_EDGE_FUNCTIONS.md Step 4)"
echo "2. Test the checkout flow in your app"
