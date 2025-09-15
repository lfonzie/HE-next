"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Target,
  BookOpen,
  Users,
  Zap,
  Calculator,
  Settings,
  Brain
} from 'lucide-react';
import { EnemArea, EnemMode } from '@/types/enem';
import { useToast } from '@/hooks/use-toast';

interface EnemCustomizerProps {
  onBack: () => void;
  onStart: (config: CustomExamConfig) => void;
}

interface CustomExamConfig {
  mode: EnemMode;
  areas: EnemArea[];
  numQuestions: number;
  timeLimit?: number;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  year?: number;
}

export function EnemCustomizer({ onBack, onStart }: EnemCustomizerProps) {
  const [selectedAreas, setSelectedAreas] = useState<EnemArea[]>(['CN', 'CH', 'LC', 'MT']);
  const [numQuestions, setNumQuestions] = useState(5);
  
  // Auto-balancear distribuição quando número de questões muda
  const handleNumQuestionsChange = (value: number) => {
    setNumQuestions(value);
    
    // Recalcular distribuição proporcionalmente
    const currentTotal = difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard;
    if (currentTotal > 0) {
      const ratio = value / currentTotal;
      const newEasy = Math.round(difficultyDistribution.easy * ratio);
      const newMedium = Math.round(difficultyDistribution.medium * ratio);
      const newHard = Math.round(difficultyDistribution.hard * ratio);
      
      // Garantir que pelo menos uma questão seja atribuída a cada nível se possível
      const total = newEasy + newMedium + newHard;
      if (total < value && value >= 3) {
        // Distribuir as questões restantes
        const remaining = value - total;
        if (remaining > 0) {
          setDifficultyDistribution({
            easy: newEasy + Math.ceil(remaining / 3),
            medium: newMedium + Math.ceil(remaining / 3),
            hard: newHard + Math.floor(remaining / 3)
          });
        } else {
          setDifficultyDistribution({ easy: newEasy, medium: newMedium, hard: newHard });
        }
      } else {
        setDifficultyDistribution({ easy: newEasy, medium: newMedium, hard: newHard });
      }
    } else {
      // Distribuição padrão baseada no número de questões
      if (value <= 3) {
        // Para poucas questões, distribuir de forma simples
        setDifficultyDistribution({
          easy: Math.max(1, Math.floor(value / 2)),
          medium: Math.max(1, Math.floor(value / 2)),
          hard: Math.max(0, value - Math.floor(value / 2) * 2)
        });
      } else {
        // Para mais questões, usar distribuição proporcional
        setDifficultyDistribution({
          easy: Math.round(value * 0.3),
          medium: Math.round(value * 0.5),
          hard: Math.round(value * 0.2)
        });
      }
    }
  };
  const [timeLimit, setTimeLimit] = useState<number | undefined>(60);
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: 2,
    medium: 2,
    hard: 1
  });
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const { toast } = useToast();

  const areas = [
    {
      id: 'CN' as EnemArea,
      name: 'Ciências da Natureza',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-purple-500',
      description: 'Física, Química, Biologia'
    },
    {
      id: 'CH' as EnemArea,
      name: 'Ciências Humanas',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-green-500',
      description: 'História, Geografia, Filosofia'
    },
    {
      id: 'LC' as EnemArea,
      name: 'Linguagens e Códigos',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'bg-blue-500',
      description: 'Português, Literatura, Inglês/Espanhol'
    },
    {
      id: 'MT' as EnemArea,
      name: 'Matemática',
      icon: <Calculator className="h-5 w-5" />,
      color: 'bg-orange-500',
      description: 'Álgebra, Geometria, Estatística'
    }
  ];

  const handleAreaToggle = (area: EnemArea) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleDifficultyChange = (type: 'easy' | 'medium' | 'hard', value: number) => {
    const currentTotal = difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard;
    const newTotal = currentTotal - difficultyDistribution[type] + value;
    
    // Garantir que não exceda o número total de questões
    if (newTotal <= numQuestions && value >= 0) {
      setDifficultyDistribution(prev => ({
        ...prev,
        [type]: value
      }));
    } else if (value > numQuestions) {
      // Se o valor exceder o total, ajustar para o máximo possível
      const maxValue = numQuestions - (currentTotal - difficultyDistribution[type]);
      if (maxValue > 0) {
        setDifficultyDistribution(prev => ({
          ...prev,
          [type]: maxValue
        }));
      }
    }
  };

  const handleStartExam = () => {
    // Validações mais robustas
    if (selectedAreas.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma área",
        variant: "destructive"
      });
      return;
    }

    if (numQuestions < 5 || numQuestions > 180) {
      toast({
        title: "Erro", 
        description: "Número de questões deve estar entre 5 e 180",
        variant: "destructive"
      });
      return;
    }

    const totalDifficulty = difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard;
    if (totalDifficulty !== numQuestions) {
      toast({
        title: "Erro",
        description: "A distribuição de dificuldade deve somar o número total de questões",
        variant: "destructive"
      });
      return;
    }

    if (timeLimit && (timeLimit < 15 || timeLimit > 300)) {
      toast({
        title: "Erro",
        description: "Tempo limite deve estar entre 15 e 300 minutos",
        variant: "destructive"
      });
      return;
    }

    const config: CustomExamConfig = {
      mode: 'CUSTOM',
      areas: selectedAreas,
      numQuestions,
      timeLimit,
      difficultyDistribution,
      year: selectedYear
    };

    onStart(config);
  };

  const estimatedDuration = timeLimit || Math.ceil(numQuestions * 3.3);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Personalizar Simulado</h2>
          <p className="text-gray-600">Configure seu simulado personalizado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Areas Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Áreas do Conhecimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {areas.map((area) => (
              <div key={area.id} className="flex items-center space-x-3">
                <Checkbox
                  id={area.id}
                  checked={selectedAreas.includes(area.id)}
                  onCheckedChange={() => handleAreaToggle(area.id)}
                />
                <Label htmlFor={area.id} className="flex items-center gap-3 cursor-pointer">
                  <div className={`p-2 rounded-lg ${area.color} text-white`}>
                    {area.icon}
                  </div>
                  <div>
                    <div className="font-medium">{area.name}</div>
                    <div className="text-sm text-gray-600">{area.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Exam Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Number of Questions */}
            <div>
              <Label className="text-base font-medium">
                Número de Questões: {numQuestions}
              </Label>
              <Slider
                value={[numQuestions]}
                onValueChange={(value) => handleNumQuestionsChange(value[0])}
                max={180}
                min={5}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>5</span>
                <span>180</span>
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <Label className="text-base font-medium">
                Tempo Limite (minutos): {timeLimit || 'Sem limite'}
              </Label>
              <Slider
                value={[timeLimit || 0]}
                onValueChange={(value) => setTimeLimit(value[0] === 0 ? undefined : value[0])}
                max={300}
                min={0}
                step={15}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Sem limite</span>
                <span>300 min</span>
              </div>
            </div>

            {/* Year Selection */}
            <div>
              <Label className="text-base font-medium">Ano da Prova (Opcional)</Label>
              <Select value={selectedYear?.toString() || "all"} onValueChange={(value) => setSelectedYear(value === "all" ? undefined : parseInt(value))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione um ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {Array.from({ length: 16 }, (_, i) => 2024 - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Distribuição de Dificuldade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-base font-medium">
                Fácil: {difficultyDistribution.easy} questões
              </Label>
              <Slider
                value={[difficultyDistribution.easy]}
                onValueChange={(value) => handleDifficultyChange('easy', value[0])}
                max={numQuestions}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-base font-medium">
                Médio: {difficultyDistribution.medium} questões
              </Label>
              <Slider
                value={[difficultyDistribution.medium]}
                onValueChange={(value) => handleDifficultyChange('medium', value[0])}
                max={numQuestions}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-base font-medium">
                Difícil: {difficultyDistribution.hard} questões
              </Label>
              <Slider
                value={[difficultyDistribution.hard]}
                onValueChange={(value) => handleDifficultyChange('hard', value[0])}
                max={numQuestions}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary and Start Button */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2">Resumo do Simulado</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Áreas:</strong> {selectedAreas.map(area => areas.find(a => a.id === area)?.name).join(', ')}</p>
                <p><strong>Questões:</strong> {numQuestions}</p>
                <p><strong>Tempo estimado:</strong> {estimatedDuration} minutos</p>
                <p><strong>Dificuldade:</strong> {difficultyDistribution.easy}F, {difficultyDistribution.medium}M, {difficultyDistribution.hard}D</p>
              </div>
            </div>
            <Button 
              onClick={handleStartExam}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar Simulado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
