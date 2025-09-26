import { mapToOpenAIMessages, trimHistory, ChatMessage } from "../chat-history";

function getPerplexityHeaders() {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY environment variable is required");
  }
  return {
    "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    "Content-Type": "application/json"
  };
}

export async function callPerplexity(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string
) {
  const trimmed = trimHistory([...history, { role: "user", content: input }]);
  const messages = mapToOpenAIMessages(trimmed);

  if (systemPrompt && !messages.some(m => m.role === "system")) {
    messages.unshift({ role: "system", content: systemPrompt });
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: getPerplexityHeaders(),
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
  }

  const res = await response.json();
  const text = res.choices[0]?.message?.content ?? "";
  return { text, raw: res, usage: res.usage };
}

export async function streamPerplexity(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string
) {
  const trimmed = trimHistory([...history, { role: "user", content: input }]);
  const messages = mapToOpenAIMessages(trimmed);

  if (systemPrompt && !messages.some(m => m.role === "system")) {
    messages.unshift({ role: "system", content: systemPrompt });
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: getPerplexityHeaders(),
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
  }

  // Criar um stream iterável similar ao OpenAI
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body from Perplexity");
  }

  const decoder = new TextDecoder();
  
  return {
    async *[Symbol.asyncIterator]() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') return;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta) {
                  yield parsed;
                }
              } catch (e) {
                // Ignorar linhas inválidas
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
}
