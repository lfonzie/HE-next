import Groq from "groq-sdk";
import { mapToOpenAIMessages, trimHistory, ChatMessage } from "../chat-history";

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is required");
  }
  return new Groq({ 
    apiKey: process.env.GROQ_API_KEY 
  });
}

export async function callGroq(
  model: string, 
  history: ChatMessage[], 
  input: string,
  systemPrompt?: string
) {
  const trimmed = trimHistory([...history, { role: "user", content: input }]);
  const messages = mapToOpenAIMessages(trimmed);

  // Adicionar system prompt se fornecido
  if (systemPrompt && !messages.some(m => m.role === "system")) {
    messages.unshift({ role: "system", content: systemPrompt });
  }

  const groq = getGroqClient();
  const res = await groq.chat.completions.create({
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

export async function streamGroq(
  model: string, 
  history: ChatMessage[], 
  input: string,
  systemPrompt?: string
) {
  const trimmed = trimHistory([...history, { role: "user", content: input }]);
  const messages = mapToOpenAIMessages(trimmed);

  // Adicionar system prompt se fornecido
  if (systemPrompt && !messages.some(m => m.role === "system")) {
    messages.unshift({ role: "system", content: systemPrompt });
  }

  const groq = getGroqClient();
  const stream = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    stream: true
  });

  return stream;
}
