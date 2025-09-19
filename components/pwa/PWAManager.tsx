'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff,
  Bell,
  BellOff,
  Share2,
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface PWAManagerProps {
  onInstall?: () => void;
  onUpdate?: () => void;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  notificationPermission: NotificationPermission;
  installPrompt: any;
}

export default function PWAManager({ onInstall, onUpdate }: PWAManagerProps) {
  const [isClient, setIsClient] = useState(false);
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true, // Default to online to prevent hydration mismatch
    hasUpdate: false,
    notificationPermission: 'default',
    installPrompt: null
  });

  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [showOfflineNotification, setShowOfflineNotification] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Set client-side flag and initialize actual online status
    setIsClient(true);
    setPwaState(prev => ({ ...prev, isOnline: navigator.onLine }));
    
    initializePWA();
    setupEventListeners();
    checkInstallationStatus();
    requestNotificationPermission();
  }, []);

  const initializePWA = () => {
    // Registra o Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
          
          // Verifica atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPwaState(prev => ({ ...prev, hasUpdate: true }));
                  setShowUpdateBanner(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }
  };

  const setupEventListeners = () => {
    // Evento de instalação do PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaState(prev => ({ ...prev, isInstallable: true }));
      setShowInstallBanner(true);
    });

    // Evento de instalação concluída
    window.addEventListener('appinstalled', () => {
      setPwaState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      setShowInstallBanner(false);
      onInstall?.();
    });

    // Monitora conectividade
    window.addEventListener('online', () => {
      setPwaState(prev => ({ ...prev, isOnline: true }));
      setShowOfflineNotification(false);
    });

    window.addEventListener('offline', () => {
      setPwaState(prev => ({ ...prev, isOnline: false }));
      setShowOfflineNotification(true);
    });

    // Monitora mudanças no Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setPwaState(prev => ({ ...prev, hasUpdate: true }));
          setShowUpdateBanner(true);
        }
      });
    }
  };

  const checkInstallationStatus = () => {
    // Verifica se o app está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    setPwaState(prev => ({
      ...prev,
      isInstalled: isStandalone || (isIOS && isInStandaloneMode)
    }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPwaState(prev => ({ ...prev, notificationPermission: permission }));
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA instalado pelo usuário');
      } else {
        console.log('PWA não instalado pelo usuário');
      }
      
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
    setShowUpdateBanner(false);
    onUpdate?.();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HubEdu.ia - A Educação do Futuro',
          text: 'Descubra a plataforma educacional mais avançada do Brasil!',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copiado para a área de transferência!');
    }
  };

  const toggleNotifications = async () => {
    if (pwaState.notificationPermission === 'granted') {
      // Desativa notificações (implementação específica)
      setPwaState(prev => ({ ...prev, notificationPermission: 'denied' }));
    } else {
      await requestNotificationPermission();
    }
  };

  return (
    <>
      {/* Banner de Instalação */}
      {isClient && (
        <AnimatePresence>
          {showInstallBanner && pwaState.isInstallable && !pwaState.isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-4 shadow-lg"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Instale o HubEdu.ia</h3>
                  <p className="text-sm">Acesse rapidamente e use offline!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Instalar
                </button>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Banner de Atualização */}
      {isClient && (
        <AnimatePresence>
          {showUpdateBanner && pwaState.hasUpdate && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 shadow-lg"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Atualização Disponível</h3>
                  <p className="text-sm">Nova versão do HubEdu.ia disponível!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Atualizar
                </button>
                <button
                  onClick={() => setShowUpdateBanner(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Notificação Offline */}
      {isClient && (
        <AnimatePresence>
          {showOfflineNotification && !pwaState.isOnline && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5" />
              <div>
                <h4 className="font-bold">Modo Offline</h4>
                <p className="text-sm">Algumas funcionalidades podem estar limitadas</p>
              </div>
              <button
                onClick={() => setShowOfflineNotification(false)}
                className="p-1 hover:bg-red-600 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Status PWA */}
      {isClient && (
        <div className="fixed bottom-4 left-4 z-40">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                pwaState.isOnline ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-gray-600">
                {pwaState.isOnline ? 'Online' : 'Offline'}
              </span>
              {pwaState.isInstalled && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menu PWA */}
      {isClient && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
            <div className="flex items-center gap-1">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Compartilhar"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
              
              <button
                onClick={toggleNotifications}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={pwaState.notificationPermission === 'granted' ? 'Desativar notificações' : 'Ativar notificações'}
              >
                {pwaState.notificationPermission === 'granted' ? (
                  <Bell className="w-4 h-4 text-green-500" />
                ) : (
                  <BellOff className="w-4 h-4 text-gray-600" />
                )}
              </button>
              
              {pwaState.isInstallable && !pwaState.isInstalled && (
                <button
                  onClick={handleInstall}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Instalar PWA"
                >
                  <Download className="w-4 h-4 text-blue-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
