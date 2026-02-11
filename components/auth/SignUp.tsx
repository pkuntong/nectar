import React, { useState } from 'react';
import { convexClient } from '../../lib/convexClient';
import { logger } from '../../lib/logger';

interface SignUpProps {
  onSignUpSuccess: () => void;
  onError: (error: string) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onError }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await convexClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        // Send welcome email without blocking account creation.
        try {
          await convexClient.functions.invoke('send-email', {
            body: {
              to: email,
              subject: 'Welcome to Nectar Forge! 🚀',
              type: 'welcome',
            },
          });
        } catch (emailError) {
          logger.error('Failed to send welcome email:', emailError);
        }
        onSignUpSuccess();
      }
    } catch (error: any) {
      onError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const { error } = await convexClient.auth.signInWithOAuth({ provider: 'google' });
      if (error) {
        throw error;
      }
      onSignUpSuccess();
    } catch (error: any) {
      onError(error.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="text-medium-text mb-8 text-lg leading-relaxed">Create your account to start finding your next income stream.</p>
      <form onSubmit={handleSignUp}>
        <div className="space-y-5">
          <input 
            type="text" 
            placeholder="Full Name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-4 bg-dark-bg border border-dark-card-border rounded-xl text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all duration-300 hover:border-brand-orange/50" 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-dark-bg border border-dark-card-border rounded-xl text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all duration-300 hover:border-brand-orange/50" 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-dark-bg border border-dark-card-border rounded-xl text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all duration-300 hover:border-brand-orange/50" 
            required 
            minLength={6}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-4 px-6 rounded-xl hover:scale-105 active:scale-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-orange/30 hover:shadow-glow-orange-sm"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

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
        onClick={handleGoogleSignUp}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-4 px-6 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign up with Google
      </button>
    </div>
  );
};

export default SignUp;
