import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from './components/AuthProvider';
import { Analytics } from '@vercel/analytics/react';
import './index.css';
import router from './routes';
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
        <Analytics />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Register service worker with production check
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Only register in production
      if (import.meta.env.PROD) {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
          // Remove type: 'module' as we're not using ES modules in the service worker
        });

        registration.addEventListener('updatefound', () => {
          console.log('New service worker found, installing...');
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            console.log('Service worker state changed:', newWorker.state);
            
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              console.log('New content is available; please refresh.');
            } else if (newWorker.state === 'activated') {
              console.log('Service worker activated');
            }
          });
        });

        // Check for updates on page load
        registration.update().catch(err => 
          console.log('Service worker update check failed:', err)
        );
        
        // Check for updates every hour
        setInterval(() => {
          registration.update().catch(err => 
            console.log('Service worker update check failed:', err)
          );
        }, 60 * 60 * 1000);
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
};

// Register service worker after the app loads
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // In case the document has finished parsing, document's event handler may not execute
  setTimeout(registerServiceWorker, 0);
} else {
  window.addEventListener('load', registerServiceWorker);
}