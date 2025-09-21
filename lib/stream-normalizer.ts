/**
 * Wrapper para streamText com normalização de matemática
 */

import { streamText, StreamTextResult } from 'ai';
import { normalizeScientificText } from './math-normalizer';

export interface StreamTextWithNormalizationOptions {
  model: any;
  messages: any[];
  temperature?: number;
  onFinish?: () => void;
}

/**
 * Stream de texto com normalização automática de matemática
 */
export async function streamTextWithNormalization(
  options: StreamTextWithNormalizationOptions
): Promise<StreamTextResult<any, any>> {
  const { model, messages, temperature = 0.7, onFinish } = options;

  // Criar o stream original
  const result = await streamText({
    model,
    messages,
    temperature,
  });

  // Interceptar o stream para normalizar o conteúdo
  const originalStream = result.textStream;
  
  // Criar um novo stream que normaliza o conteúdo
  const normalizedStream = new ReadableStream({
    start(controller) {
      const reader = originalStream.getReader();
      
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              if (onFinish) onFinish();
              break;
            }
            
            // Normalizar o texto antes de enviar
            const normalizedValue = normalizeScientificText(value);
            controller.enqueue(normalizedValue);
          }
        } catch (error) {
          controller.error(error);
        }
      };
      
      pump();
    }
  });

  // Retornar um objeto que parece com o resultado original mas usa o stream normalizado
  return {
    ...result,
    textStream: normalizedStream,
    toTextStreamResponse: (options?: any) => {
      return new Response(normalizedStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          ...options?.headers,
        },
      });
    }
  } as StreamTextResult;
}

/**
 * Função para normalizar texto de forma síncrona (para respostas não-streaming)
 */
export function normalizeResponseText(text: string): string {
  return normalizeScientificText(text);
}
