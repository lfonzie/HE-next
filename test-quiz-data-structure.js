// Teste para verificar a estrutura real dos dados do quiz
// Este arquivo testa como os dados são estruturados na prática

const testQuizDataStructure = async () => {
  console.log('🧪 Testando estrutura real dos dados do quiz...\n');

  try {
    // Teste 1: Gerar uma aula real e examinar a estrutura
    console.log('📋 Teste 1: Gerando aula real para examinar estrutura');
    
    const response = await fetch('http://localhost:3000/api/aulas/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'Modernismo',
        mode: 'sync'
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.slides) {
      console.log(`✅ Aula gerada com sucesso: ${data.slides.length} slides`);
      
      // Encontrar slides de quiz
      const quizSlides = data.slides.filter(slide => slide.type === 'quiz');
      console.log(`📊 Slides de quiz encontrados: ${quizSlides.length}`);
      
      if (quizSlides.length > 0) {
        quizSlides.forEach((slide, index) => {
          console.log(`\n📝 Quiz ${index + 1}:`);
          console.log(`   Título: ${slide.title}`);
          console.log(`   Tipo: ${slide.type}`);
          console.log(`   Número: ${slide.number}`);
          
          if (slide.questions && slide.questions.length > 0) {
            slide.questions.forEach((question, qIndex) => {
              console.log(`\n   Questão ${qIndex + 1}:`);
              console.log(`   Pergunta: ${question.q}`);
              console.log(`   Opções: ${question.options?.length || 0}`);
              console.log(`   Resposta correta: ${question.correct} (tipo: ${typeof question.correct})`);
              console.log(`   Explicação: ${question.explanation ? 'Sim' : 'Não'}`);
              
              // Verificar estrutura das opções
              if (question.options) {
                question.options.forEach((option, optIndex) => {
                  console.log(`     ${optIndex}: ${option}`);
                });
              }
              
              // Testar normalização
              const normalizeCorrectAnswer = (correct) => {
                if (typeof correct === 'string') {
                  const normalizedCorrect = correct.toLowerCase();
                  if (normalizedCorrect === 'a') return 0;
                  if (normalizedCorrect === 'b') return 1;
                  if (normalizedCorrect === 'c') return 2;
                  if (normalizedCorrect === 'd') return 3;
                  return normalizedCorrect.charCodeAt(0) - 97;
                }
                return correct;
              };
              
              const normalized = normalizeCorrectAnswer(question.correct);
              console.log(`   Normalizada: ${normalized}`);
              
              // Simular resposta do usuário
              const userAnswer = normalized; // Usuário responde corretamente
              const isCorrect = userAnswer === normalized;
              console.log(`   Usuário responde: ${userAnswer}`);
              console.log(`   Está correto: ${isCorrect}`);
            });
          } else {
            console.log('   ⚠️ Nenhuma questão encontrada');
          }
        });
      } else {
        console.log('⚠️ Nenhum slide de quiz encontrado');
      }

      // Teste 2: Verificar estrutura dos stages
      console.log('\n📋 Teste 2: Verificando estrutura dos stages');
      
      if (data.lesson && data.lesson.stages) {
        console.log(`📊 Stages encontrados: ${data.lesson.stages.length}`);
        
        data.lesson.stages.forEach((stage, index) => {
          console.log(`\n   Stage ${index + 1}:`);
          console.log(`   Etapa: ${stage.etapa}`);
          console.log(`   Tipo: ${stage.type}`);
          console.log(`   Componente: ${stage.activity?.component}`);
          
          if (stage.activity?.component === 'QuizComponent') {
            console.log(`   Questões: ${stage.activity.questions?.length || 0}`);
            
            if (stage.activity.questions && stage.activity.questions.length > 0) {
              stage.activity.questions.forEach((question, qIndex) => {
                console.log(`     Questão ${qIndex + 1}:`);
                console.log(`     Pergunta: ${question.q}`);
                console.log(`     Resposta correta: ${question.correct} (tipo: ${typeof question.correct})`);
                console.log(`     Opções: ${question.options?.length || 0}`);
              });
            }
          }
        });
      }

      // Teste 3: Verificar se há inconsistências
      console.log('\n📋 Teste 3: Verificando inconsistências');
      
      const allQuizQuestions = [];
      
      // Coletar todas as questões de quiz
      quizSlides.forEach(slide => {
        if (slide.questions) {
          allQuizQuestions.push(...slide.questions);
        }
      });
      
      if (data.lesson && data.lesson.stages) {
        data.lesson.stages.forEach(stage => {
          if (stage.activity?.component === 'QuizComponent' && stage.activity.questions) {
            allQuizQuestions.push(...stage.activity.questions);
          }
        });
      }
      
      console.log(`📊 Total de questões de quiz encontradas: ${allQuizQuestions.length}`);
      
      // Verificar tipos de resposta correta
      const correctAnswerTypes = {};
      allQuizQuestions.forEach(question => {
        const type = typeof question.correct;
        correctAnswerTypes[type] = (correctAnswerTypes[type] || 0) + 1;
      });
      
      console.log('📊 Tipos de resposta correta:');
      Object.entries(correctAnswerTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

    } else {
      console.log('❌ Erro: Resposta não contém dados válidos');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }

  console.log('\n🏁 Teste de estrutura de dados concluído!');
};

// Executar o teste se este arquivo for chamado diretamente
if (typeof window === 'undefined') {
  testQuizDataStructure();
}

module.exports = { testQuizDataStructure };
