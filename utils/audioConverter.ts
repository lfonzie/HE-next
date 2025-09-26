// utils/audioConverter.ts
import { Buffer } from 'buffer';

export interface AudioConversionOptions {
  sampleRate?: number;
  channels?: number;
  bitDepth?: number;
}

export class AudioConverter {
  private static readonly DEFAULT_OPTIONS: Required<AudioConversionOptions> = {
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16,
  };

  /**
   * Convert audio blob to PCM format required by Gemini Live API
   * @param audioBlob - The audio blob to convert
   * @param options - Conversion options
   * @returns Promise<Blob> - PCM formatted audio blob
   */
  static async convertToPCM(audioBlob: Blob, options: AudioConversionOptions = {}): Promise<Blob> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Create audio context for processing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: opts.sampleRate,
      });

      // Decode audio data
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Convert to PCM format
      const pcmData = this.convertAudioBufferToPCM(audioBuffer, opts);
      
      // Create PCM blob
      const pcmBlob = new Blob([pcmData], { type: 'audio/pcm' });
      
      // Clean up
      audioContext.close();
      
      return pcmBlob;
    } catch (error) {
      console.error('Audio conversion failed:', error);
      throw new Error('Failed to convert audio to PCM format');
    }
  }

  /**
   * Convert AudioBuffer to PCM data
   */
  private static convertAudioBufferToPCM(audioBuffer: AudioBuffer, options: Required<AudioConversionOptions>): ArrayBuffer {
    const { sampleRate, channels, bitDepth } = options;
    
    // Get the source data
    const sourceData = audioBuffer.getChannelData(0); // Use first channel for mono
    const sourceSampleRate = audioBuffer.sampleRate;
    
    // Resample if necessary
    let processedData = sourceData;
    if (sourceSampleRate !== sampleRate) {
      processedData = this.resample(sourceData, sourceSampleRate, sampleRate);
    }
    
    // Convert to PCM format
    const pcmData = this.float32ToPCM16(processedData);
    
    return pcmData.buffer;
  }

  /**
   * Simple resampling using linear interpolation
   */
  private static resample(data: Float32Array, sourceRate: number, targetRate: number): Float32Array {
    if (sourceRate === targetRate) return data;
    
    const ratio = sourceRate / targetRate;
    const newLength = Math.floor(data.length / ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const sourceIndex = i * ratio;
      const index = Math.floor(sourceIndex);
      const fraction = sourceIndex - index;
      
      if (index + 1 < data.length) {
        result[i] = data[index] * (1 - fraction) + data[index + 1] * fraction;
      } else {
        result[i] = data[index];
      }
    }
    
    return result;
  }

  /**
   * Convert Float32Array to PCM16 format
   */
  private static float32ToPCM16(data: Float32Array): Int16Array {
    const pcm16 = new Int16Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      // Clamp and convert to 16-bit PCM
      const sample = Math.max(-1, Math.min(1, data[i]));
      pcm16[i] = Math.round(sample * 32767);
    }
    
    return pcm16;
  }

  /**
   * Convert PCM data to base64 string
   */
  static async pcmToBase64(pcmBlob: Blob): Promise<string> {
    const arrayBuffer = await pcmBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    
    return btoa(binary);
  }

  /**
   * Convert base64 PCM data back to audio blob for playback
   */
  static base64ToAudioBlob(base64Data: string, mimeType: string = 'audio/wav'): Blob {
    try {
      // Decode base64
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create WAV header for playback
      const wavBlob = this.createWavBlob(bytes, mimeType);
      return wavBlob;
    } catch (error) {
      console.error('Failed to convert base64 to audio blob:', error);
      throw new Error('Failed to convert audio data');
    }
  }

  /**
   * Create WAV blob from PCM data
   */
  private static createWavBlob(pcmData: Uint8Array, mimeType: string): Blob {
    const sampleRate = 24000; // Output sample rate from Gemini Live API
    const channels = 1;
    const bitsPerSample = 16;
    
    const dataLength = pcmData.length;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;
    
    const buffer = new ArrayBuffer(totalLength);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true);
    view.setUint16(32, channels * bitsPerSample / 8, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Copy PCM data
    const uint8View = new Uint8Array(buffer, headerLength);
    uint8View.set(pcmData);
    
    return new Blob([buffer], { type: mimeType });
  }
}
