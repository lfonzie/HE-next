import React from 'react';
import { EnhancedQuizComponent } from '@/components/interactive/EnhancedQuizComponent';
import { ProgressiveLessonComponent } from '@/components/professor-interactive/lesson/ProgressiveLessonComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Exemplo de uso dos componentes de quiz com validação AI SDK
 * Demonstra como o bloqueio de navegação funciona
 */
export function QuizValidationExample() {
  const mockQuestions = [
    {
      id: 'q1',
      question: 'Qual é a capital do Brasil?',
      options: {
        A: 'São Paulo',
        B: 'Rio de Janeiro', 
        C: 'Brasília',
        D: 'Salvador'
      },
      correctAnswer: 'C',
      explanation: 'Brasília é a capital do Brasil desde 1960.',
      difficulty: 'EASY',
      points: 10
    },
    {
      id: 'q2',
      question: 'Quantos estados tem o Brasil?',
      options: {
        A: '25',
        B: '26',
        C: '27', 
        D: '28'
      },
      correctAnswer: 'B',
      explanation: 'O Brasil tem 26 estados e 1 Distrito Federal.',
      difficulty: 'MEDIUM',
      points: 15
    },
    {
      id: 'q3',
      question: 'Explique a importância da Amazônia para o Brasil.',
      options: {
        A: 'Regula o clima',
        B: 'Biodiversidade única',
        C: 'Recursos naturais',
        D: 'Todas as anteriores'
      },
      correctAnswer: 'D',
      explanation: 'A Amazônia é importante por todos esses fatores.',
      difficulty: 'HARD',
      points: 20
    }
  ];

  const handleQuizComplete = (score: number, totalQuestions: number, results: any[]) => {
    console.log('Quiz completado!', { score, totalQuestions, results });
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Exemplo: Quiz com Validação AI SDK</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedQuizComponent
            questions={mockQuestions}
            onComplete={handleQuizComplete}
            showExplanations={true}
            showHints={true}
            timeLimit={300} // 5 minutos
          />
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Como funciona a validação:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• O botão "Próxima" só fica habilitado após confirmar a resposta atual</li>
              <li>• Na última questão, o sistema valida todas as respostas usando AI SDK</li>
              <li>• Se alguma questão não foi respondida adequadamente, mostra feedback específico</li>
              <li>• Só permite finalizar o quiz após todas as validações passarem</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exemplo: Aula Progressiva com Validação</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressiveLessonComponent
            initialQuery="Geografia do Brasil"
            initialSubject="Geografia"
            onLessonComplete={() => console.log('Aula completada!')}
          />
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Validação em slides de conteúdo:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Em slides de pergunta, o usuário deve responder antes de avançar</li>
              <li>• A resposta é validada usando AI SDK para qualidade</li>
              <li>• Feedback específico é mostrado se a resposta precisar melhorar</li>
              <li>• Navegação bloqueada até validação passar</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Melhorias Implementadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium">1. Validação Inteligente com AI SDK</h4>
            <p className="text-sm text-muted-foreground">
              Substituiu regex por AI SDK para análise mais precisa e contextual das respostas
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Bloqueio de Navegação</h4>
            <p className="text-sm text-muted-foreground">
              Usuário só pode avançar para próximo slide após responder todas as questões adequadamente
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Feedback Contextual</h4>
            <p className="text-sm text-muted-foreground">
              Mostra recomendações específicas para melhorar respostas inadequadas
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Interface Melhorada</h4>
            <p className="text-sm text-muted-foreground">
              Indicadores visuais de validação, loading states e mensagens claras
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuizValidationExample;
