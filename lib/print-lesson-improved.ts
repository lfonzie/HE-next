/**
 * Função melhorada para imprimir uma aula completa com imagens e design aprimorado
 * @param lessonData - Dados da aula a ser impressa
 */
export function printLessonImproved(lessonData: {
  title: string
  objectives: string[]
  introduction: string
  stages: Array<{
    etapa: string
    type: string
    activity: any
    route: string
  }>
  summary?: string
  nextSteps?: string[]
  metadata?: {
    subject: string
    grade: string
    duration: string
    difficulty: string
    tags: string[]
  }
}) {
  // Validar dados obrigatórios
  if (!lessonData) {
    console.error('Dados da aula inválidos para impressão: lessonData é null/undefined')
    return
  }

  if (!lessonData.title || lessonData.title.trim() === '') {
    console.error('Dados da aula inválidos para impressão: title está vazio')
    return
  }

  if (!lessonData.objectives || !Array.isArray(lessonData.objectives) || lessonData.objectives.length === 0) {
    console.error('Dados da aula inválidos para impressão: objectives está vazio ou não é um array válido')
    return
  }

  if (!lessonData.introduction || lessonData.introduction.trim() === '') {
    console.warn('Campo introduction está vazio, usando fallback')
  }

  // Log dos dados para debug
  console.log('Dados da aula para impressão:', {
    title: lessonData.title,
    objectivesLength: lessonData.objectives?.length,
    introduction: lessonData.introduction?.substring(0, 50) + '...',
    hasStages: !!lessonData.stages,
    stagesLength: lessonData.stages?.length
  })

  // Garantir que temos dados válidos para impressão
  const safeLessonData = {
    title: lessonData.title || 'Aula sem título',
    objectives: lessonData.objectives && Array.isArray(lessonData.objectives) && lessonData.objectives.length > 0 
      ? lessonData.objectives 
      : ['Objetivos não especificados'],
    introduction: lessonData.introduction && lessonData.introduction.trim() !== '' 
      ? lessonData.introduction 
      : `Esta aula aborda o tema "${lessonData.title || 'selecionado'}" de forma didática e interativa.`,
    stages: lessonData.stages || [],
    summary: lessonData.summary || '',
    nextSteps: lessonData.nextSteps || [],
    metadata: lessonData.metadata || {
      subject: 'Não especificado',
      grade: 'Não especificado', 
      duration: 'Não especificado',
      difficulty: 'Não especificado',
      tags: []
    }
  }

  // Criar uma nova janela para impressão
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  
  if (!printWindow) {
    console.error('Não foi possível abrir a janela de impressão')
    return
  }

  // Função para renderizar imagens dos stages
  const renderStageImages = (stage: any) => {
    if (stage.activity?.imageUrl) {
      return `
        <div class="stage-image">
          <img src="${stage.activity.imageUrl}" alt="${stage.etapa}" />
          <div class="stage-image-caption">Imagem ilustrativa: ${stage.etapa}</div>
        </div>
      `
    }
    return ''
  }

  // Função para renderizar questões do quiz
  const renderQuizQuestions = (stage: any) => {
    if (stage.activity?.questions && Array.isArray(stage.activity.questions)) {
      return `
        <div class="quiz-questions">
          ${stage.activity.questions.map((q: any, index: number) => `
            <div class="quiz-question">
              <div class="quiz-question-text">${index + 1}. ${q.q || q.question || 'Pergunta não disponível'}</div>
              <ul class="quiz-options">
                ${(q.options || []).map((option: string, optIndex: number) => {
                  const isCorrect = q.correct === optIndex || q.correctAnswer === optIndex
                  return `
                    <li class="${isCorrect ? 'quiz-correct' : ''}">
                      ${String.fromCharCode(65 + optIndex)}) ${option}
                    </li>
                  `
                }).join('')}
              </ul>
              ${q.explanation ? `
                <div class="quiz-explanation">
                  <strong>Explicação:</strong> ${q.explanation}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `
    }
    return ''
  }

  // HTML para impressão melhorado
  const printHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${safeLessonData.title} - Aula Impressa</title>
      <style>
        @page {
          margin: 1cm;
          size: A4;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 100%;
          margin: 0;
          padding: 0;
          background: white;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          margin-bottom: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 10px;
          padding: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .header-text {
          flex: 1;
        }
        
        .title {
          font-size: 28px;
          font-weight: bold;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 15px;
        }
        
        .metadata-item {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }
        
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #667eea;
        }
        
        .objectives {
          list-style: none;
          padding: 0;
        }
        
        .objectives li {
          background: #f8f9ff;
          margin: 8px 0;
          padding: 12px 15px;
          border-left: 4px solid #667eea;
          border-radius: 0 8px 8px 0;
        }
        
        .stages {
          display: grid;
          gap: 20px;
        }
        
        .stage {
          background: #f8f9ff;
          border: 1px solid #e1e5f2;
          border-radius: 10px;
          padding: 20px;
          page-break-inside: avoid;
        }
        
        .stage-title {
          font-size: 18px;
          font-weight: bold;
          color: #667eea;
          margin: 0 0 10px 0;
        }
        
        .stage-type {
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 15px;
        }
        
        .stage-content {
          margin-top: 15px;
        }
        
        .stage-content p {
          margin: 10px 0;
          line-height: 1.6;
        }
        
        .stage-image {
          margin: 15px 0;
          text-align: center;
        }
        
        .stage-image img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .stage-image-caption {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
          font-style: italic;
        }
        
        .quiz-questions {
          margin-top: 15px;
        }
        
        .quiz-question {
          background: white;
          border: 1px solid #e1e5f2;
          border-radius: 8px;
          padding: 15px;
          margin: 10px 0;
        }
        
        .quiz-question-text {
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        
        .quiz-options {
          list-style: none;
          padding: 0;
        }
        
        .quiz-options li {
          padding: 8px 12px;
          margin: 5px 0;
          background: #f8f9ff;
          border-radius: 5px;
          border-left: 3px solid #667eea;
        }
        
        .quiz-correct {
          background: #e8f5e8;
          border-left-color: #28a745;
          font-weight: bold;
        }
        
        .quiz-explanation {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 10px;
          margin-top: 10px;
          font-size: 14px;
        }
        
        .summary {
          background: #e8f5e8;
          border: 1px solid #c3e6c3;
          border-radius: 8px;
          padding: 20px;
        }
        
        .next-steps {
          list-style: none;
          padding: 0;
        }
        
        .next-steps li {
          background: #fff3cd;
          margin: 8px 0;
          padding: 12px 15px;
          border-left: 4px solid #ffc107;
          border-radius: 0 8px 8px 0;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #667eea;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        
        .footer p {
          margin: 5px 0;
        }
        
        .footer .app-name {
          font-weight: bold;
          color: #667eea;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .section {
            page-break-inside: avoid;
          }
          
          .stage {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-content">
          <div class="logo">
            <img src="/assets/Logo_HubEdu.ia.svg" alt="HubEdu Logo" />
          </div>
          <div class="header-text">
            <h1 class="title">${safeLessonData.title}</h1>
            <div class="metadata">
              <span class="metadata-item">📚 ${safeLessonData.metadata.subject}</span>
              <span class="metadata-item">🎓 ${safeLessonData.metadata.grade}</span>
              <span class="metadata-item">⏱️ ${safeLessonData.metadata.duration}</span>
              <span class="metadata-item">📊 ${safeLessonData.metadata.difficulty}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Objetivos de Aprendizagem</h2>
        <ul class="objectives">
          ${safeLessonData.objectives.map(obj => `<li>${obj}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Introdução</h2>
        <p>${safeLessonData.introduction}</p>
      </div>

      <div class="section">
        <h2 class="section-title">Estrutura da Aula</h2>
        <div class="stages">
          ${safeLessonData.stages.map(stage => `
            <div class="stage">
              <h3 class="stage-title">${stage.etapa}</h3>
              <span class="stage-type">${stage.type}</span>
              <div class="stage-content">
                ${stage.activity?.content ? `<p>${stage.activity.content}</p>` : ''}
                ${renderStageImages(stage)}
                ${renderQuizQuestions(stage)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${safeLessonData.summary ? `
        <div class="section">
          <h2 class="section-title">Resumo</h2>
          <div class="summary">
            <p>${safeLessonData.summary}</p>
          </div>
        </div>
      ` : ''}

      ${safeLessonData.nextSteps && safeLessonData.nextSteps.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Próximos Passos</h2>
          <div class="next-steps">
            <ul>
              ${safeLessonData.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        <p class="app-name">HubEdu - Plataforma de Educação Interativa</p>
      </div>
    </body>
    </html>
  `

  // Escrever o HTML na janela de impressão
  printWindow.document.write(printHTML)
  printWindow.document.close()

  // Aguardar o carregamento das imagens antes de imprimir
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 1000) // Aguardar 1 segundo para carregar imagens
  }
}
