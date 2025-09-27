import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface QuestaoFormativa {
  id_questao: string;
  enunciado: string;
  tipo_questao: 'multipla-escolha' | 'verdadeiro-falso' | 'texto-livre';
  alternativas?: string[];
  resposta_correta: string | number | boolean;
  feedback: {
    correto: string;
    incorreto: string;
  };
}

interface QuizCardProps {
  questions: QuestaoFormativa[];
}

export const QuizCard: React.FC<QuizCardProps> = ({ questions }) => {
  const [answers, setAnswers] = useState<Record<string, string | boolean | null>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [isCorrect, setIsCorrect] = useState<Record<string, boolean>>({});

  const handleSelectAnswer = (questionId: string, answer: string | boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const checkAnswer = (question: QuestaoFormativa) => {
    const userAnswer = answers[question.id_questao];
    if (userAnswer === null || userAnswer === undefined) return;

    let correct = false;
    if (question.tipo_questao === 'multipla-escolha' && typeof question.resposta_correta === 'number') {
      const correctAnswer = question.alternativas?.[question.resposta_correta];
      correct = userAnswer === correctAnswer;
    } else {
      correct = userAnswer === question.resposta_correta;
    }

    setSubmitted(prev => ({ ...prev, [question.id_questao]: true }));
    setIsCorrect(prev => ({ ...prev, [question.id_questao]: correct }));
    setFeedback(prev => ({ ...prev, [question.id_questao]: correct ? question.feedback.correto : question.feedback.incorreto }));
  };
  
  const getOptionClassName = (question: QuestaoFormativa, option: string | boolean) => {
    if (!submitted[question.id_questao]) {
      return answers[question.id_questao] === option 
        ? 'bg-cyan-600/50 ring-2 ring-cyan-500' 
        : 'bg-slate-700/50 hover:bg-slate-600/50';
    }

    let isCorrectAnswer = false;
    if (question.tipo_questao === 'multipla-escolha' && typeof question.resposta_correta === 'number') {
        isCorrectAnswer = option === question.alternativas?.[question.resposta_correta];
    } else {
        isCorrectAnswer = option === question.resposta_correta;
    }

    if (isCorrectAnswer) return 'bg-green-500/50 ring-2 ring-green-400';
    if (answers[question.id_questao] === option && !isCorrect[question.id_questao]) return 'bg-red-500/50 ring-2 ring-red-400';

    return 'bg-slate-700/50';
  }


  return (
    <Card>
      <h3 className="text-lg font-bold text-cyan-400 mb-4">Check Your Understanding</h3>
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id_questao}>
            <p className="text-slate-300 mb-3">{q.enunciado}</p>
            
            {q.tipo_questao === 'multipla-escolha' && q.alternativas && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.alternativas.map((alt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(q.id_questao, alt)}
                    disabled={submitted[q.id_questao]}
                    className={`p-3 rounded-md text-left transition-all duration-200 disabled:cursor-not-allowed ${getOptionClassName(q, alt)}`}
                  >
                    {alt}
                  </button>
                ))}
              </div>
            )}

            {q.tipo_questao === 'verdadeiro-falso' && (
                <div className="flex gap-2">
                    {[true, false].map(val => (
                        <button
                            key={String(val)}
                            onClick={() => handleSelectAnswer(q.id_questao, val)}
                            disabled={submitted[q.id_questao]}
                            className={`p-3 w-full rounded-md transition-all duration-200 disabled:cursor-not-allowed ${getOptionClassName(q, val)}`}
                        >
                            {String(val)}
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-3">
              {!submitted[q.id_questao] ? (
                <Button onClick={() => checkAnswer(q)} disabled={answers[q.id_questao] === undefined}>
                  Check Answer
                </Button>
              ) : (
                <div className={`p-3 rounded-md text-sm ${isCorrect[q.id_questao] ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                  <p><strong>{isCorrect[q.id_questao] ? 'Correct!' : 'Incorrect.'}</strong> {feedback[q.id_questao]}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
