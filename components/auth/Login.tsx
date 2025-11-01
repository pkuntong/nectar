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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        onLoginSuccess();
      }
    } catch (error: any) {
      onError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="text-medium-text mb-6">Enter your credentials to access your dashboard.</p>
      <form onSubmit={handleLogin}>
        <div className="space-y-4">
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
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center text-sm text-medium-text select-none cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-dark-card-border bg-dark-bg text-brand-orange focus:ring-brand-orange focus:ring-offset-dark-card" />
            <span className="ml-2">Remember me</span>
          </label>
          <button 
            type="button"
            onClick={() => onError('Password reset not implemented yet')} 
            className="text-sm text-brand-orange-light hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-3 px-5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;

