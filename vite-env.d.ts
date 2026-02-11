/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly RESEND_API_KEY: string;
  readonly VITE_SENTRY_DSN: string;
  readonly SENTRY_AUTH_TOKEN: string;
  readonly VITE_CONVEX_SITE_URL?: string;
  readonly VITE_CONVEX_URL?: string;
  readonly VITE_CONVEX_GENERATE_HUSTLES_URL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly GEMINI_API_KEY?: string;
  readonly VITE_GROQ_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
