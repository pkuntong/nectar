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
      <p className="text-medium-text mb-8 text-lg leading-relaxed">Enter your credentials to access your dashboard.</p>
      <form onSubmit={handleLogin}>
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
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-dark-bg border border-dark-card-border rounded-xl text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all duration-300 hover:border-brand-orange/50" 
              required 
            />
          </div>
        </div>
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
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-4 px-6 rounded-xl hover:scale-105 active:scale-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-orange/30 hover:shadow-glow-orange-sm"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;

