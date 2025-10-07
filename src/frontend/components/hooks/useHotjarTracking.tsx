// src/hooks/useHotjarTracking.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    hj?: (...args: any[]) => void;
  }
}
export {};

export function useHotjarTracking() {
  const location = useLocation();

  useEffect(() => {
    // small delay helps ensure Hotjar has loaded
    const timer = setTimeout(() => {
      if (typeof window.hj === "function") {
        window.hj("stateChange", location.pathname + location.search);
      }
    }, 300); // ms delay

    return () => clearTimeout(timer);
  }, [location]);
}
