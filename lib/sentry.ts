import * as Sentry from '@sentry/react';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN;

export const initSentry = () => {
  if (!sentryDsn) {
    console.warn('Sentry DSN not found. Error tracking will be disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    // ✅ Sample 100% in dev, only 10% in production to save costs
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0, // Always capture sessions with errors
    environment: import.meta.env.MODE || 'development',
  });
};

export default Sentry;

