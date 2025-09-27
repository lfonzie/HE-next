'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Send, 
  Lightbulb, 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  MessageSquare,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface AIAssistantProps {
  experimentId: string;
  experimentName: string;
  onSuggestion?: (suggestion: string) => void;
  onQuestion?: (question: string) => void;
}

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  experimentId,
  experimentName,
  onSuggestion,
  onQuestion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensagem inicial do assistente
    const initialMessage: AIMessage = {
      id: 'initial',
      type: 'assistant',
      content: `Olá! Sou seu assistente de laboratório virtual. Estou aqui para te ajudar com o experimento "${experimentName}". Posso explicar conceitos, sugerir parâmetros, interpretar resultados e responder suas dúvidas. Como posso te ajudar?`,
      timestamp: new Date(),
      suggestions: [
        'Explique como funciona este experimento',
        'Quais parâmetros posso ajustar?',
        'O que significam os resultados?',
        'Dê-me uma dica para começar'
      ]
    };
    setMessages([initialMessage]);
  }, [experimentId, experimentName]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    if (onQuestion) {
      onQuestion(inputValue);
    }

    try {
      // Simular resposta da IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = await generateAIResponse(inputValue, experimentId);
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (question: string, experimentId: string): Promise<{content: string, suggestions?: string[]}> => {
    // Simular respostas baseadas no experimento
    const responses = {
      'chemical-reaction': {
        'explicar': 'Este experimento simula reações químicas. Você pode misturar diferentes compostos e observar as reações resultantes. Cada reação tem propriedades específicas como mudança de cor, liberação de gases ou formação de precipitados.',
        'parâmetros': 'Você pode ajustar a temperatura (0-100°C) e concentração (0-100%). Temperaturas mais altas aceleram as reações, enquanto concentrações maiores podem alterar os resultados.',
        'resultados': 'Os resultados mostram os produtos da reação, mudanças visuais e propriedades físicas. Observe as cores, estados físicos e qualquer liberação de gases.',
        'dica': 'Comece com uma reação simples como HCl + NaOH. Ajuste a temperatura para 25°C e concentração para 50% para ver uma reação de neutralização clássica.'
      },
      'pendulum': {
        'explicar': 'Este experimento simula um pêndulo simples. O movimento é governado pela gravidade e segue um padrão harmônico. O período depende apenas do comprimento e da gravidade, não da massa.',
        'parâmetros': 'Ajuste o comprimento (50-200cm), ângulo inicial (5-60°), massa (0.5-5kg), gravidade (1-20m/s²) e amortecimento (0-0.1).',
        'resultados': 'Observe o período, frequência, velocidade angular e trajetória. O período é calculado por T = 2π√(L/g).',
        'dica': 'Comece com comprimento 100cm, ângulo 30° e gravidade 9.81m/s². Observe como o período muda quando você altera o comprimento.'
      },
      'bouncing-ball': {
        'explicar': 'Este experimento simula uma bola saltitante. Explore conceitos de gravidade, elasticidade e resistência do ar. O coeficiente de restituição determina quanta energia é perdida a cada quique.',
        'parâmetros': 'Ajuste o coeficiente de restituição (0-1), gravidade (1-20m/s²), altura inicial (100-350px) e resistência do ar (0-0.1).',
        'resultados': 'Observe o número de quiques, altura máxima, velocidade e tempo total. Uma restituição de 1 significa quique perfeito, 0 significa que a bola para imediatamente.',
        'dica': 'Comece com restituição 0.8, gravidade 9.81m/s² e altura 300px. Experimente diferentes valores de restituição para ver o efeito na duração dos quiques.'
      },
      'color-mixing': {
        'explicar': 'Este experimento explora a teoria das cores. Misture cores primárias (RGB) ou secundárias (CMYK) para criar novas cores. Cada modelo tem suas próprias propriedades e aplicações.',
        'parâmetros': 'Ajuste os valores RGB (0-255) ou CMYK (0-100%). RGB é aditivo (usado em telas), CMYK é subtrativo (usado em impressão).',
        'resultados': 'Veja a cor resultante em RGB, HSL e HEX. Observe como diferentes combinações criam cores únicas e como a luminosidade afeta a percepção.',
        'dica': 'Comece misturando vermelho (255,0,0) com verde (0,255,0) para criar amarelo. Experimente diferentes proporções para ver as variações de cor.'
      }
    };

    const experimentResponses = responses[experimentId as keyof typeof responses] || responses['chemical-reaction'];
    
    // Detectar tipo de pergunta
    const questionLower = question.toLowerCase();
    let responseKey = 'explicar';
    
    if (questionLower.includes('parâmetro') || questionLower.includes('ajustar') || questionLower.includes('configurar')) {
      responseKey = 'parâmetros';
    } else if (questionLower.includes('resultado') || questionLower.includes('significa') || questionLower.includes('interpretar')) {
      responseKey = 'resultados';
    } else if (questionLower.includes('dica') || questionLower.includes('começar') || questionLower.includes('sugestão')) {
      responseKey = 'dica';
    }

    const content = experimentResponses[responseKey as keyof typeof experimentResponses] || experimentResponses.explicar;
    
    return {
      content,
      suggestions: [
        'Mostre-me mais detalhes',
        'Quais são os conceitos científicos?',
        'Como interpretar os dados?',
        'Dê-me outro exemplo'
      ]
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
        size="lg"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 w-96 shadow-xl transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[500px]'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Assistente IA</CardTitle>
              <CardDescription className="text-sm">Laboratório Virtual</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'assistant'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-yellow-100 text-yellow-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.suggestions && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-6 mr-1 mb-1"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta..."
              className="flex-1 min-h-[40px] max-h-[100px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
