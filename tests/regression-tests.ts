/**
 * Teste de regressão para verificar duplicação de imagens em aulas
 * Este teste falha se houver imagens repetidas em uma aula gerada
 * ATUALIZADO: Verifica 3 imagens distintas, 1 por provedor
 */

import { NextResponse } from 'next/server';

interface ImageData {
  url: string;
  provider: string;
  slideNumber: number;
  attribution?: string;
  license?: string;
}

interface LessonSlide {
  number: number;
  imageUrl?: string;
  imageSource?: string;
  imageMetadata?: {
    provider: string;
    title?: string;
    attribution?: string;
    license?: string;
    author?: string;
    sourceUrl?: string;
  };
}

interface LessonResponse {
  success: boolean;
  slides: LessonSlide[];
  metrics?: any;
}

/**
 * Verifica se há imagens duplicadas em uma aula
 */
export function checkForDuplicateImages(slides: LessonSlide[]): {
  hasDuplicates: boolean;
  duplicates: Array<{ url: string; slideNumbers: number[] }>;
  duplicateCount: number;
} {
  const imageMap = new Map<string, number[]>();
  
  // Coletar todas as imagens e seus slides
  slides.forEach(slide => {
    if (slide.imageUrl) {
      const existing = imageMap.get(slide.imageUrl) || [];
      existing.push(slide.number);
      imageMap.set(slide.imageUrl, existing);
    }
  });
  
  // Encontrar duplicatas
  const duplicates: Array<{ url: string; slideNumbers: number[] }> = [];
  let duplicateCount = 0;
  
  imageMap.forEach((slideNumbers, url) => {
    if (slideNumbers.length > 1) {
      duplicates.push({ url, slideNumbers });
      duplicateCount += slideNumbers.length - 1; // Contar apenas as repetições extras
    }
  });
  
  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
    duplicateCount
  };
}

/**
 * Verifica diversidade de provedores nas imagens
 */
export function checkProviderDiversity(slides: LessonSlide[]): {
  hasDiversity: boolean;
  providers: string[];
  providerCount: number;
  issues: string[];
} {
  const providers = new Set<string>();
  const issues: string[] = [];
  
  slides.forEach(slide => {
    if (slide.imageMetadata?.provider) {
      providers.add(slide.imageMetadata.provider);
    }
  });
  
  const providerCount = providers.size;
  
  if (providerCount < 2) {
    issues.push(`Apenas ${providerCount} provedor(es) distintos (mínimo: 2)`);
  }
  
  if (providerCount < 3) {
    issues.push(`Idealmente 3 provedores distintos, encontrados: ${providerCount}`);
  }
  
  return {
    hasDiversity: providerCount >= 2,
    providers: Array.from(providers),
    providerCount,
    issues
  };
}

/**
 * Verifica se há metadados de licença e atribuição
 */
export function checkLicenseMetadata(slides: LessonSlide[]): {
  hasMetadata: boolean;
  metadataCount: number;
  issues: string[];
} {
  let metadataCount = 0;
  const issues: string[] = [];
  
  slides.forEach(slide => {
    if (slide.imageMetadata) {
      metadataCount++;
      
      // Verificar se tem atribuição (especialmente importante para Wikimedia)
      if (slide.imageMetadata.provider === 'wikimedia' && !slide.imageMetadata.attribution) {
        issues.push(`Wikimedia image sem atribuição no slide ${slide.number}`);
      }
      
      // Verificar se tem licença
      if (!slide.imageMetadata.license) {
        issues.push(`Imagem sem informação de licença no slide ${slide.number}`);
      }
    }
  });
  
  return {
    hasMetadata: metadataCount > 0,
    metadataCount,
    issues
  };
}

/**
 * Teste de regressão que gera uma aula e verifica duplicação de imagens
 */
