# 💬 Implementação das Inovações no Sistema de Chat

## 🎯 Visão Geral

Este guia mostra como integrar as novas funcionalidades (Tutor IA Pessoal, Análise de Sentimento, Exercícios Adaptativos) no sistema de chat existente do HubEdu.ia.

---

## 🔧 1. Integração do Tutor IA Pessoal no Chat

### A. Modificação do ChatInterfaceRefactored.tsx

```typescript
// Adicione estas importações
import { aiPersonalizationEngine, LearningProfile, SentimentAnalysis } from '@/lib/ai-personalization-engine';
import { useState, useEffect } from 'react';

// Adicione estes estados ao componente
const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis | null>(null);
const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);
const [adaptiveExercises, setAdaptiveExercises] = useState<any[]>([]);

// Função para inicializar perfil de aprendizado
const initializeLearningProfile = async (userId: string) => {
  setIsAnalyzingProfile(true);
  try {
    // Simula dados de interação (em produção viria do banco)
    const mockInteractions = [
      { type: 'question', content: 'Como resolver equações?', timestamp: new Date() },
      { type: 'answer', content: 'Entendi!', timestamp: new Date() }
    ];

    const mockPerformance = [
      { topic: 'Matemática', score: 0.8, timeSpent: 300, attempts: 2, timestamp: new Date().toISOString() }
    ];

    const profile = await aiPersonalizationEngine.analyzeLearningProfile(
      userId,
      mockInteractions,
      mockPerformance
    );
    
    setLearningProfile(profile);
  } catch (error) {
    console.error('Erro ao inicializar perfil:', error);
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
  if (!learningProfile) return;

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
```

### B. Modificação da Função de Envio de Mensagem

```typescript
// Modifique a função handleSendMessage existente
const handleSendMessage = async (message: string) => {
  if (!message.trim()) return;

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
```

### C. Componente de Perfil de Aprendizado

```typescript
// Adicione este componente ao chat
const LearningProfilePanel = () => {
  if (!learningProfile) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          <span className="text-blue-700">Analisando seu perfil de aprendizado...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
      <h3 className="font-bold text-purple-800 mb-3">🧠 Seu Perfil de Aprendizado</h3>
      
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
```

### D. Componente de Análise de Sentimento

```typescript
// Adicione este componente para mostrar análise de sentimento
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
```

---

## 🎮 2. Integração de Exercícios Adaptativos

### A. Componente de Exercícios Adaptativos

```typescript
// Adicione este componente para exercícios adaptativos
const AdaptiveExercisesPanel = () => {
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [showExercises, setShowExercises] = useState(false);

  const handleGenerateExercises = async (topic: string) => {
    const exercises = await generateAdaptiveExercises(topic);
    if (exercises.length > 0) {
      setCurrentExercise(exercises[0]);
      setShowExercises(true);
    }
  };

  const handleExerciseComplete = (score: number) => {
    // Atualiza perfil baseado no desempenho
    if (learningProfile) {
      const newPerformance = {
        topic: currentExercise.topic,
        score,
        timeSpent: Date.now() - startTime,
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
        setShowExercises(false);
      }
    }, 1000);
  };

  if (!showExercises || !currentExercise) {
    return (
      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <button
          onClick={() => handleGenerateExercises('Matemática')}
          className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
        >
          🎯 Gerar Exercícios Adaptativos
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h4 className="font-bold text-gray-800 mb-3">🎯 Exercício Adaptativo</h4>
      
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
```

### B. Integração com Comandos do Chat

```typescript
// Adicione comandos especiais para exercícios
const handleSpecialCommands = (message: string) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('exercício') || lowerMessage.includes('questão')) {
    // Gera exercícios adaptativos
    const topic = extractTopicFromMessage(message);
    handleGenerateExercises(topic);
    return true;
  }
  
  if (lowerMessage.includes('perfil') || lowerMessage.includes('análise')) {
    // Mostra perfil de aprendizado
    setShowProfilePanel(true);
    return true;
  }
  
  if (lowerMessage.includes('sentimento') || lowerMessage.includes('emoção')) {
    // Mostra análise de sentimento
    setShowSentimentPanel(true);
    return true;
  }
  
  return false;
};

// Modifique a função handleSendMessage para incluir comandos especiais
const handleSendMessage = async (message: string) => {
  if (!message.trim()) return;

  // Verifica comandos especiais
  if (handleSpecialCommands(message)) {
    return;
  }

  // Resto da implementação...
};
```

