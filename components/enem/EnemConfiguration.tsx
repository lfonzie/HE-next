'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Info, Clock, BookOpen, Target, Zap } from 'lucide-react';
import { useEnemConfigStore } from '@/lib/stores/enem-config-store';
import { useEnemUIStore } from '@/lib/stores/enem-ui-store';

export function EnemConfiguration() {
  const {
    config,
    areas,
    modes,
    showAdvancedFilters,
    setConfig,
    toggleAdvancedFilters,
    validateConfig,
    loadPreset
  } = useEnemConfigStore();

  const { showInfoToast } = useEnemUIStore();
  const [selectedArea, setSelectedArea] = useState(config.area);

  const validation = validateConfig();

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area as "matematica" | "linguagens" | "ciencias_natureza" | "ciencias_humanas");
    setConfig({ area: area as any });
  };

  const handleModeSelect = (mode: string) => {
    setConfig({ mode: mode as any });
  };

  const handlePresetSelect = (preset: 'quick' | 'standard' | 'comprehensive') => {
    loadPreset(preset);
    showInfoToast('Preset Carregado', `Configuração ${preset} aplicada com sucesso!`);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'matematica': return <Target className="w-5 h-5" />;
      case 'linguagens': return <BookOpen className="w-5 h-5" />;
      case 'ciencias_natureza': return <Zap className="w-5 h-5" />;
      case 'ciencias_humanas': return <Info className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Configuração do Simulador ENEM</h1>
        <p className="text-muted-foreground">
          Configure seu simulado personalizado com questões reais e geradas por IA
        </p>
      </div>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configurações Rápidas
          </CardTitle>
          <CardDescription>
            Escolha uma configuração pré-definida ou personalize sua própria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => handlePresetSelect('quick')}
            >
              <div className="font-semibold">Rápido</div>
              <div className="text-sm text-muted-foreground">
                10 questões • 30 min • Ano 2023
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => handlePresetSelect('standard')}
            >
              <div className="font-semibold">Padrão</div>
              <div className="text-sm text-muted-foreground">
                20 questões • 1h • Anos 2023-2022
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => handlePresetSelect('comprehensive')}
            >
              <div className="font-semibold">Completo</div>
              <div className="text-sm text-muted-foreground">
                45 questões • 2h • Anos 2023-2020
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Area Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Área do Conhecimento</CardTitle>
          <CardDescription>
            Selecione a área que você deseja praticar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(areas).map(([key, area]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedArea === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleAreaSelect(key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getAreaIcon(key)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{area.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {area.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {area.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {area.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{area.skills.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Questões</CardTitle>
          <CardDescription>
            Escolha como as questões serão selecionadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(modes).map(([key, mode]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  config.mode === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleModeSelect(key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{mode.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mode.description}
                      </p>
                      <div className="mt-3 space-y-2">
                        <div>
                          <h4 className="text-sm font-medium text-green-600">Vantagens:</h4>
                          <ul className="text-sm text-muted-foreground">
                            {mode.pros.map((pro, index) => (
                              <li key={index}>• {pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-red-600">Limitações:</h4>
                          <ul className="text-sm text-muted-foreground">
                            {mode.cons.map((con, index) => (
                              <li key={index}>• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Básicas</CardTitle>
          <CardDescription>
            Defina a duração e quantidade de questões
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="questions-slider">
              Número de Questões: {config.total_questions}
            </Label>
            <Slider
              id="questions-slider"
              min={5}
              max={50}
              step={5}
              value={[config.total_questions]}
              onValueChange={([value]) => setConfig({ total_questions: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 questões</span>
              <span>50 questões</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration-slider">
              Duração: {formatDuration(config.duration_sec)}
            </Label>
            <Slider
              id="duration-slider"
              min={300}
              max={14400}
              step={300}
              value={[config.duration_sec]}
              onValueChange={([value]) => setConfig({ duration_sec: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>4 horas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Collapsible open={showAdvancedFilters} onOpenChange={toggleAdvancedFilters}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between">
                Filtros Avançados
                {showAdvancedFilters ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </CardTitle>
              <CardDescription>
                Personalize ainda mais seu simulado
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Years Selection */}
              <div className="space-y-3">
                <Label>Anos das Provas</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].map((year) => (
                    <div key={year} className="flex items-center space-x-2">
                      <Checkbox
                        id={`year-${year}`}
                        checked={config.years.includes(year)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setConfig({ years: [...config.years, year] });
                          } else {
                            setConfig({ years: config.years.filter(y => y !== year) });
                          }
                        }}
                      />
                      <Label htmlFor={`year-${year}`} className="text-sm">
                        {year}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Difficulty Selection */}
              <div className="space-y-3">
                <Label>Níveis de Dificuldade</Label>
                <div className="space-y-2">
                  {[
                    { key: 'EASY', label: 'Fácil', color: 'bg-green-100 text-green-800' },
                    { key: 'MEDIUM', label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
                    { key: 'HARD', label: 'Difícil', color: 'bg-red-100 text-red-800' }
                  ].map(({ key, label, color }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`difficulty-${key}`}
                        checked={config.difficulty.includes(key as any)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setConfig({ difficulty: [...config.difficulty, key as any] });
                          } else {
                            setConfig({ difficulty: config.difficulty.filter(d => d !== key) });
                          }
                        }}
                      />
                      <Label htmlFor={`difficulty-${key}`} className="text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Fallback Threshold */}
              <div className="space-y-2">
                <Label htmlFor="fallback-slider">
                  Threshold de Fallback: {Math.round(config.fallback_threshold * 100)}%
                </Label>
                <Slider
                  id="fallback-slider"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[config.fallback_threshold]}
                  onValueChange={([value]) => setConfig({ fallback_threshold: value })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Percentual mínimo de questões do banco de dados antes de usar IA
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Validation Summary */}
      {!validation.isValid && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-red-800 mb-2">Configuração Inválida</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Área:</strong> {areas[config.area]?.name}
            </div>
            <div>
              <strong>Modo:</strong> {modes[config.mode]?.name}
            </div>
            <div>
              <strong>Questões:</strong> {config.total_questions}
            </div>
            <div>
              <strong>Duração:</strong> {formatDuration(config.duration_sec)}
            </div>
            <div>
              <strong>Anos:</strong> {config.years.join(', ')}
            </div>
            <div>
              <strong>Dificuldade:</strong> {config.difficulty.join(', ')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