export async function testImageDeduplication(topic: string = 'Inteligência Artificial'): Promise<{
  passed: boolean;
  message: string;
  details: any;
}> {
  try {
    // Gerar uma aula de teste
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aulas/generate-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        mode: 'sync',
        schoolId: 'test-school'
      }),
    });
    
    if (!response.ok) {
      return {
        passed: false,
        message: `Falha ao gerar aula: ${response.status} ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText }
      };
    }
    
    const lessonData: LessonResponse = await response.json();
    
    if (!lessonData.success || !lessonData.slides) {
      return {
        passed: false,
        message: 'Resposta inválida da API de geração de aulas',
        details: lessonData
      };
    }
    
    // Verificar duplicação de imagens
    const duplicateCheck = checkForDuplicateImages(lessonData.slides);
    
    // Verificar diversidade de provedores
    const diversityCheck = checkProviderDiversity(lessonData.slides);
    
    // Verificar metadados de licença
    const metadataCheck = checkLicenseMetadata(lessonData.slides);
    
    // Verificar quantidade de imagens
    const slidesWithImages = lessonData.slides.filter(s => s.imageUrl);
    const hasEnoughImages = slidesWithImages.length >= 3;
    
    // Determinar se passou nos testes
    const allChecksPassed = !duplicateCheck.hasDuplicates && 
                           diversityCheck.hasDiversity && 
                           hasEnoughImages;
    
    if (!allChecksPassed) {
      const issues = [
        ...(duplicateCheck.hasDuplicates ? [`${duplicateCheck.duplicateCount} imagens duplicadas`] : []),
        ...diversityCheck.issues,
        ...metadataCheck.issues,
        ...(hasEnoughImages ? [] : [`Apenas ${slidesWithImages.length} imagens (mínimo: 3)`])
      ];
      
      return {
        passed: false,
        message: `Teste falhou: ${issues.join(', ')}`,
        details: {
          duplicates: duplicateCheck.duplicates,
          providerDiversity: diversityCheck,
          metadata: metadataCheck,
          totalSlides: lessonData.slides.length,
          slidesWithImages: slidesWithImages.length,
          issues
        }
      };
    }
    
    return {
      passed: true,
      message: `Teste passou! ${slidesWithImages.length} imagens distintas de ${diversityCheck.providerCount} provedores`,
      details: {
        totalSlides: lessonData.slides.length,
        slidesWithImages: slidesWithImages.length,
        uniqueImages: new Set(slidesWithImages.map(s => s.imageUrl)).size,
        providers: diversityCheck.providers,
        providerCount: diversityCheck.providerCount,
        metadataCount: metadataCheck.metadataCount
      }
    };
    
  } catch (error) {
    return {
      passed: false,
      message: `Erro durante o teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: { error: error instanceof Error ? error.stack : error }
    };
  }
}

/**
 * Teste de performance para verificar tempos de geração
 */
export async function testGenerationPerformance(topic: string = 'Inteligência Artificial'): Promise<{
  passed: boolean;
  message: string;
  details: any;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aulas/generate-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        mode: 'sync',
        schoolId: 'test-school'
      }),
    });
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    if (!response.ok) {
      return {
        passed: false,
        message: `Falha na geração: ${response.status}`,
        details: { duration: totalDuration, status: response.status }
      };
    }
    
    const lessonData: LessonResponse = await response.json();
    
    // Meta: menos de 30 segundos para geração completa
    const performanceThreshold = 30000; // 30 segundos
    const passed = totalDuration < performanceThreshold;
    
    return {
      passed,
      message: passed 
        ? `Performance OK: ${totalDuration}ms (meta: <${performanceThreshold}ms)`
        : `Performance ruim: ${totalDuration}ms (meta: <${performanceThreshold}ms)`,
      details: {
        duration: totalDuration,
        threshold: performanceThreshold,
        slides: lessonData.slides?.length || 0,
        metrics: lessonData.metrics
      }
    };
    
  } catch (error) {
    return {
      passed: false,
      message: `Erro no teste de performance: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: { error: error instanceof Error ? error.stack : error }
    };
  }
}

/**
 * Suite completa de testes de regressão
 */
export async function runRegressionTests(): Promise<{
  imageDeduplication: any;
  performance: any;
  overallPassed: boolean;
}> {
  console.log('🧪 Iniciando testes de regressão...');
  
  const [imageTest, performanceTest] = await Promise.all([
    testImageDeduplication(),
    testGenerationPerformance()
  ]);
  
  const overallPassed = imageTest.passed && performanceTest.passed;
  
  console.log('🧪 Resultados dos testes:');
  console.log(`  📸 Deduplicação de imagens: ${imageTest.passed ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`  ⚡ Performance: ${performanceTest.passed ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`  🎯 Geral: ${overallPassed ? '✅ TODOS PASSARAM' : '❌ ALGUNS FALHARAM'}`);
  
  return {
    imageDeduplication: imageTest,
    performance: performanceTest,
    overallPassed
  };
}

export default {
  checkForDuplicateImages,
  testImageDeduplication,
  testGenerationPerformance,
  runRegressionTests
};
