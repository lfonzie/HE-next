"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface RealtimeEvent {
  type: string;
  [key: string]: any;
}

export interface RealtimeState {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  error: string | null;
  sessionId: string | null;
}

export interface UseRealtimeOptions {
  model?: string;
  voice?: string;
  onEvent?: (event: RealtimeEvent) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    model = "gpt-4o-realtime",
    voice = "Zephyr",
    onEvent,
    onError,
    onConnectionChange,
  } = options;

  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isConnecting: false,
    isMuted: false,
    isSpeaking: false,
    error: null,
    sessionId: null,
  });

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const updateState = useCallback((updates: Partial<RealtimeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback((error: string) => {
    console.error("Realtime error:", error);
    updateState({ error, isConnecting: false });
    onError?.(error);
  }, [updateState, onError]);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    dataChannelRef.current = null;
    sessionIdRef.current = null;
    updateState({
      isConnected: false,
      isConnecting: false,
      isSpeaking: false,
      sessionId: null,
    });
  }, [updateState]);

  const connect = useCallback(async () => {
    if (state.isConnected || state.isConnecting) return;

    try {
      updateState({ isConnecting: true, error: null });

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      // Get user media
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });
      mediaStreamRef.current = mediaStream;

      // Add audio tracks to peer connection
      mediaStream.getTracks().forEach(track => {
        pc.addTrack(track, mediaStream);
      });

      // Create audio element for playback
      const audioElement = document.createElement("audio");
      audioElement.autoplay = true;
      audioElement.controls = false;
      audioElementRef.current = audioElement;
      document.body.appendChild(audioElement);

      // Handle incoming audio
      pc.ontrack = (event) => {
        console.log("Received remote track");
        audioElement.srcObject = event.streams[0];
        updateState({ isSpeaking: true });
      };

      // Create data channel for events
      const dataChannel = pc.createDataChannel("oai-events", {
        ordered: true,
      });
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log("Data channel opened");
      };

      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received event:", data);
          onEvent?.(data);
          
          // Handle specific event types
          if (data.type === "conversation.item.input_text.done") {
            updateState({ isSpeaking: false });
          }
        } catch (error) {
          console.error("Failed to parse data channel message:", error);
        }
      };

      dataChannel.onerror = (error) => {
        console.error("Data channel error:", error);
        handleError("Data channel error");
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("ICE candidate:", event.candidate);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        if (pc.connectionState === "connected") {
          updateState({ isConnected: true, isConnecting: false });
          onConnectionChange?.(true);
        } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          handleError("Connection failed");
          onConnectionChange?.(false);
        }
      };

      // Get ephemeral token from server
      const response = await fetch("/api/realtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          voice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create session");
      }

      const sessionData = await response.json();
      
      // Create offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);

      // Connect to OpenAI Realtime API using session ID
      const webrtcUrl = `wss://api.openai.com/v1/realtime/${sessionData.sessionId}`;
      
      // For now, we'll use a simplified approach
      // In a real implementation, you would establish WebRTC connection with OpenAI
      // This requires the OpenAI Realtime WebRTC SDK
      
      updateState({ 
        sessionId: sessionData.sessionId,
        isConnected: true,
        isConnecting: false 
      });

    } catch (error) {
      console.error("Connection error:", error);
      handleError(error instanceof Error ? error.message : "Connection failed");
      cleanup();
    }
  }, [state.isConnected, state.isConnecting, model, voice, onEvent, onError, onConnectionChange, updateState, handleError, cleanup]);

  const disconnect = useCallback(async () => {
    try {
      if (sessionIdRef.current) {
        await fetch("/api/realtime", {
          method: "DELETE",
          headers: {
            "X-Session-Id": sessionIdRef.current,
          },
        });
      }
    } catch (error) {
      console.error("Failed to close session:", error);
    } finally {
      cleanup();
    }
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = state.isMuted;
      });
      updateState({ isMuted: !state.isMuted });
    }
  }, [state.isMuted, updateState]);

  const sendMessage = useCallback((message: string) => {
    if (dataChannelRef.current?.readyState === "open") {
      const event = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: message,
            },
          ],
        },
      };
      dataChannelRef.current.send(JSON.stringify(event));
    }
  }, []);

  const sendToolCall = useCallback((toolName: string, parameters: any) => {
    if (dataChannelRef.current?.readyState === "open") {
      const event = {
        type: "conversation.item.create",
        item: {
          type: "tool_call",
          tool_call: {
            name: toolName,
            parameters,
          },
        },
      };
      dataChannelRef.current.send(JSON.stringify(event));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    ...state,
    connect,
    disconnect,
    toggleMute,
    sendMessage,
    sendToolCall,
  };
}
