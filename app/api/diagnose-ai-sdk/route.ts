import { NextRequest, NextResponse } from 'next/server'
import { validateOpenAIKey, productionAIConfig } from '@/lib/ai-sdk-production-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DIAGNOSTIC-API] Starting AI SDK diagnostics...')
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
        nodeVersion: process.version,
      },
      apiKeys: {
        openai: {
          present: !!process.env.OPENAI_API_KEY,
          valid: validateOpenAIKey(),
          length: process.env.OPENAI_API_KEY?.length || 0,
          startsWithSk: process.env.OPENAI_API_KEY?.startsWith('sk-') || false,
        },
        google: {
          present: !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY),
          geminiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
          googleKey: !!process.env.GOOGLE_API_KEY,
        }
      },
      productionConfig: {
        openaiAvailable: productionAIConfig.openai.available,
        googleAvailable: productionAIConfig.google.available,
      },
      tests: {
        openaiConnectivity: null,
        googleConnectivity: null,
        modelCreation: {
          openaiSimple: null,
          openaiComplex: null,
          googleSimple: null,
        }
      }
    }
    
    // Teste de conectividade OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          diagnostics.tests.openaiConnectivity = {
            success: true,
            modelCount: data.data?.length || 0,
            gpt5Available: data.data?.some((model: any) => model.id === 'gpt-5-chat-latest') || false,
            availableModels: data.data?.map((model: any) => model.id).slice(0, 10) || []
          }
        } else {
          diagnostics.tests.openaiConnectivity = {
            success: false,
            status: response.status,
            statusText: response.statusText,
            error: await response.text()
          }
        }
      } catch (error: any) {
        diagnostics.tests.openaiConnectivity = {
          success: false,
          error: error.message
        }
      }
    }
    
    // Teste de criação de modelos
    try {
      const { createSafeModel } = await import('@/lib/ai-sdk-production-config')
      
      // Teste OpenAI simples
      try {
        const model = createSafeModel('openai', 'simple')
        diagnostics.tests.modelCreation.openaiSimple = { success: true }
      } catch (error: any) {
        diagnostics.tests.modelCreation.openaiSimple = { success: false, error: error.message }
      }
      
      // Teste OpenAI complexo
      try {
        const model = createSafeModel('openai', 'complex')
        diagnostics.tests.modelCreation.openaiComplex = { success: true }
      } catch (error: any) {
        diagnostics.tests.modelCreation.openaiComplex = { success: false, error: error.message }
      }
      
      // Teste Google
      try {
        const model = createSafeModel('google', 'simple')
        diagnostics.tests.modelCreation.googleSimple = { success: true }
      } catch (error: any) {
        diagnostics.tests.modelCreation.googleSimple = { success: false, error: error.message }
      }
      
    } catch (error: any) {
      console.error('Error testing model creation:', error)
    }
    
    console.log('✅ [DIAGNOSTIC-API] Diagnostics completed')
    
    return NextResponse.json(diagnostics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error: any) {
    console.error('❌ [DIAGNOSTIC-API] Error:', error)
    
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
