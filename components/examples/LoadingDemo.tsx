'use client';

import { useState } from 'react';
import { LoadingScreen, LoadingSpinner, LoadingCard, useLoadingScreen } from '@/components/ui/LoadingScreen';
import { useLoading, LoadingButton, LoadingInput } from '@/lib/loading';
import { Button } from '@/components/ui/button';

export function LoadingDemo() {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const { isLoading, message, progress, startLoading, stopLoading, updateProgress } = useLoadingScreen();
  const { start: startLoadingContext, end: endLoadingContext, update: updateLoadingContext } = useLoading();

  const handleFullScreenDemo = () => {
    setShowFullScreen(true);
    startLoading('Carregando dados importantes...', 3000);
    
    // Simulate progress updates
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      updateProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          stopLoading();
          setShowFullScreen(false);
        }, 500);
      }
    }, 300);
  };

  const handleCardDemo = () => {
    setShowCard(true);
    setTimeout(() => setShowCard(false), 2000);
  };

  const handleGlobalLoading = () => {
    const key = startLoadingContext('global-loading', {
      message: 'Processando dados globalmente...',
      cancelable: true,
      onCancel: () => {
        console.log('Loading cancelado pelo usuário');
      }
    });

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      updateLoadingContext(key, { progress });
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => endLoadingContext(key, 'success'), 500);
      }
    }, 500);
  };

  const handleButtonLoading = async () => {
    const loadingKey = startLoadingContext('button-loading', {
      message: 'Salvando dados...',
      priority: 'high'
    });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Operação concluída!');
      endLoadingContext(loadingKey, 'success');
    } catch (error) {
      endLoadingContext(loadingKey, 'error');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Sistema de Loading - Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstração dos diferentes tipos de loading disponíveis
        </p>
      </div>

      {/* Full Screen Loading */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tela de Loading Completa</h2>
        <Button onClick={handleFullScreenDemo} variant="outline">
          Mostrar Loading Completo
        </Button>
        
        {showFullScreen && (
          <LoadingScreen
            isLoading={isLoading}
            message={message}
            progress={progress}
            variant="default"
            size="lg"
            showProgress={true}
            showPercentage={true}
            onComplete={() => console.log('Loading completo!')}
          />
        )}
      </div>

      {/* Card Loading */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Card de Loading</h2>
        <Button onClick={handleCardDemo} variant="outline">
          Mostrar Card Loading
        </Button>
        
        {showCard && (
          <div className="flex justify-center">
            <LoadingCard 
              message="Carregando conteúdo do card..."
              variant="default"
              showSpinner={true}
            />
          </div>
        )}
      </div>

      {/* Spinners */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Spinners</h2>
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <LoadingSpinner size="sm" variant="default" />
            <p className="text-sm mt-2">Small</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="md" variant="dots" />
            <p className="text-sm mt-2">Dots</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="lg" variant="pulse" />
            <p className="text-sm mt-2">Pulse</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="xl" variant="ring" />
            <p className="text-sm mt-2">Ring</p>
          </div>
        </div>
      </div>

      {/* Global Loading */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Loading Global</h2>
        <Button onClick={handleGlobalLoading} variant="outline">
          Iniciar Loading Global
        </Button>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Este loading aparece como overlay global e pode ser cancelado
        </p>
      </div>

      {/* Loading Button */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Botão com Loading</h2>
        <LoadingButton 
          onClick={handleButtonLoading}
          variant="default"
          size="md"
        >
          Salvar Dados
        </LoadingButton>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Botão que mostra loading durante operações assíncronas
        </p>
      </div>

      {/* Loading Input */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Input com Loading</h2>
        <div className="max-w-md">
          <LoadingInput
            placeholder="Digite algo..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            loading={inputValue.length > 0 && inputValue.length < 3}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Input que mostra loading quando está validando
        </p>
      </div>

      {/* Skeleton Components */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Skeleton Loading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingDemo;
