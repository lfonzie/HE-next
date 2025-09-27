'use client';

import React from 'react';
import { Experiment } from '../types/experiment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings, BookOpen } from 'lucide-react';

interface ExperimentViewProps {
  experiment: Experiment;
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({ experiment }) => {
  const [isRunning, setIsRunning] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const ExperimentComponent = experiment.component;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <experiment.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{experiment.name}</CardTitle>
                <CardDescription>{experiment.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{experiment.category}</Badge>
              <Badge variant="outline">{experiment.difficulty}</Badge>
              <Badge variant="outline">{experiment.duration}min</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleStart}
                disabled={isRunning && !isPaused}
                variant="default"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
              <Button
                onClick={handlePause}
                disabled={!isRunning}
                variant="outline"
                size="sm"
              >
                <Pause className="h-4 w-4 mr-2" />
                {isPaused ? 'Continuar' : 'Pausar'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSettings}
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Ajuda
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experiment Area */}
      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardContent className="h-full p-6">
            <div className="h-full flex flex-col">
              {/* Status */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-600">
                      {isRunning ? (isPaused ? 'Pausado' : 'Executando') : 'Parado'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Tempo: 00:00
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {experiment.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="mr-1 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experiment Component */}
              <div className="flex-1 min-h-0">
                <ExperimentComponent />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
