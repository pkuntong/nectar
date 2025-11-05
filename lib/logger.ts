/**
 * Production-safe logger
 * In development: logs everything
 * In production: only logs errors and warnings
 */

const isDev = import.meta.env.MODE === 'development' || import.meta.env.DEV;

export const logger = {
  /**
   * Log general information (hidden in production)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always shown, sent to Sentry)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log warnings (shown in production, but less verbose)
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Group logs (only in development)
   */
  group: (label: string) => {
    if (isDev && console.group) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDev && console.groupEnd) {
      console.groupEnd();
    }
  }
};
