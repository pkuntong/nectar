#!/bin/bash

echo "🔍 Nectar API Key Verification"
echo "================================"
echo ""

# Load .env file
if [ -f .env ]; then
    source .env
else
    echo "❌ .env file not found!"
    echo "   Create .env file from .env.example"
    exit 1
fi

echo "Checking API keys in .env file..."
echo ""

# Check each API key
check_key() {
    local key_name=$1
    local key_value=$2
    local required=$3

    if [ -z "$key_value" ] || [ "$key_value" == "your_${key_name,,}_here" ] || [[ "$key_value" == *"XXXXX"* ]]; then
        if [ "$required" == "true" ]; then
            echo "❌ $key_name - MISSING or placeholder (REQUIRED)"
        else
            echo "⚠️  $key_name - MISSING or placeholder (Optional)"
        fi
    else
        # Show first 10 chars only for security
        local preview="${key_value:0:20}..."
        echo "✅ $key_name - Present ($preview)"
    fi
}

echo "🔑 REQUIRED API KEYS:"
echo "-------------------"
check_key "GEMINI_API_KEY" "$GEMINI_API_KEY" "true"
check_key "VITE_SUPABASE_URL" "$VITE_SUPABASE_URL" "true"
check_key "VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_ANON_KEY" "true"
check_key "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "true"
check_key "VITE_STRIPE_PUBLISHABLE_KEY" "$VITE_STRIPE_PUBLISHABLE_KEY" "true"
check_key "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY" "true"

echo ""
echo "📧 OPTIONAL API KEYS:"
echo "--------------------"
check_key "RESEND_API_KEY" "$RESEND_API_KEY" "false"
check_key "VITE_SENTRY_DSN" "$VITE_SENTRY_DSN" "false"
check_key "SENTRY_AUTH_TOKEN" "$SENTRY_AUTH_TOKEN" "false"

echo ""
echo "================================"
echo ""

# Check if required keys are missing
MISSING_REQUIRED=false

if [ -z "$GEMINI_API_KEY" ] || [[ "$GEMINI_API_KEY" == "your_"* ]] || [[ "$GEMINI_API_KEY" == *"XXXXX"* ]]; then
    MISSING_REQUIRED=true
fi

if [ -z "$VITE_SUPABASE_URL" ] || [[ "$VITE_SUPABASE_URL" == "your_"* ]] || [[ "$VITE_SUPABASE_URL" == *"XXXXX"* ]]; then
    MISSING_REQUIRED=true
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ] || [[ "$VITE_SUPABASE_ANON_KEY" == "your_"* ]] || [[ "$VITE_SUPABASE_ANON_KEY" == *"XXXXX"* ]]; then
    MISSING_REQUIRED=true
fi

if [ -z "$VITE_STRIPE_PUBLISHABLE_KEY" ] || [[ "$VITE_STRIPE_PUBLISHABLE_KEY" == "your_"* ]] || [[ "$VITE_STRIPE_PUBLISHABLE_KEY" == *"XXXXX"* ]]; then
    MISSING_REQUIRED=true
fi

if [ -z "$STRIPE_SECRET_KEY" ] || [[ "$STRIPE_SECRET_KEY" == "your_"* ]] || [[ "$STRIPE_SECRET_KEY" == *"XXXXX"* ]]; then
    MISSING_REQUIRED=true
fi

if [ "$MISSING_REQUIRED" = true ]; then
    echo "⚠️  MISSING REQUIRED API KEYS"
    echo ""
    echo "Next steps:"
    echo "1. Get your API keys from:"
    echo "   - Gemini: https://aistudio.google.com/apikey"
    echo "   - Supabase: https://app.supabase.com (Project Settings > API)"
    echo "   - Stripe: https://dashboard.stripe.com/test/apikeys"
    echo ""
    echo "2. Update your .env file with real values"
    echo ""
else
    echo "✅ All required API keys are present!"
    echo ""
    echo "Optional improvements:"
    echo "- Add RESEND_API_KEY for email functionality"
    echo "- Add VITE_SENTRY_DSN for error tracking"
    echo ""
fi

echo "📚 For detailed setup instructions, see:"
echo "   - SETUP.md"
echo "   - STRIPE_SETUP.md"
echo "   - DEPLOY_EDGE_FUNCTIONS.md"
echo ""
