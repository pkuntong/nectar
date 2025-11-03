-- Add unique constraint for stripe_subscription_id to enable proper upsert
ALTER TABLE subscriptions
ADD CONSTRAINT unique_stripe_subscription_id
UNIQUE (stripe_subscription_id);

-- Also make user_id + stripe_subscription_id unique as a user can only have one active subscription
-- Note: This will prevent duplicate subscription records
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_stripe
ON subscriptions(user_id, stripe_subscription_id);
