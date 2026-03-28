'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update().catch(console.error);
          }, 60 * 60 * 1000); // Every hour
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  return null;
}
