import { callGrok, streamGrok } from '@/lib/providers/grok';

export function grok(model: string) {
  return {
    modelId: model,
    provider: 'grok',
    specificationVersion: 'v2' as const,
    supportedUrls: {} as Record<string, RegExp[]>,
    async doGenerate(options: any) {
      const { prompt, temperature, maxTokens } = options;
      
      // For AI SDK compatibility, we'll treat the prompt as a single message
      const result = await callGrok(model, [], prompt, undefined);
      
      return {
        text: result.text,
        usage: result.usage,
        finishReason: 'stop'
      };
    },
    
    async doStream(options: any) {
      const { prompt, temperature, maxTokens } = options;
      
      const stream = await streamGrok(model, [], prompt, undefined);
      
      return {
        stream: stream,
        rawCall: { rawPrompt: prompt, rawSettings: { temperature, maxTokens } }
      };
    }
  };
}
