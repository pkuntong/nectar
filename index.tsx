// Import Tailwind CSS
import './src/index.css';

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

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div>Something went wrong</div>} showDialog>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
