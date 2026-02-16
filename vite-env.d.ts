/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_CONVEX_SITE_URL?: string;
  readonly VITE_CONVEX_URL?: string;
  readonly VITE_CONVEX_GENERATE_HUSTLES_URL?: string;
  readonly VITE_STRIPE_PRICE_FREE?: string;
  readonly VITE_STRIPE_PRICE_ENTREPRENEUR?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
