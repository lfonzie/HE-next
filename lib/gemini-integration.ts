// lib/gemini-integration.ts

interface GeminiImageRequest {
  prompt: string
  type: 'diagram' | 'table' | 'chart' | 'illustration'
  style?: 'educational' | 'scientific' | 'modern' | 'minimal'
  language?: 'pt' | 'en'
}

interface GeminiImageResponse {
  imageUrl: string
  description: string
  success: boolean
  error?: string
}

// Gemini 2.5 Nano configuration
const GEMINI_CONFIG = {
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  model: 'gemini-2.0-flash-exp', // Using the latest available model
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
}

export async function generateEducationalImage(request: GeminiImageRequest): Promise<GeminiImageResponse> {
  try {
    if (!GEMINI_CONFIG.apiKey) {
      console.warn('Gemini API key not found, using placeholder')
      return {
        imageUrl: generatePlaceholderImage(request.type),
        description: `Placeholder ${request.type} for: ${request.prompt}`,
        success: false,
        error: 'API key not configured'
      }
    }

    console.log(`🎨 Gerando ${request.type} com Gemini para: "${request.prompt}"`)

    // Enhanced prompt based on type
    const enhancedPrompt = buildEnhancedPrompt(request)
    
    // For now, we'll use a text-to-image service or return a placeholder
    // In a real implementation, you would call Gemini's image generation API
    const imageUrl = await callGeminiImageAPI(enhancedPrompt, request.type)
    
    return {
      imageUrl,
      description: `Diagrama educacional: ${request.prompt}`,
      success: true
    }
    
  } catch (error) {
    console.error('Error generating image with Gemini:', error)
    return {
      imageUrl: generatePlaceholderImage(request.type),
      description: `Erro ao gerar ${request.type}: ${request.prompt}`,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function buildEnhancedPrompt(request: GeminiImageRequest): string {
  const { prompt, type, style = 'educational', language = 'pt' } = request
  
  const styleInstructions = {
    educational: 'Estilo educacional claro e didático, cores suaves, sem texto',
    scientific: 'Estilo científico preciso, diagramas técnicos, cores profissionais',
    modern: 'Design moderno e limpo, elementos minimalistas',
    minimal: 'Design minimalista, apenas elementos essenciais'
  }

  const typeInstructions = {
    diagram: 'Crie um diagrama visual claro mostrando o processo ou conceito',
    table: 'Crie uma tabela visual organizada com dados estruturados',
    chart: 'Crie um gráfico ou chart visual com dados',
    illustration: 'Crie uma ilustração educacional do conceito'
  }

  return `${typeInstructions[type]} sobre "${prompt}". 
${styleInstructions[style]}. 
Linguagem: ${language === 'pt' ? 'português' : 'inglês'}.
Sem texto ou letras na imagem, apenas elementos visuais.`
}

async function callGeminiImageAPI(prompt: string, type: string): Promise<string> {
  // This is a placeholder implementation
  // In a real scenario, you would call Gemini's actual image generation API
  
  // For now, return a placeholder based on type
  return generatePlaceholderImage(type)
}

function generatePlaceholderImage(type: string): string {
  const placeholders = {
    diagram: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    table: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    chart: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    illustration: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
  }
  
  return placeholders[type as keyof typeof placeholders] || placeholders.diagram
}

// Function to detect special commands in messages
export function detectImageCommands(message: string): GeminiImageRequest[] {
  const commands: GeminiImageRequest[] = []
  
  // Pattern for diagram creation
  const diagramPattern = /<<<criar um diagrama da (.+?), sem letras somente imagem>>>/gi
  let match
  while ((match = diagramPattern.exec(message)) !== null) {
    commands.push({
      prompt: match[1].trim(),
      type: 'diagram',
      style: 'educational',
      language: 'pt'
    })
  }
  
  // Pattern for table creation
  const tablePattern = /<<<criar uma tabela (.+?)>>>/gi
  while ((match = tablePattern.exec(message)) !== null) {
    commands.push({
      prompt: match[1].trim(),
      type: 'table',
      style: 'educational',
      language: 'pt'
    })
  }
  
  // Pattern for chart creation
  const chartPattern = /<<<criar um gráfico (.+?)>>>/gi
  while ((match = chartPattern.exec(message)) !== null) {
    commands.push({
      prompt: match[1].trim(),
      type: 'chart',
      style: 'educational',
      language: 'pt'
    })
  }
  
  // Pattern for illustration creation
  const illustrationPattern = /<<<criar uma ilustração (.+?)>>>/gi
  while ((match = illustrationPattern.exec(message)) !== null) {
    commands.push({
      prompt: match[1].trim(),
      type: 'illustration',
      style: 'educational',
      language: 'pt'
    })
  }
  
  return commands
}

// Function to process message and replace commands with images
export async function processMessageWithImageGeneration(message: string): Promise<{
  processedMessage: string
  generatedImages: GeminiImageResponse[]
}> {
  const commands = detectImageCommands(message)
  const generatedImages: GeminiImageResponse[] = []
  let processedMessage = message
  
  for (const command of commands) {
    const imageResponse = await generateEducationalImage(command)
    generatedImages.push(imageResponse)
    
    if (imageResponse.success) {
      // Replace the command with an image placeholder
      const commandPattern = new RegExp(`<<<criar um ${command.type} da? (.+?), sem letras somente imagem>>>`, 'gi')
      processedMessage = processedMessage.replace(commandPattern, `![${command.prompt}](${imageResponse.imageUrl})`)
    }
  }
  
  return {
    processedMessage,
    generatedImages
  }
}
