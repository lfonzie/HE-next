#!/usr/bin/env node

/**
 * Teste para verificar a funcionalidade de bloqueio de navegação no quiz
 * Testa se o usuário só pode avançar após responder todas as questões
 */

import { validateQuizCompletion, validateSingleAnswer } from './lib/quiz-validation.js';

// Mock de questões para teste
const mockQuestions = [
  {
    id: 'q1',
    question: 'Qual é a capital do Brasil?',
    type: 'multiple-choice',
    options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
    correctAnswer: 'Brasília',
    required: true
  },
  {
    id: 'q2', 
    question: 'Quantos estados tem o Brasil?',
    type: 'multiple-choice',
    options: ['25', '26', '27', '28'],
    correctAnswer: '26',
    required: true
  },
  {
    id: 'q3',
    question: 'Explique a importância da Amazônia para o Brasil.',
    type: 'open-ended',
    required: true
  }
];

async function testQuizValidation() {
  console.log('🧪 Teste de Validação de Quiz com AI SDK');
  console.log('==========================================');

  // Teste 1: Todas as questões respondidas
  console.log('\n📝 Teste 1: Todas as questões respondidas');
  const completeAnswers = {
    'q1': { questionId: 'q1', answer: 'Brasília', timestamp: Date.now() },
    'q2': { questionId: 'q2', answer: '26', timestamp: Date.now() },
    'q3': { questionId: 'q3', answer: 'A Amazônia é fundamental para o Brasil pois regula o clima, possui biodiversidade única e recursos naturais importantes.', timestamp: Date.now() }
  };

  try {
    const result1 = await validateQuizCompletion(mockQuestions, completeAnswers, {
      subject: 'Geografia',
      difficulty: 'Média'
    });
    
    console.log(`✅ Resultado: ${result1.canProceed ? 'PODE PROSSEGUIR' : 'NÃO PODE PROSSEGUIR'}`);
    console.log(`📊 Questões respondidas: ${result1.allQuestionsAnswered ? 'Sim' : 'Não'}`);
    console.log(`❓ Questões não respondidas: [${result1.unansweredQuestions.join(', ')}]`);
    console.log(`💡 Recomendações: ${result1.recommendations.join('; ')}`);
  } catch (error) {
    console.error('❌ Erro no teste 1:', error.message);
  }

  // Teste 2: Algumas questões não respondidas
  console.log('\n📝 Teste 2: Algumas questões não respondidas');
  const incompleteAnswers = {
    'q1': { questionId: 'q1', answer: 'Brasília', timestamp: Date.now() },
    // q2 não respondida
    'q3': { questionId: 'q3', answer: 'A Amazônia é importante.', timestamp: Date.now() }
  };

  try {
    const result2 = await validateQuizCompletion(mockQuestions, incompleteAnswers, {
      subject: 'Geografia',
      difficulty: 'Média'
    });
    
    console.log(`✅ Resultado: ${result2.canProceed ? 'PODE PROSSEGUIR' : 'NÃO PODE PROSSEGUIR'}`);
    console.log(`📊 Questões respondidas: ${result2.allQuestionsAnswered ? 'Sim' : 'Não'}`);
    console.log(`❓ Questões não respondidas: [${result2.unansweredQuestions.join(', ')}]`);
    console.log(`💡 Recomendações: ${result2.recommendations.join('; ')}`);
  } catch (error) {
    console.error('❌ Erro no teste 2:', error.message);
  }

  // Teste 3: Resposta muito curta para questão aberta
  console.log('\n📝 Teste 3: Resposta muito curta para questão aberta');
  const shortAnswerAnswers = {
    'q1': { questionId: 'q1', answer: 'Brasília', timestamp: Date.now() },
    'q2': { questionId: 'q2', answer: '26', timestamp: Date.now() },
    'q3': { questionId: 'q3', answer: 'Importante.', timestamp: Date.now() } // Muito curta
  };

  try {
    const result3 = await validateQuizCompletion(mockQuestions, shortAnswerAnswers, {
      subject: 'Geografia',
      difficulty: 'Média'
    });
    
    console.log(`✅ Resultado: ${result3.canProceed ? 'PODE PROSSEGUIR' : 'NÃO PODE PROSSEGUIR'}`);
    console.log(`📊 Questões respondidas: ${result3.allQuestionsAnswered ? 'Sim' : 'Não'}`);
    console.log(`❓ Questões não respondidas: [${result3.unansweredQuestions.join(', ')}]`);
    console.log(`⚠️ Respostas incompletas: ${result3.incompleteAnswers.length}`);
    console.log(`💡 Recomendações: ${result3.recommendations.join('; ')}`);
  } catch (error) {
    console.error('❌ Erro no teste 3:', error.message);
  }

  // Teste 4: Validação de resposta individual
  console.log('\n📝 Teste 4: Validação de resposta individual');
  try {
    const singleResult = await validateSingleAnswer(
      mockQuestions[2], // Questão aberta
      'A Amazônia é fundamental para o Brasil pois regula o clima global, possui a maior biodiversidade do planeta e contém recursos naturais essenciais.',
      { subject: 'Geografia', expectedLength: 50 }
    );
    
    console.log(`✅ Resposta válida: ${singleResult.isValid ? 'Sim' : 'Não'}`);
    console.log(`📝 Resposta completa: ${singleResult.isComplete ? 'Sim' : 'Não'}`);
    console.log(`💬 Feedback: ${singleResult.feedback}`);
    console.log(`💡 Sugestões: ${singleResult.suggestions.join('; ')}`);
  } catch (error) {
    console.error('❌ Erro no teste 4:', error.message);
  }

  console.log('\n✨ Testes concluídos!');
  console.log('\n📋 Resumo das melhorias implementadas:');
  console.log('• Validação inteligente usando AI SDK em vez de regex');
  console.log('• Bloqueio de navegação até todas as questões serem respondidas');
  console.log('• Análise de qualidade das respostas');
  console.log('• Feedback contextual e recomendações específicas');
  console.log('• Validação individual de respostas');
  console.log('• Interface melhorada com indicadores de validação');
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testQuizValidation().catch(console.error);
}

export { testQuizValidation };
