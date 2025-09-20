// app/api/system-prompts/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import OpenAI from 'openai';


import { promptManager, PromptRequest, getUnifiedSystemPrompt } from '@/lib/system-prompts';



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { promptKey, userMessage, context } = await request.json();

    if (!promptKey || !userMessage) {
      return NextResponse.json(
        { error: 'promptKey and userMessage are required' },
        { status: 400 }
      );
    }

    // Construir requisição do prompt
    const promptRequest: PromptRequest = {
      key: promptKey,
      userMessage,
      context: context || {}
    };

    // Validar se o prompt existe
    const validation = promptManager.validatePrompt(promptKey);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid prompt configuration',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Construir mensagens para OpenAI
    const messages = promptManager.buildMessages(promptRequest);
    const modelConfig = promptManager.getModelConfig(promptKey);

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: modelConfig.model,
      messages: messages as any,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';
    const usage = completion.usage;

    return NextResponse.json({
      success: true,
      response,
      model: modelConfig.model,
      tokens: {
        prompt: usage?.prompt_tokens || 0,
        completion: usage?.completion_tokens || 0,
        total: usage?.total_tokens || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('System prompt API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process system prompt request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Listar prompts disponíveis
export async function GET() {
  try {
    const stats = promptManager.getPromptStats();
    const activePrompts = promptManager.getActivePrompts();

    return NextResponse.json({
      success: true,
      stats,
      prompts: activePrompts.map(prompt => ({
        key: prompt.key,
        type: prompt.json.type,
        description: prompt.description,
        model: prompt.model,
        status: prompt.status
      }))
    });

  } catch (error: any) {
    console.error('System prompt list error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to list system prompts',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
