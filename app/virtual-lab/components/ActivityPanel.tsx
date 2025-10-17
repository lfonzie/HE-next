// components/ActivityPanel.tsx - Sistema de atividades e problemas
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  Lightbulb,
  Calculator,
  Beaker,
  Zap,
  Award,
  BarChart3,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface ActivityObjective {
  id: string;
  description: string;
  type: 'measurement' | 'calculation' | 'observation' | 'comparison';
  target: {
    parameter: string;
    value: number;
    tolerance: number;
    unit: string;
  };
  points: number;
  completed: boolean;
  actualValue?: number;
  accuracy?: number;
}

interface Activity {
  id: string;
  title: string;
  discipline: 'chemistry' | 'physics';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  description: string;
  objectives: ActivityObjective[];
  hints: string[];
  expectedOutcomes: Record<string, any>;
  timeLimit?: number; // minutes
  prerequisites: string[];
  bnccSkills: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  score?: number;
  attempts: number;
  maxAttempts: number;
}

interface ActivityPanelProps {
  activities: Activity[];
  currentActivity?: Activity;
  onStartActivity: (activity: Activity) => void;
  onCompleteObjective: (activityId: string, objectiveId: string, value: number) => void;
  onSubmitActivity: (activity: Activity) => void;
  onResetActivity: (activity: Activity) => void;
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({
  activities,
  currentActivity,
  onStartActivity,
  onCompleteObjective,
  onSubmitActivity,
  onResetActivity
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<boolean>(true);

  const categories = ['all', 'stoichiometry', 'acid-base', 'kinetics', 'thermodynamics', 'circuits', 'mechanics', 'optics'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredActivities = activities.filter(activity => {
    const categoryMatch = selectedCategory === 'all' || activity.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || activity.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateProgress = (activity: Activity) => {
    const completedObjectives = activity.objectives.filter(obj => obj.completed).length;
    return (completedObjectives / activity.objectives.length) * 100;
  };

  const calculateScore = (activity: Activity) => {
    const totalPoints = activity.objectives.reduce((sum, obj) => sum + obj.points, 0);
    const earnedPoints = activity.objectives
      .filter(obj => obj.completed)
      .reduce((sum, obj) => sum + obj.points, 0);
    
    return totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  };

  const getTimeRemaining = (activity: Activity) => {
    if (!activity.timeLimit || !activity.startTime) return null;
    
    const elapsed = (Date.now() - activity.startTime) / 1000 / 60; // minutes
    const remaining = activity.timeLimit - elapsed;
    
    return remaining > 0 ? Math.ceil(remaining) : 0;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Atividades</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHints(!showHints)}
            className={`p-2 rounded-lg transition-colors ${
              showHints ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Lightbulb className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setShowProgress(!showProgress)}
            className={`p-2 rounded-lg transition-colors ${
              showProgress ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Todas' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty === 'all' ? 'Todas' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Atividade atual */}
      {currentActivity && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-blue-800">{currentActivity.title}</h4>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentActivity.difficulty)}`}>
                {currentActivity.difficulty}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentActivity.status)}`}>
                {currentActivity.status}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-blue-700 mb-3">{currentActivity.description}</p>
          
          {/* Progresso */}
          {showProgress && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-blue-700">Progresso</span>
                <span className="text-sm text-blue-600">{Math.round(calculateProgress(currentActivity))}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress(currentActivity)}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Tempo restante */}
          {currentActivity.timeLimit && (
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                Tempo restante: {getTimeRemaining(currentActivity)} minutos
              </span>
            </div>
          )}
          
          {/* Objetivos */}
          <div className="space-y-2 mb-4">
            {currentActivity.objectives.map(objective => (
              <div key={objective.id} className="flex items-center space-x-3">
                {objective.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-blue-700">{objective.description}</p>
                  {objective.completed && objective.actualValue !== undefined && (
                    <p className="text-xs text-green-600">
                      Valor obtido: {objective.actualValue} {objective.target.unit}
                      {objective.accuracy && ` (Precisão: ${objective.accuracy.toFixed(1)}%)`}
                    </p>
                  )}
                </div>
                <span className="text-xs text-blue-600 font-medium">{objective.points} pts</span>
              </div>
            ))}
          </div>
          
          {/* Dicas */}
          {showHints && currentActivity.hints.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-blue-700 mb-2">Dicas:</h5>
              <ul className="space-y-1">
                {currentActivity.hints.map((hint, index) => (
                  <li key={index} className="text-sm text-blue-600 flex items-start space-x-2">
                    <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500" />
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Ações */}
          <div className="flex space-x-2">
            {currentActivity.status === 'not_started' && (
              <button
                onClick={() => onStartActivity(currentActivity)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>Iniciar</span>
              </button>
            )}
            
            {currentActivity.status === 'in_progress' && (
              <button
                onClick={() => onSubmitActivity(currentActivity)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Submeter</span>
              </button>
            )}
            
            <button
              onClick={() => onResetActivity(currentActivity)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Resetar</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista de atividades */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {filteredActivities.map(activity => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                currentActivity?.id === activity.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onClick={() => onStartActivity(activity)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-800">{activity.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                    {activity.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>{activity.objectives.length} objetivos</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>{activity.objectives.reduce((sum, obj) => sum + obj.points, 0)} pontos</span>
                  </span>
                  {activity.timeLimit && (
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{activity.timeLimit} min</span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {activity.attempts}/{activity.maxAttempts} tentativas
                  </span>
                  {activity.score !== undefined && (
                    <span className="text-xs font-medium text-blue-600">
                      {activity.score.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              
              {/* Progresso */}
              {showProgress && activity.status === 'in_progress' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(activity)}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {filteredActivities.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nenhuma atividade encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};
