/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;
  readonly RESEND_API_KEY: string;
  readonly VITE_SENTRY_DSN: string;
  readonly SENTRY_AUTH_TOKEN: string;
  readonly GEMINI_API_KEY?: string;
  readonly VITE_GROQ_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

