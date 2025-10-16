'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Star, 
  Play, 
  CheckCircle,
  Bookmark,
  Share2,
  Download,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';
import { Trail, TrailProgress } from '@/types/trails';

interface TrailCardProps {
  trail: Trail;
  progress?: TrailProgress;
  recommendationScore?: number;
  isRecommended?: boolean;
  onSelect?: (trail: Trail) => void;
  onBookmark?: (trailId: string) => void;
  onShare?: (trail: Trail) => void;
  onDownload?: (trail: Trail) => void;
  compact?: boolean;
  className?: string;
}

export function TrailCard({
  trail,
  progress,
  recommendationScore,
  isRecommended = false,
  onSelect,
  onBookmark,
  onShare,
  onDownload,
  compact = false,
  className = ''
}: TrailCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleSelect = useCallback(() => {
    onSelect?.(trail);
  }, [onSelect, trail]);

  const handleBookmark = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(trail.id);
  }, [isBookmarked, onBookmark, trail.id]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(trail);
  }, [onShare, trail]);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(trail);
  }, [onDownload, trail]);

  const getDifficultyColor = (difficulty: Trail['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: Trail['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      case 'expert': return 'Especialista';
      default: return difficulty;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const getProgressStatus = () => {
    if (!progress) return null;
    
    if (progress.overallProgress === 100) {
      return {
        status: 'completed',
        label: 'Completada',
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600'
      };
    } else if (progress.overallProgress > 0) {
      return {
        status: 'in-progress',
        label: 'Em progresso',
        icon: <Play className="w-4 h-4" />,
        color: 'text-blue-600'
      };
    }
    return null;
  };

  const progressStatus = getProgressStatus();

  if (compact) {
    return (
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all duration-200 ${className}`}
        onClick={handleSelect}
        role="button"
        tabIndex={0}
        aria-label={`View trail: ${trail.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleSelect();
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{trail.title}</h3>
                {isRecommended && (
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Badge variant="outline" className={`text-xs ${getDifficultyColor(trail.difficulty)}`}>
                  {getDifficultyLabel(trail.difficulty)}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(trail.estimatedDuration)}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {trail.modules.length}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button size="sm" variant="outline">
                {progressStatus?.icon || <Play className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${className}`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      aria-label={`View trail: ${trail.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleSelect();
        }
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              {trail.title}
              {isRecommended && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Recomendado
                </Badge>
              )}
            </CardTitle>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{trail.description}</p>
          </div>
          
          <div className="flex gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`p-2 ${isBookmarked ? 'text-yellow-600' : 'text-gray-400'}`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2 text-gray-400"
              aria-label="Share trail"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="p-2 text-gray-400"
              aria-label="Download trail"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Trail Metadata */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getDifficultyColor(trail.difficulty)}>
              {getDifficultyLabel(trail.difficulty)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(trail.estimatedDuration)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {trail.modules.length} módulos
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {trail.metadata.targetAudience.join(', ')}
            </Badge>
          </div>

          {/* Tags */}
          {trail.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {trail.metadata.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {trail.metadata.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{trail.metadata.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Progress */}
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  {progressStatus?.icon}
                  <span className={progressStatus?.color}>
                    {progressStatus?.label}
                  </span>
                </span>
                <span>{Math.round(progress.overallProgress)}%</span>
              </div>
              <Progress value={progress.overallProgress} className="h-2" />
              <div className="text-xs text-gray-500">
                {progress.completedModules.length} de {trail.modules.length} módulos completados
              </div>
            </div>
          )}

          {/* Recommendation Score */}
          {recommendationScore && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Score de recomendação: {Math.round(recommendationScore * 100)}%</span>
            </div>
          )}

          {/* Learning Objectives Preview */}
          {trail.learningObjectives.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Objetivos de Aprendizado</h4>
              <ul className="space-y-1">
                {trail.learningObjectives.slice(0, 2).map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{objective}</span>
                  </li>
                ))}
                {trail.learningObjectives.length > 2 && (
                  <li className="text-xs text-gray-500">
                    +{trail.learningObjectives.length - 2} objetivos adicionais
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <Button 
            className="w-full" 
            variant={progress ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect();
            }}
          >
            {progressStatus?.status === 'completed' ? (
              <>
                <Award className="w-4 h-4 mr-2" />
                Ver Certificado
              </>
            ) : progressStatus?.status === 'in-progress' ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Continuar Trilha
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4 mr-2" />
                Iniciar Trilha
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
