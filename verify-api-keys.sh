#!/bin/bash
# verify-api-keys.sh - Run before every deployment to verify production readiness

echo "🔍 Verifying Production Environment Variables..."
echo ""

# Function to check if a file contains test mode keys
check_test_keys() {
    local file=$1
    local errors=0

    if [ ! -f "$file" ]; then
        echo "⚠️  Warning: $file not found"
        return 0
    fi

    echo "Checking $file..."

    # Check for Stripe test mode keys
    if grep -q "pk_test_" "$file" 2>/dev/null; then
        echo "❌ ERROR: Stripe TEST publishable key found in $file"
        echo "   Update to LIVE key (pk_live_...) before deploying to production"
        errors=$((errors + 1))
    fi

    if grep -q "sk_test_" "$file" 2>/dev/null; then
        echo "❌ ERROR: Stripe TEST secret key found in $file"
        echo "   Update to LIVE key (sk_live_...) before deploying to production"
        errors=$((errors + 1))
    fi

    if [ $errors -eq 0 ]; then
        echo "✅ No test mode keys found in $file"
    fi

    return $errors
}

# Check .env file (should have test keys for development)
if [ -f ".env" ]; then
    echo "ℹ️  .env file exists (for development - should have TEST keys)"
fi

# Check .env.production file (must have live keys)
total_errors=0

if [ -f ".env.production" ]; then
    check_test_keys ".env.production"
    total_errors=$?
else
    echo "⚠️  Warning: .env.production file not found"
    echo "   Create .env.production with LIVE mode keys for production deployment"
fi

echo ""
echo "🔍 Checking Supabase Edge Function secrets..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Warning: Supabase CLI not installed"
    echo "   Install with: npm install -g supabase"
    echo "   Skipping Supabase secrets check..."
else
    # Try to list secrets (requires being logged in and linked)
    if supabase secrets list &> /dev/null; then
        SECRETS=$(supabase secrets list 2>/dev/null)

        # Check for critical secrets
        if echo "$SECRETS" | grep -q "STRIPE_SECRET_KEY"; then
            echo "✅ STRIPE_SECRET_KEY is set in Supabase"
        else
            echo "❌ ERROR: STRIPE_SECRET_KEY not set in Supabase Edge Functions"
            echo "   Run: supabase secrets set STRIPE_SECRET_KEY=sk_live_..."
            total_errors=$((total_errors + 1))
        fi

        if echo "$SECRETS" | grep -q "STRIPE_WEBHOOK_SECRET"; then
            echo "✅ STRIPE_WEBHOOK_SECRET is set in Supabase"
        else
            echo "❌ ERROR: STRIPE_WEBHOOK_SECRET not set in Supabase Edge Functions"
            echo "   Run: supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_..."
            total_errors=$((total_errors + 1))
        fi

        if echo "$SECRETS" | grep -q "RESEND_API_KEY"; then
            echo "✅ RESEND_API_KEY is set in Supabase"
        else
            echo "⚠️  Warning: RESEND_API_KEY not set in Supabase Edge Functions"
            echo "   Email functionality may not work"
        fi
    else
        echo "⚠️  Warning: Could not check Supabase secrets"
        echo "   Make sure you're logged in: supabase login"
        echo "   And linked to project: supabase link"
    fi
fi

echo ""
echo "🔍 Checking for console.log statements in production code..."

# Count console.log in source files (excluding node_modules, dist, and this script)
CONSOLE_LOGS=$(grep -r "console\.log" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=supabase . 2>/dev/null | wc -l)

if [ "$CONSOLE_LOGS" -gt 0 ]; then
    echo "⚠️  Warning: Found $CONSOLE_LOGS console.log statements in source code"
    echo "   Consider replacing with logger.log for production builds"
else
    echo "✅ No console.log statements found in source code"
fi

echo ""
echo "🔍 Checking required environment variables..."

# Function to check if env var is set in .env.production
check_env_var() {
    local var_name=$1
    local file=".env.production"

    if [ -f "$file" ]; then
        if grep -q "^${var_name}=" "$file" 2>/dev/null; then
            echo "✅ $var_name is set"
        else
            echo "❌ ERROR: $var_name not found in $file"
            total_errors=$((total_errors + 1))
        fi
    fi
}

if [ -f ".env.production" ]; then
    check_env_var "VITE_STRIPE_PUBLISHABLE_KEY"
    check_env_var "VITE_STRIPE_PRICE_FREE"
    check_env_var "VITE_STRIPE_PRICE_ENTREPRENEUR"
    check_env_var "VITE_SUPABASE_URL"
    check_env_var "VITE_SUPABASE_ANON_KEY"
    check_env_var "VITE_SENTRY_DSN"
fi

echo ""
echo "================================"

if [ $total_errors -eq 0 ]; then
    echo "✅ All checks passed!"
    echo "🚀 Ready to deploy to production"
    exit 0
else
    echo "❌ Found $total_errors error(s)"
    echo "⚠️  Fix the errors above before deploying to production"
    exit 1
fi
