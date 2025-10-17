'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  BarChart3,
  Target,
  Zap,
  Eye,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';

interface AIAnalysisProps {
  experimentData: any;
  experimentType: string;
  parameters: Record<string, any>;
  results: Record<string, any>;
}

interface AnalysisResult {
  id: string;
  type: 'insight' | 'warning' | 'suggestion' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
  action?: string;
}

interface PatternAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable' | 'oscillating';
  correlation: number;
  significance: number;
  explanation: string;
}

interface PredictionResult {
  nextValue: number;
  confidence: number;
  range: { min: number; max: number };
  factors: string[];
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({
  experimentData,
  experimentType,
  parameters,
  results
}) => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    if (experimentData && results) {
      performAIAnalysis();
    }
  }, [experimentData, results, experimentType]);

  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simular análise progressiva
      const steps = [
        'Analisando parâmetros...',
        'Processando resultados...',
        'Identificando padrões...',
        'Gerando insights...',
        'Calculando previsões...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setAnalysisProgress((i + 1) * 20);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Realizar análise baseada no tipo de experimento
      const results = await analyzeExperimentData();
      setAnalysisResults(results.insights);
      setPatternAnalysis(results.patterns);
      setPredictions(results.predictions);

    } catch (error) {
      console.error('Erro na análise de IA:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeExperimentData = async (): Promise<{
    insights: AnalysisResult[];
    patterns: PatternAnalysis;
    predictions: PredictionResult;
  }> => {
    const insights: AnalysisResult[] = [];
    let patterns: PatternAnalysis;
    let predictions: PredictionResult;

    switch (experimentType) {
      case 'electromagnetism':
        insights.push(...analyzeElectromagnetismData());
        patterns = analyzeElectromagnetismPatterns();
        predictions = predictElectromagnetismResults();
        break;
      case 'thermodynamics':
        insights.push(...analyzeThermodynamicsData());
        patterns = analyzeThermodynamicsPatterns();
        predictions = predictThermodynamicsResults();
        break;
      case 'optics':
        insights.push(...analyzeOpticsData());
        patterns = analyzeOpticsPatterns();
        predictions = predictOpticsResults();
        break;
      case 'organic-chemistry':
        insights.push(...analyzeChemistryData());
        patterns = analyzeChemistryPatterns();
        predictions = predictChemistryResults();
        break;
      default:
        insights.push(...analyzeGenericData());
        patterns = analyzeGenericPatterns();
        predictions = predictGenericResults();
    }

    return { insights, patterns, predictions };
  };

  const analyzeElectromagnetismData = (): AnalysisResult[] => {
    const insights: AnalysisResult[] = [];
    const { totalResistance, totalCurrent, totalVoltage, power } = results;

    // Análise de eficiência energética
    if (power > 100) {
      insights.push({
        id: 'high-power',
        type: 'warning',
        title: 'Alto Consumo de Energia',
        description: `O circuito está consumindo ${power.toFixed(2)}W, o que pode indicar ineficiência energética.`,
        confidence: 0.9,
        impact: 'high',
        category: 'Eficiência',
        actionable: true,
        action: 'Considere usar componentes com menor resistência ou reduzir a voltagem.'
      });
    }

    // Análise de corrente
    if (totalCurrent > 1) {
      insights.push({
        id: 'high-current',
        type: 'warning',
        title: 'Corrente Elevada',
        description: `A corrente de ${totalCurrent.toFixed(3)}A pode danificar componentes sensíveis.`,
        confidence: 0.8,
        impact: 'medium',
        category: 'Segurança',
        actionable: true,
        action: 'Adicione resistores limitadores de corrente.'
      });
    }

    // Análise de resistência
    if (totalResistance < 10) {
      insights.push({
        id: 'low-resistance',
        type: 'insight',
        title: 'Circuito de Baixa Resistência',
        description: `Resistência total de ${totalResistance.toFixed(2)}Ω permite alta corrente.`,
        confidence: 0.95,
        impact: 'medium',
        category: 'Características',
        actionable: false
      });
    }

    // Sugestão de otimização
    insights.push({
      id: 'optimization',
      type: 'suggestion',
      title: 'Otimização Sugerida',
      description: 'Para melhorar a eficiência, considere usar circuitos paralelos para reduzir a resistência total.',
      confidence: 0.7,
      impact: 'medium',
      category: 'Otimização',
      actionable: true,
      action: 'Experimente com configuração paralela.'
    });

    return insights;
  };

  const analyzeThermodynamicsData = (): AnalysisResult[] => {
    const insights: AnalysisResult[] = [];
    const { temperature, pressure } = parameters;

    // Análise de temperatura
    if (temperature > 100) {
      insights.push({
        id: 'high-temp',
        type: 'warning',
        title: 'Temperatura Elevada',
        description: `Temperatura de ${temperature}°C pode causar mudanças de fase inesperadas.`,
        confidence: 0.85,
        impact: 'high',
        category: 'Segurança',
        actionable: true,
        action: 'Monitore cuidadosamente as mudanças de fase.'
      });
    }

    // Análise de pressão
    if (pressure > 5) {
      insights.push({
        id: 'high-pressure',
        type: 'warning',
        title: 'Pressão Elevada',
        description: `Pressão de ${pressure} atm pode afetar significativamente as propriedades do sistema.`,
        confidence: 0.8,
        impact: 'medium',
        category: 'Condições',
        actionable: true,
        action: 'Verifique se o equipamento suporta esta pressão.'
      });
    }

    // Insight sobre eficiência
    insights.push({
      id: 'efficiency',
      type: 'insight',
      title: 'Eficiência Termodinâmica',
      description: 'O sistema está operando dentro dos parâmetros ideais para máxima eficiência.',
      confidence: 0.9,
      impact: 'low',
      category: 'Performance',
      actionable: false
    });

    return insights;
  };

  const analyzeOpticsData = (): AnalysisResult[] => {
    const insights: AnalysisResult[] = [];
    const { wavelength, intensity } = parameters;

    // Análise de comprimento de onda
    if (wavelength < 400 || wavelength > 700) {
      insights.push({
        id: 'non-visible',
        type: 'insight',
        title: 'Luz Não Visível',
        description: `Comprimento de onda de ${wavelength}nm está fora do espectro visível.`,
        confidence: 1.0,
        impact: 'low',
        category: 'Características',
        actionable: false
      });
    }

    // Análise de intensidade
    if (intensity < 50) {
      insights.push({
        id: 'low-intensity',
        type: 'warning',
        title: 'Baixa Intensidade',
        description: `Intensidade de ${intensity}% pode resultar em efeitos ópticos fracos.`,
        confidence: 0.8,
        impact: 'medium',
        category: 'Qualidade',
        actionable: true,
        action: 'Aumente a intensidade para melhor observação.'
      });
    }

    // Sugestão de experimento
    insights.push({
      id: 'experiment-suggestion',
      type: 'suggestion',
      title: 'Experimento Sugerido',
      description: 'Experimente com diferentes comprimentos de onda para observar a dispersão da luz.',
      confidence: 0.7,
      impact: 'low',
      category: 'Exploração',
      actionable: true,
      action: 'Varie o comprimento de onda gradualmente.'
    });

    return insights;
  };

  const analyzeChemistryData = (): AnalysisResult[] => {
    const insights: AnalysisResult[] = [];
    const { temperature, pressure } = parameters;

    // Análise de condições de reação
    if (temperature < 0) {
      insights.push({
        id: 'low-temp',
        type: 'warning',
        title: 'Temperatura Muito Baixa',
        description: `Temperatura de ${temperature}°C pode inibir a reação química.`,
        confidence: 0.9,
        impact: 'high',
        category: 'Condições',
        actionable: true,
        action: 'Aumente a temperatura para ativar a reação.'
      });
    }

    // Análise de rendimento
    if (results.yield && results.yield < 50) {
      insights.push({
        id: 'low-yield',
        type: 'warning',
        title: 'Rendimento Baixo',
        description: `Rendimento de ${results.yield}% está abaixo do esperado.`,
        confidence: 0.8,
        impact: 'medium',
        category: 'Eficiência',
        actionable: true,
        action: 'Otimize as condições de reação.'
      });
    }

    // Insight sobre mecanismo
    insights.push({
      id: 'mechanism',
      type: 'insight',
      title: 'Mecanismo de Reação',
      description: 'A reação está seguindo o mecanismo esperado com boa seletividade.',
      confidence: 0.85,
      impact: 'low',
      category: 'Mecanismo',
      actionable: false
    });

    return insights;
  };

  const analyzeGenericData = (): AnalysisResult[] => {
    return [
      {
        id: 'generic-insight',
        type: 'insight',
        title: 'Análise Geral',
        description: 'O experimento está progredindo dentro dos parâmetros esperados.',
        confidence: 0.7,
        impact: 'low',
        category: 'Geral',
        actionable: false
      }
    ];
  };

  const analyzeElectromagnetismPatterns = (): PatternAnalysis => {
    return {
      trend: 'stable',
      correlation: 0.85,
      significance: 0.9,
      explanation: 'A corrente e voltagem mostram correlação linear forte, indicando comportamento ôhmico.'
    };
  };

  const analyzeThermodynamicsPatterns = (): PatternAnalysis => {
    return {
      trend: 'increasing',
      correlation: 0.75,
      significance: 0.8,
      explanation: 'A temperatura mostra tendência crescente com aumento da pressão, seguindo a lei dos gases.'
    };
  };

  const analyzeOpticsPatterns = (): PatternAnalysis => {
    return {
      trend: 'oscillating',
      correlation: 0.6,
      significance: 0.7,
      explanation: 'O padrão de interferência mostra oscilações características da natureza ondulatória da luz.'
    };
  };

  const analyzeChemistryPatterns = (): PatternAnalysis => {
    return {
      trend: 'increasing',
      correlation: 0.9,
      significance: 0.95,
      explanation: 'O rendimento aumenta exponencialmente com a temperatura, indicando cinética de primeira ordem.'
    };
  };

  const analyzeGenericPatterns = (): PatternAnalysis => {
    return {
      trend: 'stable',
      correlation: 0.5,
      significance: 0.6,
      explanation: 'Padrão geral observado nos dados experimentais.'
    };
  };

  const predictElectromagnetismResults = (): PredictionResult => {
    const currentPower = results.power || 0;
    return {
      nextValue: currentPower * 1.1,
      confidence: 0.8,
      range: { min: currentPower * 0.9, max: currentPower * 1.2 },
      factors: ['Resistência', 'Voltagem', 'Temperatura']
    };
  };

  const predictThermodynamicsResults = (): PredictionResult => {
    const currentTemp = parameters.temperature || 25;
    return {
      nextValue: currentTemp + 10,
      confidence: 0.75,
      range: { min: currentTemp + 5, max: currentTemp + 15 },
      factors: ['Pressão', 'Calor', 'Volume']
    };
  };

  const predictOpticsResults = (): PredictionResult => {
    const currentWavelength = parameters.wavelength || 500;
    return {
      nextValue: currentWavelength + 50,
      confidence: 0.7,
      range: { min: currentWavelength + 25, max: currentWavelength + 75 },
      factors: ['Meio', 'Ângulo', 'Frequência']
    };
  };

  const predictChemistryResults = (): PredictionResult => {
    const currentYield = results.yield || 50;
    return {
      nextValue: Math.min(currentYield * 1.2, 100),
      confidence: 0.85,
      range: { min: currentYield * 1.1, max: Math.min(currentYield * 1.3, 100) },
      factors: ['Temperatura', 'Catalisador', 'Tempo']
    };
  };

  const predictGenericResults = (): PredictionResult => {
    return {
      nextValue: 50,
      confidence: 0.5,
      range: { min: 40, max: 60 },
      factors: ['Parâmetros Gerais']
    };
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'insight': return <Lightbulb className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'suggestion': return <Target className="w-4 h-4" />;
      case 'prediction': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insight': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-red-600 bg-red-50';
      case 'suggestion': return 'text-green-600 bg-green-50';
      case 'prediction': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Análise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Análise Inteligente de IA</span>
          </CardTitle>
          <CardDescription>
            Insights automáticos e previsões baseadas nos dados do experimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-600">Analisando dados...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button
                onClick={performAIAnalysis}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Brain className="w-4 h-4 mr-2" />
                Reanalisar
              </Button>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Análise Completa
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados da Análise */}
      {analysisResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Insights e Recomendações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.type === 'warning' ? 'border-red-500 bg-red-50' :
                    result.type === 'insight' ? 'border-blue-500 bg-blue-50' :
                    result.type === 'suggestion' ? 'border-green-500 bg-green-50' :
                    'border-purple-500 bg-purple-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(result.type)}
                      <h4 className="font-medium text-gray-900">{result.title}</h4>
                      <Badge className={getTypeColor(result.type)}>
                        {result.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getImpactColor(result.impact)}>
                        {result.impact}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-700">{result.description}</p>
                  
                  {result.actionable && result.action && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Ação Recomendada:</span>
                      </div>
                      <p className="mt-1 text-sm text-green-700">{result.action}</p>
                    </div>
                  )}
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Categoria: {result.category}</span>
                    <span>Confiança: {Math.round(result.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise de Padrões */}
      {patternAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Análise de Padrões</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tendência</h4>
                <Badge className={
                  patternAnalysis.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                  patternAnalysis.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                  patternAnalysis.trend === 'oscillating' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {patternAnalysis.trend}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Correlação</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.abs(patternAnalysis.correlation) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(patternAnalysis.correlation * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Explicação</h4>
              <p className="text-sm text-gray-700">{patternAnalysis.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previsões */}
      {predictions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <span>Previsões Inteligentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Próximo Valor</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {predictions.nextValue.toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Confiança</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${predictions.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round(predictions.confidence * 100)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Intervalo</h4>
                  <div className="text-sm text-gray-600">
                    {predictions.range.min.toFixed(2)} - {predictions.range.max.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Fatores Influenciadores</h4>
                <div className="flex flex-wrap gap-2">
                  {predictions.factors.map((factor, index) => (
                    <Badge key={index} variant="outline" className="text-purple-600 border-purple-600">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIAnalysis;
