import React, { useState } from 'react';

const GoogleOAuthSetup: React.FC = () => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [step, setStep] = useState<'input' | 'instructions'>('input');

  // Try to get Supabase URL from environment
  const getSupabaseUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    if (supabaseUrl) {
      // Extract project reference from Supabase URL
      // Format: https://xxxxx.supabase.co
      const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
      if (match) {
        return `${supabaseUrl}/auth/v1/callback`;
      }
    }
    return 'https://your-supabase-project.supabase.co/auth/v1/callback';
  };

  const supabaseRedirectUri = getSupabaseUrl();

  const handleSave = () => {
    if (!clientId.trim()) {
      alert('Please enter your Google Client ID');
      return;
    }
    setStep('instructions');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (step === 'instructions') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-dark-card rounded-xl border border-dark-card-border">
        <h2 className="text-2xl font-bold mb-6 text-light-text">Google OAuth Setup Instructions</h2>
        
        <div className="space-y-6">
          {/* Step 1: Get Client ID */}
          <div className="bg-dark-bg p-5 rounded-lg border border-dark-card-border">
            <h3 className="text-xl font-semibold mb-3 text-light-text flex items-center gap-2">
              <span className="bg-brand-orange text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
              Get Your Google Client ID & Secret
            </h3>
            <div className="ml-10 space-y-3 text-medium-text">
              <p>1. Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">Google Cloud Console</a></p>
              <p>2. Select your project (or create a new one)</p>
              <p>3. Navigate to: <strong>APIs & Services</strong> → <strong>Credentials</strong></p>
              <p>4. Click <strong>"Create Credentials"</strong> → <strong>"OAuth client ID"</strong></p>
              <p>5. If prompted, configure the OAuth consent screen first</p>
              <p>6. Choose <strong>"Web application"</strong> as the application type</p>
              <p>7. Add authorized redirect URIs:</p>
              <div className="ml-4 space-y-2 mt-2">
                <div className="bg-yellow-900/20 border border-yellow-700/50 p-3 rounded mb-3">
                  <p className="text-yellow-300 text-sm font-semibold mb-2">⚠️ REQUIRED - Copy this exact URI:</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-dark-card px-3 py-2 rounded text-sm text-light-text flex-1 break-all">
                      {supabaseRedirectUri}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(supabaseRedirectUri)}
                      className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-orange-light transition-colors whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-yellow-200 mt-2">
                    This MUST be added to Google Cloud Console or you'll get a "redirect_uri mismatch" error
                  </p>
                </div>
                <p className="text-xs text-medium-text mb-2">Optional (for local development):</p>
                <div className="flex items-center gap-2">
                  <code className="bg-dark-card px-3 py-1 rounded text-sm text-light-text flex-1">
                    {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://yourdomain.com/auth/callback'}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://yourdomain.com/auth/callback')}
                    className="text-brand-orange hover:text-brand-orange-light text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <p className="mt-3">8. Click <strong>"Create"</strong> (or <strong>"Save"</strong> if editing existing credentials)</p>
              <p>9. Copy your <strong>Client ID</strong> and <strong>Client Secret</strong></p>
              <div className="bg-blue-900/20 border border-blue-700/50 p-3 rounded mt-3">
                <p className="text-blue-300 text-sm font-semibold mb-1">💡 Already created credentials?</p>
                <p className="text-xs text-blue-200">Click on your existing OAuth client ID → Edit → Add the redirect URI above → Save</p>
              </div>
            </div>
          </div>

          {/* Step 2: Configure Supabase */}
          <div className="bg-dark-bg p-5 rounded-lg border border-dark-card-border">
            <h3 className="text-xl font-semibold mb-3 text-light-text flex items-center gap-2">
              <span className="bg-brand-orange text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
              Enable Google Provider in Supabase
            </h3>
            <div className="ml-10 space-y-3 text-medium-text">
              <p>1. Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">Supabase Dashboard</a></p>
              <p>2. Select your project</p>
              <p>3. Navigate to: <strong>Authentication</strong> → <strong>Providers</strong></p>
              <p>4. Find <strong>"Google"</strong> in the list and click on it</p>
              <p>5. Toggle <strong>"Enable Google provider"</strong> to ON</p>
              <p>6. Enter your credentials:</p>
              <div className="ml-4 mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-light-text mb-1">Client ID (Client Key)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={clientId}
                      readOnly
                      className="flex-1 bg-dark-card border border-dark-card-border rounded px-3 py-2 text-light-text"
                    />
                    <button 
                      onClick={() => copyToClipboard(clientId)}
                      className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-orange-light transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text mb-1">Client Secret (Secret Key)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="password" 
                      value={clientSecret}
                      readOnly
                      className="flex-1 bg-dark-card border border-dark-card-border rounded px-3 py-2 text-light-text"
                    />
                    <button 
                      onClick={() => copyToClipboard(clientSecret)}
                      className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-orange-light transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-4">7. Click <strong>"Save"</strong> in Supabase</p>
            </div>
          </div>

          {/* Step 3: Test */}
          <div className="bg-dark-bg p-5 rounded-lg border border-dark-card-border">
            <h3 className="text-xl font-semibold mb-3 text-light-text flex items-center gap-2">
              <span className="bg-brand-orange text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
              Test Your Setup
            </h3>
            <div className="ml-10 space-y-3 text-medium-text">
              <p>1. Go to your login page</p>
              <p>2. Click <strong>"Sign in with Google"</strong></p>
              <p>3. You should be redirected to Google's sign-in page</p>
              <p>4. After signing in, you'll be redirected back to your dashboard</p>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-900/20 border border-yellow-700/50 p-5 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-yellow-300">⚠️ Important Notes</h4>
            <ul className="space-y-2 text-medium-text ml-4 list-disc">
              <li>Replace <code className="bg-dark-card px-2 py-1 rounded text-sm">your-supabase-project</code> with your actual Supabase project reference ID</li>
              <li>Make sure to add BOTH redirect URIs in Google Cloud Console</li>
              <li>For production, update the redirect URI to your production domain</li>
              <li>Your Client Secret should be kept secure and never exposed in client-side code</li>
            </ul>
          </div>

          <button
            onClick={() => setStep('input')}
            className="w-full mt-6 bg-brand-orange text-white font-semibold py-3 px-6 rounded-xl hover:bg-brand-orange-light transition-colors"
          >
            Edit Client ID / Secret
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-dark-card rounded-xl border border-dark-card-border">
      <h2 className="text-2xl font-bold mb-6 text-light-text">Google OAuth Setup</h2>
      <p className="text-medium-text mb-6">
        Enter your Google OAuth credentials to enable Google Sign-In. You'll get these from Google Cloud Console.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-light-text mb-2">
            Google Client ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g., 123456789-abcdefghijklmnop.apps.googleusercontent.com"
            className="w-full p-4 bg-dark-bg border border-dark-card-border rounded-xl text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all"
            required
          />
          <p className="text-sm text-medium-text mt-2">
            Get this from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">Google Cloud Console</a>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text mb-2">
            Google Client Secret <span className="text-red-400">*</span>
          </label>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Enter your client secret"
            className="w-full p-4 bg-dark-bg border border-dark-card-border rounded-xl text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all"
            required
          />
          <p className="text-sm text-medium-text mt-2">
            This will be used to configure Supabase. Keep it secure!
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!clientId.trim() || !clientSecret.trim()}
          className="w-full mt-6 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-4 px-6 rounded-xl hover:scale-105 active:scale-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-orange/30 hover:shadow-glow-orange-sm"
        >
          Continue to Setup Instructions
        </button>
      </div>
    </div>
  );
};

export default GoogleOAuthSetup;

