'use client';

import { useEffect } from 'react';

export function ChunkErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleChunkError = () => {
      // Clear Next.js cache and reload
      if (typeof window !== 'undefined') {
        // Clear service worker cache
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        
        // Reload the page
        window.location.href = '/';
      }
    };

    window.addEventListener('error', (event) => {
      if (event.message?.includes('Loading chunk') || event.message?.includes('failed')) {
        console.error('Chunk loading error detected:', event.message);
        handleChunkError();
      }
    });

    return () => {
      window.removeEventListener('error', handleChunkError);
    };
  }, []);

  return <>{children}</>;
}
