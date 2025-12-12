import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️  Missing Supabase environment variables');
  console.warn('⚠️  Supabase features will not work without VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.warn('⚠️  Creating Supabase client with placeholder values - features will fail when used');
  // Don't throw - let the app load, features will fail gracefully when used
}

// Create client with actual values or placeholders (will fail gracefully when used)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

