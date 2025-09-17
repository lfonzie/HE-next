"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Settings,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  BookOpen,
  Target,
  Clock,
  Zap
} from 'lucide-react';

interface EnhancedLessonControlsProps {
  // Navegação
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  
  // Estado
  currentStep: number;
  totalSteps: number;
  isGeneratingNext: boolean;
  
  // Controles
  onRestart: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  
  // Configurações
  onSettings?: () => void;
  onVolumeToggle?: () => void;
  isMuted?: boolean;
  
  // Auto-play
  onAutoPlay?: () => void;
  isAutoPlaying?: boolean;
  
  // Estatísticas
  showStats?: boolean;
  onToggleStats?: () => void;
  
  className?: string;
}

// Componente de botão de navegação otimizado
const NavigationButton = React.memo(({ 
  direction, 
  onClick, 
  disabled, 
  isLoading = false 
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
  disabled: boolean;
  isLoading?: boolean;
}) => {
  const isPrevious = direction === 'previous';
  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center gap-2 ${
        isPrevious ? 'pr-3' : 'pl-3'
      }`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {isPrevious ? 'Anterior' : 'Próximo'}
    </Button>
  );
});

NavigationButton.displayName = 'NavigationButton';

// Componente de indicador de progresso
const ProgressIndicator = React.memo(({ 
  currentStep, 
  totalSteps, 
  isGeneratingNext 
}: {
  currentStep: number;
  totalSteps: number;
  isGeneratingNext: boolean;
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="flex items-center gap-1">
        <BookOpen className="h-3 w-3" />
        {currentStep + 1} de {totalSteps}
      </Badge>
      
      {isGeneratingNext && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Zap className="h-3 w-3 animate-pulse" />
          Gerando...
        </Badge>
      )}
      
      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-24">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

// Componente de controles de mídia
const MediaControls = React.memo(({ 
  onVolumeToggle, 
  isMuted, 
  onAutoPlay, 
  isAutoPlaying 
}: {
  onVolumeToggle?: () => void;
  isMuted?: boolean;
  onAutoPlay?: () => void;
  isAutoPlaying?: boolean;
}) => {
  if (!onVolumeToggle && !onAutoPlay) return null;
  
  return (
    <div className="flex items-center gap-2">
      {onVolumeToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onVolumeToggle}
          className="p-2"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      )}
      
      {onAutoPlay && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAutoPlay}
          className="p-2"
        >
          {isAutoPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
});

MediaControls.displayName = 'MediaControls';

export default function EnhancedLessonControls({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  currentStep,
  totalSteps,
  isGeneratingNext,
  onRestart,
  onFullscreen,
  isFullscreen,
  onSettings,
  onVolumeToggle,
  isMuted,
  onAutoPlay,
  isAutoPlaying,
  showStats,
  onToggleStats,
  className = ''
}: EnhancedLessonControlsProps) {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  const handlePrevious = useCallback(() => {
    if (canGoPrevious && !isGeneratingNext) {
      onPrevious();
    }
  }, [canGoPrevious, isGeneratingNext, onPrevious]);

  const handleNext = useCallback(() => {
    if (canGoNext && !isGeneratingNext) {
      onNext();
    }
  }, [canGoNext, isGeneratingNext, onNext]);

  return (
    <div className={`bg-white border-t border-gray-200 p-4 space-y-4 ${className}`}>
      {/* Controles principais */}
      <div className="flex items-center justify-between">
        {/* Navegação */}
        <div className="flex items-center gap-3">
          <NavigationButton
            direction="previous"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            isLoading={isGeneratingNext}
          />
          
          <NavigationButton
            direction="next"
            onClick={handleNext}
            disabled={!canGoNext}
            isLoading={isGeneratingNext}
          />
        </div>

        {/* Indicador de progresso */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          isGeneratingNext={isGeneratingNext}
        />

        {/* Controles de ação */}
        <div className="flex items-center gap-2">
          <MediaControls
            onVolumeToggle={onVolumeToggle}
            isMuted={isMuted}
            onAutoPlay={onAutoPlay}
            isAutoPlaying={isAutoPlaying}
          />
          
          {onSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettings}
              className="p-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreen}
            className="p-2"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestart}
            className="p-2"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controles avançados (colapsáveis) */}
      {showAdvancedControls && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrevious()}
              disabled={!canGoPrevious}
              className="flex items-center gap-1"
            >
              <SkipBack className="h-3 w-3" />
              Primeiro
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNext()}
              disabled={!canGoNext}
              className="flex items-center gap-1"
            >
              Último
              <SkipForward className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {onToggleStats && (
              <Button
                variant={showStats ? "default" : "outline"}
                size="sm"
                onClick={onToggleStats}
                className="flex items-center gap-1"
              >
                <Target className="h-3 w-3" />
                Stats
              </Button>
            )}
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Slide {currentStep + 1}
            </Badge>
          </div>
        </div>
      )}

      {/* Botão para mostrar/ocultar controles avançados */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {showAdvancedControls ? 'Ocultar' : 'Mostrar'} controles avançados
        </Button>
      </div>
    </div>
  );
}
