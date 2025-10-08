// Step 5: Theme Translation and Multi-Provider Image Generation (Gemini 2.5 & Grok)
import { NextRequest, NextResponse } from 'next/server'
import { generateMultipleImagesWithGrok } from '@/lib/grok-image-generator'

export const runtime = 'edge'
export const maxDuration = 300

// Extract key search terms from detailed prompts
function extractSearchTerms(prompt: string): string {
  // Remove common descriptive words and keep main subjects
  const stopWords = [
    'detailed', 'high', 'resolution', 'professional', 'photography', 'style',
    'educational', 'illustration', 'visual', 'appealing', 'appropriate',
    'learning', 'materials', 'create', 'image', 'photograph', 'picture',
    'beautiful', 'stunning', 'amazing', 'incredible', 'perfect', 'ideal'
  ]
  
  // Convert to lowercase and split into words
  const words = prompt.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2) // Remove short words
    .filter(word => !stopWords.includes(word)) // Remove stop words
  
  // Take first 3-5 meaningful words
  const keyTerms = words.slice(0, 5).join(' ')
  
  console.log('    📝 Original prompt:', prompt.substring(0, 100) + '...')
  console.log('    🎯 Extracted terms:', keyTerms)
  
  return keyTerms || 'education'
}

// Translation helper using Grok
async function translateToEnglish(text: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: 'You are a translation expert. Translate the given Portuguese text to English. Respond ONLY with the English translation, no explanations.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    })

    if (!response.ok) {
      console.warn('Translation failed, using original text')
      return text
    }

    const data = await response.json()
    return data.choices[0]?.message?.content?.trim() || text
  } catch (error) {
    console.warn('Translation error, using original text:', error)
    return text
  }
}

// Generate image using Google Gemini 2.5
async function generateImageWithGemini(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('    🔍 Gemini API Key configured:', !!apiKey)
    console.log('    📝 Prompt length:', prompt.length)
    
    // Try multiple Gemini models for better compatibility
    const models = [
      'gemini-2.5-flash-image',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash'
    ]
    
    for (const model of models) {
      console.log(`    🎯 Trying model: ${model}`)
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Create an educational image: ${prompt}. Make it visually appealing, educational, and appropriate for learning materials.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          })
        }
      )

      console.log(`    📡 ${model} response status:`, response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`    ⚠️ ${model} API error:`, response.status, errorText)
        continue // Try next model
      }

      const data = await response.json()
      console.log(`    📊 ${model} response structure:`, {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0,
        firstCandidate: data.candidates?.[0] ? 'exists' : 'missing'
      })
      
      // Extract image data if present
      const candidate = data.candidates?.[0]
      const parts = candidate?.content?.parts || []
      
      console.log(`    🔍 ${model} parts found:`, parts.length)
      
      for (const part of parts) {
        console.log(`    🔍 ${model} part type:`, part.text ? 'text' : part.inlineData ? 'image' : 'unknown')
        if (part.inlineData && part.inlineData.data) {
          console.log(`    ✅ Image data found with ${model}!`)
          // Return base64 image data
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        }
      }

      console.log(`    ⚠️ No image data found in ${model} response`)
    }

    console.log('    ❌ All Gemini models failed to generate image')
    return null
  } catch (error) {
    console.error('    ❌ Error generating image with Gemini:', error)
    return null
  }
}

// Fallback: Use Unsplash API for images
async function searchUnsplashImage(query: string): Promise<string | null> {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
    
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not configured')
      return null
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    )

    if (!response.ok) {
      console.warn('Unsplash API error:', response.status)
      return null
    }

    const data = await response.json()
    const photo = data.results?.[0]

    if (photo && photo.urls && photo.urls.regular) {
      return photo.urls.regular
    }

    return null
  } catch (error) {
    console.error('Error searching Unsplash:', error)
    return null
  }
}

