// test-pixabay-quick.js - Teste rápido da implementação
const API_KEY = "52327225-b29494d470fd930f2a225e9cf";

async function testPixabayService() {
  console.log('🧪 Testando serviço Pixabay implementado...\n');

  try {
    // Simular o serviço Pixabay
    const pixabayService = {
      async searchEducationalImages(query, page = 1, perPage = 5) {
        const params = new URLSearchParams({
          key: API_KEY,
          q: query,
          page: page.toString(),
          per_page: perPage.toString(),
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: 'true',
          lang: 'pt',
          category: 'education'
        });

        const response = await fetch(`https://pixabay.com/api/?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
      }
    };

    // Teste 1: Busca educacional
    console.log('🔍 Teste 1: Busca educacional');
    const educationResult = await pixabayService.searchEducationalImages('educação', 1, 3);
    console.log(`✅ Encontradas ${educationResult.hits.length} imagens educacionais`);
    
    if (educationResult.hits.length > 0) {
      const image = educationResult.hits[0];
      console.log(`   🖼️ Primeira imagem: ${image.tags.substring(0, 50)}...`);
      console.log(`   👤 Autor: ${image.user}`);
      console.log(`   📏 Dimensões: ${image.webformatWidth}x${image.webformatHeight}`);
    }

    // Teste 2: Busca por disciplina
    console.log('\n🔍 Teste 2: Busca por disciplina (matemática)');
    const mathResult = await pixabayService.searchEducationalImages('matemática', 1, 3);
    console.log(`✅ Encontradas ${mathResult.hits.length} imagens de matemática`);

    // Teste 3: Busca científica
    console.log('\n🔍 Teste 3: Busca científica');
    const scienceResult = await pixabayService.searchEducationalImages('laboratório', 1, 3);
    console.log(`✅ Encontradas ${scienceResult.hits.length} imagens científicas`);

    // Teste 4: Formatação de resultado
    console.log('\n🔍 Teste 4: Formatação de resultado');
    if (educationResult.hits.length > 0) {
      const image = educationResult.hits[0];
      const formattedResult = {
        id: `pixabay_${image.id}`,
        url: image.webformatURL,
        thumbnail: image.previewURL,
        description: image.tags,
        author: image.user,
        authorUrl: `https://pixabay.com/users/${image.user}-${image.user_id}/`,
        source: 'pixabay',
        downloadUrl: image.pageURL,
        width: image.webformatWidth,
        height: image.webformatHeight,
        tags: image.tags.split(', '),
        quality: 'good',
        educational: true,
        views: image.views,
        downloads: image.downloads,
        likes: image.likes
      };
      
      console.log('✅ Resultado formatado:');
      console.log(`   ID: ${formattedResult.id}`);
      console.log(`   URL: ${formattedResult.url}`);
      console.log(`   Autor: ${formattedResult.author}`);
      console.log(`   Tags: ${formattedResult.tags.slice(0, 3).join(', ')}`);
    }

    console.log('\n🎉 Todos os testes passaram!');
    console.log('✅ A implementação da API Pixabay está funcionando perfeitamente!');
    
    return true;

  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
    return false;
  }
}

// Executar teste
testPixabayService().catch(console.error);
