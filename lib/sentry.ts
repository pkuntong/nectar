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
    tracesSampleRate: 1.0, // 100% in development, adjust for production (e.g., 0.1 for 10%)
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with an error
    environment: import.meta.env.MODE || 'development',
  });
};

export default Sentry;

