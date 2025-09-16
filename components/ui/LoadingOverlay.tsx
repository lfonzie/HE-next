'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  onCancel?: () => void;
  showCancelButton?: boolean;
  message?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  onCancel, 
  showCancelButton = false,
  message = "Carregando…"
}: LoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Prevenir scroll do body quando overlay está visível
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  if (!mounted || !isVisible) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-sm mx-4 flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Mensagem */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{message}</p>
          <p className="text-sm text-gray-600 mt-1">Aguarde um momento...</p>
        </div>

        {/* Botão Cancelar (opcional) */}
        {showCancelButton && onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
            aria-label="Cancelar operação"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancelar
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
