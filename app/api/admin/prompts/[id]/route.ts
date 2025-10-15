import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { handleAdminRouteError, requireAdmin } from '@/lib/admin-auth';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id: promptId } = await params;

    // Try to find in system_messages first
    let prompt = await prisma.system_messages.findUnique({
      where: { id: promptId }
    });

    if (prompt) {
      return NextResponse.json({
        id: prompt.id,
        module: prompt.module,
        text: prompt.system_prompt,
        description: prompt.description,
        isActive: prompt.is_active,
        temperature: prompt.temperature,
        maxTokens: prompt.max_tokens,
        maxCompletionTokens: prompt.max_completion_tokens,
        tone: prompt.tone,
        type: 'system',
        school: null,
        created_at: prompt.created_at,
        updated_at: prompt.updated_at
      });
    }

    // Try to find in school_prompts
    const schoolPrompt = await prisma.school_prompts.findUnique({
      where: { id: promptId },
      include: {
        schools: {
          select: {
            name: true
          }
        }
      }
    });

    if (schoolPrompt) {
      return NextResponse.json({
        id: schoolPrompt.id,
        module: schoolPrompt.module,
        text: schoolPrompt.prompt,
        description: null,
        isActive: schoolPrompt.is_active,
        temperature: null,
        maxTokens: null,
        maxCompletionTokens: null,
        tone: null,
        type: 'school',
        school: schoolPrompt.schools?.name || 'Unknown',
        created_at: schoolPrompt.created_at,
        updated_at: schoolPrompt.updated_at
      });
    }

    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });

  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id: promptId } = await params;
    const body = await request.json();
    const { 
      text, 
      description, 
      isActive, 
      temperature, 
      maxTokens, 
      maxCompletionTokens, 
      tone 
    } = body;

    // Try to update in system_messages first
    const systemPrompt = await prisma.system_messages.findUnique({
      where: { id: promptId }
    });

    if (systemPrompt) {
      const updatedPrompt = await prisma.system_messages.update({
        where: { id: promptId },
        data: {
          system_prompt: text,
          description: description,
          is_active: isActive,
          temperature: temperature,
          max_tokens: maxTokens,
          max_completion_tokens: maxCompletionTokens,
          tone: tone,
          updated_at: new Date()
        }
      });

      return NextResponse.json({
        id: updatedPrompt.id,
        module: updatedPrompt.module,
        text: updatedPrompt.system_prompt,
        description: updatedPrompt.description,
        isActive: updatedPrompt.is_active,
        temperature: updatedPrompt.temperature,
        maxTokens: updatedPrompt.max_tokens,
        maxCompletionTokens: updatedPrompt.max_completion_tokens,
        tone: updatedPrompt.tone,
        type: 'system',
        school: null,
        created_at: updatedPrompt.created_at,
        updated_at: updatedPrompt.updated_at
      });
    }

    // Try to update in school_prompts
    const schoolPrompt = await prisma.school_prompts.findUnique({
      where: { id: promptId }
    });

    if (schoolPrompt) {
      const updatedPrompt = await prisma.school_prompts.update({
        where: { id: promptId },
        data: {
          prompt: text,
          is_active: isActive,
          updated_at: new Date()
        },
        include: {
          schools: {
            select: {
              name: true
            }
          }
        }
      });

      return NextResponse.json({
        id: updatedPrompt.id,
        module: updatedPrompt.module,
        text: updatedPrompt.prompt,
        description: null,
        isActive: updatedPrompt.is_active,
        temperature: null,
        maxTokens: null,
        maxCompletionTokens: null,
        tone: null,
        type: 'school',
        school: updatedPrompt.schools?.name || 'Unknown',
        created_at: updatedPrompt.created_at,
        updated_at: updatedPrompt.updated_at
      });
    }

    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });

  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id: promptId } = await params;

    // Try to delete from system_messages first
    const systemPrompt = await prisma.system_messages.findUnique({
      where: { id: promptId }
    });

    if (systemPrompt) {
      await prisma.system_messages.delete({
        where: { id: promptId }
      });
      return NextResponse.json({ success: true, message: 'System prompt deleted' });
    }

    // Try to delete from school_prompts
    const schoolPrompt = await prisma.school_prompts.findUnique({
      where: { id: promptId }
    });

    if (schoolPrompt) {
      await prisma.school_prompts.delete({
        where: { id: promptId }
      });
      return NextResponse.json({ success: true, message: 'School prompt deleted' });
    }

    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });

  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}


