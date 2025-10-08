/**
 * Grok Image Generation Utility
 * 
 * Integrates xAI's Grok image generation API (grok-2-image-1212)
 * as an alternative to Gemini 2.5 Flash Image
 */

export interface GrokImageGenerationOptions {
  prompt: string;
  n?: number; // Number of images to generate (1-10)
  response_format?: 'url' | 'b64_json';
}

export interface GrokImageResponse {
  success: boolean;
  images: string[]; // URLs or base64 data URIs
  provider: 'grok';
  processingTime: number;
  error?: string;
}

/**
 * Generate images using Grok (xAI) API
 * 
 * @param options - Image generation options
 * @returns Promise with image URLs or base64 data
 */
export async function generateImageWithGrok(
  options: GrokImageGenerationOptions
): Promise<GrokImageResponse> {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.XAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('XAI_API_KEY not configured');
    }

    const {
      prompt,
      n = 1,
      response_format = 'url'
    } = options;

    console.log(`🎨 Generating ${n} image(s) with Grok (grok-2-image-1212)`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-2-image-1212',
        prompt,
        n,
        response_format
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Grok Image API error: ${response.status}`, errorText);
      throw new Error(`Grok Image API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    // Extract image URLs or base64 data
    const images: string[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (response_format === 'url' && item.url) {
          images.push(item.url);
        } else if (response_format === 'b64_json' && item.b64_json) {
          // Convert base64 to data URI
          images.push(`data:image/jpeg;base64,${item.b64_json}`);
        }
      }
    }

    if (images.length === 0) {
      throw new Error('No images returned from Grok API');
    }

    console.log(`✅ Generated ${images.length} image(s) with Grok in ${processingTime}ms`);

    return {
      success: true,
      images,
      provider: 'grok',
      processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Error generating image with Grok:', error);
    
    return {
      success: false,
      images: [],
      provider: 'grok',
      processingTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate multiple images with Grok in batches
 * 
 * @param prompts - Array of prompts
 * @param responseFormat - 'url' or 'b64_json'
 * @returns Promise with array of image URLs/data
 */
export async function generateMultipleImagesWithGrok(
  prompts: string[],
  responseFormat: 'url' | 'b64_json' = 'url'
): Promise<string[]> {
  const images: string[] = [];
  
  console.log(`🎨 Generating ${prompts.length} images with Grok...`);
  
  for (let i = 0; i < prompts.length; i++) {
    console.log(`  🖼️  Image ${i + 1}/${prompts.length}...`);
    
    const result = await generateImageWithGrok({
      prompt: prompts[i],
      n: 1,
      response_format: responseFormat
    });
    
    if (result.success && result.images.length > 0) {
      images.push(result.images[0]);
    } else {
      // Fallback to placeholder if generation fails
      const placeholder = `https://via.placeholder.com/1200x800/4F46E5/FFFFFF?text=Grok+Error+${i + 1}`;
      images.push(placeholder);
      console.warn(`  ⚠️  Using placeholder for image ${i + 1}`);
    }
    
    // Rate limiting: max 5 requests per second
    // Wait 200ms between requests
    if (i < prompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return images;
}

/**
 * Test Grok image generation with a simple prompt
 */
export async function testGrokImageGeneration(): Promise<void> {
  console.log('🧪 Testing Grok image generation...');
  
  const result = await generateImageWithGrok({
    prompt: 'A beautiful sunset over mountains, educational illustration style',
    n: 1,
    response_format: 'url'
  });
  
  if (result.success) {
    console.log('✅ Grok image generation test successful!');
    console.log('📸 Image URL:', result.images[0]);
  } else {
    console.error('❌ Grok image generation test failed:', result.error);
  }
}

