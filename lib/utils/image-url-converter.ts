/**
 * Utilitário para converter URLs do enem.dev para caminhos locais
 * Permite usar imagens armazenadas localmente em vez de buscar do servidor externo
 */

/**
 * Converte uma URL do enem.dev para caminho local
 * @param url - URL completa do enem.dev
 * @returns Caminho local relativo ao public ou a URL original se não for enem.dev
 * 
 * @example
 * // De: https://enem.dev/2023/questions/100/image.jpg
 * // Para: /QUESTOES_ENEM/public/2023/questions/100/image.jpg
 */
export function convertEnemDevUrlToLocal(url: string): string {
  if (!url) return url;
  
  // Verificar se é uma URL do enem.dev
  if (url.includes('enem.dev')) {
    // Extrair o caminho após enem.dev/
    const match = url.match(/enem\.dev\/(.+)/);
    if (match && match[1]) {
      // Retornar caminho local
      return `/QUESTOES_ENEM/public/${match[1]}`;
    }
  }
  
  // Se já for um caminho local, retornar como está
  if (url.startsWith('/QUESTOES_ENEM/')) {
    return url;
  }
  
  // Para outras URLs, retornar como está
  return url;
}

/**
 * Converte um array de URLs do enem.dev para caminhos locais
 * @param urls - Array de URLs
 * @returns Array com URLs convertidas
 */
export function convertEnemDevUrlsToLocal(urls: string[]): string[] {
  if (!urls || urls.length === 0) return urls;
  return urls.map(url => convertEnemDevUrlToLocal(url));
}

/**
 * Verifica se uma URL é do domínio enem.dev
 * @param url - URL a verificar
 * @returns true se for do enem.dev
 */
export function isEnemDevUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('enem.dev');
}

/**
 * Converte caminho local para URL do enem.dev (reverso)
 * Útil para fazer fallback se o arquivo local não existir
 * @param localPath - Caminho local
 * @returns URL do enem.dev
 * 
 * @example
 * // De: /QUESTOES_ENEM/public/2023/questions/100/image.jpg
 * // Para: https://enem.dev/2023/questions/100/image.jpg
 */
export function convertLocalToEnemDevUrl(localPath: string): string {
  if (!localPath) return localPath;
  
  // Verificar se é um caminho local do QUESTOES_ENEM
  if (localPath.startsWith('/QUESTOES_ENEM/public/')) {
    const relativePath = localPath.replace('/QUESTOES_ENEM/public/', '');
    return `https://enem.dev/${relativePath}`;
  }
  
  // Se já for uma URL, retornar como está
  return localPath;
}

/**
 * Processa uma questão convertendo todas as URLs de imagem para locais
 * @param question - Objeto da questão
 * @returns Questão com URLs convertidas
 */
export function processQuestionImages<T extends Record<string, any>>(question: T): T {
  const processed = { ...question } as any;
  
  // Converter image_url se existir
  if ('image_url' in processed && typeof processed.image_url === 'string') {
    processed.image_url = convertEnemDevUrlToLocal(processed.image_url);
  }
  
  // Converter asset_refs se existir (array de URLs)
  if ('asset_refs' in processed && Array.isArray(processed.asset_refs)) {
    processed.asset_refs = convertEnemDevUrlsToLocal(processed.asset_refs);
  }
  
  // Converter files se existir (array de URLs)
  if ('files' in processed && Array.isArray(processed.files)) {
    processed.files = convertEnemDevUrlsToLocal(processed.files);
  }
  
  // Processar alternativas se existirem
  if ('alternatives' in processed && Array.isArray(processed.alternatives)) {
    processed.alternatives = processed.alternatives.map((alt: any) => ({
      ...alt,
      file: alt.file ? convertEnemDevUrlToLocal(alt.file) : alt.file
    }));
  }
  
  return processed as T;
}

/**
 * Processa um array de questões convertendo todas as URLs de imagem para locais
 * @param questions - Array de questões
 * @returns Array de questões com URLs convertidas
 */
export function processQuestionsImages<T extends Record<string, any>>(questions: T[]): T[] {
  if (!questions || questions.length === 0) return questions;
  return questions.map(q => processQuestionImages(q));
}

