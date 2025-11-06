import { supabase } from './supabase';
import { logger } from './logger';

// Usage limits configuration
export const USAGE_LIMITS = {
  ANONYMOUS: 3,        // 3 generations without login
  FREE: 5,            // 5 generations per week for free tier
  ENTREPRENEUR: -1,    // Unlimited (-1 means no limit)
};

// Reset period for free tier (in days)
export const RESET_PERIOD_DAYS = 7;

/**
 * Get usage count for anonymous users (from localStorage)
 */
export const getAnonymousUsageCount = (): number => {
  const stored = localStorage.getItem('nectar_anonymous_usage');
  if (!stored) return 0;

  try {
    const data = JSON.parse(stored);
    const now = new Date().getTime();

    // Reset if more than 24 hours old
    if (now - data.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('nectar_anonymous_usage');
      return 0;
    }

    return data.count || 0;
  } catch {
    return 0;
  }
};

/**
 * Increment anonymous usage count
 */
export const incrementAnonymousUsage = (): number => {
  const currentCount = getAnonymousUsageCount();
  const newCount = currentCount + 1;

  localStorage.setItem('nectar_anonymous_usage', JSON.stringify({
    count: newCount,
    timestamp: new Date().getTime(),
  }));

  return newCount;
};

/**
 * Get remaining generations for anonymous users
 */
export const getAnonymousRemaining = (): number => {
  const used = getAnonymousUsageCount();
  return Math.max(0, USAGE_LIMITS.ANONYMOUS - used);
};

/**
 * Check if anonymous user has reached limit
 */
export const hasAnonymousReachedLimit = (): boolean => {
  return getAnonymousUsageCount() >= USAGE_LIMITS.ANONYMOUS;
};

/**
 * Create user profile if it doesn't exist
 */
const ensureUserProfile = async (userId: string): Promise<void> => {
  const nextReset = new Date();
  nextReset.setDate(nextReset.getDate() + RESET_PERIOD_DAYS);

  await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      subscription_tier: 'free',
      usage_count: 0,
      usage_reset_date: nextReset.toISOString(),
    }, {
      onConflict: 'id',
      ignoreDuplicates: true
    });
};

/**
 * Get usage data for logged-in user from database
 */
export const getUserUsageData = async (userId: string): Promise<{
  count: number;
  resetDate: string | null;
  tier: string;
}> => {
  try {
    // Try to get profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('usage_count, usage_reset_date, subscription_tier')
      .eq('id', userId)
      .maybeSingle();

    // If profile doesn't exist, create it
    if (!profile) {
      logger.log('Creating user profile for:', userId);
      await ensureUserProfile(userId);

      // Return defaults for new profile
      const nextReset = new Date();
      nextReset.setDate(nextReset.getDate() + RESET_PERIOD_DAYS);

      return {
        count: 0,
        resetDate: nextReset.toISOString(),
        tier: 'free',
      };
    }

    if (error) throw error;

    return {
      count: profile.usage_count || 0,
      resetDate: profile.usage_reset_date || null,
      tier: profile.subscription_tier || 'free',
    };
  } catch (error) {
    logger.error('Error fetching user usage:', error);
    // Create profile on error as well
    try {
      await ensureUserProfile(userId);
    } catch (createError) {
      logger.error('Error creating user profile:', createError);
    }

    const nextReset = new Date();
    nextReset.setDate(nextReset.getDate() + RESET_PERIOD_DAYS);

    return {
      count: 0,
      resetDate: nextReset.toISOString(),
      tier: 'free'
    };
  }
};

/**
 * Check if usage should be reset (weekly reset for free tier)
 */
const shouldResetUsage = (resetDate: string | null): boolean => {
  if (!resetDate) return true;

  const reset = new Date(resetDate);
  const now = new Date();

  return now >= reset;
};

/**
 * Reset user usage count
 */
const resetUserUsage = async (userId: string): Promise<void> => {
  const nextReset = new Date();
  nextReset.setDate(nextReset.getDate() + RESET_PERIOD_DAYS);

  await supabase
    .from('user_profiles')
    .update({
      usage_count: 0,
      usage_reset_date: nextReset.toISOString(),
    })
    .eq('id', userId);
};

/**
 * Increment user usage count
 */
export const incrementUserUsage = async (userId: string): Promise<number> => {
  try {
    const { count, resetDate, tier } = await getUserUsageData(userId);

    // Entrepreneur tier has unlimited usage
    if (tier === 'entrepreneur') {
      return -1; // Unlimited
    }

    // Check if we need to reset
    if (shouldResetUsage(resetDate)) {
      await resetUserUsage(userId);
      const newCount = 1;

      await supabase
        .from('user_profiles')
        .update({ usage_count: newCount })
        .eq('id', userId);

      return newCount;
    }

    // Increment count
    const newCount = count + 1;

    await supabase
      .from('user_profiles')
      .update({ usage_count: newCount })
      .eq('id', userId);

    return newCount;
  } catch (error) {
    logger.error('Error incrementing user usage:', error);
    throw error;
  }
};

/**
 * Get remaining generations for logged-in user
 */
export const getUserRemaining = async (userId: string): Promise<number> => {
  try {
    const { count, resetDate, tier } = await getUserUsageData(userId);

    // Entrepreneur tier has unlimited
    if (tier === 'entrepreneur') {
      return -1; // Unlimited
    }

    // Check if we need to reset
    if (shouldResetUsage(resetDate)) {
      return USAGE_LIMITS.FREE;
    }

    return Math.max(0, USAGE_LIMITS.FREE - count);
  } catch (error) {
    logger.error('Error getting user remaining:', error);
    return 0;
  }
};

/**
 * Check if user has reached their limit
 */
export const hasUserReachedLimit = async (userId: string): Promise<boolean> => {
  try {
    const { count, resetDate, tier } = await getUserUsageData(userId);

    // Entrepreneur tier never reaches limit
    if (tier === 'entrepreneur') {
      return false;
    }

    // Check if we need to reset
    if (shouldResetUsage(resetDate)) {
      return false;
    }

    return count >= USAGE_LIMITS.FREE;
  } catch (error) {
    logger.error('Error checking user limit:', error);
    return true; // Fail safe - block if error
  }
};

/**
 * Get days until reset
 */
export const getDaysUntilReset = async (userId: string): Promise<number> => {
  try {
    const { resetDate } = await getUserUsageData(userId);

    if (!resetDate) {
      return RESET_PERIOD_DAYS;
    }

    const reset = new Date(resetDate);
    const now = new Date();
    const diff = reset.getTime() - now.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return RESET_PERIOD_DAYS;
  }
};
