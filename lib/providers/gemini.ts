import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage, trimHistory } from "../chat-history";

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

function toGeminiContent(history: ChatMessage[], input: string, systemPrompt?: string) {
  const trimmed = trimHistory(history);
  const contents = trimmed.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }]
  }));
  
  contents.push({ role: "user", parts: [{ text: input }] });
  
  // Gemini usa system instruction separada
  return { contents, systemInstruction: systemPrompt };
}

export async function callGemini(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string
) {
  const genAI = getGeminiClient();
  const modelClient = genAI.getGenerativeModel({
    model: model === "gemini-2.5-flash" ? "gemini-2.0-flash-exp" : model, // Mapear para modelo disponível
    systemInstruction: systemPrompt
  });
  
  const { contents } = toGeminiContent(history, input, systemPrompt);
  const res = await modelClient.generateContent({ contents });
  
  const text = res.response.text();
  return { 
    text, 
    raw: res,
    usage: res.response.usageMetadata
  };
}

export async function streamGemini(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string
) {
  const genAI = getGeminiClient();
  const modelClient = genAI.getGenerativeModel({
    model: model === "gemini-2.5-flash" ? "gemini-2.0-flash-exp" : model, // Mapear para modelo disponível
    systemInstruction: systemPrompt
  });
  
  const { contents } = toGeminiContent(history, input, systemPrompt);
  const result = await modelClient.generateContentStream({ contents });
  
  return result;
}
