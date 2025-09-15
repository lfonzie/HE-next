import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { question, playbookId, stepId, stepLabel, context, previousStates } = await request.json();

    const systemPrompt = `You are an educational IT specialist. Provide practical and specific hints for resolving technical issues in a school environment.

Problem context: ${question}
Playbook: ${playbookId}
Current step: ${stepLabel}
Previous states: ${JSON.stringify(previousStates)}

Provide a specific, practical hint for this step, considering:
- Educational environment (schools, labs)
- Limited resources typical in schools
- Need for quick and effective solutions
- Clear and didactic language

Return only the hint without additional formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Provide a specific hint for step "${stepLabel}" in playbook "${playbookId}".` },
      ],
      max_completion_tokens: 200,
    });

    const hint = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      hint,
      model: 'gpt-4o-mini',
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('TI hint generation error:', e);
    return NextResponse.json(
      { error: 'Failed to generate TI hint', details: e.message },
      { status: 500 }
    );
  }
}

