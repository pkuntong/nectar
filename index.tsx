// Import Tailwind CSS
import './src/index.css';

// Import Mobile Enhancements
import './mobile-enhancements.css';

// Validate environment variables first
import './lib/env';

import { initSentry } from './lib/sentry';
import * as Sentry from '@sentry/react';

// Initialize Sentry before anything else
initSentry();

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div>Something went wrong</div>} showDialog>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
