/**
 * Environment variable validation
 * Ensures all required environment variables are set at startup
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
] as const;

const optionalEnvVars = [
  'VITE_SENTRY_DSN',
  'VITE_STRIPE_PRICE_FREE',
  'VITE_STRIPE_PRICE_ENTREPRENEUR',
  'GEMINI_API_KEY',
  'VITE_GROQ_API_KEY',
] as const;

// Validate required environment variables
export function validateEnv() {
  const missing: string[] = [];

  requiredEnvVars.forEach(key => {
    if (!import.meta.env[key] && !process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\nPlease add them to your .env file.`;
    console.error(errorMessage);
    
    // In production, show a user-friendly error instead of crashing
    if (import.meta.env.MODE === 'production') {
      // Don't throw - let the app render with a graceful error message
      // The app will show an error state instead
      console.error('App will run in limited mode due to missing environment variables');
      // Still check optional vars
      const missingOptional: string[] = [];
      optionalEnvVars.forEach(key => {
        if (!import.meta.env[key] && !process.env[key]) {
          missingOptional.push(key);
        }
      });
      if (missingOptional.length > 0) {
        console.warn(`Optional environment variables not set:\n${missingOptional.map(v => `  - ${v}`).join('\n')}`);
      }
      return false;
    }
    
    throw new Error(errorMessage);
  }

  // Warn about missing optional variables
  const missingOptional: string[] = [];
  optionalEnvVars.forEach(key => {
    if (!import.meta.env[key] && !process.env[key]) {
      missingOptional.push(key);
    }
  });

  if (missingOptional.length > 0) {
    console.warn(`Optional environment variables not set:\n${missingOptional.map(v => `  - ${v}`).join('\n')}`);
  }
}

// Validate on module load (but don't crash in production)
if (import.meta.env.MODE !== 'test') {
  try {
    validateEnv();
  } catch (error) {
    // In development, throw to show error immediately
    if (import.meta.env.DEV) {
      throw error;
    }
    // In production, log but don't crash
    console.error('Environment validation failed:', error);
  }
}
