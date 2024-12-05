import React from 'react';
import { createRoot } from 'react-dom/client';

// Styles
import './style.css';
// App
import App from './App';

const root = createRoot(
  document.getElementById('app') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
