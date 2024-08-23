import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

if (typeof global === 'undefined') {
  (window as unknown as { global: typeof window }).global = window;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
);
