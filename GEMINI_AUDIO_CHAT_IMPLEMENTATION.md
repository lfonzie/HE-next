# Gemini Audio Chat Implementation Guide

## Overview

This implementation provides a complete audio chat interface powered by Google Gemini AI. It uses:
- **Google Gemini 2.5 Flash** for intelligent text generation
- **Google Cloud Text-to-Speech** for high-quality audio synthesis
- **Next.js 15 App Router** for modern server-side rendering
- **Beautiful UI** with Tailwind CSS and shadcn/ui components

## Features

✅ Real-time AI text generation with Gemini 2.5 Flash  
✅ High-quality audio synthesis with Google Cloud TTS  
✅ Beautiful, modern UI with dark mode support  
✅ Keyboard shortcuts (Enter to submit)  
✅ Audio playback controls with download option  
✅ Error handling and loading states  
✅ Fully typed with TypeScript  
✅ Responsive design for mobile and desktop  

## Files Created

### 1. API Route
**Location:** `/app/api/gemini-audio/route.ts`

This API endpoint handles:
- Text generation using Gemini 2.5 Flash
- Audio synthesis using Google Cloud TTS
- Error handling and logging
- Health check endpoint (GET)

### 2. React Component
**Location:** `/components/GeminiAudioChat.tsx`

A beautiful, feature-rich component that includes:
- Text input with textarea
- Submit button with loading state
- Response display with text and audio
- Audio player with controls
- Download audio functionality
- Error alerts and status messages

### 3. Page
**Location:** `/app/gemini-audio/page.tsx`

A dedicated page to showcase the Gemini Audio Chat component.

## Installation

### Prerequisites

The required dependencies are already installed in your project:
```json
{
  "@google-cloud/text-to-speech": "^6.3.0",
  "@google/generative-ai": "^0.24.1",
  "mime": "^4.1.0"
}
```

### Environment Setup

Your project already supports multiple environment variable names for the Gemini API key:

```env
# Add ONE of these to your .env.local file:
GOOGLE_GEMINI_API_KEY="your-gemini-api-key-here"
# OR
GEMINI_API_KEY="your-gemini-api-key-here"
# OR
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key-here"
```

**Get your API key:** https://aistudio.google.com/app/apikey

## Usage

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Access the Interface

Navigate to: **http://localhost:3000/gemini-audio**

### 3. Try It Out

Enter a prompt like:
- "Tell me a short story about a brave astronaut"
- "Explain quantum physics in simple terms"
- "Read me a poem about the ocean"

Click "Generate Audio Response" or press Enter to submit.

## API Endpoints

### POST /api/gemini-audio

Generates AI text response with audio synthesis.

**Request Body:**
```json
{
  "prompt": "Your prompt here",
  "voice": "pt-BR-Standard-A" // Optional, defaults to pt-BR-Standard-A
}
```

**Response:**
```json
{
  "text": "AI generated text response",
  "audio": "base64-encoded-audio-data",
  "audioFormat": "audio/mp3",
  "voice": "pt-BR-Standard-A",
  "timestamp": "2025-01-07T12:00:00.000Z",
  "aiProvider": "gemini-2.5-flash"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### GET /api/gemini-audio

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "gemini-audio",
  "version": "1.0.0",
  "timestamp": "2025-01-07T12:00:00.000Z"
}
```

## Voice Options

The API supports various Portuguese Brazilian voices:

- `pt-BR-Standard-A` - Female voice (default)
- `pt-BR-Standard-B` - Male voice
- `pt-BR-Wavenet-A` - Premium female voice (WaveNet)
- `pt-BR-Wavenet-B` - Premium male voice (WaveNet)
- `pt-BR-Neural2-A` - Neural female voice
- `pt-BR-Neural2-B` - Neural male voice

To use a different voice, modify the component to pass the `voice` parameter:

```typescript
body: JSON.stringify({ 
  prompt,
  voice: 'pt-BR-Wavenet-A' // Custom voice
}),
```

