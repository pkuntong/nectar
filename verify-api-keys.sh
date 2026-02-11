#!/bin/bash
# verify-api-keys.sh - Verify Convex + frontend env configuration before deployment

set -euo pipefail

echo "🔍 Verifying environment readiness..."
echo ""

total_errors=0

check_test_keys() {
  local file=$1
  local errors=0

  if [ ! -f "$file" ]; then
    echo "⚠️  Warning: $file not found"
    return 0
  fi

  echo "Checking $file..."

  if grep -q "pk_test_" "$file" 2>/dev/null; then
    echo "❌ ERROR: Stripe test publishable key found in $file"
    errors=$((errors + 1))
  fi

  if grep -q "sk_test_" "$file" 2>/dev/null; then
    echo "❌ ERROR: Stripe test secret key found in $file"
    errors=$((errors + 1))
  fi

  if [ $errors -eq 0 ]; then
    echo "✅ No Stripe test keys found in $file"
  fi

  return $errors
}

if [ -f ".env.production" ]; then
  check_test_keys ".env.production" || total_errors=$((total_errors + 1))
else
  echo "⚠️  Warning: .env.production file not found"
fi

echo ""
echo "🔍 Checking Convex secrets..."

deployment="${CONVEX_DEPLOYMENT:-quaint-lion-604}"
deployment="${deployment#dev:}"
deployment="${deployment%%#*}"
deployment="$(echo "$deployment" | xargs)"

if env_output=$(npx convex env list --deployment-name "$deployment" 2>/dev/null); then
  check_convex_secret() {
    local key=$1
    if echo "$env_output" | grep -q "^${key}="; then
      echo "✅ $key is set in Convex ($deployment)"
    else
      echo "❌ ERROR: $key is missing in Convex ($deployment)"
      total_errors=$((total_errors + 1))
    fi
  }

  check_convex_secret "STRIPE_SECRET_KEY"
  check_convex_secret "STRIPE_WEBHOOK_SECRET"
  check_convex_secret "GROQ_API_KEY"
  check_convex_secret "GEMINI_API_KEY"
  check_convex_secret "GOOGLE_CLIENT_ID"
  check_convex_secret "RESEND_API_KEY"

  if echo "$env_output" | grep -q "^RESEND_FROM_EMAIL="; then
    echo "✅ RESEND_FROM_EMAIL is set in Convex ($deployment)"
  else
    echo "⚠️  RESEND_FROM_EMAIL is missing; fallback sender onboarding@resend.dev will be used"
  fi
else
  echo "❌ ERROR: Could not read Convex env for deployment $deployment"
  total_errors=$((total_errors + 1))
fi

echo ""
echo "🔍 Checking required frontend env vars in .env.production..."

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
  check_env_var "VITE_CONVEX_SITE_URL"
  check_env_var "VITE_GOOGLE_CLIENT_ID"
fi

echo ""
echo "================================"
if [ $total_errors -eq 0 ]; then
  echo "✅ All checks passed"
  exit 0
else
  echo "❌ Found $total_errors issue(s)"
  exit 1
fi
