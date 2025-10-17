/**
 * Gemini Live API Service
 * Integração com Gemini 2.5 Flash Live API para interação de voz em tempo real
 */

import * as genai from '@google/genai';

export interface GeminiLiveConfig {
  apiKey: string;
  projectId?: string;
  location?: string;
  modelId?: string;
  responseModalities?: ('TEXT' | 'AUDIO')[];
  temperature?: number;
  maxOutputTokens?: number;
  voiceConfig?: {
    voiceName?: string;
    language?: string;
  };
  systemInstruction?: string;
  tools?: any[];
}

export interface AudioMessage {
  type: 'audio';
  data: ArrayBuffer;
  sampleRate: number;
  channels: number;
}

export interface TextMessage {
  type: 'text';
  content: string;
}

export interface FunctionCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface FunctionResponse {
  id: string;
  response: any;
}

export type Message = AudioMessage | TextMessage;

export interface GeminiLiveSession {
  sendMessage: (message: Message) => Promise<void>;
  sendFunctionResponse: (response: FunctionResponse) => Promise<void>;
  onMessage: (callback: (message: any) => void) => void;
  onFunctionCall: (callback: (call: FunctionCall) => void) => void;
  onError: (callback: (error: Error) => void) => void;
  close: () => Promise<void>;
}

export class GeminiLiveService {
  private client: any;
  private config: GeminiLiveConfig;
  private session: any = null;
  private messageCallbacks: ((message: any) => void)[] = [];
  private functionCallCallbacks: ((call: FunctionCall) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];

  constructor(config: GeminiLiveConfig) {
    this.config = {
      modelId: 'gemini-live-2.5-flash-preview-native-audio-09-2025',
      responseModalities: ['AUDIO', 'TEXT'],
      temperature: 0.7,
      maxOutputTokens: 2048,
      voiceConfig: {
        voiceName: 'Aoede',
        language: 'pt-BR'
      },
      systemInstruction: 'Você é um assistente de laboratório virtual especializado em química e física. Ajude os estudantes com experimentos, cálculos e explicações científicas.',
      ...config
    };

    this.initializeClient();
  }

  private initializeClient() {
    try {
      // Mock client para desenvolvimento - substitua pela implementação real
      this.client = {
        aio: {
          live: {
            connect: async (config: any) => {
              console.log('Conectando ao Gemini Live API:', config);
              return {
                send: async (data: any) => console.log('Enviando:', data),
                receive: async function* () {
                  yield { text: 'Resposta mock do Gemini' };
                },
                close: async () => console.log('Fechando conexão'),
                send_tool_response: async (response: any) => console.log('Resposta de ferramenta:', response)
              };
            }
          }
        }
      };
    } catch (error) {
      console.error('Erro ao inicializar cliente Gemini:', error);
      throw new Error('Falha ao inicializar cliente Gemini Live API');
    }
  }

