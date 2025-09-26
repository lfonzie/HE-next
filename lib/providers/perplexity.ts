import { perplexity } from '@ai-sdk/perplexity';
import { generateText, streamText } from 'ai';
import { mapToOpenAIMessages, trimHistory, ChatMessage } from "../chat-history";
import { getRecommendedModel, getModelConfig } from './perplexity-models';

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
  const messages = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    ...mapToOpenAIMessages(trimHistory(history)),
    { role: 'user' as const, content: input }
  ];

  try {
    const result = await generateText({
      model: perplexityModel,
      messages,
      maxTokens: 1000,
    });

    return {
      text: result.text,
      raw: result,
      usage: {
        prompt_tokens: result.usage?.promptTokens || 0,
        completion_tokens: result.usage?.completionTokens || 0,
        total_tokens: result.usage?.totalTokens || 0
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
  const messages = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    ...mapToOpenAIMessages(trimHistory(history)),
    { role: 'user' as const, content: input }
  ];

  try {
    const result = await streamText({
      model: perplexityModel,
      messages,
      maxTokens: 1000,
    });

    return {
      async *[Symbol.asyncIterator]() {
        for await (const delta of result.textStream) {
          yield {
            choices: [{
              delta: {
                content: delta
              }
            }]
          };
        }
        
        // Final chunk to indicate completion
        yield {
          choices: [{
            delta: {},
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
