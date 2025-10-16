'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  Target, 
  Star,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Share2,
  Download,
  Loader2,
  AlertCircle,
  Trophy,
  Users,
  Calendar,
  Tag
} from 'lucide-react';
import { useTrails, useCurrentTrail } from '@/contexts/TrailContext';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Trail, TrailModule, TrailProgress } from '@/types/trails';

interface TrailViewProps {
  trailId: string;
  userId: string;
  onComplete?: () => void;
  onExit?: () => void;
  className?: string;
}

export function TrailView({ trailId, userId, onComplete, onExit, className = '' }: TrailViewProps) {
  const { state, setCurrentTrail, startTrail, updateProgress, completeModule } = useTrails();
  const { trail, progress } = useCurrentTrail();
  const { getPersonalizedContent, recordInteraction } = usePersonalization({ userId });
  
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personalizedContent, setPersonalizedContent] = useState<any>(null);

  // Find the trail
  const currentTrail = useMemo(() => {
    return state.trails.find(t => t.id === trailId) || trail;
  }, [state.trails, trailId, trail]);

  // Find current progress
  const currentProgress = useMemo(() => {
    return state.userProgress.find(p => p.trailId === trailId) || progress;
  }, [state.userProgress, trailId, progress]);

  useEffect(() => {
    if (currentTrail) {
      setCurrentTrail(currentTrail);
      
      // Load personalized content
      loadPersonalizedContent();
      
      // Record trail view
      recordInteraction(trailId, 'viewed', {
        timestamp: new Date().toISOString(),
        moduleIndex: currentModuleIndex,
      });
    }
  }, [currentTrail, trailId, currentModuleIndex, setCurrentTrail, recordInteraction]);

  const loadPersonalizedContent = useCallback(async () => {
    try {
      const content = await getPersonalizedContent(trailId);
      setPersonalizedContent(content);
    } catch (err) {
      console.error('Error loading personalized content:', err);
    }
  }, [getPersonalizedContent, trailId]);

  const handleStartTrail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await startTrail(trailId, userId);
      setIsPlaying(true);
      
      // Record trail start
      await recordInteraction(trailId, 'started', {
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start trail');
    } finally {
      setLoading(false);
    }
  }, [startTrail, trailId, userId, recordInteraction]);

  const handleNextModule = useCallback(async () => {
    if (!currentTrail || currentModuleIndex >= currentTrail.modules.length - 1) {
      // Trail completed
      await recordInteraction(trailId, 'completed', {
        timestamp: new Date().toISOString(),
        score: 100,
        timeSpent: currentProgress?.timeSpent || 0,
      });
      onComplete?.();
      return;
    }

    const nextIndex = currentModuleIndex + 1;
    setCurrentModuleIndex(nextIndex);
    
    // Record module completion
    if (currentTrail.modules[currentModuleIndex]) {
      await completeModule(trailId, currentTrail.modules[currentModuleIndex].id);
    }
    
    // Record module view
    await recordInteraction(trailId, 'module_viewed', {
      moduleId: currentTrail.modules[nextIndex]?.id,
      moduleIndex: nextIndex,
      timestamp: new Date().toISOString(),
    });
  }, [currentTrail, currentModuleIndex, trailId, currentProgress, completeModule, recordInteraction, onComplete]);

  const handlePreviousModule = useCallback(() => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  }, [currentModuleIndex]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    recordInteraction(trailId, 'paused', {
      moduleIndex: currentModuleIndex,
      timestamp: new Date().toISOString(),
    });
  }, [trailId, currentModuleIndex, recordInteraction]);

  const handleResume = useCallback(() => {
    setIsPlaying(true);
    recordInteraction(trailId, 'resumed', {
      moduleIndex: currentModuleIndex,
      timestamp: new Date().toISOString(),
    });
  }, [trailId, currentModuleIndex, recordInteraction]);

  const handleRestart = useCallback(() => {
    setCurrentModuleIndex(0);
    setIsPlaying(false);
    recordInteraction(trailId, 'restarted', {
      timestamp: new Date().toISOString(),
    });
  }, [trailId, recordInteraction]);

  const currentModule = currentTrail?.modules[currentModuleIndex];
  const overallProgress = currentTrail ? ((currentModuleIndex + 1) / currentTrail.modules.length) * 100 : 0;

  if (!currentTrail) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading trail...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trail Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {currentTrail.title}
                <Badge variant="outline" className="ml-2">
                  {currentTrail.difficulty}
                </Badge>
              </CardTitle>
              <p className="text-gray-600 mb-4">{currentTrail.description}</p>
              
              {/* Trail Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentTrail.estimatedDuration} min
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {currentTrail.modules.length} módulos
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {currentTrail.metadata.tags.join(', ')}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" aria-label="Bookmark trail">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" aria-label="Share trail">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" aria-label="Download trail">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Geral</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          
          {/* Learning Objectives */}
          {currentTrail.learningObjectives.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Objetivos de Aprendizado</h4>
              <ul className="space-y-1">
                {currentTrail.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Trail Content */}
      {!currentProgress ? (
        /* Start Trail */
        <Card>
          <CardContent className="text-center p-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
            <h3 className="text-xl font-semibold mb-2">Pronto para começar?</h3>
            <p className="text-gray-600 mb-6">
              Esta trilha contém {currentTrail.modules.length} módulos e levará aproximadamente {currentTrail.estimatedDuration} minutos para completar.
            </p>
            <Button 
              onClick={handleStartTrail} 
              disabled={loading}
              size="lg"
              className="mr-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Trilha
                </>
              )}
            </Button>
            {onExit && (
              <Button variant="outline" onClick={onExit}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Trail Content */
        <div className="space-y-4">
          {/* Module Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Módulo {currentModuleIndex + 1} de {currentTrail.modules.length}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousModule}
                    disabled={currentModuleIndex === 0}
                    aria-label="Previous module"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextModule}
                    disabled={currentModuleIndex >= currentTrail.modules.length - 1}
                    aria-label="Next module"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {currentModule && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{currentModule.title}</h3>
                  <p className="text-gray-600">{currentModule.description}</p>
                  
                  {/* Module Controls */}
                  <div className="flex gap-2">
                    {!isPlaying ? (
                      <Button onClick={handleResume} aria-label="Resume module">
                        <Play className="w-4 h-4 mr-2" />
                        Continuar
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={handlePause} aria-label="Pause module">
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleRestart} aria-label="Restart module">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reiniciar
                    </Button>
                  </div>
                  
                  {/* Module Content Placeholder */}
                  <div className="border rounded-lg p-6 bg-gray-50">
                    <p className="text-center text-gray-500">
                      Conteúdo do módulo será renderizado aqui
                    </p>
                    {personalizedContent && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-semibold text-blue-800 mb-2">Conteúdo Personalizado</h4>
                        <p className="text-blue-700 text-sm">
                          Este conteúdo foi personalizado com base no seu perfil de aprendizado.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
