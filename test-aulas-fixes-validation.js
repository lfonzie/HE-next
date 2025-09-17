// Teste para validar as correções implementadas no sistema de aulas
// Este arquivo testa as melhorias feitas no endpoint de geração de aulas

const testAulasFixes = async () => {
  console.log('🧪 Iniciando teste de validação das correções do sistema de aulas...\n');

  try {
    // Teste 1: Verificar se todas as imagens são geradas (não apenas slides 1 e 9)
    console.log('📋 Teste 1: Geração de imagens para todos os slides');
    const response = await fetch('http://localhost:3000/api/aulas/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'Fotossíntese',
        mode: 'sync'
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.slides) {
      console.log(`✅ Aula gerada com sucesso: ${data.slides.length} slides`);
      
      // Verificar se todos os slides têm imagens
      const slidesWithImages = data.slides.filter(slide => slide.imageUrl);
      console.log(`📊 Slides com imagens: ${slidesWithImages.length}/${data.slides.length}`);
      
      if (slidesWithImages.length === data.slides.length) {
        console.log('✅ CORREÇÃO APLICADA: Todos os slides têm imagens');
      } else {
        console.log('❌ PROBLEMA: Nem todos os slides têm imagens');
      }

      // Verificar se todos os slides têm pelo menos 500 tokens
      console.log('\n📋 Teste 2: Conteúdo mínimo de 500 tokens por slide');
      const slidesWithMinTokens = data.slides.filter(slide => {
        const tokens = Math.ceil((slide.content || '').length / 4);
        return tokens >= 500;
      });
      
      console.log(`📊 Slides com 500+ tokens: ${slidesWithMinTokens.length}/${data.slides.length}`);
      
      if (slidesWithMinTokens.length === data.slides.length) {
        console.log('✅ CORREÇÃO APLICADA: Todos os slides têm pelo menos 500 tokens');
      } else {
        console.log('❌ PROBLEMA: Nem todos os slides têm 500+ tokens');
      }

      // Verificar formato das perguntas
      console.log('\n📋 Teste 3: Formato das perguntas (A, B, C, D)');
      const quizSlides = data.slides.filter(slide => slide.type === 'quiz');
      
      if (quizSlides.length > 0) {
        quizSlides.forEach((slide, index) => {
          if (slide.questions && slide.questions.length > 0) {
            const question = slide.questions[0];
            console.log(`📝 Quiz ${index + 1}:`);
            console.log(`   Pergunta: ${question.q}`);
            console.log(`   Opções: ${question.options?.length || 0}`);
            console.log(`   Resposta correta: ${question.correct}`);
            
            // Verificar se as opções têm formato A), B), C), D)
            const hasCorrectFormat = question.options?.every(option => 
              option.includes('A)') || option.includes('B)') || 
              option.includes('C)') || option.includes('D)')
            );
            
            if (hasCorrectFormat) {
              console.log('✅ CORREÇÃO APLICADA: Opções com formato A), B), C), D)');
            } else {
              console.log('❌ PROBLEMA: Opções não têm formato correto');
            }
          }
        });
      }

      // Verificar quebras de linha no conteúdo
      console.log('\n📋 Teste 4: Quebras de linha no conteúdo');
      const slidesWithLineBreaks = data.slides.filter(slide => 
        slide.content && slide.content.includes('\\n\\n')
      );
      
      console.log(`📊 Slides com quebras de linha: ${slidesWithLineBreaks.length}/${data.slides.length}`);
      
      if (slidesWithLineBreaks.length > 0) {
        console.log('✅ CORREÇÃO APLICADA: Slides têm quebras de linha');
      } else {
        console.log('❌ PROBLEMA: Slides não têm quebras de linha');
      }

      // Verificar métricas de qualidade
      console.log('\n📋 Teste 5: Métricas de qualidade');
      if (data.metrics) {
        console.log(`📊 Qualidade: ${data.metrics.quality?.score || 0}%`);
        console.log(`📊 Tokens médios por slide: ${data.metrics.content?.averageTokensPerSlide || 0}`);
        console.log(`📊 Duração estimada: ${data.metrics.duration?.sync || 0} minutos`);
      }

      // Verificar validação
      console.log('\n📋 Teste 6: Validação da estrutura');
      if (data.validation) {
        console.log(`📊 Estrutura válida: ${data.validation.isValid ? 'Sim' : 'Não'}`);
        if (data.validation.issues && data.validation.issues.length > 0) {
          console.log('⚠️ Problemas encontrados:');
          data.validation.issues.forEach(issue => console.log(`   - ${issue}`));
        }
      }

    } else {
      console.log('❌ Erro: Resposta não contém dados válidos');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }

  console.log('\n🏁 Teste de validação concluído!');
};

// Executar o teste se este arquivo for chamado diretamente
if (typeof window === 'undefined') {
  testAulasFixes();
}

module.exports = { testAulasFixes };