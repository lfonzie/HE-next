'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: navigator.onLine,
    registration: null,
    error: null,
  });

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    // Register service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[SW] Service Worker registrado com sucesso:', registration);

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
          error: null,
        }));

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, notify user
                console.log('[SW] Nova versão disponível');
                // You can show a notification here
              }
            });
          }
        });

      } catch (error) {
        console.error('[SW] Erro ao registrar Service Worker:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }));
      }
    };

    // Listen for online/offline events
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    registerSW();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateServiceWorker = async () => {
    if (!state.registration) return;

    try {
      await state.registration.update();
      console.log('[SW] Service Worker atualizado');
    } catch (error) {
      console.error('[SW] Erro ao atualizar Service Worker:', error);
    }
  };

  const unregisterServiceWorker = async () => {
    if (!state.registration) return;

    try {
      await state.registration.unregister();
      setState(prev => ({ ...prev, isRegistered: false, registration: null }));
      console.log('[SW] Service Worker desregistrado');
    } catch (error) {
      console.error('[SW] Erro ao desregistrar Service Worker:', error);
    }
  };

  return {
    ...state,
    updateServiceWorker,
    unregisterServiceWorker,
  };
}
