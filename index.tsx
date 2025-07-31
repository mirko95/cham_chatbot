import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Locate the DOM element where the React app will be mounted
const rootElement = document.getElementById('root');
if (!rootElement) {
  // Fail fast if root div is missing (prevents silent app failure)
  throw new Error("Could not find root element to mount to");
}

// Initialize React 18+ root API (concurrent mode compatible)
const root = ReactDOM.createRoot(rootElement);

// Render the main application
// React.StrictMode enables extra checks & warnings in development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