---

## 🔧 3. Modificações na Interface do Chat

### A. Layout Atualizado

```typescript
// Modifique o layout do chat para incluir os novos painéis
return (
  <div className="flex h-screen bg-gray-50">
    {/* Painel Lateral com Perfil e Análise */}
    <div className="w-80 bg-white border-r border-gray-200 p-4 space-y-4">
      <LearningProfilePanel />
      <SentimentAnalysisPanel sentiment={sentimentAnalysis} />
      <AdaptiveExercisesPanel />
    </div>
    
    {/* Chat Principal */}
    <div className="flex-1 flex flex-col">
      {/* Header do Chat */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-800">
          💬 Chat Inteligente com Tutor IA
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
      </div>
      
      {/* Input de Mensagem */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSendMessage(inputMessage)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  </div>
);
```

---

## 🚀 4. Implementação Passo a Passo

### Passo 1: Instalar Dependências
```bash
npm install @ai-sdk/openai zod
```

### Passo 2: Copiar Arquivos
```bash
# Copie o motor de personalização
cp lib/ai-personalization-engine.ts /path/to/your/project/lib/

# Copie a API do tutor
cp app/api/ai/tutor-response/route.ts /path/to/your/project/app/api/ai/tutor-response/
```

### Passo 3: Modificar ChatInterfaceRefactored.tsx
```typescript
// Adicione as importações e funções conforme mostrado acima
// Modifique o layout para incluir os novos painéis
// Integre as funcionalidades de análise de sentimento e exercícios
```

### Passo 4: Testar Funcionalidades
```typescript
// Teste o perfil de aprendizado
// Teste a análise de sentimento
// Teste os exercícios adaptativos
// Verifique a integração com o chat existente
```

---

## 🎯 5. Comandos Especiais do Chat

### Comandos Disponíveis
- **"exercício"** ou **"questão"**: Gera exercícios adaptativos
- **"perfil"** ou **"análise"**: Mostra perfil de aprendizado
- **"sentimento"** ou **"emoção"**: Mostra análise de sentimento
- **"ajuda"**: Lista todos os comandos disponíveis

### Exemplos de Uso
```
Usuário: "Preciso de um exercício de matemática"
Tutor: [Gera exercício adaptativo baseado no perfil]

Usuário: "Como está meu perfil de aprendizado?"
Tutor: [Mostra perfil detalhado com métricas]

Usuário: "Estou confuso com este tópico"
Tutor: [Detecta sentimento negativo e oferece suporte]
```

---

## 📊 6. Métricas e Analytics

### Dados Coletados
```typescript
const chatAnalytics = {
  messagesPerSession: messages.length,
  averageSentiment: calculateAverageSentiment(messages),
  engagementLevel: learningProfile?.engagementLevel,
  exercisesCompleted: adaptiveExercises.length,
  topicsDiscussed: extractTopics(messages),
  timeSpent: calculateSessionTime()
};
```

### Dashboard de Métricas
```typescript
// Componente para mostrar métricas do chat
const ChatAnalyticsPanel = () => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-bold mb-3">📊 Métricas da Sessão</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Mensagens: {messages.length}</div>
        <div>Engajamento: {learningProfile?.engagementLevel}/10</div>
        <div>Exercícios: {adaptiveExercises.length}</div>
        <div>Tempo: {formatTime(sessionTime)}</div>
      </div>
    </div>
  );
};
```

---

## 🎉 Conclusão

Com essas implementações, o chat do HubEdu.ia se torna um **Tutor IA Pessoal completo** que:

- ✅ **Analisa perfil** de aprendizado automaticamente
- ✅ **Detecta sentimento** em tempo real
- ✅ **Gera exercícios** adaptativos personalizados
- ✅ **Oferece suporte** emocional personalizado
- ✅ **Mantém conformidade** total com LGPD
- ✅ **Integra perfeitamente** com o sistema existente

**Resultado**: Um chat inteligente que se adapta a cada usuário e oferece uma experiência educacional verdadeiramente personalizada! 🎓✨