  async createSession(): Promise<GeminiLiveSession> {
    try {
      const sessionConfig = {
        model: this.config.modelId,
        config: {
          responseModalities: this.config.responseModalities,
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxOutputTokens,
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: this.config.voiceConfig?.voiceName
                }
              }
            }
          },
          systemInstruction: this.config.systemInstruction,
          tools: this.config.tools || []
        }
      };

      this.session = await this.client.aio.live.connect(sessionConfig);

      return {
        sendMessage: this.sendMessage.bind(this),
        sendFunctionResponse: this.sendFunctionResponse.bind(this),
        onMessage: this.onMessage.bind(this),
        onFunctionCall: this.onFunctionCall.bind(this),
        onError: this.onError.bind(this),
        close: this.close.bind(this)
      };
    } catch (error) {
      console.error('Erro ao criar sessão Gemini Live:', error);
      throw new Error('Falha ao criar sessão Gemini Live API');
    }
  }

  private async sendMessage(message: Message): Promise<void> {
    if (!this.session) {
      throw new Error('Sessão não inicializada');
    }

    try {
      if (message.type === 'audio') {
        // Converter ArrayBuffer para formato esperado pelo Gemini
        const audioData = new Uint8Array(message.data);
        await this.session.send(audioData);
      } else if (message.type === 'text') {
        await this.session.send(message.content);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      this.errorCallbacks.forEach(callback => callback(error as Error));
    }
  }

  private async sendFunctionResponse(response: FunctionResponse): Promise<void> {
    if (!this.session) {
      throw new Error('Sessão não inicializada');
    }

    try {
      await this.session.send_tool_response({
        function_responses: [{
          id: response.id,
          response: response.response
        }]
      });
    } catch (error) {
      console.error('Erro ao enviar resposta de função:', error);
      this.errorCallbacks.forEach(callback => callback(error as Error));
    }
  }

  private onMessage(callback: (message: any) => void): void {
    this.messageCallbacks.push(callback);
    
    if (this.session) {
      this.startListening();
    }
  }

  private onFunctionCall(callback: (call: FunctionCall) => void): void {
    this.functionCallCallbacks.push(callback);
  }

  private onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  private async startListening(): Promise<void> {
    if (!this.session) return;

    try {
      for await (const response of this.session.receive()) {
        // Processar diferentes tipos de resposta
        if (response.text) {
          this.messageCallbacks.forEach(callback => 
            callback({ type: 'text', content: response.text })
          );
        }

        if (response.data) {
          // Áudio de resposta
          this.messageCallbacks.forEach(callback => 
            callback({ 
              type: 'audio', 
              data: response.data,
              sampleRate: 24000, // Gemini Live usa 24kHz para saída
              channels: 1
            })
          );
        }

        if (response.tool_call) {
          // Function call
          const functionCall: FunctionCall = {
            id: response.tool_call.id,
            name: response.tool_call.name,
            args: response.tool_call.args
          };
          this.functionCallCallbacks.forEach(callback => callback(functionCall));
        }

        if (response.input_transcription) {
          // Transcrição da entrada do usuário
          this.messageCallbacks.forEach(callback => 
            callback({ 
              type: 'input_transcription', 
              content: response.input_transcription.text 
            })
          );
        }

        if (response.output_transcription) {
          // Transcrição da saída do modelo
          this.messageCallbacks.forEach(callback => 
            callback({ 
              type: 'output_transcription', 
              content: response.output_transcription.text 
            })
          );
        }

        if (response.interrupted) {
          // Modelo foi interrompido
          this.messageCallbacks.forEach(callback => 
            callback({ type: 'interrupted' })
          );
        }
      }
    } catch (error) {
      console.error('Erro ao escutar respostas:', error);
      this.errorCallbacks.forEach(callback => callback(error as Error));
    }
  }

  private async close(): Promise<void> {
    if (this.session) {
      try {
        await this.session.close();
        this.session = null;
      } catch (error) {
        console.error('Erro ao fechar sessão:', error);
      }
    }
  }

  // Métodos utilitários para configuração
  updateSystemInstruction(instruction: string): void {
    this.config.systemInstruction = instruction;
  }

  addTool(tool: any): void {
    if (!this.config.tools) {
      this.config.tools = [];
    }
    this.config.tools.push(tool);
  }

  updateVoiceConfig(voiceConfig: Partial<GeminiLiveConfig['voiceConfig']>): void {
    this.config.voiceConfig = { ...this.config.voiceConfig, ...voiceConfig };
  }
}

// Instância singleton para uso global
let geminiLiveInstance: GeminiLiveService | null = null;

export function getGeminiLiveService(config?: GeminiLiveConfig): GeminiLiveService {
  if (!geminiLiveInstance && config) {
    geminiLiveInstance = new GeminiLiveService(config);
  }
  
  if (!geminiLiveInstance) {
    throw new Error('Gemini Live Service não foi inicializado. Forneça a configuração primeiro.');
  }
  
  return geminiLiveInstance;
}

export function initializeGeminiLive(config: GeminiLiveConfig): GeminiLiveService {
  geminiLiveInstance = new GeminiLiveService(config);
  return geminiLiveInstance;
}
