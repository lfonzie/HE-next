'use client';

import { useState, useEffect } from 'react';
import { Heart, Brain, Target, Zap, CheckCircle } from 'lucide-react';
import { aiPersonalizationEngine, LearningProfile, SentimentAnalysis } from '@/lib/ai-personalization-engine';

// Exemplo de implementação completa no chat existente
export default function EnhancedChatInterface() {
  // Estados existentes do chat
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Novos estados para funcionalidades avançadas
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis | null>(null);
  const [adaptiveExercises, setAdaptiveExercises] = useState<any[]>([]);
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showSentimentPanel, setShowSentimentPanel] = useState(false);
  const [showExercisesPanel, setShowExercisesPanel] = useState(false);

  // Inicializa perfil de aprendizado quando o chat carrega
  useEffect(() => {
    initializeLearningProfile('current-user');
  }, []);

  // Função para inicializar perfil de aprendizado
  const initializeLearningProfile = async (userId: string) => {
    setIsAnalyzingProfile(true);
    try {
      // Simula dados de interação (em produção viria do banco)
      const mockInteractions = [
        { type: 'question', content: 'Como resolver equações?', timestamp: new Date() },
        { type: 'answer', content: 'Entendi!', timestamp: new Date() },
        { type: 'feedback', content: 'Muito bom!', timestamp: new Date() }
      ];

      const mockPerformance = [
        { topic: 'Matemática', score: 0.8, timeSpent: 300, attempts: 2, timestamp: new Date().toISOString() },
        { topic: 'Português', score: 0.9, timeSpent: 200, attempts: 1, timestamp: new Date().toISOString() }
      ];

      const profile = await aiPersonalizationEngine.analyzeLearningProfile(
        userId,
        mockInteractions,
        mockPerformance
      );
      
      setLearningProfile(profile);
    } catch (error) {
      console.error('Erro ao inicializar perfil de aprendizado:', error);
    } finally {
      setIsAnalyzingProfile(false);
    }
  };

  // Função para analisar sentimento das mensagens
  const analyzeMessageSentiment = async (message: string, previousMessages: string[]) => {
    try {
      const sentiment = await aiPersonalizationEngine.analyzeSentiment(
        message,
        'chat_interaction',
        previousMessages.slice(-3) // Últimas 3 mensagens para contexto
      );
      
      setSentimentAnalysis(sentiment);
      return sentiment;
    } catch (error) {
      console.error('Erro na análise de sentimento:', error);
      return null;
    }
  };

  // Função para gerar exercícios adaptativos
  const generateAdaptiveExercises = async (topic: string) => {
    if (!learningProfile) return [];

    try {
      const exercises = await aiPersonalizationEngine.generateAdaptiveExercises(
        learningProfile,
        topic,
        aiPersonalizationEngine.calculateDifficultyAdjustment([0.7, 0.8, 0.9])
      );
      
      setAdaptiveExercises(exercises);
      return exercises;
    } catch (error) {
      console.error('Erro ao gerar exercícios:', error);
      return [];
    }
  };

  // Função para gerar resposta personalizada
  const generatePersonalizedResponse = async (userMessage: string, sentiment: SentimentAnalysis | null): Promise<string> => {
    if (!learningProfile) return 'Aguarde, estou analisando seu perfil de aprendizado...';

    const prompt = `
    Você é um tutor IA personalizado. Responda à mensagem do aluno considerando:
    
    Mensagem: "${userMessage}"
    Sentimento detectado: ${sentiment?.sentiment || 'neutro'} (confiança: ${sentiment?.confidence || 0})
    Emoções: ${sentiment?.emotions.join(', ') || 'não detectadas'}
    Nível de engajamento: ${sentiment?.engagementLevel || 5}/10
    
    Perfil do aluno:
    - Estilo de aprendizado: ${learningProfile.learningStyle}
    - Nível: ${learningProfile.difficultyLevel}
    - Interesses: ${learningProfile.interests.join(', ')}
    - Pontos fracos: ${learningProfile.weaknesses.join(', ')}
    
    Seja:
    1. Empático e encorajador
    2. Adaptado ao estilo de aprendizado
    3. Focado nos pontos fracos
    4. Motivador se o engajamento estiver baixo
    5. Desafiador se o engajamento estiver alto
    6. Alinhado com a BNCC
    
    Responda em português brasileiro, de forma clara e didática.
    `;

    try {
      const response = await fetch('/api/ai/tutor-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userId: 'current-user' })
      });
      
      const data = await response.json();
      return data.response || 'Desculpe, não consegui processar sua mensagem. Tente novamente.';
    } catch (error) {
      return 'Estou com dificuldades técnicas. Vamos tentar uma abordagem diferente?';
    }
  };

  // Função principal de envio de mensagem
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);

    // Verifica comandos especiais
    if (handleSpecialCommands(message)) {
      setIsLoading(false);
      return;
    }

    // Analisa sentimento da mensagem
    const sentiment = await analyzeMessageSentiment(message, messages.map(m => m.content));
    
    // Adiciona mensagem do usuário
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user' as const,
      timestamp: new Date(),
      sentiment: sentiment
    };

    setMessages(prev => [...prev, userMessage]);

    // Gera resposta personalizada baseada no perfil e sentimento
    const personalizedResponse = await generatePersonalizedResponse(message, sentiment);
    
    // Adiciona resposta do tutor
    const tutorMessage = {
      id: (Date.now() + 1).toString(),
      content: personalizedResponse,
      role: 'assistant' as const,
      timestamp: new Date(),
      sentiment: sentiment
    };

    setMessages(prev => [...prev, tutorMessage]);
    setInputMessage('');
    setIsLoading(false);
  };

  // Função para comandos especiais
  const handleSpecialCommands = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('exercício') || lowerMessage.includes('questão')) {
      const topic = extractTopicFromMessage(message);
      generateAdaptiveExercises(topic);
      setShowExercisesPanel(true);
      return true;
    }
    
    if (lowerMessage.includes('perfil') || lowerMessage.includes('análise')) {
      setShowProfilePanel(true);
      return true;
    }
    
    if (lowerMessage.includes('sentimento') || lowerMessage.includes('emoção')) {
      setShowSentimentPanel(true);
      return true;
    }
    
    if (lowerMessage.includes('ajuda')) {
      showHelpCommands();
      return true;
    }
    
    return false;
  };

  // Função para extrair tópico da mensagem
  const extractTopicFromMessage = (message: string): string => {
    const topics = ['matemática', 'português', 'história', 'geografia', 'ciências', 'física', 'química', 'biologia'];
    const lowerMessage = message.toLowerCase();
    
    for (const topic of topics) {
      if (lowerMessage.includes(topic)) {
        return topic;
      }
    }
    
    return 'Matemática'; // Tópico padrão
  };

  // Função para mostrar comandos de ajuda
  const showHelpCommands = () => {
    const helpMessage = {
      id: Date.now().toString(),
      content: `🤖 Comandos disponíveis:
      
• "exercício" ou "questão" - Gera exercícios adaptativos
• "perfil" ou "análise" - Mostra seu perfil de aprendizado
• "sentimento" ou "emoção" - Mostra análise de sentimento
• "ajuda" - Lista todos os comandos

Experimente qualquer um desses comandos!`,
      role: 'assistant' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, helpMessage]);
  };

  // Função para completar exercício
  const handleExerciseComplete = (score: number) => {
    if (currentExercise) {
      // Atualiza perfil baseado no desempenho
      if (learningProfile) {
        const newPerformance = {
          topic: currentExercise.topic,
          score,
          timeSpent: Date.now() - Date.now(), // Simplificado
          attempts: 1,
          timestamp: new Date().toISOString()
        };
        
        setLearningProfile(prev => ({
          ...prev!,
          performanceHistory: [...prev!.performanceHistory, newPerformance]
        }));
      }
      
      // Gera próximo exercício
      setTimeout(() => {
        const nextExercises = adaptiveExercises.slice(1);
        if (nextExercises.length > 0) {
          setCurrentExercise(nextExercises[0]);
        } else {
          setShowExercisesPanel(false);
        }
      }, 1000);
    }
  };

  // Componente de Perfil de Aprendizado
  const LearningProfilePanel = () => {
    if (!learningProfile) {
      return (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-blue-700">Analisando seu perfil...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Seu Perfil de Aprendizado
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Estilo:</span>
            <span className="ml-2 font-medium capitalize">{learningProfile.learningStyle}</span>
          </div>
          <div>
            <span className="text-gray-600">Nível:</span>
            <span className="ml-2 font-medium capitalize">{learningProfile.difficultyLevel}</span>
          </div>
          <div>
            <span className="text-gray-600">Ritmo:</span>
            <span className="ml-2 font-medium capitalize">{learningProfile.pace}</span>
          </div>
          <div>
            <span className="text-gray-600">Engajamento:</span>
            <span className="ml-2 font-medium">{learningProfile.engagementLevel}/10</span>
          </div>
        </div>
        
        <div className="mt-3">
          <span className="text-gray-600 text-sm">Interesses:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {learningProfile.interests.slice(0, 3).map((interest, index) => (
              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Componente de Análise de Sentimento
  const SentimentAnalysisPanel = ({ sentiment }: { sentiment: SentimentAnalysis | null }) => {
    if (!sentiment) return null;

    return (
      <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-gray-700">Análise de Sentimento</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${
            sentiment.sentiment === 'positive' ? 'text-green-500' :
            sentiment.sentiment === 'negative' ? 'text-red-500' :
            sentiment.sentiment === 'frustrated' ? 'text-orange-500' :
            sentiment.sentiment === 'excited' ? 'text-purple-500' :
            'text-gray-500'
          }`}>
            {sentiment.sentiment === 'positive' ? '😊' :
             sentiment.sentiment === 'negative' ? '😔' :
             sentiment.sentiment === 'frustrated' ? '😤' :
             sentiment.sentiment === 'excited' ? '🤩' :
             sentiment.sentiment === 'confused' ? '😕' :
             '😐'}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium capitalize">{sentiment.sentiment}</span>
              <span className="text-xs text-gray-500">({Math.round(sentiment.confidence * 100)}%)</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-red-400 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${sentiment.engagementLevel * 10}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{sentiment.engagementLevel}/10</span>
            </div>
          </div>
        </div>
        
        {sentiment.recommendations.length > 0 && (
          <div className="mt-2">
            <span className="text-xs text-gray-600">Recomendação:</span>
            <p className="text-xs text-gray-700 mt-1">{sentiment.recommendations[0]}</p>
          </div>
        )}
      </div>
    );
  };

  // Componente de Exercícios Adaptativos
  const AdaptiveExercisesPanel = () => {
    if (!showExercisesPanel || !currentExercise) {
      return (
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <button
            onClick={() => {
              generateAdaptiveExercises('Matemática');
              setShowExercisesPanel(true);
            }}
            className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Target className="w-4 h-4" />
            Gerar Exercícios Adaptativos
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Exercício Adaptativo
        </h4>
        
        <div className="mb-4">
          <h5 className="font-medium text-gray-700 mb-2">{currentExercise.question}</h5>
          <p className="text-sm text-gray-600">{currentExercise.explanation}</p>
        </div>
        
        {currentExercise.options && (
          <div className="space-y-2 mb-4">
            {currentExercise.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleExerciseComplete(Math.random() > 0.5 ? 0.8 : 0.6)}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Dificuldade: {currentExercise.difficulty}/10</span>
          <span>Tempo: {currentExercise.estimatedTime}min</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Painel Lateral com Funcionalidades Avançadas */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 space-y-4 overflow-y-auto">
        <LearningProfilePanel />
        <SentimentAnalysisPanel sentiment={sentimentAnalysis} />
        <AdaptiveExercisesPanel />
      </div>
      
      {/* Chat Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header do Chat */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Chat Inteligente com Tutor IA
          </h2>
          <p className="text-sm text-gray-600">
            Personalizado para seu estilo de aprendizado
          </p>
        </div>
        
        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
                {message.sentiment && (
                  <div className="mt-2 text-xs">
                    <span className="opacity-70">
                      {message.sentiment.sentiment} ({Math.round(message.sentiment.confidence * 100)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className="text-sm text-gray-600">Tutor IA está pensando...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input de Mensagem */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
              placeholder="Digite sua mensagem ou comando especial..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
          
          {/* Dicas de comandos */}
          <div className="mt-2 text-xs text-gray-500">
            💡 Dica: Digite "ajuda" para ver comandos especiais disponíveis
          </div>
        </div>
      </div>
    </div>
  );
}
