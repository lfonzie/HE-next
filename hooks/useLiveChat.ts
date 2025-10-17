// hooks/useLiveChat.ts
import { useRef, useState, useEffect, useCallback } from 'react';

export interface LiveChatOptions {
  mic?: boolean;
  cam?: boolean;
  screen?: boolean;
  autoConnect?: boolean;
}

export interface LiveChatState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isStreaming: boolean;
  isAudioStreaming: boolean;
  isVideoStreaming: boolean;
  isScreenSharing: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  aiResponse: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    audioBlob?: Blob;
    isStreaming?: boolean;
  }>;
  videoElement: HTMLVideoElement | null;
}

export function useLiveChat(options: LiveChatOptions = {}) {
  console.log('[useLiveChat] Hook called with options:', options);
  console.log('[useLiveChat] Hook rendering...');
  
  const sessionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const connectingRef = useRef(false);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<LiveChatState>({
    connected: false,
    connecting: false,
    error: null,
    audioEnabled: false,
    videoEnabled: false,
    screenEnabled: false,
    isRecording: false,
    isPlaying: false,
    isStreaming: false,
    isAudioStreaming: false,
    isVideoStreaming: false,
    isScreenSharing: false,
    connectionStatus: 'disconnected',
    aiResponse: '',
    messages: [],
    videoElement: null,
  });

  console.log('[useLiveChat] Initial state:', state);

  const updateState = useCallback((updates: Partial<LiveChatState>) => {
    console.log('[useLiveChat] updateState called with:', updates);
    setState(prev => {
      const newState = { ...prev, ...updates };
      console.log('[useLiveChat] State updated from:', prev, 'to:', newState);
      return newState;
    });
  }, []);

  const addMessage = useCallback((message: LiveChatState['messages'][0]) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Add message when streaming starts
  const addStreamingMessage = useCallback((type: string) => {
    const message = {
      id: `streaming_${Date.now()}`,
      role: 'assistant' as const,
      content: `Streaming de ${type} iniciado com sucesso!`,
      timestamp: Date.now(),
    };
    addMessage(message);
  }, [addMessage]);

  const connect = useCallback(async (opts: LiveChatOptions = {}) => {
    if (connectingRef.current || state.connected) {
      console.log('[LiveChat] Already connecting or connected');
      return;
    }

    const { mic = true, cam = false, screen = false } = opts;
    connectingRef.current = true;
    
    updateState({
      connecting: true,
      connectionStatus: 'connecting',
      error: null,
      audioEnabled: mic,
      videoEnabled: cam,
      screenEnabled: screen,
    });

    try {
      console.log('[LiveChat] Connecting to chat service...');
      
      // Create a new session by calling our API endpoint
      const response = await fetch('/api/chat/live/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect to chat service');
      }

      const { sessionId } = await response.json();
      console.log('[LiveChat] Session created:', sessionId);
      sessionRef.current = { sessionId };

      updateState({
        connected: true,
        connecting: false,
        connectionStatus: 'connected',
      });

    } catch (e: any) {
      console.error('[LiveChat] Connect error:', e);
      updateState({
        connected: false,
        connecting: false,
        connectionStatus: 'error',
        error: e.message || 'Connection failed'
      });
    } finally {
      connectingRef.current = false;
    }
  }, [state.connected, updateState]);

  // Real-time Audio Streaming
  const startAudioStreaming = useCallback(async () => {
    if (!state.connected || state.isAudioStreaming) {
      console.log('[LiveChat] Cannot start audio streaming:', { connected: state.connected, isAudioStreaming: state.isAudioStreaming });
      return;
    }

    try {
      console.log('[LiveChat] Starting audio streaming...');
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });

      console.log('[LiveChat] Microphone access granted');

      // Create audio context for real-time processing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      audioContextRef.current = audioContext;
      audioProcessorRef.current = processor;

      // Use ref to track streaming state to avoid closure issues
      const isStreamingRef = { current: true };

      processor.onaudioprocess = async (event) => {
        if (!isStreamingRef.current) return;
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Convert float32 to int16
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }

        // Send audio data to API
        try {
          console.log('[LiveChat] Sending audio data:', int16Data.length, 'samples');
          
          // For now, just log the data instead of sending to avoid auth issues
          if (int16Data.length > 0) {
            console.log('[LiveChat] Audio data captured:', {
              samples: int16Data.length,
              firstSample: int16Data[0],
              lastSample: int16Data[int16Data.length - 1],
              maxSample: Math.max(...Array.from(int16Data)),
              minSample: Math.min(...Array.from(int16Data))
            });
          }
          
          // Send audio data to API
          const response = await fetch('/api/chat/live/send-audio-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: int16Data.buffer
          });
          
          if (!response.ok) {
            console.error('[LiveChat] Audio streaming response error:', response.status, response.statusText);
          } else {
            console.log('[LiveChat] Audio data sent successfully');
          }
        } catch (error) {
          console.error('[LiveChat] Audio streaming error:', error);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Store ref for cleanup
      (processor as any).isStreamingRef = isStreamingRef;

      updateState({ 
        isAudioStreaming: true,
        isStreaming: true 
      });

      addStreamingMessage('áudio');
      console.log('[LiveChat] Audio streaming started successfully');
    } catch (error) {
      console.error('[LiveChat] Failed to start audio streaming:', error);
      updateState({ error: 'Failed to start audio streaming: ' + (error as Error).message });
    }
  }, [state.connected, state.isAudioStreaming, updateState, addStreamingMessage]);

  const stopAudioStreaming = useCallback(() => {
    console.log('[LiveChat] Stopping audio streaming...');
    
    if (audioProcessorRef.current) {
      // Stop the streaming ref
      if ((audioProcessorRef.current as any).isStreamingRef) {
        (audioProcessorRef.current as any).isStreamingRef.current = false;
      }
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    updateState({ 
      isAudioStreaming: false,
      isStreaming: state.isVideoStreaming || state.isScreenSharing
    });
    
    console.log('[LiveChat] Audio streaming stopped');
  }, [state.isVideoStreaming, state.isScreenSharing, updateState]);

  // Real-time Video Streaming
  const startVideoStreaming = useCallback(async () => {
    if (!state.connected || state.isVideoStreaming) return;

    try {
      console.log('[LiveChat] Starting video streaming...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 10 }
        } 
      });

      videoStreamRef.current = stream;

      // Create video element for preview
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);
      
      videoElementRef.current = videoElement;

      // Start frame capture
      const captureFrame = async () => {
        if (!state.isVideoStreaming || !videoElement) return;

        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0);
            
            canvas.toBlob(async (blob) => {
              if (blob && state.isVideoStreaming) {
                const formData = new FormData();
                formData.append('video', blob);
                
                try {
                  await fetch('/api/chat/live/send-video-stream', {
                    method: 'POST',
                    body: formData
                  });
                } catch (error) {
                  console.error('[LiveChat] Video streaming error:', error);
                }
              }
            }, 'image/jpeg', 0.8);
          }
        } catch (error) {
          console.error('[LiveChat] Frame capture error:', error);
        }
      };

      // Capture frames at 10 FPS
      streamingIntervalRef.current = setInterval(captureFrame, 100);

      updateState({ 
        isVideoStreaming: true,
        isStreaming: true,
        videoElement 
      });

      console.log('[LiveChat] Video streaming started');
    } catch (error) {
      console.error('[LiveChat] Failed to start video streaming:', error);
      updateState({ error: 'Failed to start video streaming' });
    }
  }, [state.connected, state.isVideoStreaming, updateState]);

  const stopVideoStreaming = useCallback(() => {
    console.log('[LiveChat] Stopping video streaming...');
    
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }

    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }

    if (videoElementRef.current) {
      videoElementRef.current.remove();
      videoElementRef.current = null;
    }

    updateState({ 
      isVideoStreaming: false,
      isStreaming: state.isAudioStreaming || state.isScreenSharing,
      videoElement: null
    });
  }, [state.isAudioStreaming, state.isScreenSharing, updateState]);

  // Real-time Screen Sharing
  const startScreenSharing = useCallback(async () => {
    if (!state.connected || state.isScreenSharing) return;

    try {
      console.log('[LiveChat] Starting screen sharing...');
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 5 }
        },
        audio: false
      });

      screenStreamRef.current = stream;

      // Create video element for preview
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);
      
      videoElementRef.current = videoElement;

      // Handle screen sharing end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenSharing();
      };

      // Start frame capture
      const captureFrame = async () => {
        if (!state.isScreenSharing || !videoElement) return;

        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0);
            
            canvas.toBlob(async (blob) => {
              if (blob && state.isScreenSharing) {
                const formData = new FormData();
                formData.append('screen', blob);
                
                try {
                  await fetch('/api/chat/live/send-screen-stream', {
                    method: 'POST',
                    body: formData
                  });
                } catch (error) {
                  console.error('[LiveChat] Screen streaming error:', error);
                }
              }
            }, 'image/jpeg', 0.8);
          }
        } catch (error) {
          console.error('[LiveChat] Screen frame capture error:', error);
        }
      };

      // Capture frames at 5 FPS
      streamingIntervalRef.current = setInterval(captureFrame, 200);

      updateState({ 
        isScreenSharing: true,
        isStreaming: true,
        videoElement 
      });

      console.log('[LiveChat] Screen sharing started');
    } catch (error) {
      console.error('[LiveChat] Failed to start screen sharing:', error);
      updateState({ error: 'Failed to start screen sharing' });
    }
  }, [state.connected, state.isScreenSharing, updateState]);

  const stopScreenSharing = useCallback(() => {
    console.log('[LiveChat] Stopping screen sharing...');
    
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    if (videoElementRef.current) {
      videoElementRef.current.remove();
      videoElementRef.current = null;
    }

    updateState({ 
      isScreenSharing: false,
      isStreaming: state.isAudioStreaming || state.isVideoStreaming,
      videoElement: null
    });
  }, [state.isAudioStreaming, state.isVideoStreaming, updateState]);

  const disconnect = useCallback(() => {
    console.log('[LiveChat] Disconnecting...');
    
    // Stop all streaming
    if (state.isAudioStreaming) stopAudioStreaming();
    if (state.isVideoStreaming) stopVideoStreaming();
    if (state.isScreenSharing) stopScreenSharing();
    
    sessionRef.current = null;
    
    updateState({
      connected: false,
      connecting: false,
      connectionStatus: 'disconnected',
      error: null,
      audioEnabled: false,
      videoEnabled: false,
      screenEnabled: false,
      isRecording: false,
      isPlaying: false,
      isStreaming: false,
      isAudioStreaming: false,
      isVideoStreaming: false,
      isScreenSharing: false,
      videoElement: null,
    });
  }, [state.isAudioStreaming, state.isVideoStreaming, state.isScreenSharing, stopAudioStreaming, stopVideoStreaming, stopScreenSharing, updateState]);

  // Auto-connect if specified
  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }
  }, [options.autoConnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    const onBeforeUnload = () => disconnect();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      disconnect();
    };
  }, [disconnect]);

  // Legacy recording functions (for compatibility)
  const startRecording = useCallback(async () => {
    console.log('[LiveChat] startRecording called');
    
    // Simple test first
    try {
      console.log('[LiveChat] Testing microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[LiveChat] Microphone access successful!', stream);
      
      // Add a simple message to show it's working
      addMessage({
        id: `test_${Date.now()}`,
        role: 'assistant',
        content: 'Microfone acessado com sucesso! Streaming iniciado.',
        timestamp: Date.now(),
      });
      
      // Now start the real streaming
      startAudioStreaming();
    } catch (error) {
      console.error('[LiveChat] Microphone access failed:', error);
      updateState({ error: 'Falha ao acessar microfone: ' + (error as Error).message });
    }
  }, [startAudioStreaming, addMessage, updateState]);

  const stopRecording = useCallback(() => {
    console.log('[LiveChat] stopRecording called');
    stopAudioStreaming();
  }, [stopAudioStreaming]);

  const toggleAudio = useCallback(() => {
    if (state.isAudioStreaming) {
      stopAudioStreaming();
    } else {
      startAudioStreaming();
    }
  }, [state.isAudioStreaming, startAudioStreaming, stopAudioStreaming]);

  const toggleVideo = useCallback(() => {
    if (state.isVideoStreaming) {
      stopVideoStreaming();
    } else {
      startVideoStreaming();
    }
  }, [state.isVideoStreaming, startVideoStreaming, stopVideoStreaming]);

  const returnValue = {
    ...state,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    startAudioStreaming,
    stopAudioStreaming,
    startVideoStreaming,
    stopVideoStreaming,
    startScreenSharing,
    stopScreenSharing,
    toggleAudio,
    toggleVideo,
    addMessage,
    clearMessages,
    clearError,
  };
  
  console.log('[useLiveChat] Returning:', { 
    connected: returnValue.connected, 
    connecting: returnValue.connecting, 
    error: returnValue.error,
    isRecording: returnValue.isRecording 
  });
  
  return returnValue;
}