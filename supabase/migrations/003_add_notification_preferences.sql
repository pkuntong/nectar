-- Add notification_preferences column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"weekly": true, "product": false, "offers": true}'::jsonb;

-- Add index for faster queries on notification preferences
CREATE INDEX IF NOT EXISTS idx_user_profiles_notifications
ON user_profiles USING GIN (notification_preferences);

-- Set default notification preferences for existing users who don't have it
UPDATE user_profiles
SET notification_preferences = '{"weekly": true, "product": false, "offers": true}'::jsonb
WHERE notification_preferences IS NULL;