## Customization

### Change Language

To use a different language, modify the API route:

```typescript
// Change in /app/api/gemini-audio/route.ts
voice: {
  languageCode: 'en-US', // Change to your language
  name: 'en-US-Standard-A', // Change to matching voice
},
```

### Adjust Audio Settings

Modify the `audioConfig` in the API route:

```typescript
audioConfig: {
  audioEncoding: 'MP3',
  speakingRate: 1.2, // Speed (0.25 to 4.0)
  pitch: 2.0, // Pitch (-20.0 to 20.0)
},
```

### Change Gemini Model

To use a different model:

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp', // Or another model
  generationConfig: {
    temperature: 0.9, // Creativity (0.0 to 1.0)
    maxOutputTokens: 4096, // Max length
  },
});
```

## Architecture

```
┌─────────────────┐
│  User Browser   │
│  (React UI)     │
└────────┬────────┘
         │ POST /api/gemini-audio
         │ { prompt: "..." }
         ▼
┌─────────────────┐
│  Next.js API    │
│  Route Handler  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌─────┐
│Gemini│   │ TTS │
│ 2.5  │   │ API │
└─────┘   └─────┘
    │         │
    └────┬────┘
         │
         ▼
  { text, audio }
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Missing API Key**: Returns 500 with clear error message
2. **Invalid Prompt**: Returns 400 with validation error
3. **Gemini API Error**: Logs error and returns 500
4. **TTS Error**: Continues without audio, logs warning
5. **Network Error**: Displays error alert in UI

## Performance

- **Text Generation**: ~2-5 seconds (depends on prompt)
- **Audio Synthesis**: ~1-3 seconds (depends on text length)
- **Total Response Time**: ~3-8 seconds

## Security

✅ API key stored in environment variables  
✅ Server-side API calls only (key not exposed to client)  
✅ Input validation on API route  
✅ Error messages don't expose sensitive information  

## Troubleshooting

### "Gemini API key not configured"

**Solution:** Make sure you've added your API key to `.env.local`:
```bash
echo 'GEMINI_API_KEY=your-key-here' >> .env.local
npm run dev # Restart the server
```

### "Failed to generate response"

**Possible causes:**
1. Invalid API key
2. API quota exceeded
3. Network connectivity issues
4. Invalid model name

**Solution:** Check the server console logs for detailed error messages.

### Audio not playing

**Possible causes:**
1. TTS API not configured correctly
2. Browser doesn't support audio/mp3 format
3. Audio data not properly encoded

**Solution:**
1. Check browser console for errors
2. Try a different browser
3. Verify TTS API is working (check server logs)

### TypeScript errors

**Solution:**
```bash
npm install -D @types/node typescript
```

## Integration with Your App

### Use as a Component

```tsx
import GeminiAudioChat from '@/components/GeminiAudioChat'

export default function MyPage() {
  return (
    <div>
      <GeminiAudioChat />
    </div>
  )
}
```

### Use the API Programmatically

```typescript
const response = await fetch('/api/gemini-audio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    prompt: 'Your prompt here',
    voice: 'pt-BR-Standard-A' 
  }),
})

const data = await response.json()
console.log('Text:', data.text)
console.log('Audio:', data.audio) // Base64 encoded
```

## Next Steps

### Enhancements You Can Add:

1. **Voice Selection UI** - Add dropdown to choose voice
2. **Streaming Responses** - Implement SSE for real-time text streaming
3. **Conversation History** - Store and display previous messages
4. **Audio Recording** - Add microphone input for voice prompts
5. **Multiple Languages** - Add language selection
6. **Rate Limiting** - Add API rate limiting
7. **Caching** - Cache responses for repeated prompts
8. **Analytics** - Track usage metrics

## Resources

- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com/)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review server console logs
3. Check browser console for client-side errors
4. Verify API key is valid and has quota

## License

This implementation follows your project's existing license.

---

**Created:** October 7, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

