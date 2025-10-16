'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Target, 
  Star, 
  TrendingUp,
  Users,
  Award,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useTrails, useTrailList, useTrailRecommendations, useTrailLoading, useTrailError } from '@/contexts/TrailContext';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Trail, TrailProgress } from '@/types/trails';

interface TrailsDashboardProps {
  userId: string;
  onTrailSelect?: (trail: Trail) => void;
  className?: string;
}

export function TrailsDashboard({ userId, onTrailSelect, className = '' }: TrailsDashboardProps) {
  const { fetchTrails, refreshData } = useTrails();
  const trails = useTrailList();
  const recommendations = useTrailRecommendations();
  const loading = useTrailLoading();
  const error = useTrailError();
  const { recommendations: personalizedRecommendations } = usePersonalization({ userId });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');

  // Filter and sort trails
  const filteredTrails = useMemo(() => {
    let filtered = trails;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trail =>
        trail.title.toLowerCase().includes(query) ||
        trail.description.toLowerCase().includes(query) ||
        trail.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(trail => trail.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(trail => trail.difficulty === selectedDifficulty);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'duration':
          comparison = a.estimatedDuration - b.estimatedDuration;
          break;
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        case 'popularity':
          // Mock popularity score based on recommendations
          const aScore = recommendations.find(r => r.trail.id === a.id)?.score || 0;
          const bScore = recommendations.find(r => r.trail.id === b.id)?.score || 0;
          comparison = bScore - aScore;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [trails, searchQuery, selectedCategory, selectedDifficulty, sortBy, sortOrder, recommendations]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(trails.map(trail => trail.category))];
    return uniqueCategories;
  }, [trails]);

  // Get user's progress for trails
  const getUserProgress = useCallback((trailId: string) => {
    // This would typically come from the context
    return null; // Mock implementation
  }, []);

  useEffect(() => {
    if (userId) {
      refreshData(userId);
    }
  }, [userId, refreshData]);

  const handleTrailClick = useCallback((trail: Trail) => {
    onTrailSelect?.(trail);
  }, [onTrailSelect]);

  const getDifficultyColor = (difficulty: Trail['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TrailCard = ({ trail }: { trail: Trail }) => {
    const progress = getUserProgress(trail.id);
    const recommendation = recommendations.find(r => r.trail.id === trail.id);
    const personalizedRec = personalizedRecommendations.find(r => r.trail.id === trail.id);

    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleTrailClick(trail)}
        role="button"
        tabIndex={0}
        aria-label={`View trail: ${trail.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleTrailClick(trail);
          }
        }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{trail.title}</CardTitle>
              <p className="text-gray-600 text-sm line-clamp-2">{trail.description}</p>
            </div>
            {personalizedRec && (
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                <Star className="w-3 h-3 mr-1" />
                Recomendado
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Trail Metadata */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getDifficultyColor(trail.difficulty)}>
                {trail.difficulty}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {trail.estimatedDuration} min
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {trail.modules.length} módulos
              </Badge>
            </div>

            {/* Progress Bar */}
            {progress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progresso</span>
                  <span>{Math.round(progress.overallProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress.overallProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Recommendation Score */}
            {recommendation && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>Score: {Math.round(recommendation.score * 100)}%</span>
              </div>
            )}

            {/* Action Button */}
            <Button 
              className="w-full" 
              variant={progress ? "outline" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                handleTrailClick(trail);
              }}
            >
              {progress ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Continuar
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Iniciar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Carregando trilhas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trilhas de Aprendizado</h1>
          <p className="text-gray-600">Explore e inicie suas jornadas de aprendizado</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar trilhas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as dificuldades</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
                <SelectItem value="expert">Especialista</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularidade</SelectItem>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="duration">Duração</SelectItem>
                <SelectItem value="difficulty">Dificuldade</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todas ({filteredTrails.length})</TabsTrigger>
          <TabsTrigger value="recommended">Recomendadas ({personalizedRecommendations.length})</TabsTrigger>
          <TabsTrigger value="in-progress">Em Progresso (0)</TabsTrigger>
          <TabsTrigger value="completed">Completadas (0)</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredTrails.length > 0 ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredTrails.map(trail => (
                <TrailCard key={trail.id} trail={trail} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma trilha encontrada</h3>
                <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="mt-6">
          {personalizedRecommendations.length > 0 ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {personalizedRecommendations.map(rec => (
                <TrailCard key={rec.trail.id} trail={rec.trail} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma recomendação disponível</h3>
                <p className="text-gray-600">Complete algumas trilhas para receber recomendações personalizadas.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <Card>
            <CardContent className="text-center p-8">
              <Play className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma trilha em progresso</h3>
              <p className="text-gray-600">Inicie uma trilha para ver seu progresso aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardContent className="text-center p-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma trilha completada</h3>
              <p className="text-gray-600">Complete trilhas para ver seu histórico aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
