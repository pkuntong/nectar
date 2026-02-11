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
      plugins: [
        react({
          // Fast Refresh for better DX
          fastRefresh: true,
          // Optimize JSX transform
          jsxRuntime: 'automatic',
        })
      ],
      define: {
        // ✅ SAFE - Only expose public environment variables to the frontend
        // These are prefixed with VITE_ and are safe to expose
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
        'process.env.VITE_SENTRY_DSN': JSON.stringify(env.VITE_SENTRY_DSN),
        'process.env.VITE_CONVEX_URL': JSON.stringify(env.VITE_CONVEX_URL),
        'process.env.VITE_CONVEX_SITE_URL': JSON.stringify(env.VITE_CONVEX_SITE_URL),
        'process.env.VITE_CONVEX_GENERATE_HUSTLES_URL': JSON.stringify(env.VITE_CONVEX_GENERATE_HUSTLES_URL),
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
        // Target modern browsers for smaller bundles
        target: 'es2020',
        // Minify with terser for better compression
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
            pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
          },
        },
        // Optimize CSS
        cssMinify: true,
        // Source maps for production debugging (small overhead)
        sourcemap: mode !== 'production',
        rollupOptions: {
          output: {
            // Improved code splitting for better caching
            manualChunks: (id) => {
              // Vendor chunks for better long-term caching
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor-react';
                }
                if (id.includes('@supabase')) {
                  return 'vendor-supabase';
                }
                if (id.includes('@google/genai')) {
                  return 'vendor-genai';
                }
                if (id.includes('@sentry')) {
                  return 'vendor-sentry';
                }
                if (id.includes('stripe')) {
                  return 'vendor-stripe';
                }
                // All other node_modules
                return 'vendor';
              }
            },
            // Better chunk naming for caching
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
          }
        },
        chunkSizeWarningLimit: 1000,
        // Report compressed size
        reportCompressedSize: true,
        commonjsOptions: {
          // Help with Stripe's CommonJS modules
          transformMixedEsModules: true
        }
      },
      // Performance optimizations
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          '@supabase/supabase-js',
          '@stripe/stripe-js',
          'react-hot-toast'
        ],
        // Exclude large dependencies that should be lazy-loaded
        exclude: ['@google/genai'],
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
