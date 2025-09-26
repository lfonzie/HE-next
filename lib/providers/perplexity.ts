import { Perplexity } from '@perplexity-ai/perplexity_ai';
import { mapToOpenAIMessages, trimHistory, ChatMessage } from "../chat-history";

function getPerplexityClient() {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY environment variable is required");
  }
  return new Perplexity({
    apiKey: process.env.PERPLEXITY_API_KEY,
  });
}

export async function callPerplexity(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string
) {
  const client = getPerplexityClient();
  
  // Use the new Search API instead of chat completions
  const searchResult = await client.search.create({
    query: input,
    max_results: 5,
    max_tokens_per_page: 1024
  });

  // Format the search results into a response
  const searchResults = searchResult.results.map(result => 
    `**${result.title}**\n${result.snippet}\nURL: ${result.url}\n`
  ).join('\n---\n');

  const text = `Baseado na busca mais recente, aqui estão os resultados:\n\n${searchResults}`;
  
  return { 
    text, 
    raw: searchResult, 
    usage: { 
      prompt_tokens: 0, 
      completion_tokens: 0, 
      total_tokens: 0 
    } 
  };
}

export async function streamPerplexity(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string
) {
  const client = getPerplexityClient();
  
  // Use the new Search API - note that Search API doesn't support streaming
  // We'll simulate streaming by chunking the response
  const searchResult = await client.search.create({
    query: input,
    max_results: 5,
    max_tokens_per_page: 1024
  });

  // Format the search results
  const searchResults = searchResult.results.map(result => 
    `**${result.title}**\n${result.snippet}\nURL: ${result.url}\n`
  ).join('\n---\n');

  const fullText = `Baseado na busca mais recente, aqui estão os resultados:\n\n${searchResults}`;
  
  // Simulate streaming by chunking the response
  const chunks = fullText.split(' ');
  let currentIndex = 0;
  
  return {
    async *[Symbol.asyncIterator]() {
      while (currentIndex < chunks.length) {
        const chunk = chunks[currentIndex] + (currentIndex < chunks.length - 1 ? ' ' : '');
        yield {
          choices: [{
            delta: {
              content: chunk
            }
          }]
        };
        currentIndex++;
        
        // Add small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
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
}
