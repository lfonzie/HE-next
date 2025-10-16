import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { getPromptsData } from '@/lib/admin-utils';
import { handleAdminRouteError, requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();



export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    // Simple implementation without getPromptsData
    const systemPrompts = await prisma.system_messages.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    const systemPromptsData = systemPrompts.map(prompt => ({
      id: prompt.id,
      module: prompt.module,
      text: prompt.system_prompt,
      description: prompt.description,
      isActive: prompt.is_active,
      temperature: prompt.temperature,
      maxTokens: prompt.max_tokens,
      tone: prompt.tone,
      type: 'system',
      school: null,
      created_at: prompt.created_at
    }));

    return NextResponse.json(systemPromptsData);
  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching prompts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch prompts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { 
      module, 
      text, 
      description, 
      isActive = true, 
      temperature, 
      maxTokens, 
      maxCompletionTokens, 
      tone 
    } = body;

    if (!module || !text) {
      return NextResponse.json({ error: 'Module and text are required' }, { status: 400 });
    }

    const prisma = new PrismaClient();

    const newPrompt = await prisma.system_messages.create({
      data: {
        module,
        content: text,
        system_prompt: text,
        description,
        is_active: isActive,
        temperature,
        max_tokens: maxTokens,
        max_completion_tokens: maxCompletionTokens,
        tone
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      id: newPrompt.id,
      module: newPrompt.module,
      text: newPrompt.system_prompt,
      description: newPrompt.description,
      isActive: newPrompt.is_active,
      temperature: newPrompt.temperature,
      maxTokens: newPrompt.max_tokens,
      maxCompletionTokens: newPrompt.max_completion_tokens,
      tone: newPrompt.tone,
      type: 'system',
      school: null,
      created_at: newPrompt.created_at,
      updated_at: newPrompt.updated_at
    });

  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}
