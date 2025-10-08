// Test endpoint for Gemini 2.5 image generation
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google Gemini API key not configured' },
        { status: 500 }
      )
    }

    console.log('🧪 Testing Gemini 2.5 image generation...')

    // Test with a simple prompt
    const testPrompt = "A simple educational illustration of the solar system with planets orbiting the sun"

    // Try multiple Gemini models for better compatibility
    const models = [
      'gemini-2.5-flash-image',
      'gemini-2.0-flash-exp', 
      'gemini-1.5-flash'
    ]
    
    for (const model of models) {
      console.log(`🧪 Testing model: ${model}`)
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Create an educational image: ${testPrompt}. Make it visually appealing, educational, and appropriate for learning materials.`
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

      console.log(`📡 ${model} test response status:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`⚠️ ${model} test error:`, response.status, errorText)
        continue // Try next model
      }

      const data = await response.json()
      console.log(`📊 ${model} test response structure:`, {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0,
        firstCandidate: data.candidates?.[0] ? 'exists' : 'missing'
      })

      // Extract image data if present
      const candidate = data.candidates?.[0]
      const parts = candidate?.content?.parts || []

      console.log(`🔍 ${model} parts found:`, parts.length)

      for (const part of parts) {
        console.log(`🔍 ${model} part type:`, part.text ? 'text' : part.inlineData ? 'image' : 'unknown')
        if (part.inlineData && part.inlineData.data) {
          console.log(`✅ Image data found with ${model}!`)
          return NextResponse.json({
            success: true,
            message: `Gemini image generation working with ${model}!`,
            imageData: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            prompt: testPrompt,
            model: model
          })
        }
      }

      console.log(`⚠️ No image data found in ${model} response`)
    }

    // If all models failed
    return NextResponse.json({
      success: false,
      error: 'All Gemini models failed to generate images',
      message: 'Please check your API key and model availability'
    })

  } catch (error) {
    console.error('❌ Error testing Gemini:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test Gemini',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
