import { NextRequest, NextResponse } from 'next/server';

/**
 * INTELLIGENT Image Search API
 * 
 * Features:
 * - AI-powered query optimization (translates to educational terms)
 * - Multiple providers (Unsplash, Pixabay, Pexels) in parallel
 * - AI-powered filtering and ranking
 * - Smart caching
 * - 15 second timeout per provider
 * - Guaranteed quality educational images
 */

interface ImageSearchRequest {
  topic: string;
  count?: number;
}

interface FastImage {
  url: string;
  title: string;
  description: string;
  provider: string;
  attribution?: string;
  license?: string;
  author?: string;
  sourceUrl?: string;
  relevanceScore?: number;
}

// In-memory cache (simple and fast)
const imageCache = new Map<string, { images: FastImage[], timestamp: number, optimizedQuery: string }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Clean old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      imageCache.delete(key);
    }
  }
}, 1000 * 60 * 10); // Clean every 10 minutes

/**
 * Use AI to optimize search query for educational images
 */
async function optimizeQueryWithAI(topic: string): Promise<string> {
  try {
    console.log(`🤖 AI optimizing query: "${topic}"`);
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert in creating educational image search queries.

TASK: Transform this Portuguese topic into an optimal English search query for educational images.

TOPIC: "${topic}"

RULES:
1. Translate to English using SCIENTIFIC/EDUCATIONAL terms
2. Focus on visual, educational aspects (anatomy, diagrams, processes, systems)
3. Avoid abstract concepts - focus on concrete, photographable subjects
4. Use 2-4 specific keywords
5. Return ONLY the optimized query, nothing else

EXAMPLES:
- "Como funciona a respiração?" → "respiratory system anatomy diagram"
- "Como funciona a fotossíntese?" → "photosynthesis process plant cells"
- "Sistema solar" → "solar system planets astronomy"
- "DNA" → "dna structure double helix"

Respond with ONLY the optimized query:`;

    const result = await model.generateContent(prompt);
    const optimizedQuery = result.response.text().trim().replace(/['"]/g, '');
    
    console.log(`✅ AI optimized: "${topic}" → "${optimizedQuery}"`);
    return optimizedQuery;
  } catch (error) {
    console.error('❌ AI optimization failed:', (error as Error).message);
    // Fallback: simple translation
    const fallback = topic
      .toLowerCase()
      .replace(/como funciona a?/gi, '')
      .replace(/[?¿!¡.,;:]/g, '')
      .trim();
    console.log(`⚠️ Using fallback: "${fallback}"`);
    return fallback;
  }
}

/**
 * Search Unsplash
 */
async function searchUnsplashFast(query: string, count: number): Promise<FastImage[]> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ UNSPLASH_ACCESS_KEY not configured');
    return [];
  }

  try {
    console.log(`🔍 Unsplash search: "${query}" (${count} images)`);
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&content_filter=high`,
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
          'Accept-Version': 'v1'
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ Unsplash error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const images: FastImage[] = [];

    if (data.results && data.results.length > 0) {
      for (const photo of data.results.slice(0, count)) {
        images.push({
          url: photo.urls.regular,
          title: photo.alt_description || photo.description || query,
          description: photo.description || photo.alt_description || '',
          provider: 'unsplash',
          attribution: photo.user?.name || '',
          license: 'Unsplash License',
          author: photo.user?.name || '',
          sourceUrl: photo.links?.html || ''
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Unsplash returned ${images.length} images in ${duration}ms`);
    return images;

  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.error('❌ Unsplash search timeout (5s)');
    } else {
      console.error('❌ Unsplash search error:', (error as Error).message);
    }
    return [];
  }
}

/**
 * Search Pixabay
 */
async function searchPixabay(query: string, count: number): Promise<FastImage[]> {
  const apiKey = process.env.PIXABAY_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ PIXABAY_API_KEY not configured');
    return [];
  }

  try {
    console.log(`🔍 Pixabay search: "${query}" (${count} images)`);
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=${count}&safesearch=true`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ Pixabay error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const images: FastImage[] = [];

    if (data.hits && data.hits.length > 0) {
      for (const hit of data.hits.slice(0, count)) {
        images.push({
          url: hit.webformatURL,
          title: hit.tags || query,
          description: hit.tags || '',
          provider: 'pixabay',
          attribution: hit.user || '',
          license: 'Pixabay License',
          author: hit.user || '',
          sourceUrl: hit.pageURL || ''
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Pixabay returned ${images.length} images in ${duration}ms`);
    return images;

  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.error('❌ Pixabay search timeout (15s)');
    } else {
      console.error('❌ Pixabay search error:', (error as Error).message);
    }
    return [];
  }
}

/**
 * Search Pexels
 */
async function searchPexels(query: string, count: number): Promise<FastImage[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ PEXELS_API_KEY not configured');
    return [];
  }

  try {
    console.log(`🔍 Pexels search: "${query}" (${count} images)`);
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: { 'Authorization': apiKey },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ Pexels error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const images: FastImage[] = [];

    if (data.photos && data.photos.length > 0) {
      for (const photo of data.photos.slice(0, count)) {
        images.push({
          url: photo.src.large,
          title: photo.alt || query,
          description: photo.alt || '',
          provider: 'pexels',
          attribution: photo.photographer || '',
          license: 'Pexels License',
          author: photo.photographer || '',
          sourceUrl: photo.url || ''
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Pexels returned ${images.length} images in ${duration}ms`);
    return images;

  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.error('❌ Pexels search timeout (15s)');
    } else {
      console.error('❌ Pexels search error:', (error as Error).message);
    }
    return [];
  }
}

/**
 * Use AI to filter and rank images by educational relevance
 */
async function filterImagesWithAI(images: FastImage[], topic: string, targetCount: number): Promise<FastImage[]> {
  if (images.length === 0) return [];
  
  try {
    console.log(`🤖 AI filtering ${images.length} images for educational relevance`);
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const imageList = images.map((img, idx) => 
      `${idx + 1}. Title: "${img.title}", Provider: ${img.provider}`
    ).join('\n');

    const prompt = `You are an expert in selecting educational images.

TOPIC: "${topic}"

AVAILABLE IMAGES:
${imageList}

TASK: Select the ${targetCount} MOST EDUCATIONAL and RELEVANT images for this topic.

CRITERIA:
- Educational value (diagrams, anatomy, processes, scientific content)
- Direct relevance to the topic
- Avoid decorative/abstract images
- Prefer scientific/educational visuals

RESPONSE FORMAT (JSON only):
{
  "selected": [1, 3, 5, 7, 9, 11],
  "reasoning": "Brief explanation"
}

Return ONLY valid JSON:`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const selectedIndices = parsed.selected.map((idx: number) => idx - 1); // Convert to 0-indexed
      
      const filtered = selectedIndices
        .filter((idx: number) => idx >= 0 && idx < images.length)
        .map((idx: number) => ({ ...images[idx], relevanceScore: 95 }));
      
      console.log(`✅ AI selected ${filtered.length} best images: ${parsed.reasoning}`);
      return filtered.slice(0, targetCount);
    }
  } catch (error) {
    console.error('❌ AI filtering failed:', (error as Error).message);
  }
  
  // Fallback: return diverse images from different providers
  console.log('⚠️ Using fallback selection (diversified by provider)');
  const providerGroups = images.reduce((acc, img) => {
    if (!acc[img.provider]) acc[img.provider] = [];
    acc[img.provider].push(img);
    return acc;
  }, {} as Record<string, FastImage[]>);
  
  const diversified: FastImage[] = [];
  let providerIndex = 0;
  const providers = Object.keys(providerGroups);
  
  while (diversified.length < targetCount && providerIndex < images.length) {
    for (const provider of providers) {
      if (providerGroups[provider].length > 0) {
        const img = providerGroups[provider].shift();
        if (img) diversified.push({ ...img, relevanceScore: 80 });
        if (diversified.length >= targetCount) break;
      }
    }
    providerIndex++;
  }
  
  return diversified.slice(0, targetCount);
}

/**
 * Create simple SVG placeholders (instant fallback)
 */
function createPlaceholder(topic: string, index: number): FastImage {
  const colors = ['#4F46E5', '#059669', '#DC2626', '#7C3AED', '#D97706', '#0891B2'];
  const color = colors[index % colors.length];
  
  const svg = `
    <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="${color}" opacity="0.1"/>
      <rect x="100" y="100" width="1000" height="600" fill="white" stroke="${color}" stroke-width="3" rx="12"/>
      <circle cx="600" cy="300" r="80" fill="${color}" opacity="0.3"/>
      <rect x="450" y="400" width="300" height="120" fill="${color}" opacity="0.2" rx="8"/>
      <text x="600" y="580" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${color}">
        ${topic.toUpperCase()}
      </text>
      <text x="600" y="630" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="${color}" opacity="0.7">
        Imagem Educacional ${index + 1}
      </text>
    </svg>
  `;
  
  return {
    url: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
    title: `${topic} - Imagem ${index + 1}`,
    description: `Imagem educacional sobre ${topic}`,
    provider: 'placeholder',
    attribution: 'Sistema HE',
    license: 'Generated',
    author: 'HE System'
  };
}

/**
 * Main API handler
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { topic, count = 6 }: ImageSearchRequest = await request.json();

    if (!topic) {
      return NextResponse.json({
        success: false,
        error: 'Topic is required'
      }, { status: 400 });
    }

    console.log(`⚡ INTELLIGENT IMAGE SEARCH: "${topic}" (${count} images)`);

    // Check cache first
    const cacheKey = `${topic.toLowerCase().trim()}:${count}`;
    const cached = imageCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`✨ Cache hit: ${cached.images.length} images (${Date.now() - startTime}ms)`);
      console.log(`📝 Used optimized query: "${cached.optimizedQuery}"`);
      return NextResponse.json({
        success: true,
        images: cached.images,
        found: cached.images.length,
        requested: count,
        processingTime: Date.now() - startTime,
        cached: true,
        optimizedQuery: cached.optimizedQuery,
        provider: 'cache'
      });
    }

    // Step 1: Optimize query with AI
    const optimizedQuery = await optimizeQueryWithAI(topic);
    
    // Step 2: Search multiple providers in parallel
    console.log(`🔍 Searching ${count * 2} images across providers with: "${optimizedQuery}"`);
    const searchCount = Math.ceil(count * 2); // Get more images to have better selection
    
    const [unsplashResults, pixabayResults, pexelsResults] = await Promise.allSettled([
      searchUnsplashFast(optimizedQuery, searchCount),
      searchPixabay(optimizedQuery, searchCount),
      searchPexels(optimizedQuery, searchCount)
    ]);
    
    // Combine all results
    let allImages: FastImage[] = [];
    if (unsplashResults.status === 'fulfilled') allImages.push(...unsplashResults.value);
    if (pixabayResults.status === 'fulfilled') allImages.push(...pixabayResults.value);
    if (pexelsResults.status === 'fulfilled') allImages.push(...pexelsResults.value);
    
    console.log(`📊 Combined results: ${allImages.length} images from ${new Set(allImages.map(i => i.provider)).size} providers`);
    
    // Step 3: Use AI to filter and rank the best educational images
    let finalImages: FastImage[] = [];
    if (allImages.length > 0) {
      finalImages = await filterImagesWithAI(allImages, topic, count);
    }
    
    // Step 4: Fill with placeholders if needed
    if (finalImages.length < count) {
      const needed = count - finalImages.length;
      console.log(`📊 Adding ${needed} placeholders to reach ${count} images`);
      for (let i = 0; i < needed; i++) {
        finalImages.push(createPlaceholder(topic, finalImages.length + i));
      }
    }

    // Ensure we have exactly the requested count
    const images = finalImages.slice(0, count);
    
    // Cache the results
    imageCache.set(cacheKey, {
      images,
      timestamp: Date.now(),
      optimizedQuery
    });

    const processingTime = Date.now() - startTime;
    const providers = [...new Set(images.map(i => i.provider))];
    console.log(`✅ INTELLIGENT SEARCH COMPLETE: ${images.length} images in ${processingTime}ms`);
    console.log(`📦 Providers used: ${providers.join(', ')}`);

    return NextResponse.json({
      success: true,
      images,
      found: images.length,
      requested: count,
      processingTime,
      cached: false,
      optimizedQuery,
      providers,
      totalImagesFound: allImages.length
    });

  } catch (error) {
    console.error('❌ Fast image search error:', error);
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

/**
 * GET handler - API info
 */
export async function GET() {
  return NextResponse.json({
    name: 'Intelligent Image Search API',
    version: '3.0.0',
    description: 'AI-powered image search with multiple providers for educational content',
    features: [
      'AI-powered query optimization (Gemini)',
      'Multiple providers (Unsplash, Pixabay, Pexels)',
      'AI-powered filtering and ranking',
      '15 second timeout per provider',
      'In-memory caching (1 hour TTL)',
      'Smart placeholder fallback',
      'Guaranteed quality educational images'
    ],
    performance: {
      targetResponseTime: '<500ms for cached results',
      targetResponseTime_uncached: '<20s for new searches',
      cacheEnabled: true,
      cacheTTL: '1 hour',
      timeout: '15 seconds per provider',
      aiProcessing: 'Query optimization + Image filtering'
    },
    providers: {
      unsplash: {
        enabled: !!process.env.UNSPLASH_ACCESS_KEY,
        priority: 'high'
      },
      pixabay: {
        enabled: !!process.env.PIXABAY_API_KEY,
        priority: 'medium'
      },
      pexels: {
        enabled: !!process.env.PEXELS_API_KEY,
        priority: 'medium'
      }
    },
    aiFeatures: {
      queryOptimization: 'Gemini 2.0 Flash',
      imageFiltering: 'Gemini 2.0 Flash',
      educationalRelevance: 'Automated ranking'
    }
  });
}

