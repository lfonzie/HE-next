// Teste para verificar as melhorias nos slides de lições
// Este arquivo testa se os slides agora têm conteúdo mais extenso e perguntas com lógica correta

const testSlideGeneration = async () => {
  console.log('🧪 Testando melhorias nos slides de lições...\n');
  
  try {
    // Teste 1: Gerar um slide de explicação
    console.log('📝 Teste 1: Gerando slide de explicação...');
    const explanationResponse = await fetch('/api/slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Disney - História e Impacto Cultural',
        position: 1,
        previousSlides: []
      })
    });
    
    if (explanationResponse.ok) {
      const explanationData = await explanationResponse.json();
      const slide = explanationData.slide;
      
      console.log('✅ Slide de explicação gerado com sucesso!');
      console.log(`📊 Título: ${slide.title}`);
      console.log(`📏 Tamanho do conteúdo: ${slide.content.length} caracteres`);
      console.log(`🖼️ Image prompt: ${slide.image_prompt || 'Não fornecido'}`);
      
      if (slide.content.length >= 400) {
        console.log('✅ Conteúdo extenso: PASSOU (≥400 caracteres)');
      } else {
        console.log('❌ Conteúdo muito pequeno: FALHOU (<400 caracteres)');
      }
    } else {
      console.log('❌ Erro ao gerar slide de explicação');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Teste 2: Gerar um slide de pergunta
    console.log('❓ Teste 2: Gerando slide de pergunta...');
    const questionResponse = await fetch('/api/slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Disney - História e Impacto Cultural',
        position: 4,
        previousSlides: []
      })
    });
    
    if (questionResponse.ok) {
      const questionData = await questionResponse.json();
      const slide = questionData.slide;
      
      console.log('✅ Slide de pergunta gerado com sucesso!');
      console.log(`📊 Título: ${slide.title}`);
      console.log(`❓ Pergunta: ${slide.question_stem || 'Não fornecida'}`);
      console.log(`📋 Opções: ${slide.options ? slide.options.length : 0} opções`);
      console.log(`✅ Resposta correta: ${slide.answer || 'Não fornecida'}`);
      console.log(`💡 Explicação: ${slide.rationale ? 'Fornecida' : 'Não fornecida'}`);
      
      // Verificar estrutura da pergunta
      const hasValidStructure = slide.question_stem && 
                               slide.options && 
                               slide.options.length === 4 && 
                               slide.answer && 
                               ['A', 'B', 'C', 'D'].includes(slide.answer) &&
                               slide.rationale;
      
      if (hasValidStructure) {
        console.log('✅ Estrutura da pergunta: PASSOU');
      } else {
        console.log('❌ Estrutura da pergunta: FALHOU');
        console.log('   Problemas encontrados:');
        if (!slide.question_stem) console.log('   - question_stem ausente');
        if (!slide.options || slide.options.length !== 4) console.log('   - options inválidas');
        if (!slide.answer || !['A', 'B', 'C', 'D'].includes(slide.answer)) console.log('   - answer inválida');
        if (!slide.rationale) console.log('   - rationale ausente');
      }
    } else {
      console.log('❌ Erro ao gerar slide de pergunta');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Teste 3: Gerar slide de encerramento (slide 9)
    console.log('🏁 Teste 3: Gerando slide de encerramento (slide 9)...');
    const closingResponse = await fetch('/api/slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Disney - História e Impacto Cultural',
        position: 9,
        previousSlides: []
      })
    });
    
    if (closingResponse.ok) {
      const closingData = await closingResponse.json();
      const slide = closingData.slide;
      
      console.log('✅ Slide de encerramento gerado com sucesso!');
      console.log(`📊 Título: ${slide.title}`);
      console.log(`📏 Tamanho do conteúdo: ${slide.content.length} caracteres`);
      console.log(`🖼️ Image prompt: ${slide.image_prompt || 'Não fornecido'}`);
      
      if (slide.content.length >= 400) {
        console.log('✅ Conteúdo extenso: PASSOU (≥400 caracteres)');
      } else {
        console.log('❌ Conteúdo muito pequeno: FALHOU (<400 caracteres)');
      }
      
      if (slide.image_prompt) {
        console.log('✅ Image prompt no slide 9: PASSOU');
      } else {
        console.log('❌ Image prompt no slide 9: FALHOU');
      }
    } else {
      console.log('❌ Erro ao gerar slide de encerramento');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
};

// Executar testes se estiver no browser
if (typeof window !== 'undefined') {
  testSlideGeneration();
} else {
  console.log('Este script deve ser executado no browser para testar as APIs');
}

export { testSlideGeneration };
