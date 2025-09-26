"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface WebSocketEvent {
  type: string;
  [key: string]: any;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sessionId: string | null;
  messages: Array<{ role: string; content: string; timestamp: Date }>;
}

export interface UseWebSocketOptions {
  model?: string;
  onEvent?: (event: WebSocketEvent) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    model = "gpt-4o-realtime",
    onEvent,
    onError,
    onConnectionChange,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    sessionId: null,
    messages: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const updateState = useCallback((updates: Partial<WebSocketState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback((error: string) => {
    console.error("WebSocket error:", error);
    updateState({ error, isConnecting: false });
    onError?.(error);
  }, [updateState, onError]);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
    updateState({
      isConnected: false,
      isConnecting: false,
      sessionId: null,
    });
  }, [updateState]);

  const connect = useCallback(async () => {
    if (state.isConnected || state.isConnecting) return;

    try {
      updateState({ isConnecting: true, error: null });

      // Create connection through our API
      const response = await fetch("/api/realtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello", // Initial message to establish connection
          model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to connect");
      }

      const data = await response.json();
      
      updateState({
        isConnected: true,
        isConnecting: false,
        sessionId: data.sessionId,
        messages: [...state.messages, {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        }],
      });

      onConnectionChange?.(true);

    } catch (error) {
      console.error("WebSocket connection error:", error);
      handleError(error instanceof Error ? error.message : "Connection failed");
    }
  }, [state.isConnected, state.isConnecting, state.messages, model, onConnectionChange, updateState, handleError]);

  const disconnect = useCallback(() => {
    cleanup();
    onConnectionChange?.(false);
  }, [cleanup, onConnectionChange]);

  const sendMessage = useCallback(async (message: string) => {
    if (!state.isConnected) {
      handleError("Not connected");
      return;
    }

    try {
      // Add user message to state
      const userMessage = {
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      
      updateState({
        messages: [...state.messages, userMessage],
      });

      // Send message through API
      const response = await fetch("/api/realtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId: state.sessionId,
          model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      
      // Add assistant response to state
      const assistantMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      
      updateState({
        messages: [...state.messages, userMessage, assistantMessage],
      });

      // Trigger event callback
      onEvent?.({
        type: "message",
        content: data.response,
        role: "assistant",
      });

    } catch (error) {
      console.error("Send message error:", error);
      handleError(error instanceof Error ? error.message : "Failed to send message");
    }
  }, [state.isConnected, state.messages, state.sessionId, model, onEvent, updateState, handleError]);

  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      handleError("Max reconnection attempts reached");
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Reconnecting... attempt ${reconnectAttemptsRef.current}`);
      connect();
    }, delay);
  }, [connect, handleError]);

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!state.isConnected && !state.isConnecting && reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnect();
    }
  }, [state.isConnected, state.isConnecting, reconnect]);

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
    sendMessage,
    reconnect,
  };
}
