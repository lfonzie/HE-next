import OpenAI from "openai";
import { mapToOpenAIMessages, trimHistory, ChatMessage } from "../chat-history";

function getGPT5Client() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export async function callGPT5(
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

  const client = getGPT5Client();
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    stream: false
  });

  const text = res.choices[0]?.message?.content ?? "";
  return { text, raw: res, usage: res.usage };
}

export async function streamGPT5(
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

  const client = getGPT5Client();
  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    stream: true
  });

  return stream;
}
