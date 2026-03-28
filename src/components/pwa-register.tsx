'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Use absolute path for GitHub Pages with basePath /garden
      const swPath = '/garden/sw.js';
      const swScope = '/garden/';

      navigator.serviceWorker
        .register(swPath, { scope: swScope })
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
