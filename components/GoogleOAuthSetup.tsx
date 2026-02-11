import React from 'react';

const GoogleOAuthSetup: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-dark-card rounded-xl border border-dark-card-border">
      <h2 className="text-2xl font-bold mb-4 text-light-text">Google Sign-In Status</h2>
      <div className="space-y-4 text-medium-text">
        <p>
          Google sign-in is enabled through Convex auth routes using Google Identity credentials.
        </p>
        <p>
          Make sure `VITE_GOOGLE_CLIENT_ID` (frontend) and `GOOGLE_CLIENT_ID` (Convex env) are set to
          the same OAuth client for production.
        </p>
        <div className="bg-dark-bg border border-dark-card-border rounded-lg p-4">
          <p className="text-sm text-light-text font-semibold mb-1">Current Auth Mode</p>
          <p className="text-sm">Convex HTTP auth (email/password + Google sessions)</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthSetup;
