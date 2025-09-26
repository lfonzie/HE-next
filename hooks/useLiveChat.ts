// hooks/useLiveChat.ts
import { useRef, useState, useEffect, useCallback } from 'react';

export interface LiveChatOptions {
  mic?: boolean;
  cam?: boolean;
  screen?: boolean;
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
  aiResponse: string;
}

export function useLiveChat() {
  const sessionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const connectingRef = useRef(false);
  const [state, setState] = useState<LiveChatState>({
    connected: false,
    connecting: false,
    error: null,
    audioEnabled: false,
    videoEnabled: false,
    screenEnabled: false,
    isRecording: false,
    isPlaying: false,
    aiResponse: '',
  });

  // Cleanup on unmount
  useEffect(() => {
    const onBeforeUnload = () => disconnect();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      disconnect();
    };
  }, []);

  const updateState = useCallback((updates: Partial<LiveChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const connect = useCallback(async (opts: LiveChatOptions = {}) => {
    if (connectingRef.current || sessionRef.current) {
      console.log('[LiveChat] Already connecting or connected');
      return;
    }

    const { mic = true, cam = false, screen = false } = opts;
    connectingRef.current = true;
    
    updateState({
      connecting: true,
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

      // Set up media recording if microphone is enabled
      if (mic) {
        await setupMediaRecording();
      }

      updateState({
        connected: true,
        connecting: false,
      });

    } catch (e: any) {
      console.error('[LiveChat] Connect error:', e);
      updateState({
        connected: false,
        connecting: false,
        error: e.message || 'Connection failed'
      });
      disconnect();
    } finally {
      connectingRef.current = false;
    }
  }, [updateState]);

  const setupMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToAPI(audioBlob);
        audioChunksRef.current = [];
      };

      console.log('[LiveChat] Media recording setup complete');
    } catch (error) {
      console.error('[LiveChat] Failed to setup media recording:', error);
      updateState({ error: 'Failed to access microphone' });
    }
  };

  const sendAudioToAPI = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/chat/live/send-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send audio');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'text' && data.content) {
                fullResponse += data.content;
              } else if (data.type === 'done') {
                // Display the complete text response
                console.log('[LiveChat] AI Response:', fullResponse);
                // You could emit this to a parent component or display it in the UI
                updateState({ error: null });
              } else if (data.type === 'error') {
                console.error('[LiveChat] API error:', data.content);
                updateState({ error: data.content });
              }
            } catch (e) {
              console.warn('[LiveChat] Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('[LiveChat] Failed to send audio:', error);
      updateState({ error: 'Failed to send audio' });
    }
  };

  const startRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      mediaRecorderRef.current.start();
      updateState({ isRecording: true });
      console.log('[LiveChat] Recording started');
    }
  }, [updateState]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      updateState({ isRecording: false });
      console.log('[LiveChat] Recording stopped');
    }
  }, [updateState]);

  const sendTextMessage = useCallback(async (message: string) => {
    try {
      const response = await fetch('/api/chat/live/send-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send text message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'text' && data.content) {
                fullResponse += data.content;
                updateState({ aiResponse: fullResponse });
              } else if (data.type === 'done') {
                // Display the complete text response
                console.log('[LiveChat] AI Response:', fullResponse);
                updateState({ error: null, aiResponse: fullResponse });
              } else if (data.type === 'error') {
                console.error('[LiveChat] API error:', data.content);
                updateState({ error: data.content });
              }
            } catch (e) {
              console.warn('[LiveChat] Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('[LiveChat] Failed to send text:', error);
      updateState({ error: 'Failed to send text message' });
    }
  }, [updateState]);

  const disconnect = useCallback(() => {
    console.log('[LiveChat] Disconnecting...');
    
    // Stop media recording
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }

    // Stop all media tracks
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    sessionRef.current = null;
    
    updateState({
      connected: false,
      connecting: false,
      error: null,
      audioEnabled: false,
      videoEnabled: false,
      screenEnabled: false,
      isRecording: false,
      isPlaying: false,
    });
  }, [updateState]);

  const toggleAudio = useCallback(() => {
    updateState({ audioEnabled: !state.audioEnabled });
  }, [state.audioEnabled, updateState]);

  const toggleVideo = useCallback(() => {
    updateState({ videoEnabled: !state.videoEnabled });
  }, [state.videoEnabled, updateState]);

  return {
    ...state,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextMessage,
    toggleAudio,
    toggleVideo,
  };
}