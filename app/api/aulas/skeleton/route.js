import { NextResponse } from 'next/server';
import { log } from '@/lib/lesson-logger';
import { prisma } from '@/lib/db';

/**
 * Gera estrutura básica da aula (esqueleto) para carregamento progressivo
 * @param {string} topic - Tópico da aula
 * @returns {Object} - Estrutura da aula
 */
function generateLessonSkeleton(topic) {
  return {
    id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: topic,
    subject: topic,
    level: 'Intermediário',
    objectives: [
      `Compreender os conceitos fundamentais sobre ${topic}`,
      `Aplicar conhecimentos através de atividades práticas`,
      `Desenvolver pensamento crítico sobre o tema`,
      `Conectar o aprendizado com situações do cotidiano`
    ],
    stages: Array.from({ length: 14 }, (_, index) => {
      const slideNumber = index + 1;
      let title, type, component;
      
      switch (slideNumber) {
        case 1:
          title = "Abertura: Tema e Objetivos";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 2:
          title = "Conceitos Fundamentais";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 3:
          title = "Desenvolvimento dos Processos";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 4:
          title = "Aplicações Práticas";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 5:
          title = "Variações e Adaptações";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 6:
          title = "Conexões Avançadas";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 7:
          title = "Quiz: Conceitos Básicos";
          type = "Avaliação";
          component = "QuizComponent";
          break;
        case 8:
          title = "Aprofundamento";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 9:
          title = "Exemplos Práticos";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 10:
          title = "Análise Crítica";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 11:
          title = "Síntese Intermediária";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 12:
          title = "Quiz: Análise Situacional";
          type = "Avaliação";
          component = "QuizComponent";
          break;
        case 13:
          title = "Aplicações Futuras";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 14:
          title = "Encerramento: Síntese Final";
          type = "Encerramento";
          component = "AnimationSlide";
          break;
        default:
          title = `Slide ${slideNumber}`;
          type = "Conteúdo";
          component = "AnimationSlide";
      }
      
      return {
        etapa: title,
        type: type,
        activity: {
          component: component,
          content: `Carregando conteúdo do slide ${slideNumber}...`,
          imageUrl: null,
          imagePrompt: null
        },
        route: `/${type.toLowerCase()}`,
        estimatedTime: type === "Avaliação" ? 10 : 5,
        loading: true // Indica que o conteúdo ainda está sendo carregado
      };
    }),
    metadata: {
      subject: topic,
      grade: 'Ensino Médio',
      duration: '45-60 minutos',
      difficulty: 'Intermediário',
      tags: [topic.toLowerCase()],
      status: 'loading' // Indica que a aula está sendo carregada progressivamente
    }
  };
}

export async function POST(request) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { topic, schoolId } = await request.json();
    
    const baseContext = {
      requestId,
      topic,
      schoolId,
      timestamp: new Date().toISOString()
    };
    
    log.info('🎓 Gerando esqueleto da aula', baseContext, {
      topic,
      schoolId: schoolId || 'N/A'
    });
    
    if (!topic) {
      log.validationError('topic', topic, 'string não vazia', baseContext);
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 });
    }
    
    const skeleton = generateLessonSkeleton(topic);
    
    // Save lesson skeleton to database
    try {
      console.log('💾 Saving lesson skeleton to database:', skeleton.id);
      
      const savedLesson = await prisma.lessons.create({
        data: {
          id: skeleton.id,
          title: skeleton.title,
          subject: skeleton.subject,
          level: skeleton.level,
          objective: skeleton.objectives?.join(', ') || '',
          outline: skeleton.stages.map(stage => ({
            etapa: stage.etapa,
            type: stage.type,
            route: stage.route,
            loading: stage.loading
          })),
          cards: skeleton.stages.map(stage => ({
            type: stage.type,
            title: stage.etapa,
            content: stage.activity?.content || '',
            prompt: stage.activity?.prompt || '',
            questions: stage.activity?.questions || [],
            time: stage.activity?.time || 5,
            points: stage.activity?.points || 0
          })),
          user_id: null // Demo lesson
        }
      });
      
      console.log('✅ Lesson skeleton saved successfully:', savedLesson.id);
      
      log.success('💾 Esqueleto da aula salvo no banco', baseContext, {
        lessonId: savedLesson.id,
        stagesCount: skeleton.stages.length,
        topic: skeleton.title
      });
      
    } catch (dbError) {
      console.error('❌ Error saving lesson skeleton to database:', dbError);
      log.error('❌ Erro ao salvar esqueleto no banco', baseContext, {
        error: dbError.message,
        lessonId: skeleton.id
      });
      // Continue even if database save fails
    }
    
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    
    log.success('📊 Esqueleto da aula gerado', baseContext, {
      totalDuration,
      stagesCount: skeleton.stages.length,
      topic: skeleton.title
    });
    
    return NextResponse.json({
      success: true,
      lessonId: skeleton.id,
      skeleton: skeleton,
      topic,
      metadata: {
        duration: totalDuration,
        stagesGenerated: skeleton.stages.length,
        status: 'skeleton_ready'
      }
    });
    
  } catch (error) {
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    console.error(`❌ [${totalDuration}s] Erro na geração do esqueleto:`, error);
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}