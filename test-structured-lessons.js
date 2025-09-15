// test-structured-lessons.js
// Teste para verificar a nova estrutura de aulas com 9 slides

const testTopic = "Como funciona a fotossíntese nas plantas"

async function testStructuredLessonGeneration() {
  try {
    console.log('🧪 Testando geração de aula estruturada...')
    console.log(`📚 Tópico: ${testTopic}`)
    
    const response = await fetch('/api/generate-lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: testTopic,
        demoMode: true
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Falha na geração da aula')
    }

    const lesson = data.lesson
    
    console.log('\n✅ Aula gerada com sucesso!')
    console.log(`📖 Título: ${lesson.title}`)
    console.log(`🎯 Matéria: ${lesson.subject}`)
    console.log(`📚 Série: ${lesson.level}º ano`)
    console.log(`🎯 Objetivos: ${lesson.objectives.length} objetivos`)
    console.log(`📊 Slides: ${lesson.slides.length} slides`)
    console.log(`🎭 Etapas: ${lesson.stages.length} etapas`)
    
    // Verificar estrutura dos slides
    console.log('\n📋 Estrutura dos Slides:')
    lesson.slides.forEach((slide, index) => {
      const slideNumber = index + 1
      const expectedType = getExpectedSlideType(slideNumber)
      const isCorrect = slide.type === expectedType
      
      console.log(`  ${slideNumber}. ${slide.title} (${slide.type}) ${isCorrect ? '✅' : '❌'}`)
      
      if (slide.imagePrompt) {
        console.log(`     🖼️ Imagem: ${slide.imagePrompt}`)
      }
      
      if (slide.type === 'question') {
        console.log(`     ❓ Pergunta: ${slide.question}`)
        console.log(`     📝 Opções: ${slide.options.length} alternativas`)
      }
    })
    
    // Verificar se tem exatamente 9 slides
    if (lesson.slides.length !== 9) {
      console.log(`❌ ERRO: Esperado 9 slides, mas encontrado ${lesson.slides.length}`)
    } else {
      console.log('✅ Estrutura correta: 9 slides')
    }
    
    // Verificar tipos de slides
    const explanationSlides = lesson.slides.filter(s => s.type === 'explanation').length
    const questionSlides = lesson.slides.filter(s => s.type === 'question').length
    const closingSlides = lesson.slides.filter(s => s.type === 'closing').length
    
    console.log(`\n📊 Distribuição dos Slides:`)
    console.log(`  📖 Explicação: ${explanationSlides} slides`)
    console.log(`  ❓ Pergunta: ${questionSlides} slides`)
    console.log(`  🏁 Encerramento: ${closingSlides} slides`)
    
    // Verificar se a distribuição está correta
    const expectedExplanation = 6 // slides 1,2,3,5,6,7
    const expectedQuestions = 2 // slides 4 e 8
    const expectedClosing = 1 // slide 9
    
    if (explanationSlides === expectedExplanation && 
        questionSlides === expectedQuestions && 
        closingSlides === expectedClosing) {
      console.log('✅ Distribuição correta dos tipos de slides!')
    } else {
      console.log('❌ Distribuição incorreta dos tipos de slides')
    }
    
    // Verificar imagens
    const slidesWithImages = lesson.slides.filter(s => s.imagePrompt).length
    console.log(`\n🖼️ Slides com sugestões de imagem: ${slidesWithImages}/9`)
    
    if (slidesWithImages === 9) {
      console.log('✅ Todos os slides têm sugestões de imagem!')
    } else {
      console.log('❌ Alguns slides não têm sugestões de imagem')
    }
    
    console.log('\n🎉 Teste concluído!')
    
    return lesson
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    throw error
  }
}

function getExpectedSlideType(slideNumber) {
  switch (slideNumber) {
    case 1:
    case 2:
    case 3:
    case 5:
    case 6:
    case 7:
      return 'explanation'
    case 4:
    case 8:
      return 'question'
    case 9:
      return 'closing'
    default:
      return 'unknown'
  }
}

// Executar teste se chamado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  testStructuredLessonGeneration()
    .then(() => {
      console.log('✅ Teste executado com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Teste falhou:', error)
      process.exit(1)
    })
} else {
  // Browser environment
  window.testStructuredLessonGeneration = testStructuredLessonGeneration
}

module.exports = { testStructuredLessonGeneration }
