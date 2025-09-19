// lib/unsplash-enhanced.js
// Integração aprimorada com Unsplash para aulas educacionais

import { createApi } from 'unsplash-js';

const unsplash = createApi({ 
  accessKey: process.env.UNSPLASH_ACCESS_KEY 
});

/**
 * Busca imagem otimizada do Unsplash para slides educacionais
 * @param {string} query - Query de busca para a imagem
 * @param {string} subject - Matéria/disciplina para contexto
 * @returns {Object|null} - Objeto com URL, alt text e estimativa de tamanho
 */
export async function searchUnsplashImage(query, subject = 'Geral') {
  try {
    // Otimizar query para contexto educacional
    const educationalQuery = optimizeQueryForEducation(query, subject);
    
    const result = await unsplash.search.getPhotos({ 
      query: educationalQuery, 
      perPage: 1, 
      orientation: 'landscape',
      contentFilter: 'high' // Filtro para conteúdo apropriado
    });
    
    if (result.errors) {
      console.error('Unsplash API errors:', result.errors);
      throw new Error(result.errors[0]);
    }
    
    if (!result.response.results.length) {
      console.warn(`No images found for query: ${educationalQuery}`);
      return null;
    }
    
    const photo = result.response.results[0];
    
    return {
      url: photo.urls.regular, // Resolução otimizada (~1200px)
      alt: photo.alt_description || `Imagem educacional sobre ${query}`,
      sizeEstimate: '200-500 KB', // Estimativa para otimização
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      unsplashUrl: photo.links.html,
      width: photo.width,
      height: photo.height
    };
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return null;
  }
}

/**
 * Otimiza query de busca para contexto educacional
 * @param {string} query - Query original
 * @param {string} subject - Matéria/disciplina
 * @returns {string} - Query otimizada
 */
function optimizeQueryForEducation(query, subject) {
  const educationalTerms = {
    'Ciências': 'science education laboratory',
    'Matemática': 'mathematics education school',
    'História': 'history education classroom',
    'Geografia': 'geography education world map',
    'Português': 'portuguese language education',
    'Física': 'physics education experiment',
    'Química': 'chemistry education laboratory',
    'Biologia': 'biology education microscope',
    'Fotossíntese': 'photosynthesis plants biology education',
    'Quiz': 'quiz education test classroom'
  };
  
  const baseQuery = query.toLowerCase();
  const subjectContext = educationalTerms[subject] || 'education classroom';
  
  // Adicionar contexto educacional se não estiver presente
  if (!baseQuery.includes('education') && !baseQuery.includes('school') && !baseQuery.includes('classroom')) {
    return `${query} ${subjectContext}`;
  }
  
  return query;
}

/**
 * Busca múltiplas imagens para uma aula completa
 * @param {Array} slides - Array de slides com imageQuery
 * @returns {Array} - Slides com imagens populadas apenas no primeiro e último
 */
export async function populateLessonWithImages(slides) {
  console.log('🖼️ Populando imagens apenas no primeiro e último slide...');
  
  const slidesWithImages = await Promise.all(
    slides.map(async (slide, index) => {
      // Apenas primeiro slide (index 0) e último slide (index slides.length - 1)
      const isFirstSlide = index === 0
      const isLastSlide = index === slides.length - 1
      
      if (slide.imageQuery && (isFirstSlide || isLastSlide)) {
        try {
          const image = await searchUnsplashImage(slide.imageQuery, slide.subject);
          if (image) {
            console.log(`✅ Imagem ${index + 1}/${slides.length} (${isFirstSlide ? 'primeiro' : 'último'}): ${slide.imageQuery}`);
            return { ...slide, image };
          } else {
            console.warn(`⚠️ Imagem não encontrada para slide ${index + 1}: ${slide.imageQuery}`);
            return slide;
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar imagem para slide ${index + 1}:`, error);
          return slide;
        }
      }
      
      // Para slides intermediários, remover image se existir
      const { image, ...slideWithoutImage } = slide;
      return slideWithoutImage;
    })
  );
  
  console.log('✅ Processo de imagens concluído (apenas primeiro e último slide)');
  return slidesWithImages;
}

/**
 * Gera queries de imagem otimizadas para cada tipo de slide
 * @param {string} topic - Tópico da aula
 * @param {number} slideNumber - Número do slide
 * @param {string} slideType - Tipo do slide (content/quiz/closing)
 * @returns {string} - Query otimizada para busca
 */
export function generateImageQuery(topic, slideNumber, slideType) {
  // Retornar apenas o tema principal, sem termos adicionais
  return topic;
}

/**
 * Valida se uma imagem é apropriada para contexto educacional
 * @param {Object} image - Objeto da imagem do Unsplash
 * @returns {boolean} - Se a imagem é apropriada
 */
export function validateEducationalImage(image) {
  if (!image) return false;
  
  // Verificar se não contém conteúdo inapropriado
  const inappropriateTerms = ['adult', 'violence', 'weapon', 'drug'];
  const description = (image.alt || '').toLowerCase();
  
  return !inappropriateTerms.some(term => description.includes(term));
}
