# Stripe Products Setup Guide

This guide will help you create the exact Stripe products needed for Nectar.

## Products to Create

You need to create 2 products in Stripe:

### Product 1: Side Hustler (Free Plan)
- **Name:** Side Hustler
- **Description:** Perfect for getting started with your first side hustle
- **Pricing:** Free ($0.00)

### Product 2: Entrepreneur (Paid Plan)
- **Name:** Entrepreneur
- **Description:** For serious side hustlers ready to scale
- **Pricing:** $29.00/month (recurring)

---

## Method 1: Using Stripe Dashboard (Recommended for Beginners)

### Step 1: Log into Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top right)

### Step 2: Create Free Plan Product

1. Click **Products** in the left sidebar
2. Click **Add Product** button
3. Fill in the form:
   - **Name:** `Side Hustler`
   - **Description:** `Perfect for getting started with your first side hustle`
   - **Image:** (optional) Upload a product image

4. Under **Pricing:**
   - **Price:** `0.00`
   - **Billing period:** One time
   - **Currency:** USD

5. Click **Save product**

6. **IMPORTANT:** Copy the **Price ID** (starts with `price_`)
   - You'll see it in the price list under your product
   - Save it somewhere - you'll need this later

### Step 3: Create Paid Plan Product

1. Click **Products** in the left sidebar
2. Click **Add Product** button
3. Fill in the form:
   - **Name:** `Entrepreneur`
   - **Description:** `For serious side hustlers ready to scale`
   - **Image:** (optional) Upload a product image

4. Under **Pricing:**
   - **Price:** `29.00`
   - **Billing period:** Monthly
   - **Currency:** USD

5. Click **Save product**

6. **IMPORTANT:** Copy the **Price ID** (starts with `price_`)
   - Save it somewhere - you'll need this later

### Step 4: Update Your Code

Now that you have your Price IDs, you need to update them in your code:

1. Open `components/Pricing.tsx`
2. Find the `STRIPE_PRICES` constant (around line 8)
3. Replace with your actual Price IDs:

```typescript
const STRIPE_PRICES = {
  free: 'price_xxxxxxxxxxxxx',        // Replace with your Free plan Price ID
  entrepreneur: 'price_xxxxxxxxxxxxx'  // Replace with your Entrepreneur plan Price ID
};
```

---

## Method 2: Using Stripe CLI (Advanced)

If you have the Stripe CLI installed, you can create products via command line:

### Prerequisites

Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
# See: https://stripe.com/docs/stripe-cli
```

### Login to Stripe

```bash
stripe login
```

### Create Products

```bash
# Create Free Plan Product
FREE_PRODUCT=$(stripe products create \
  --name="Side Hustler" \
  --description="Perfect for getting started with your first side hustle" \
  -d metadata[plan]="free" \
  --format=json | jq -r '.id')

# Create Free Plan Price
FREE_PRICE=$(stripe prices create \
  --product="$FREE_PRODUCT" \
  --unit-amount=0 \
  --currency=usd \
  --nickname="free-plan" \
  --format=json | jq -r '.id')

echo "Free Plan Price ID: $FREE_PRICE"

# Create Paid Plan Product
PAID_PRODUCT=$(stripe products create \
  --name="Entrepreneur" \
  --description="For serious side hustlers ready to scale" \
  -d metadata[plan]="entrepreneur" \
  --format=json | jq -r '.id')

# Create Paid Plan Price (Monthly)
PAID_PRICE=$(stripe prices create \
  --product="$PAID_PRODUCT" \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month \
  --nickname="entrepreneur-monthly" \
  --format=json | jq -r '.id')

echo "Entrepreneur Plan Price ID: $PAID_PRICE"
```

Copy the Price IDs output and update your code as shown in Step 4 above.

---

## Method 3: Using Stripe API (Most Advanced)

If you want to automate this with a script:

Create a file `create-stripe-products.js`:

```javascript
const Stripe = require('stripe');
const stripe = Stripe('sk_test_YOUR_SECRET_KEY_HERE'); // Replace with your secret key

async function createProducts() {
  try {
    // Create Free Plan
    const freeProduct = await stripe.products.create({
      name: 'Side Hustler',
      description: 'Perfect for getting started with your first side hustle',
      metadata: {
        plan: 'free'
      }
    });

    const freePrice = await stripe.prices.create({
      product: freeProduct.id,
      unit_amount: 0,
      currency: 'usd',
      nickname: 'free-plan'
    });

    console.log('Free Plan Price ID:', freePrice.id);

    // Create Paid Plan
    const paidProduct = await stripe.products.create({
      name: 'Entrepreneur',
      description: 'For serious side hustlers ready to scale',
      metadata: {
        plan: 'entrepreneur'
      }
    });

    const paidPrice = await stripe.prices.create({
      product: paidProduct.id,
      unit_amount: 2900, // $29.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      nickname: 'entrepreneur-monthly'
    });

    console.log('Entrepreneur Plan Price ID:', paidPrice.id);

    console.log('\nAdd these to your components/Pricing.tsx:');
    console.log(`const STRIPE_PRICES = {`);
    console.log(`  free: '${freePrice.id}',`);
    console.log(`  entrepreneur: '${paidPrice.id}'`);
    console.log(`};`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createProducts();
```

Run it:
```bash
npm install stripe
node create-stripe-products.js
```

---

## Verification

After creating products:

1. Go to Stripe Dashboard → **Products**
2. You should see both products listed
3. Click on each product to verify:
   - Correct name and description
   - Correct pricing
   - Price IDs are visible

---

## Important Notes

### Test Mode vs Live Mode

- **Always start in Test Mode** (toggle in dashboard top-right)
- Test mode Price IDs start with `price_test_`
- When ready for production:
  1. Switch to Live Mode
  2. Create the same products again
  3. Update your code with Live Price IDs
  4. Update `.env` with Live API keys

### Price IDs

- Price IDs are permanent and cannot be edited
- If you need to change pricing, create a new Price for the same Product
- Keep old Price IDs for existing subscriptions

### Metadata

Adding metadata helps track plans:
```typescript
metadata: {
  plan: 'free',
  features: 'basic,limited'
}
```

---

## What's Next?

After creating products:

1. ✅ Copy both Price IDs
2. ✅ Update `components/Pricing.tsx` with your Price IDs
3. ✅ Set up Stripe webhooks (see SETUP.md)
4. ✅ Deploy Supabase Edge Functions for checkout
5. ✅ Test the checkout flow

---

## Troubleshooting

### Can't find Price ID
- Click on the Product in dashboard
- Look under "Pricing" section
- The Price ID is shown next to the price amount

### Created wrong price
- You can archive the price (can't delete)
- Create a new price with correct settings
- Update code with new Price ID

### Need different pricing
Create additional prices on the same product:
- Annual billing: Create another price with `interval: 'year'`
- Different tiers: Create new products with new prices

---

## Support

- [Stripe Products Documentation](https://stripe.com/docs/products-prices/overview)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Dashboard](https://dashboard.stripe.com)
