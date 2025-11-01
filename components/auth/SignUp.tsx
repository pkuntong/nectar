import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

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
      const { data, error } = await supabase.auth.signUp({
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
        // Send welcome email via Supabase Edge Function
        try {
          await supabase.functions.invoke('send-email', {
            body: {
              to: email,
              subject: 'Welcome to Nectar! 🚀',
              type: 'welcome',
            },
          });
        } catch (emailError) {
          // Don't fail signup if email fails, just log it
          console.error('Failed to send welcome email:', emailError);
        }
        onSignUpSuccess();
      }
    } catch (error: any) {
      onError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="text-medium-text mb-6">Create your account to start finding your next income stream.</p>
      <form onSubmit={handleSignUp}>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Full Name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none" 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none" 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none" 
            required 
            minLength={6}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-3 px-5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default SignUp;

