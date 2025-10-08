/**
 * Image Provider Configuration
 * 
 * Centralized configuration for image generation providers
 */

export type ImageProvider = 'gemini' | 'grok';

export interface ImageProviderInfo {
  id: ImageProvider;
  name: string;
  description: string;
  model: string;
  features: string[];
  pros: string[];
  cons: string[];
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'low';
  cost: number; // USD per image
  maxImagesPerRequest: number;
  rateLimit: string;
  configured: boolean;
}

/**
 * Check if provider is configured
 */
export function isProviderConfigured(provider: ImageProvider): boolean {
  if (provider === 'gemini') {
    return !!(
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY
    );
  } else if (provider === 'grok') {
    return !!process.env.XAI_API_KEY;
  }
  return false;
}

/**
 * Get provider information
 */
export function getProviderInfo(provider: ImageProvider): ImageProviderInfo {
  const providers: Record<ImageProvider, ImageProviderInfo> = {
    gemini: {
      id: 'gemini',
      name: 'Google Gemini 2.5 Flash Image',
      description: 'High-quality image generation from Google with inline base64 images',
      model: 'gemini-2.5-flash-image-preview',
      features: [
        'Base64 inline images',
        'High quality scientific diagrams',
        'Educational content focused',
        'Text-free image generation'
      ],
      pros: [
        'Very high image quality',
        'Excellent for scientific/educational content',
        'Good at following complex prompts',
        'Integrated with other Gemini features'
      ],
      cons: [
        'Slower generation (1-3s per image)',
        'Base64 images are large (storage intensive)',
        'Sequential processing only',
        'Rate limits apply'
      ],
      speed: 'medium',
      quality: 'high',
      cost: 0, // Currently free in preview
      maxImagesPerRequest: 1,
      rateLimit: '60 requests per minute',
      configured: isProviderConfigured('gemini')
    },
    grok: {
      id: 'grok',
      name: 'xAI Grok Image Generation',
      description: 'Fast image generation from xAI with URL-based images',
      model: 'grok-2-image-1212',
      features: [
        'URL-based images (lighter)',
        'Batch generation support',
        'Fast generation speed',
        'Up to 10 images per request'
      ],
      pros: [
        'Very fast generation (<1s per image)',
        'Batch processing (up to 10 images)',
        'URL-based (lighter than base64)',
        'Good cost per image ($0.07)',
        'High rate limit (5 req/sec)'
      ],
      cons: [
        'Images stored on xAI servers',
        'May have shorter retention period',
        'Slightly lower quality than Gemini',
        'Paid service ($0.07 per image)'
      ],
      speed: 'fast',
      quality: 'medium',
      cost: 0.07, // USD per image
      maxImagesPerRequest: 10,
      rateLimit: '5 requests per second',
      configured: isProviderConfigured('grok')
    }
  };

  return providers[provider];
}

/**
 * Get all available providers
 */
export function getAvailableProviders(): ImageProviderInfo[] {
  const allProviders: ImageProvider[] = ['gemini', 'grok'];
  return allProviders
    .map(p => getProviderInfo(p))
    .filter(info => info.configured);
}

/**
 * Get recommended provider based on context
 */
export function getRecommendedProvider(
  context: {
    imageCount?: number;
    needsHighQuality?: boolean;
    needsSpeed?: boolean;
    budget?: number;
  }
): ImageProvider {
  const { imageCount = 1, needsHighQuality = false, needsSpeed = false, budget = 0 } = context;
  
  const availableProviders = getAvailableProviders();
  
  if (availableProviders.length === 0) {
    throw new Error('No image generation provider configured');
  }

  // If only one provider is configured, use it
  if (availableProviders.length === 1) {
    return availableProviders[0].id;
  }

  // If high quality is required, prefer Gemini
  if (needsHighQuality) {
    const gemini = availableProviders.find(p => p.id === 'gemini');
    if (gemini) return 'gemini';
  }

  // If speed is critical, prefer Grok
  if (needsSpeed) {
    const grok = availableProviders.find(p => p.id === 'grok');
    if (grok) return 'grok';
  }

  // If generating many images at once, prefer Grok (batch support)
  if (imageCount > 3) {
    const grok = availableProviders.find(p => p.id === 'grok');
    if (grok) return 'grok';
  }

  // If on a budget, prefer Gemini (currently free)
  if (budget === 0) {
    const gemini = availableProviders.find(p => p.id === 'gemini');
    if (gemini) return 'gemini';
  }

  // Default to first available provider
  return availableProviders[0].id;
}

/**
 * Calculate estimated cost for image generation
 */
export function calculateCost(provider: ImageProvider, imageCount: number): number {
  const info = getProviderInfo(provider);
  return info.cost * imageCount;
}

/**
 * Get provider status summary
 */
export function getProviderStatus(): {
  total: number;
  configured: number;
  providers: Record<ImageProvider, boolean>;
} {
  const allProviders: ImageProvider[] = ['gemini', 'grok'];
  const configured = allProviders.filter(p => isProviderConfigured(p));
  
  return {
    total: allProviders.length,
    configured: configured.length,
    providers: {
      gemini: isProviderConfigured('gemini'),
      grok: isProviderConfigured('grok')
    }
  };
}

