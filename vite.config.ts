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
        // ✅ SAFE - Only expose public environment variables to the frontend
        // These are prefixed with VITE_ and are safe to expose
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY),
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
        'process.env.VITE_SENTRY_DSN': JSON.stringify(env.VITE_SENTRY_DSN),
        // Price IDs (these are safe to expose - they're used client-side)
        'process.env.VITE_STRIPE_PRICE_FREE': JSON.stringify(env.VITE_STRIPE_PRICE_FREE),
        'process.env.VITE_STRIPE_PRICE_ENTREPRENEUR': JSON.stringify(env.VITE_STRIPE_PRICE_ENTREPRENEUR),

        // ⚠️ NEVER expose these secrets in frontend:
        // - SUPABASE_SERVICE_ROLE_KEY (gives admin access to database)
        // - STRIPE_SECRET_KEY (can create charges)
        // - STRIPE_WEBHOOK_SECRET (webhook verification)
        // - SENTRY_AUTH_TOKEN (Sentry account access)
        // - RESEND_API_KEY (email sending)
        // These should ONLY be in Supabase Edge Function secrets
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
