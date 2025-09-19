'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Heart,
  Zap,
  BarChart3,
  Settings,
  MessageSquare,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { aiPersonalizationEngine, LearningProfile, AdaptiveExercise, SentimentAnalysis } from '@/lib/ai-personalization-engine';

interface PersonalAITutorProps {
  userId: string;
  initialTopic?: string;
  onExerciseComplete?: (exercise: AdaptiveExercise, score: number) => void;
  onSentimentChange?: (sentiment: SentimentAnalysis) => void;
}

export default function PersonalAITutor({ 
  userId, 
  initialTopic = 'Matemática',
  onExerciseComplete,
  onSentimentChange 
}: PersonalAITutorProps) {
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [currentExercise, setCurrentExercise] = useState<AdaptiveExercise | null>(null);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    type: 'user' | 'tutor';
    content: string;
    timestamp: Date;
    sentiment?: SentimentAnalysis;
  }>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Inicializa o perfil de aprendizado
  useEffect(() => {
    initializeLearningProfile();
  }, [userId]);

  // Timer da sessão
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const initializeLearningProfile = async () => {
    setIsAnalyzing(true);
    try {
      // Simula dados de interação e performance (em produção viria do banco)
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
      
      // Gera primeiro exercício
      const exercises = await aiPersonalizationEngine.generateAdaptiveExercises(
        profile,
        initialTopic
      );
      
      if (exercises.length > 0) {
        setCurrentExercise(exercises[0]);
      }
    } catch (error) {
      console.error('Erro ao inicializar perfil de aprendizado:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMessageSend = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Analisa sentimento da mensagem
    const sentimentAnalysis = await aiPersonalizationEngine.analyzeSentiment(
      currentMessage,
      'chat_interaction',
      chatMessages.map(m => m.content)
    );

    setSentiment(sentimentAnalysis);
    onSentimentChange?.(sentimentAnalysis);

    // Resposta do tutor baseada no perfil e sentimento
    const tutorResponse = await generateTutorResponse(currentMessage, sentimentAnalysis);
    
    const tutorMessage = {
      id: (Date.now() + 1).toString(),
      type: 'tutor' as const,
      content: tutorResponse,
      timestamp: new Date(),
      sentiment: sentimentAnalysis
    };

    setChatMessages(prev => [...prev, tutorMessage]);
    setCurrentMessage('');
  };

  const generateTutorResponse = async (userMessage: string, sentiment: SentimentAnalysis): Promise<string> => {
    if (!learningProfile) return 'Aguarde, estou analisando seu perfil de aprendizado...';

    const prompt = `
    Você é um tutor IA personalizado. Responda à mensagem do aluno considerando:
    
    Mensagem: "${userMessage}"
    Sentimento detectado: ${sentiment.sentiment} (confiança: ${sentiment.confidence})
    Emoções: ${sentiment.emotions.join(', ')}
    Nível de engajamento: ${sentiment.engagementLevel}/10
    
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
        body: JSON.stringify({ prompt, userId })
      });
      
      const data = await response.json();
      return data.response || 'Desculpe, não consegui processar sua mensagem. Tente novamente.';
    } catch (error) {
      return 'Estou com dificuldades técnicas. Vamos tentar uma abordagem diferente?';
    }
  };

  const generateNewExercise = async () => {
    if (!learningProfile) return;

    setIsAnalyzing(true);
    try {
      const exercises = await aiPersonalizationEngine.generateAdaptiveExercises(
        learningProfile,
        initialTopic,
        aiPersonalizationEngine.calculateDifficultyAdjustment([0.7, 0.8, 0.9])
      );
      
      if (exercises.length > 0) {
        setCurrentExercise(exercises[0]);
        setSessionProgress(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao gerar exercício:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExerciseComplete = (score: number) => {
    if (currentExercise) {
      onExerciseComplete?.(currentExercise, score);
      
      // Atualiza perfil baseado no desempenho
      if (learningProfile) {
        const newPerformance = {
          topic: currentExercise.topic,
          score,
          timeSpent: sessionTime,
          attempts: 1,
          timestamp: new Date().toISOString()
        };
        
        setLearningProfile(prev => ({
          ...prev!,
          performanceHistory: [...prev!.performanceHistory, newPerformance]
        }));
      }
      
      // Gera próximo exercício
      setTimeout(() => generateNewExercise(), 1000);
    }
  };

  const toggleSession = () => {
    setIsSessionActive(!isSessionActive);
  };

  const resetSession = () => {
    setSessionTime(0);
    setSessionProgress(0);
    setIsSessionActive(false);
    setChatMessages([]);
  };

  if (isAnalyzing && !learningProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"
        />
        <span className="ml-4 text-lg">Analisando seu perfil de aprendizado...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header com informações do perfil */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Tutor IA Pessoal
            </h2>
            <p className="text-purple-100 mt-1">
              Personalizado para seu estilo de aprendizado: {learningProfile?.learningStyle}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{sessionProgress}</div>
              <div className="text-sm text-purple-100">Exercícios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</div>
              <div className="text-sm text-purple-100">Tempo</div>
            </div>
            <button
              onClick={toggleSession}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              {isSessionActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isSessionActive ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              onClick={resetSession}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Perfil de Aprendizado */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Seu Perfil de Aprendizado
          </h3>
          
          {learningProfile && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Estilo de Aprendizado</label>
                <div className="mt-1 p-2 bg-purple-50 rounded-lg">
                  <span className="capitalize font-medium">{learningProfile.learningStyle}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Nível Atual</label>
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <span className="capitalize font-medium">{learningProfile.difficultyLevel}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Ritmo</label>
                <div className="mt-1 p-2 bg-green-50 rounded-lg">
                  <span className="capitalize font-medium">{learningProfile.pace}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Engajamento</label>
                <div className="mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${learningProfile.engagementLevel * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{learningProfile.engagementLevel}/10</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Interesses</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {learningProfile.interests.slice(0, 3).map((interest, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Exercício Atual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Exercício Adaptativo
          </h3>
          
          {currentExercise ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">{currentExercise.question}</h4>
                <p className="text-sm text-gray-600">{currentExercise.explanation}</p>
              </div>
              
              {currentExercise.options && (
                <div className="space-y-2">
                  {currentExercise.options.map((option, index) => (
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
                <span>Tempo estimado: {currentExercise.estimatedTime}min</span>
              </div>
              
              <button
                onClick={generateNewExercise}
                disabled={isAnalyzing}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? 'Gerando...' : 'Próximo Exercício'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Carregando exercício personalizado...</p>
            </div>
          )}
        </motion.div>

        {/* Análise de Sentimento */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Análise de Sentimento
          </h3>
          
          {sentiment ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl mb-2 ${
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
                <div className="font-medium capitalize">{sentiment.sentiment}</div>
                <div className="text-sm text-gray-600">
                  Confiança: {Math.round(sentiment.confidence * 100)}%
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Emoções Detectadas</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {sentiment.emotions.map((emotion, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Engajamento</label>
                <div className="mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${sentiment.engagementLevel * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{sentiment.engagementLevel}/10</span>
                  </div>
                </div>
              </div>
              
              {sentiment.recommendations.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Recomendações</label>
                  <div className="mt-1 space-y-1">
                    {sentiment.recommendations.slice(0, 2).map((rec, index) => (
                      <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Inicie uma conversa para análise de sentimento</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Chat com Tutor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border"
      >
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            Conversa com seu Tutor IA
          </h3>
        </div>
        
        <div className="h-64 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleMessageSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleMessageSend}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
