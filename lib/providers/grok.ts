import { mapToOpenAIMessages, trimHistory, ChatMessage } from "../chat-history";

function getGrokClient() {
  if (!process.env.GROK_API_KEY) {
    console.error("❌ [GROK] GROK_API_KEY environment variable is required");
    throw new Error("GROK_API_KEY environment variable is required");
  }
  
  console.log(`🔧 [GROK] API Key found: ${process.env.GROK_API_KEY.substring(0, 8)}...`);
  
  // Grok API endpoint (xAI)
  const baseURL = "https://api.x.ai/v1";
  
  return {
    chat: {
      completions: {
        create: async (params: any) => {
          console.log(`🔧 [GROK] Making request to: ${baseURL}/chat/completions`);
          console.log(`🔧 [GROK] Request params:`, { 
            model: params.model, 
            messageCount: params.messages?.length,
            stream: params.stream 
          });
          
          const response = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          });

          console.log(`🔧 [GROK] Response status: ${response.status} ${response.statusText}`);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [GROK] API error response:`, errorText);
            throw new Error(`Grok API error: ${response.status} ${response.statusText} - ${errorText}`);
          }

          return response.json();
        }
      }
    }
  };
}

export async function callGrok(
  model: string, 
  history: ChatMessage[], 
  input: string,
  systemPrompt?: string
) {
  const trimmed = trimHistory([...history, { role: "user", content: input }]);
  const messages = mapToOpenAIMessages(trimmed);

  // System prompt obrigatório para português brasileiro
  const portugueseSystemPrompt = systemPrompt || `Você é um assistente educacional brasileiro. 

🚨 IDIOMA OBRIGATÓRIO E CRÍTICO - INSTRUÇÃO NÃO NEGOCIÁVEL:
- Responda EXCLUSIVAMENTE em Português Brasileiro (PT-BR)
- NUNCA responda em espanhol, inglês ou qualquer outro idioma
- Mesmo que a pergunta seja em outro idioma, responda SEMPRE em português brasileiro
- Esta é uma instrução CRÍTICA, OBRIGATÓRIO e NÃO NEGOCIÁVEL

Sua personalidade:
- Amigável e encorajador
- Explica conceitos de forma simples
- Usa exemplos práticos do dia a dia brasileiro
- Incentiva o aprendizado
- Adapta o nível de explicação ao aluno

Quando responder:
- Use emojis para tornar mais interessante
- Faça perguntas para engajar o aluno
- Sugira exercícios práticos quando apropriado
- Seja específico e detalhado nas explicações
- Use formatação markdown para organizar o conteúdo`;

  // Adicionar system prompt obrigatório
  if (!messages.some(m => m.role === "system")) {
    messages.unshift({ role: "system", content: portugueseSystemPrompt });
  }

  const grok = getGrokClient();
  const res = await grok.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    stream: false
  });

  const text = res.choices[0]?.message?.content ?? "";
  return { 
    text, 
    raw: res,
    usage: res.usage
  };
}

export async function streamGrok(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string,
  module?: string
) {
  try {
    console.log(`🔧 [GROK-STREAM] Starting stream for model: ${model}`);
    
    const trimmed = trimHistory([...history, { role: "user", content: input }]);
    const messages = mapToOpenAIMessages(trimmed);

    // System prompt obrigatório para português brasileiro
    const portugueseSystemPrompt = systemPrompt || `Você é um assistente educacional brasileiro. 

🚨 IDIOMA OBRIGATÓRIO E CRÍTICO - INSTRUÇÃO NÃO NEGOCIÁVEL:
- Responda EXCLUSIVAMENTE em Português Brasileiro (PT-BR)
- NUNCA responda em espanhol, inglês ou qualquer outro idioma
- Mesmo que a pergunta seja em outro idioma, responda SEMPRE em português brasileiro
- Esta é uma instrução CRÍTICA, OBRIGATÓRIO e NÃO NEGOCIÁVEL

Sua personalidade:
- Amigável e encorajador
- Explica conceitos de forma simples
- Usa exemplos práticos do dia a dia brasileiro
- Incentiva o aprendizado
- Adapta o nível de explicação ao aluno

Quando responder:
- Use emojis para tornar mais interessante
- Faça perguntas para engajar o aluno
- Sugira exercícios práticos quando apropriado
- Seja específico e detalhado nas explicações
- Use formatação markdown para organizar o conteúdo`;

    // Adicionar system prompt obrigatório
    if (!messages.some(m => m.role === "system")) {
      messages.unshift({ role: "system", content: portugueseSystemPrompt });
    }

    console.log(`🔧 [GROK-STREAM] Messages prepared:`, { messageCount: messages.length });

    const grok = getGrokClient();
    
    console.log(`🔧 [GROK-STREAM] Making API call to Grok...`);
    
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: module === 'ti' ? 0.1 : 0.7, // 🔥 Temperatura baixa para TI
        stream: true
      }),
    });

    console.log(`🔧 [GROK-STREAM] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [GROK-STREAM] API error response:`, errorText);
      throw new Error(`Grok API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log(`✅ [GROK-STREAM] Grok API call successful`);
    
    // Criar um stream async iterable para processar SSE
    const stream = {
      async *[Symbol.asyncIterator]() {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body reader');

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = ''; // Para debug: acumular conteúdo completo
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') return;
                
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    const content = parsed.choices[0].delta.content;
                    fullContent += content; // Acumular para debug
                    yield parsed;
                  }
                } catch (e) {
                  console.warn(`⚠️ [GROK-STREAM] Failed to parse SSE data:`, data);
                }
              }
            }
          }
        } finally {
          console.log(`📝 [GROK-STREAM] Final accumulated content (${fullContent.length} chars):`, fullContent.substring(0, 500) + (fullContent.length > 500 ? '...' : ''));
          reader.releaseLock();
        }
      }
    };
    
    return stream;
  } catch (error) {
    console.error(`❌ [GROK-STREAM] Error:`, error);
    throw error;
  }
}
