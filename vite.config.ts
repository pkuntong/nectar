import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'process.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.SUPABASE_SERVICE_ROLE_KEY),
        'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
        'process.env.STRIPE_SECRET_KEY': JSON.stringify(env.STRIPE_SECRET_KEY),
        'process.env.STRIPE_WEBHOOK_SECRET': JSON.stringify(env.STRIPE_WEBHOOK_SECRET),
        'process.env.RESEND_API_KEY': JSON.stringify(env.RESEND_API_KEY),
        'process.env.VITE_SENTRY_DSN': JSON.stringify(env.VITE_SENTRY_DSN),
        'process.env.SENTRY_AUTH_TOKEN': JSON.stringify(env.SENTRY_AUTH_TOKEN)
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks for better caching
              'vendor-react': ['react', 'react-dom'],
              'vendor-supabase': ['@supabase/supabase-js'],
              'vendor-genai': ['@google/genai'],
              // Don't split Stripe - it needs its locale files together
            }
          }
        },
        chunkSizeWarningLimit: 1000,
        commonjsOptions: {
          // Help with Stripe's CommonJS modules
          transformMixedEsModules: true
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
