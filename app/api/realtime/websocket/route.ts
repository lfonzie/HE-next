import { NextRequest, NextResponse } from "next/server";
import WebSocket from "ws";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId, model = "gpt-4o-realtime" } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Create WebSocket connection to OpenAI Realtime API
    const wsUrl = `wss://api.openai.com/v1/realtime?model=${model}`;
    const ws = new WebSocket(wsUrl, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    return new Promise((resolve) => {
      let responseData = "";
      let isResolved = false;

      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          ws.close();
          resolve(NextResponse.json(
            { error: "Request timeout" },
            { status: 408 }
          ));
        }
      }, 30000); // 30 second timeout

      ws.on("open", () => {
        // Send session configuration
        ws.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text"],
            instructions: "You are a helpful AI assistant. Respond naturally and conversationally.",
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200,
            },
            tools: [
              {
                type: "function",
                name: "get_weather",
                description: "Get the current weather in a given location",
                parameters: {
                  type: "object",
                  properties: {
                    location: {
                      type: "string",
                      description: "The city and state, e.g. San Francisco, CA",
                    },
                  },
                  required: ["location"],
                },
              },
            ],
          },
        }));

        // Send the user message
        ws.send(JSON.stringify({
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
        }));
      });

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === "conversation.item.input_text.delta") {
            responseData += message.delta;
          } else if (message.type === "conversation.item.input_text.done") {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeout);
              ws.close();
              resolve(NextResponse.json({
                response: responseData,
                sessionId: message.session_id,
              }));
            }
          } else if (message.type === "error") {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeout);
              ws.close();
              resolve(NextResponse.json(
                { error: message.error?.message || "Unknown error" },
                { status: 500 }
              ));
            }
          }
        } catch (error) {
          console.error("WebSocket message parse error:", error);
        }
      });

      ws.on("error", (error) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          resolve(NextResponse.json(
            { error: "WebSocket connection error" },
            { status: 500 }
          ));
        }
      });

      ws.on("close", () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          resolve(NextResponse.json({
            response: responseData,
            sessionId: sessionId,
          }));
        }
      });
    });
  } catch (error) {
    console.error("WebSocket API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
