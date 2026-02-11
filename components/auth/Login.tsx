import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { convexClient } from '../../lib/convexClient';

type LoginMode = 'signin' | 'signup' | 'forgot' | 'reset';

interface LoginProps {
  onLoginSuccess: () => void;
  onError: (error: string) => void;
  initialMode?: LoginMode;
  initialResetToken?: string | null;
}

const removeAuthQueryParams = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('verify_email_token');
  url.searchParams.delete('reset_password_token');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
};

const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onError,
  initialMode = 'signin',
  initialResetToken = null,
}) => {
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(initialResetToken);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string>('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    setResetToken(initialResetToken);
  }, [initialResetToken]);

  const titleText = useMemo(() => {
    if (mode === 'signup') return 'Create your account to start finding side hustles.';
    if (mode === 'forgot') return 'Enter your email and we will send a reset link.';
    if (mode === 'reset') return 'Set a new password for your account.';
    return 'Enter your credentials to access your dashboard.';
  }, [mode]);

  const submitSignUp = async () => {
    const { data, error } = await convexClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    if (!data?.user) throw new Error('Account creation failed.');

    setVerificationPendingEmail(email);
    setMode('signin');
    setPassword('');
    setConfirmPassword('');
    if (data.emailSent) {
      toast.success('Account created. Check your email to confirm your account before signing in.');
    } else {
      onError(
        'Account created, but verification email could not be sent. Use "Resend verification email" after SMTP is fixed.'
      );
    }
  };

  const submitSignIn = async () => {
    const { data, error } = await convexClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not verified')) {
        setVerificationPendingEmail(email);
      }
      if (error.message.includes('Invalid login credentials')) {
        onError('Invalid email or password. Please check your credentials and try again.');
        return;
      }
      throw error;
    }

    if (data?.user) {
      onLoginSuccess();
    }
  };

  const submitForgotPassword = async () => {
    const { error } = await convexClient.auth.requestPasswordReset({
      email,
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    toast.success('If your email exists, a password reset link has been sent.');
    setMode('signin');
  };

  const submitResetPassword = async () => {
    if (!resetToken) {
      throw new Error('Missing password reset token. Please request a new reset email.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const { error } = await convexClient.auth.resetPassword({
      token: resetToken,
      password,
    });
    if (error) throw error;

    removeAuthQueryParams();
    setResetToken(null);
    setPassword('');
    setConfirmPassword('');
    setMode('signin');
    toast.success('Password reset complete. You can now sign in.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        await submitSignUp();
      } else if (mode === 'forgot') {
        await submitForgotPassword();
      } else if (mode === 'reset') {
        await submitResetPassword();
      } else {
        await submitSignIn();
      }
    } catch (error: any) {
      onError(error?.message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = (verificationPendingEmail || email).trim().toLowerCase();
    if (!targetEmail) {
      onError('Enter your email first so we can resend the verification link.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await convexClient.auth.resendVerificationEmail({
        email: targetEmail,
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      toast.success('Verification email sent. Check your inbox.');
    } catch (error: any) {
      onError(error?.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await convexClient.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
      if (data?.user) {
        onLoginSuccess();
      }
    } catch (error: any) {
      onError(error?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const showEmailField = mode !== 'reset';
  const showPasswordField = mode === 'signin' || mode === 'signup' || mode === 'reset';
  const showConfirmPasswordField = mode === 'reset';
  const showGoogleButton = mode === 'signin';

  return (
    <div>
      <p className="text-medium-text mb-8 text-lg leading-relaxed">{titleText}</p>
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {showEmailField && (
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
          )}

          {showPasswordField && (
            <div>
              <input
                type="password"
                placeholder={
                  mode === 'signup'
                    ? 'Create Password (min 6 characters)'
                    : mode === 'reset'
                    ? 'New Password (min 6 characters)'
                    : 'Password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-dark-bg border border-dark-card-border rounded-xl text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all duration-300 hover:border-brand-orange/50"
                required
                minLength={6}
              />
            </div>
          )}

          {showConfirmPasswordField && (
            <div>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 bg-dark-bg border border-dark-card-border rounded-xl text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all duration-300 hover:border-brand-orange/50"
                required
                minLength={6}
              />
            </div>
          )}
        </div>

        {mode === 'signin' && (
          <div className="flex items-center justify-between mt-6">
            <label className="flex items-center text-sm text-medium-text select-none cursor-pointer group">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-dark-card-border bg-dark-bg text-brand-orange focus:ring-brand-orange focus:ring-offset-dark-card transition-all duration-300 group-hover:border-brand-orange/50"
              />
              <span className="ml-2 group-hover:text-light-text transition-colors duration-300">
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="text-sm text-brand-orange-light hover:text-brand-orange transition-colors duration-300"
            >
              Forgot password?
            </button>
          </div>
        )}

        {verificationPendingEmail && mode === 'signin' && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleResendVerification}
              className="text-sm text-brand-orange-light hover:text-brand-orange transition-colors duration-300"
              disabled={loading}
            >
              Resend verification email
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-4 px-6 rounded-xl hover:scale-105 active:scale-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-orange/30 hover:shadow-glow-orange-sm"
        >
          {loading
            ? mode === 'signup'
              ? 'Creating Account...'
              : mode === 'forgot'
              ? 'Sending Reset Link...'
              : mode === 'reset'
              ? 'Updating Password...'
              : 'Logging in...'
            : mode === 'signup'
            ? 'Create Account'
            : mode === 'forgot'
            ? 'Send Reset Link'
            : mode === 'reset'
            ? 'Update Password'
            : 'Login'}
        </button>
      </form>

      {mode === 'signin' && (
        <div className="mt-6 text-center">
          <p className="text-sm text-medium-text">
            {"Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-brand-orange hover:text-brand-orange-light font-semibold transition-colors duration-300"
            >
              Create one
            </button>
          </p>
        </div>
      )}

      {mode === 'signup' && (
        <div className="mt-6 text-center">
          <p className="text-sm text-medium-text">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-brand-orange hover:text-brand-orange-light font-semibold transition-colors duration-300"
            >
              Log in
            </button>
          </p>
        </div>
      )}

      {(mode === 'forgot' || mode === 'reset') && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="text-sm text-brand-orange hover:text-brand-orange-light font-semibold transition-colors duration-300"
          >
            Back to login
          </button>
        </div>
      )}

      {showGoogleButton && (
        <>
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
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-4 px-6 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </>
      )}
    </div>
  );
};

export default Login;
