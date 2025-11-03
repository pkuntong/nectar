-- Add usage tracking columns to user_profiles table

-- Add usage_count column (tracks generations used)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Add usage_reset_date column (when the count resets)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS usage_reset_date TIMESTAMP WITH TIME ZONE;

-- Set initial reset date for existing users (7 days from now)
UPDATE user_profiles
SET usage_reset_date = NOW() + INTERVAL '7 days'
WHERE usage_reset_date IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.usage_count IS 'Number of AI generations used in current period';
COMMENT ON COLUMN user_profiles.usage_reset_date IS 'Date when usage_count will reset (weekly for free tier)';

-- Create index for faster queries on usage_reset_date
CREATE INDEX IF NOT EXISTS idx_user_profiles_usage_reset_date
ON user_profiles(usage_reset_date);
