import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginProps {
  onLoginSuccess: () => void;
  onError: (error: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          }
        });

        if (error) throw error;

        if (data?.user) {
          onError('Account created! Please check your email to verify your account, then you can log in.');
          // Switch back to login mode after successful signup
          setTimeout(() => {
            setIsSignUp(false);
          }, 3000);
        }
      } else {
        // Login flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Check if this is a deleted account or invalid credentials
          if (error.message.includes('Invalid login credentials')) {
            // Check if user exists in database but was deleted
            const { data: profileData } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('id', email)
              .single();

            // If no profile found, account was likely deleted
            if (!profileData) {
              onError('This account has been deleted. Please create a new account to continue using Nectar Forge.');
            } else {
              onError('Invalid email or password. Please check your credentials and try again.');
            }
          } else {
            throw error;
          }
          return;
        }

        if (data?.user) {
          onLoginSuccess();
        }
      }
    } catch (error: any) {
      onError(error.message || `Failed to ${isSignUp ? 'create account' : 'login'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`
        }
      });
      if (error) {
        // Provide helpful error message for missing OAuth secret
        if (error.message?.includes('missing OAuth secret') || error.message?.includes('validation_failed')) {
          onError('Google OAuth is not configured. Please enable Google provider in Supabase Dashboard and add your Client ID and Client Secret. Visit /#google-oauth-setup for setup instructions.');
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      onError(error.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div>
      <p className="text-medium-text mb-8 text-lg leading-relaxed">
        {isSignUp ? 'Create your account to start finding side hustles.' : 'Enter your credentials to access your dashboard.'}
      </p>
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-dark-bg border border-dark-card-border rounded-xl text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all duration-300 hover:border-brand-orange/50"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder={isSignUp ? "Create Password (min 6 characters)" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-dark-bg border border-dark-card-border rounded-xl text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all duration-300 hover:border-brand-orange/50"
              required
              minLength={6}
            />
          </div>
        </div>
        {!isSignUp && (
          <div className="flex items-center justify-between mt-6">
            <label className="flex items-center text-sm text-medium-text select-none cursor-pointer group">
              <input type="checkbox" className="h-4 w-4 rounded border-dark-card-border bg-dark-bg text-brand-orange focus:ring-brand-orange focus:ring-offset-dark-card transition-all duration-300 group-hover:border-brand-orange/50" />
              <span className="ml-2 group-hover:text-light-text transition-colors duration-300">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => onError('Password reset not implemented yet')}
              className="text-sm text-brand-orange-light hover:text-brand-orange transition-colors duration-300"
            >
              Forgot password?
            </button>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-4 px-6 rounded-xl hover:scale-105 active:scale-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-orange/30 hover:shadow-glow-orange-sm"
        >
          {loading ? (isSignUp ? 'Creating Account...' : 'Logging in...') : (isSignUp ? 'Create Account' : 'Login')}
        </button>
      </form>

      {/* Toggle between Login and Sign Up */}
      <div className="mt-6 text-center">
        <p className="text-sm text-medium-text">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-brand-orange hover:text-brand-orange-light font-semibold transition-colors duration-300"
          >
            {isSignUp ? 'Log in' : 'Create one'}
          </button>
        </p>
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-card-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-dark-card text-medium-text">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-4 px-6 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-300"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-xs text-center text-medium-text mt-4">
        {isSignUp ? 'Google Sign-In automatically creates your account' : 'No account? Google Sign-In will create one automatically'}
      </p>
    </div>
  );
};

export default Login;

