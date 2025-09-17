// examples/aulas-enhanced-usage.js
// Exemplo prático de uso do Sistema de Aulas Aprimorado

import fetch from 'node-fetch';

class AulasEnhancedAPI {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Cria uma nova aula com carregamento progressivo
   * @param {string} topic - Tópico da aula
   * @returns {Promise<Object>} Dados da aula criada
   */
  async createLesson(topic) {
    console.log(`🎓 Criando aula sobre: ${topic}`);

    // 1. Gerar esqueleto da aula
    const skeleton = await this.generateSkeleton(topic);
    console.log(`✅ Esqueleto criado: ${skeleton.id}`);

    // 2. Carregar slides iniciais
    const initialSlides = await this.loadInitialSlides(topic);
    console.log(`✅ Slides iniciais carregados: ${initialSlides.length}`);

    // 3. Atualizar esqueleto com slides iniciais
    const lesson = {
      ...skeleton,
      stages: skeleton.stages.map((stage, index) => {
        if (index < 2 && initialSlides[index]) {
          return {
            ...stage,
            content: initialSlides[index].content,
            imageUrl: initialSlides[index].imageUrl,
            imagePrompt: initialSlides[index].imageQuery
          };
        }
        return stage;
      })
    };

    console.log(`🎉 Aula criada com sucesso!`);
    return lesson;
  }

  /**
   * Gera esqueleto da aula
   * @param {string} topic - Tópico da aula
   * @returns {Promise<Object>} Esqueleto da aula
   */
  async generateSkeleton(topic) {
    const response = await fetch(`${this.baseUrl}/aulas/skeleton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar esqueleto: ${response.status}`);
    }

    const data = await response.json();
    return data.skeleton;
  }

  /**
   * Carrega os 2 primeiros slides
   * @param {string} topic - Tópico da aula
   * @returns {Promise<Array>} Slides iniciais
   */
  async loadInitialSlides(topic) {
    const response = await fetch(`${this.baseUrl}/aulas/initial-slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (!response.ok) {
      throw new Error(`Erro ao carregar slides iniciais: ${response.status}`);
    }

    const data = await response.json();
    return data.slides;
  }

  /**
   * Carrega próximo slide sob demanda
   * @param {string} topic - Tópico da aula
   * @param {number} slideNumber - Número do slide
   * @param {Array} previousSlides - Slides anteriores
   * @returns {Promise<Object>} Próximo slide
   */
  async loadNextSlide(topic, slideNumber, previousSlides = []) {
    const response = await fetch(`${this.baseUrl}/aulas/next-slide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        slideNumber,
        previousSlides
      })
    });

    if (!response.ok) {
      throw new Error(`Erro ao carregar próximo slide: ${response.status}`);
    }

    const data = await response.json();
    return data.slide;
  }

  /**
   * Atualiza progresso de uma etapa
   * @param {string} lessonId - ID da aula
   * @param {number} etapa - Número da etapa
   * @param {boolean} completed - Se foi concluída
   * @param {number} points - Pontos ganhos
   * @returns {Promise<Object>} Resultado da atualização
   */
  async updateProgress(lessonId, etapa, completed, points = 0) {
    const response = await fetch(`${this.baseUrl}/aulas/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId,
        etapa,
        completed,
        points
      })
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar progresso: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Busca progresso da aula
   * @param {string} lessonId - ID da aula
   * @returns {Promise<Object>} Dados da aula
   */
  async getProgress(lessonId) {
    const response = await fetch(`${this.baseUrl}/aulas/progress?lessonId=${lessonId}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar progresso: ${response.status}`);
    }

    const data = await response.json();
    return data.lesson;
  }

  /**
   * Simula navegação pela aula com carregamento progressivo
   * @param {Object} lesson - Dados da aula
   * @param {string} topic - Tópico da aula
   */
  async simulateLessonNavigation(lesson, topic) {
    console.log(`\n📚 Simulando navegação pela aula: ${lesson.title}`);
    console.log(`📊 Total de etapas: ${lesson.stages.length}`);

    for (let i = 0; i < lesson.stages.length; i++) {
      const stage = lesson.stages[i];
      console.log(`\n📍 Etapa ${stage.etapa}: ${stage.title}`);

      // Se não tem conteúdo, carregar slide
      if (!stage.content) {
        console.log(`   ⏳ Carregando slide ${stage.etapa}...`);
        
        const previousSlides = lesson.stages
          .filter((_, index) => index < i)
          .map(s => ({ title: s.title, content: s.content || '' }));

        const slide = await this.loadNextSlide(topic, stage.etapa, previousSlides);
        
        // Atualizar etapa com conteúdo
        lesson.stages[i] = {
          ...stage,
          content: slide.content,
          imageUrl: slide.imageUrl,
          imagePrompt: slide.imageQuery,
          questions: slide.questions
        };

        console.log(`   ✅ Slide carregado: ${slide.title}`);
      } else {
        console.log(`   ✅ Slide já carregado`);
      }

      // Simular conclusão da etapa
      console.log(`   🎯 Marcando etapa como concluída...`);
      await this.updateProgress(lesson.id, stage.etapa, true, stage.type === 'Avaliação' ? 0 : 5);
      
      // Pequena pausa para simular tempo de estudo
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n🎉 Aula concluída com sucesso!`);
    
    // Buscar progresso final
    const finalProgress = await this.getProgress(lesson.id);
    console.log(`📊 Progresso final: ${finalProgress?.progress || 'N/A'}`);
  }
}

// Exemplo de uso
async function exemploUso() {
  const api = new AulasEnhancedAPI();
  
  try {
    // Criar aula sobre Física dos esportes
    const lesson = await api.createLesson('Física dos esportes');
    
    // Simular navegação com carregamento progressivo
    await api.simulateLessonNavigation(lesson, 'Física dos esportes');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar exemplo se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  exemploUso();
}

export default AulasEnhancedAPI;
