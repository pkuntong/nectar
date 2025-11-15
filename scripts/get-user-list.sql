-- User Research: Get List of Users to Interview
-- Run these queries in Supabase SQL Editor

-- ====================
-- QUERY 1: CHURNED USERS (Highest Priority)
-- ====================
-- Users who signed up but haven't logged in for 30+ days
-- These people left - we NEED to know why

SELECT
    up.id,
    au.email,
    up.full_name,
    up.created_at,
    up.subscription_tier,
    au.last_sign_in_at,
    EXTRACT(DAY FROM (NOW() - au.last_sign_in_at)) as days_since_last_login
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.last_sign_in_at < NOW() - INTERVAL '30 days'
    AND au.email IS NOT NULL
ORDER BY au.last_sign_in_at DESC
LIMIT 50;

-- ====================
-- QUERY 2: ACTIVE FREE USERS
-- ====================
-- Users on free tier who are still using the product
-- These people stayed - we need to know what's working

SELECT
    up.id,
    au.email,
    up.full_name,
    up.created_at,
    up.subscription_tier,
    au.last_sign_in_at,
    EXTRACT(DAY FROM (NOW() - up.created_at)) as days_since_signup
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.subscription_tier = 'free'
    AND au.last_sign_in_at > NOW() - INTERVAL '7 days'
    AND au.email IS NOT NULL
ORDER BY au.last_sign_in_at DESC
LIMIT 50;

-- ====================
-- QUERY 3: HIT LIMIT BUT DIDN'T UPGRADE
-- ====================
-- Users who hit the 5/week limit but didn't convert to paid
-- These people saw the paywall and said NO - we need to know why
-- Note: Usage is tracked in user_profiles.usage_count, not a separate table

SELECT
    up.id,
    au.email,
    up.full_name,
    up.created_at,
    up.subscription_tier,
    up.usage_count as total_generations
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.subscription_tier = 'free'
    AND au.email IS NOT NULL
    AND up.usage_count >= 5
    AND up.id NOT IN (
        SELECT user_id FROM subscriptions WHERE status = 'active'
    )
ORDER BY up.usage_count DESC
LIMIT 30;

-- ====================
-- QUERY 4: PAID SUBSCRIBERS (If Any)
-- ====================
-- Users who actually paid - we need to know what convinced them

SELECT
    up.id,
    au.email,
    up.full_name,
    up.created_at,
    up.subscription_tier,
    s.plan_name,
    s.status,
    s.created_at as subscription_start
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
LEFT JOIN subscriptions s ON up.id = s.user_id
WHERE up.subscription_tier = 'entrepreneur'
    AND au.email IS NOT NULL
ORDER BY s.created_at DESC
LIMIT 20;

-- ====================
-- SUMMARY STATS
-- ====================
-- Get a quick overview of your user base

SELECT
    up.subscription_tier,
    COUNT(*) as user_count,
    COUNT(*) FILTER (WHERE au.last_sign_in_at > NOW() - INTERVAL '7 days') as active_last_7_days,
    COUNT(*) FILTER (WHERE au.last_sign_in_at < NOW() - INTERVAL '30 days') as churned_30_days
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
GROUP BY up.subscription_tier;
