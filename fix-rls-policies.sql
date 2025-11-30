-- Fix RLS policies to allow service role and proper access
-- This fixes the "Failed to fetch" errors

-- First, let's be more permissive with RLS for debugging
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;

-- Create more permissive policies that allow upserts and service role access
-- Policy for authenticated users to read their own profile
CREATE POLICY "Enable read access for users based on user_id"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy to allow INSERT for authenticated users (for their own profile)
CREATE POLICY "Enable insert for authenticated users"
    ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy to allow UPDATE for authenticated users (for their own profile)
CREATE POLICY "Enable update for users based on user_id"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- IMPORTANT: Allow service role to bypass RLS (for Edge Functions)
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;

-- Policy for subscriptions
CREATE POLICY "Enable read access for users on subscriptions"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow service role full access (needed for webhooks)
CREATE POLICY "Service role has full access to user_profiles"
    ON public.user_profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to subscriptions"
    ON public.subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant additional permissions
GRANT ALL ON public.user_profiles TO service_role;
GRANT ALL ON public.subscriptions TO service_role;
