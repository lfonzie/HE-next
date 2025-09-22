// app/api/aulas/utils/image-search.js - Utilitário para busca inteligente de imagens

/**
 * Busca uma imagem usando o sistema inteligente de busca
 * @param {string} imageQuery - Query para busca da imagem
 * @param {string} topic - Tópico da aula
 * @param {number} slideNumber - Número do slide
 * @returns {Object} Objeto com imageUrl, imageSource e metadados
 */
async function searchImageForSlide(imageQuery, topic, slideNumber) {
  let imageUrl = null;
  let imageSource = 'fallback';
  let metadata = {};

  try {
    // Usar a nova API de busca inteligente que busca nos 3 melhores provedores
    const smartSearchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/images/smart-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: imageQuery, 
        subject: topic, 
        count: 3 
      }),
    });
    
    if (smartSearchResponse.ok) {
      const smartSearchData = await smartSearchResponse.json();
      if (smartSearchData.success && smartSearchData.images?.length > 0) {
        // Selecionar a melhor imagem baseada no score de relevância
        const bestImage = smartSearchData.images[0];
        imageUrl = bestImage.url;
        imageSource = bestImage.source;
        metadata = {
          relevanceScore: bestImage.relevanceScore,
          sourcesUsed: smartSearchData.sourcesUsed,
          totalFound: smartSearchData.totalFound
        };
        console.log('Smart search image selected', { 
          slideNumber, 
          imageUrl, 
          source: imageSource,
          relevanceScore: bestImage.relevanceScore,
          sourcesUsed: smartSearchData.sourcesUsed
        });
      }
    }
  } catch (error) {
    console.warn('Failed to fetch smart search image', { slideNumber, error: error.message });
  }

  // Se ainda não encontrou imagem, tentar busca específica no Wikimedia como fallback
  if (!imageUrl) {
    try {
      const wikiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wikimedia/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: imageQuery, subject: topic, count: 1 }),
      });
      if (wikiResponse.ok) {
        const wikiData = await wikiResponse.json();
        if (wikiData.success && wikiData.photos?.length > 0) {
          imageUrl = wikiData.photos[0].urls?.regular || wikiData.photos[0].url;
          imageSource = 'wikimedia-fallback';
          metadata = { fallbackUsed: true };
          console.log('Wikimedia fallback image selected', { slideNumber, imageUrl });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch Wikimedia fallback image', { slideNumber, error: error.message });
    }
  }

  // Último recurso: buscar imagem específica do tópico no Unsplash
  if (!imageUrl) {
    try {
      const unsplashResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/illustrations/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: imageQuery, 
          category: topic.toLowerCase().includes('biologia') ? 'biology' : 
                   topic.toLowerCase().includes('química') ? 'chemistry' :
                   topic.toLowerCase().includes('física') ? 'physics' :
                   topic.toLowerCase().includes('matemática') ? 'math' : 'general',
          limit: 1 
        }),
      });
      if (unsplashResponse.ok) {
        const unsplashData = await unsplashResponse.json();
        if (unsplashData.success && unsplashData.images?.length > 0) {
          imageUrl = unsplashData.images[0].url;
          imageSource = 'unsplash-specific';
          metadata = { fallbackUsed: true };
          console.log('Unsplash specific image selected', { slideNumber, imageUrl });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch Unsplash specific image', { slideNumber, error: error.message });
    }
  }

  // Se ainda não encontrou imagem, usar uma imagem educacional específica do tópico
  if (!imageUrl) {
    const topicSpecificImage = await findTopicSpecificImage(topic, imageQuery);
    if (topicSpecificImage) {
      imageUrl = topicSpecificImage.url;
      imageSource = 'topic-specific';
      metadata = { fallbackUsed: true, topicSpecific: true };
      console.log('Topic specific image selected', { slideNumber, imageUrl });
    }
  }

  return {
    imageUrl,
    imageSource,
    metadata
  };
}

/**
 * Finds a topic-specific educational image as last resort.
 * @param {string} topic - The lesson topic.
 * @param {string} imageQuery - The image query.
 * @returns {Object|null} Image object or null.
 */
async function findTopicSpecificImage(topic, imageQuery) {
  try {
    // Mapear tópicos para imagens educacionais específicas
    const topicImages = {
      'matemática': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1350&h=1080&fit=crop&auto=format',
      'matematica': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1350&h=1080&fit=crop&auto=format',
      'física': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format',
      'fisica': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format',
      'química': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1350&h=1080&fit=crop&auto=format',
      'quimica': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1350&h=1080&fit=crop&auto=format',
      'biologia': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1350&h=1080&fit=crop&auto=format',
      'história': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1350&h=1080&fit=crop&auto=format',
      'historia': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1350&h=1080&fit=crop&auto=format',
      'geografia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1350&h=1080&fit=crop&auto=format',
      'português': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1350&h=1080&fit=crop&auto=format',
      'portugues': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1350&h=1080&fit=crop&auto=format'
    };
    
    const topicLower = topic.toLowerCase().trim();
    
    // Procurar por correspondência exata
    if (topicImages[topicLower]) {
      return {
        url: topicImages[topicLower],
        source: 'topic-specific',
        title: `Imagem educacional sobre ${topic}`,
        description: `Imagem específica para o tópico ${topic}`
      };
    }
    
    // Procurar por correspondência parcial
    for (const [key, url] of Object.entries(topicImages)) {
      if (topicLower.includes(key) || key.includes(topicLower)) {
        return {
          url: url,
          source: 'topic-specific',
          title: `Imagem educacional sobre ${topic}`,
          description: `Imagem específica para o tópico ${topic}`
        };
      }
    }
    
    // Se não encontrou correspondência específica, usar uma imagem educacional geral de alta qualidade
    return {
      url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1350&h=1080&fit=crop&auto=format',
      source: 'educational-general',
      title: 'Imagem educacional geral',
      description: 'Imagem educacional de alta qualidade'
    };
    
  } catch (error) {
    console.error('Erro ao buscar imagem específica do tópico:', error);
    return null;
  }
}

module.exports = {
  searchImageForSlide,
  findTopicSpecificImage
};
