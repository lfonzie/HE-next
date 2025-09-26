'use client';

import React from 'react';
import { Experiment, ExperimentID } from '../types/experiment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Clock, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SidebarProps {
  experiments: Experiment[];
  activeExperimentId: ExperimentID;
  onSelectExperiment: (id: ExperimentID) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  experiments,
  activeExperimentId,
  onSelectExperiment
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('all');

  const categories = ['all', ...new Set(experiments.map(exp => exp.category))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredExperiments = experiments.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exp.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'chemistry': return 'bg-blue-100 text-blue-800';
      case 'physics': return 'bg-purple-100 text-purple-800';
      case 'optics': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Laboratório Virtual
        </h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar experimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Dificuldade
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'all' ? 'Todas' : difficulty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Experiments List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredExperiments.map((experiment) => {
            const isActive = experiment.id === activeExperimentId;
            const IconComponent = experiment.icon;
            
            return (
              <Card
                key={experiment.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectExperiment(experiment.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-sm ${
                        isActive ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {experiment.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {experiment.description}
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={`text-xs ${getCategoryColor(experiment.category)}`}>
                          {experiment.category}
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(experiment.difficulty)}`}>
                          {experiment.difficulty}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {experiment.duration}min
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {filteredExperiments.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Search className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">
              Nenhum experimento encontrado
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {filteredExperiments.length} experimento{filteredExperiments.length !== 1 ? 's' : ''} encontrado{filteredExperiments.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
