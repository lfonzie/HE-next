/**
 * Unified Lesson Database Saver
 * Saves all generated lessons to Neon PostgreSQL
 */

import { prisma } from '@/lib/prisma';

export interface LessonToSave {
  id?: string;
  title: string;
  topic?: string;
  subject?: string;
  level?: string;
  slides: any[];
  userId: string;
  provider?: string;
  metadata?: any;
}

export interface SaveLessonResult {
  success: boolean;
  lessonId?: string;
  error?: string;
}

/**
 * Saves a generated lesson to Neon PostgreSQL database
 */
export async function saveLessonToDatabase(lesson: LessonToSave): Promise<SaveLessonResult> {
  try {
    // Generate lesson ID if not provided
    const lessonId = lesson.id || `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`💾 Salvando aula no Neon DB: ${lessonId}`);
    
    // Extract outline from slides
    const outline = lesson.slides.map((slide: any, index: number) => ({
      number: slide.number || slide.slideNumber || index + 1,
      title: slide.title || `Slide ${index + 1}`,
      type: slide.type || 'content',
      hasImage: !!(slide.imageUrl || slide.imageQuery)
    }));
    
    // Convert slides to cards format
    const cards = lesson.slides.map((slide: any, index: number) => ({
      number: slide.number || slide.slideNumber || index + 1,
      title: slide.title || `Slide ${index + 1}`,
      type: slide.type || 'content',
      content: slide.content || '',
      imageUrl: slide.imageUrl || null,
      imageQuery: slide.imageQuery || null,
      imageProvider: slide.imageProvider || null,
      questions: slide.questions || [],
      timeEstimate: slide.timeEstimate || 5,
      tokenEstimate: slide.tokenEstimate || 0
    }));
    
    // Prepare objective
    const objective = lesson.topic 
      ? `Aula sobre ${lesson.topic}` 
      : lesson.metadata?.objectives?.join(', ') || 'Aula educacional';
    
    // Save to database
    const savedLesson = await prisma.lessons.create({
      data: {
        id: lessonId,
        title: lesson.title,
        subject: lesson.subject || lesson.metadata?.subject || 'Geral',
        level: lesson.level || lesson.metadata?.grade || 'Ensino Médio',
        objective: objective,
        outline: outline,
        cards: cards,
        user_id: lesson.userId,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`✅ Aula salva com sucesso no Neon DB: ${savedLesson.id}`);
    console.log(`   - Título: ${savedLesson.title}`);
    console.log(`   - Slides: ${cards.length}`);
    console.log(`   - Usuário: ${lesson.userId}`);
    
    // Log AI request if provider is specified
    if (lesson.provider) {
      try {
        await prisma.ai_requests.create({
          data: {
            tenant_id: 'default',
            user_id: lesson.userId,
            session_id: `lesson_gen_${Date.now()}`,
            provider: lesson.provider === 'gemini' ? 'google' : lesson.provider === 'grok' ? 'xai' : lesson.provider,
            model: lesson.metadata?.model || (lesson.provider === 'gemini' ? 'gemini-2.0-flash-exp' : 'grok-4-fast-reasoning'),
            prompt_tokens: lesson.metadata?.usage?.inputTokens || 0,
            completion_tokens: lesson.metadata?.usage?.outputTokens || 0,
            total_tokens: lesson.metadata?.usage?.totalTokens || 0,
            cost_brl: lesson.metadata?.costEstimate || '0.00',
            latency_ms: lesson.metadata?.duration || 0,
            success: true,
            cache_hit: false
          }
        });
        
        console.log(`✅ Requisição AI registrada no banco de dados`);
      } catch (aiError) {
        console.warn('⚠️ Erro ao registrar requisição AI (não crítico):', (aiError as Error).message);
      }
    }
    
    return {
      success: true,
      lessonId: savedLesson.id
    };
    
  } catch (error) {
    console.error('❌ Erro ao salvar aula no Neon DB:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao salvar aula'
    };
  }
}

/**
 * Updates an existing lesson in the database
 */
export async function updateLessonInDatabase(lessonId: string, updates: Partial<LessonToSave>): Promise<SaveLessonResult> {
  try {
    console.log(`🔄 Atualizando aula no Neon DB: ${lessonId}`);
    
    const updateData: any = {
      updated_at: new Date()
    };
    
    if (updates.title) updateData.title = updates.title;
    if (updates.subject) updateData.subject = updates.subject;
    if (updates.level) updateData.level = updates.level;
    if (updates.slides) {
      const outline = updates.slides.map((slide: any, index: number) => ({
        number: slide.number || slide.slideNumber || index + 1,
        title: slide.title || `Slide ${index + 1}`,
        type: slide.type || 'content',
        hasImage: !!(slide.imageUrl || slide.imageQuery)
      }));
      
      const cards = updates.slides.map((slide: any, index: number) => ({
        number: slide.number || slide.slideNumber || index + 1,
        title: slide.title || `Slide ${index + 1}`,
        type: slide.type || 'content',
        content: slide.content || '',
        imageUrl: slide.imageUrl || null,
        imageQuery: slide.imageQuery || null,
        imageProvider: slide.imageProvider || null,
        questions: slide.questions || [],
        timeEstimate: slide.timeEstimate || 5,
        tokenEstimate: slide.tokenEstimate || 0
      }));
      
      updateData.outline = outline;
      updateData.cards = cards;
    }
    
    const updatedLesson = await prisma.lessons.update({
      where: { id: lessonId },
      data: updateData
    });
    
    console.log(`✅ Aula atualizada com sucesso: ${updatedLesson.id}`);
    
    return {
      success: true,
      lessonId: updatedLesson.id
    };
    
  } catch (error) {
    console.error('❌ Erro ao atualizar aula no Neon DB:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar aula'
    };
  }
}

/**
 * Retrieves a lesson from the database
 */
export async function getLessonFromDatabase(lessonId: string) {
  try {
    const lesson = await prisma.lessons.findUnique({
      where: { id: lessonId }
    });
    
    if (!lesson) {
      console.log(`⚠️ Aula não encontrada: ${lessonId}`);
      return null;
    }
    
    console.log(`✅ Aula recuperada do banco: ${lesson.id}`);
    return lesson;
    
  } catch (error) {
    console.error('❌ Erro ao buscar aula no Neon DB:', error);
    return null;
  }
}

/**
 * Lists all lessons for a user
 */
export async function getUserLessons(userId: string, limit: number = 50) {
  try {
    const lessons = await prisma.lessons.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit
    });
    
    console.log(`✅ ${lessons.length} aulas encontradas para usuário ${userId}`);
    return lessons;
    
  } catch (error) {
    console.error('❌ Erro ao buscar aulas do usuário:', error);
    return [];
  }
}

