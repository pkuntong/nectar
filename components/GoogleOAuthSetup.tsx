import React from 'react';

const GoogleOAuthSetup: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-dark-card rounded-xl border border-dark-card-border">
      <h2 className="text-2xl font-bold mb-4 text-light-text">Google OAuth Status</h2>
      <div className="space-y-4 text-medium-text">
        <p>
          The app is now running in Convex-only mode. Google OAuth is currently disabled in this deployment.
        </p>
        <p>
          Use email/password sign-up and sign-in while OAuth provider integration is being finalized.
        </p>
        <div className="bg-dark-bg border border-dark-card-border rounded-lg p-4">
          <p className="text-sm text-light-text font-semibold mb-1">Current Auth Mode</p>
          <p className="text-sm">Convex HTTP auth (email/password sessions)</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthSetup;