// Fallback: Use Pixabay API
async function searchPixabayImage(query: string): Promise<string | null> {
  try {
    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY
    
    if (!PIXABAY_API_KEY) {
      console.warn('Pixabay API key not configured')
      return null
    }

    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&safesearch=true`
    )

    if (!response.ok) {
      console.warn('Pixabay API error:', response.status)
      return null
    }

    const data = await response.json()
    const hit = data.hits?.[0]

    if (hit && hit.largeImageURL) {
      return hit.largeImageURL
    }

    return null
  } catch (error) {
    console.error('Error searching Pixabay:', error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { theme, prompts, provider = 'gemini' } = await req.json()

    if (!theme || typeof theme !== 'string') {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(prompts) || prompts.length !== 6) {
      return NextResponse.json(
        { error: '6 prompts are required' },
        { status: 400 }
      )
    }

    const XAI_API_KEY = process.env.XAI_API_KEY
    const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    // Auto-detect available provider
    let selectedProvider = provider
    
    if (provider === 'grok' && !XAI_API_KEY) {
      console.warn('⚠️ XAI_API_KEY not configured, falling back to Gemini')
      selectedProvider = 'gemini'
    }
    
    if (provider === 'gemini' && !GOOGLE_API_KEY) {
      console.warn('⚠️ GOOGLE_GENERATIVE_AI_API_KEY not configured, falling back to Grok')
      selectedProvider = 'grok'
    }

    // Validate at least one provider is configured
    if (!XAI_API_KEY && !GOOGLE_API_KEY) {
      console.error('❌ Neither XAI_API_KEY nor GOOGLE_GENERATIVE_AI_API_KEY configured')
      return NextResponse.json(
        { error: 'No image generation API key configured' },
        { status: 500 }
      )
    }

    console.log(`🎨 Step 5: Generating images with ${selectedProvider.toUpperCase()}`)
    console.log('📝 Theme:', theme)
    console.log('📋 Prompts:', prompts.length)

    // Translate theme to English (only if XAI_API_KEY is available)
    const translatedTheme = XAI_API_KEY ? await translateToEnglish(theme, XAI_API_KEY) : theme
    console.log('✅ Translated theme:', translatedTheme)

    // Generate images using selected provider
    const images: string[] = []
    const imageGenerationMethod: string[] = []

    if (selectedProvider === 'grok') {
      // Use Grok for batch image generation (faster)
      console.log('🚀 Generating all 6 images with Grok in batch...')
      
      try {
        const grokImages = await generateMultipleImagesWithGrok(prompts, 'url')
        
        for (let i = 0; i < grokImages.length; i++) {
          images.push(grokImages[i])
          imageGenerationMethod.push(grokImages[i].includes('placeholder') ? 'placeholder' : 'grok')
        }
        
        console.log('✅ All images generated successfully with Grok')
      } catch (error) {
        console.error('❌ Error generating images with Grok:', error)
        // Fallback to placeholders
        for (let i = 0; i < prompts.length; i++) {
          images.push(`https://via.placeholder.com/1200x800/4F46E5/FFFFFF?text=Grok+Error+${i + 1}`)
          imageGenerationMethod.push('placeholder')
        }
      }
    } else {
      // Use Gemini 2.5 for sequential generation
      for (let i = 0; i < prompts.length; i++) {
        console.log(`🎨 Generating image ${i + 1}/6 with Gemini 2.5...`)
        
        let imageUrl: string | null = null
        let method = 'gemini'

        console.log('  🎯 Creating image with Gemini 2.5...')
        imageUrl = await generateImageWithGemini(prompts[i], GOOGLE_API_KEY)
        
        if (imageUrl) {
          console.log(`  ✅ Image ${i + 1} created successfully with Gemini 2.5`)
        } else {
          console.error(`  ❌ Failed to generate image ${i + 1} with Gemini 2.5`)
          imageUrl = `https://via.placeholder.com/1200x800/4F46E5/FFFFFF?text=Gemini+Error+${i + 1}`
          method = 'placeholder'
          console.warn(`  ⚠️ Using placeholder for image ${i + 1}`)
        }

        images.push(imageUrl)
        imageGenerationMethod.push(method)
      }
      
      console.log('✅ All images generated successfully with Gemini 2.5')
    }

    return NextResponse.json({
      success: true,
      images,
      translatedTheme,
      imageGenerationMethod,
      count: images.length,
      provider: selectedProvider
    })

  } catch (error) {
    console.error('❌ Error generating images:', error)
    
    // Return placeholder images as fallback
    const placeholderImages = Array.from({ length: 6 }, (_, i) => 
      `https://via.placeholder.com/1200x800/4F46E5/FFFFFF?text=Image+${i + 1}`
    )

    return NextResponse.json({
      success: true,
      images: placeholderImages,
      translatedTheme: '',
      imageGenerationMethod: Array(6).fill('placeholder'),
      count: 6,
      warning: 'Using placeholder images due to error'
    })
  }
}

