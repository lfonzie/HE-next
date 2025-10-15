import { perplexity } from '@ai-sdk/perplexity';
import { generateText, streamText } from 'ai';
import { mapToOpenAIMessages, trimHistory, ChatMessage } from "../chat-history";
import { getRecommendedModel, getModelConfig } from './perplexity-models';
import { cleanPerplexityResponse } from '@/lib/utils/perplexity-cleaner';

function getPerplexityModel() {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY environment variable is required");
  }
  
  // Use only the "sonar" model as requested
  console.log('Using Perplexity model: sonar (Modelo leve e econômico para consultas rápidas)');
  return perplexity('sonar');
}

export async function callPerplexity(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string
) {
  const perplexityModel = getPerplexityModel();
  
  // Prepare messages for the AI SDK
  const messages: any[] = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    ...mapToOpenAIMessages(trimHistory(history)),
    { role: 'user' as const, content: input }
  ];

  try {
    const result = await generateText({
      model: perplexityModel,
      messages,
    });

    // Clean the response to remove source citations
    const cleanedText = await cleanPerplexityResponse(result.text);

    return {
      text: cleanedText,
      raw: result,
      usage: {
        prompt_tokens: (result.usage as any)?.promptTokens || 0,
        completion_tokens: (result.usage as any)?.completionTokens || 0,
        total_tokens: (result.usage as any)?.totalTokens || 0
      }
    };
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error(`Perplexity API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function streamPerplexity(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string
) {
  const perplexityModel = getPerplexityModel();
  
  // Prepare messages for the AI SDK
  const messages: any[] = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    ...mapToOpenAIMessages(trimHistory(history)),
    { role: 'user' as const, content: input }
  ];

  try {
    const result = await streamText({
      model: perplexityModel,
      messages,
    });

    return {
      async *[Symbol.asyncIterator]() {
        let fullContent = '';
        
        for await (const delta of result.textStream) {
          fullContent += delta;
          yield {
            choices: [{
              delta: {
                content: delta
              }
            }]
          };
        }
        
        // Clean the full content and yield the cleaned version as final chunk
        const cleanedContent = await cleanPerplexityResponse(fullContent);
        
        // Final chunk with cleaned content
        yield {
          choices: [{
            delta: {
              content: cleanedContent
            },
            finish_reason: 'stop'
          }]
        };
      }
    };
  } catch (error) {
    console.error('Perplexity streaming error:', error);
    throw new Error(`Perplexity streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
