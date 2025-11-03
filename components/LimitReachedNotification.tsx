import React from 'react';

interface LimitReachedNotificationProps {
  isAnonymous: boolean;
  daysUntilReset?: number;
  onSignUp?: () => void;
  onUpgrade?: () => void;
  onClose: () => void;
}

const LimitReachedNotification: React.FC<LimitReachedNotificationProps> = ({
  isAnonymous,
  daysUntilReset,
  onSignUp,
  onUpgrade,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border-2 border-red-500 rounded-lg max-w-md w-full p-6 shadow-2xl">
        {/* Header with warning icon */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-500">
              Generation Limit Reached!
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-medium-text hover:text-light-text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          {isAnonymous ? (
            <>
              <p className="text-medium-text mb-3">
                You've used all <span className="text-red-500 font-bold">3 free generations</span> without an account.
              </p>
              <p className="text-light-text">
                <span className="text-brand-orange font-semibold">Sign up for free</span> to get{' '}
                <span className="text-green-400 font-bold">5 more generations per week!</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-medium-text mb-3">
                You've reached your <span className="text-red-500 font-bold">weekly limit of 5 generations</span> for the free tier.
              </p>
              <p className="text-light-text mb-2">
                Your limit will reset in{' '}
                <span className="text-brand-orange font-bold">
                  {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}
                </span>.
              </p>
              <p className="text-light-text">
                Or upgrade to <span className="text-brand-orange font-semibold">Entrepreneur</span> for{' '}
                <span className="text-green-400 font-bold">unlimited generations!</span>
              </p>
            </>
          )}
        </div>

        {/* Comparison Table */}
        <div className="bg-dark-bg rounded-lg p-4 mb-6 border border-dark-card-border">
          <h4 className="text-sm font-semibold text-medium-text mb-3">Compare Plans:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-medium-text">No Account:</span>
              <span className="text-red-400 font-semibold">3 total</span>
            </div>
            <div className="flex justify-between">
              <span className="text-medium-text">Free Account:</span>
              <span className="text-yellow-400 font-semibold">5 per week</span>
            </div>
            <div className="flex justify-between">
              <span className="text-medium-text">Entrepreneur:</span>
              <span className="text-green-400 font-semibold">Unlimited ∞</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isAnonymous ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-dark-card border border-dark-card-border text-light-text rounded-md hover:bg-white/5 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={onSignUp}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold rounded-md hover:opacity-90 transition-opacity"
              >
                Sign Up Free
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-dark-card border border-dark-card-border text-light-text rounded-md hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onUpgrade}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold rounded-md hover:opacity-90 transition-opacity"
              >
                Upgrade Now
              </button>
            </>
          )}
        </div>

        {/* Fine print */}
        <p className="text-xs text-medium-text text-center mt-4">
          {isAnonymous
            ? 'Free account includes 5 generations per week + all basic features'
            : 'Entrepreneur plan: $19/month with unlimited generations'}
        </p>
      </div>
    </div>
  );
};

export default LimitReachedNotification;
