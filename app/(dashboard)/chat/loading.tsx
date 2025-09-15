'use client';

import { useEffect } from 'react';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

export default function ChatLoading() {
  const loading = useGlobalLoading();

  useEffect(() => {
    // Quando o loading.tsx monta, esconde o overlay global
    // Isso garante que o overlay some assim que a rota começa a renderizar
    loading.hide();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio para executar apenas uma vez

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-4">
        {/* Header skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </div>

        {/* Chat messages skeleton */}
        <div className="space-y-4">
          {/* User message skeleton */}
          <div className="flex justify-end">
            <div className="bg-yellow-400 rounded-lg p-4 max-w-xs lg:max-w-md">
              <div className="h-4 bg-yellow-300 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Assistant message skeleton */}
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-4 max-w-xs lg:max-w-md shadow-sm">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>

          {/* Typing indicator skeleton */}
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-4 max-w-xs lg:max-w-md shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 ml-2">Digitando...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}