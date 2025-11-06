import React, { useEffect, useState } from 'react';
import {
  getAnonymousRemaining,
  getUserRemaining,
  USAGE_LIMITS,
  getDaysUntilReset,
} from '../lib/usageLimits';
import { logger } from '../lib/logger';

interface UsageBannerProps {
  userId?: string | null;
}

const UsageBanner: React.FC<UsageBannerProps> = ({ userId }) => {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [daysUntilReset, setDaysUntilReset] = useState<number>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);
      try {
        if (userId) {
          // Logged in user
          const userRemaining = await getUserRemaining(userId);
          setRemaining(userRemaining);

          if (userRemaining !== -1) {
            const days = await getDaysUntilReset(userId);
            setDaysUntilReset(days);
          }
        } else {
          // Anonymous user
          const anonRemaining = getAnonymousRemaining();
          setRemaining(anonRemaining);
        }
      } catch (error) {
        logger.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [userId]);

  if (loading || remaining === null) {
    return null;
  }

  // Don't show banner for unlimited users
  if (remaining === -1) {
    return null;
  }

  // Calculate percentage for color coding
  const total = userId ? USAGE_LIMITS.FREE : USAGE_LIMITS.ANONYMOUS;
  const percentage = (remaining / total) * 100;

  // Determine color based on remaining
  let colorClass = 'bg-green-500/20 border-green-500/30 text-green-400';
  let iconColor = 'text-green-400';

  if (percentage <= 20) {
    colorClass = 'bg-red-500/20 border-red-500/30 text-red-400';
    iconColor = 'text-red-400';
  } else if (percentage <= 40) {
    colorClass = 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
    iconColor = 'text-yellow-400';
  }

  return (
    <div className={`rounded-lg border p-3 mb-4 ${colorClass}`}>
      <div className="flex items-center gap-2">
        <svg className={`w-5 h-5 ${iconColor} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div className="flex-1">
          {userId ? (
            <p className="text-sm font-medium">
              <span className="font-bold">{remaining}</span> of {total} generations remaining this week
              {remaining > 0 && (
                <span className="text-xs opacity-75 ml-2">
                  (resets in {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'})
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm font-medium">
              <span className="font-bold">{remaining}</span> of {total} free generations remaining
              <span className="text-xs opacity-75 ml-2">(sign up for 5 more per week!)</span>
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-24 h-2 bg-dark-bg rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percentage <= 20 ? 'bg-red-500' : percentage <= 40 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default UsageBanner;
