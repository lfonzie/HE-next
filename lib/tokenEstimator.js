// lib/tokenEstimator.js
// Estimador preciso de tokens e tempo para aulas educacionais

/**
 * Estimativa precisa de tokens baseada em português brasileiro
 * @param {string} text - Texto para estimar
 * @returns {number} - Número estimado de tokens
 */
export function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  
  // Regra prática para PT-BR: ~1 token por 4 caracteres
  // Considerando espaços, pontuação e caracteres especiais
  const baseEstimate = Math.ceil(text.length / 4);
  
  // Ajuste para palavras longas (mais comuns em PT-BR)
  const longWords = (text.match(/\b\w{8,}\b/g) || []).length;
  const adjustment = Math.ceil(longWords * 0.1);
  
  return baseEstimate + adjustment;
}

/**
 * Estimativa de palavras baseada na regra: 0,75 palavra por token em PT-BR
 * @param {number} tokens - Número de tokens
 * @returns {number} - Número estimado de palavras
 */
export function estimateWords(tokens) {
  return Math.round(tokens * 0.75);
}

/**
 * Calcula duração estimada da aula baseada no modo
 * @param {Array} slides - Array de slides com conteúdo
 * @param {string} mode - Modo da aula ('sync' ou 'async')
 * @returns {Object} - Objeto com estimativas detalhadas
 */
export function estimateLessonDuration(slides, mode = 'sync') {
  if (!Array.isArray(slides) || slides.length === 0) {
    return { totalMinutes: 0, breakdown: {} };
  }
  
  // Calcular tokens totais
  const totalTokens = slides.reduce((sum, slide) => {
    return sum + estimateTokens(slide.content || '');
  }, 0);
  
  const totalWords = estimateWords(totalTokens);
  
  if (mode === 'sync') {
    // Modo síncrono (professor conduzindo)
    const expositionTime = totalWords / 130; // ~130 palavras/min
    const pauses = expositionTime * 0.4; // +40% para pausas e exemplos
    const quizzesTime = 4 * 2; // 4 min por quiz (2 quizzes)
    const closingTime = 2.5; // Encerramento
    const totalMinutes = Math.round(expositionTime + pauses + quizzesTime + closingTime);
    
    return {
      totalMinutes,
      totalTokens,
      totalWords,
      breakdown: {
        exposition: Math.round(expositionTime),
        pauses: Math.round(pauses),
        quizzes: quizzesTime,
        closing: closingTime
      }
    };
  } else {
    // Modo assíncrono (autoestudo)
    const readingTime = totalWords / 210; // ~200-220 palavras/min
    const quizzesTime = 9; // ~8-10 min para responder quizzes
    const interactionsTime = 6.5; // ~5-8 min para interações
    const totalMinutes = Math.round(readingTime + quizzesTime + interactionsTime);
    
    return {
      totalMinutes,
      totalTokens,
      totalWords,
      breakdown: {
        reading: Math.round(readingTime),
        quizzes: quizzesTime,
        interactions: interactionsTime
      }
    };
  }
}

/**
 * Valida se um slide atende aos requisitos mínimos de tokens
 * @param {Object} slide - Objeto do slide
 * @param {number} minTokens - Mínimo de tokens requerido (padrão: 500)
 * @returns {Object} - Resultado da validação
 */
export function validateSlideTokens(slide, minTokens = 500) {
  const actualTokens = estimateTokens(slide.content || '');
  const isValid = actualTokens >= minTokens;
  
  return {
    isValid,
    actualTokens,
    minTokens,
    deficit: isValid ? 0 : minTokens - actualTokens,
    words: estimateWords(actualTokens)
  };
}

/**
 * Calcula métricas completas de uma aula
 * @param {Array} slides - Array de slides
 * @param {string} mode - Modo da aula
 * @returns {Object} - Métricas completas
 */
export function calculateLessonMetrics(slides, mode = 'sync') {
  const duration = estimateLessonDuration(slides, mode);
  const slideValidations = slides.map(slide => validateSlideTokens(slide));
  const validSlides = slideValidations.filter(v => v.isValid).length;
  const totalSlides = slides.length;
  
  // Calcular tamanho estimado das imagens
  const totalImagesSize = totalSlides * 0.35; // MB estimado (média 350 KB por imagem)
  
  return {
    ...duration,
    slideMetrics: {
      total: totalSlides,
      valid: validSlides,
      invalid: totalSlides - validSlides,
      averageTokens: Math.round(duration.totalTokens / totalSlides),
      averageWords: Math.round(duration.totalWords / totalSlides)
    },
    imageMetrics: {
      totalImages: totalSlides,
      estimatedSizeMB: Math.round(totalImagesSize * 100) / 100
    },
    qualityScore: Math.round((validSlides / totalSlides) * 100),
    recommendations: generateRecommendations(slideValidations, duration)
  };
}

/**
 * Gera recomendações baseadas nas métricas
 * @param {Array} slideValidations - Validações dos slides
 * @param {Object} duration - Estimativas de duração
 * @returns {Array} - Array de recomendações
 */
function generateRecommendations(slideValidations, duration) {
  const recommendations = [];
  
  // Verificar slides com poucos tokens
  const shortSlides = slideValidations.filter(v => !v.isValid);
  if (shortSlides.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `${shortSlides.length} slide(s) com menos de 500 tokens. Considere expandir o conteúdo.`
    });
  }
  
  // Verificar duração
  if (duration.totalMinutes < 40) {
    recommendations.push({
      type: 'info',
      message: 'Aula relativamente curta. Considere adicionar mais exemplos ou exercícios.'
    });
  } else if (duration.totalMinutes > 65) {
    recommendations.push({
      type: 'warning',
      message: 'Aula longa. Considere dividir em duas sessões ou reduzir conteúdo.'
    });
  }
  
  // Verificar qualidade geral
  const qualityScore = Math.round((slideValidations.filter(v => v.isValid).length / slideValidations.length) * 100);
  if (qualityScore >= 90) {
    recommendations.push({
      type: 'success',
      message: 'Excelente qualidade de conteúdo! Todos os slides atendem aos requisitos.'
    });
  }
  
  return recommendations;
}

/**
 * Formata métricas para exibição amigável
 * @param {Object} metrics - Métricas calculadas
 * @returns {Object} - Métricas formatadas
 */
export function formatMetricsForDisplay(metrics) {
  return {
    duration: {
      sync: `${metrics.totalMinutes} min`,
      async: `${Math.round(metrics.totalMinutes * 0.7)} min`
    },
    content: {
      tokens: metrics.totalTokens.toLocaleString(),
      words: metrics.totalWords.toLocaleString(),
      averagePerSlide: Math.round(metrics.totalTokens / metrics.slideMetrics.total)
    },
    quality: {
      score: `${metrics.qualityScore}%`,
      validSlides: `${metrics.slideMetrics.valid}/${metrics.slideMetrics.total}`,
      status: metrics.qualityScore >= 80 ? 'Excelente' : 
              metrics.qualityScore >= 60 ? 'Bom' : 'Precisa melhorar'
    },
    images: {
      count: metrics.imageMetrics.totalImages,
      size: `${metrics.imageMetrics.estimatedSizeMB} MB`
    }
  };
}
