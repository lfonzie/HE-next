# Gemini Audio Chat - System Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│                   /gemini-audio (Page)                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         GeminiAudioChat Component                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │  │
│  │  │  Textarea  │  │   Button   │  │   Audio Player     │ │  │
│  │  │  (Input)   │  │  (Submit)  │  │   (Playback)       │ │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ▼ HTTP POST
                    { prompt: "..." }
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js API Layer                           │
│                /api/gemini-audio/route.ts                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Validate Input                                       │  │
│  │  2. Check API Key                                        │  │
│  │  3. Generate Text (Gemini)                               │  │
│  │  4. Generate Audio (Google Cloud TTS)                    │  │
│  │  5. Return Response                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    ▼                      ▼
        ┌───────────────────┐  ┌──────────────────────┐
        │   Google Gemini   │  │  Google Cloud TTS    │
        │   2.5 Flash API   │  │       API            │
        │                   │  │                      │
        │  Text Generation  │  │  Audio Synthesis     │
        └───────────────────┘  └──────────────────────┘
                    ▼                      ▼
                ┌────────────────────────────────┐
                │    Combined Response           │
                │  { text, audio, metadata }     │
                └────────────────────────────────┘
                            ▼ HTTP Response
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Display:                                                │  │
│  │  • Text Response                                         │  │
│  │  • Audio Player (with base64 decoded audio)             │  │
│  │  • Download Button                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📂 File Structure

```
/Users/lf/Documents/GitHub/HE-next/
│
├── app/
│   ├── api/
│   │   └── gemini-audio/
│   │       └── route.ts ..................... API endpoint (POST, GET)
│   │
│   └── gemini-audio/
│       └── page.tsx ......................... Demo page
│
├── components/
│   └── GeminiAudioChat.tsx .................. Main React component
│
├── test-gemini-audio.js ..................... Test suite
│
├── package.json ............................. Updated with test script
│
└── Documentation:
    ├── GEMINI_AUDIO_CHAT_IMPLEMENTATION.md .. Full technical guide
    ├── GEMINI_AUDIO_QUICK_START.md .......... Quick setup guide
    ├── GEMINI_AUDIO_IMPLEMENTATION_SUMMARY.md Summary & checklist
    └── GEMINI_AUDIO_ARCHITECTURE.md ......... This file
```

## 🔄 Request Flow

### 1. User Action
```
User types prompt → Clicks button (or presses Enter)
```

### 2. Client-Side Processing
```typescript
// GeminiAudioChat.tsx
const handleSubmit = async () => {
  setLoading(true)
  
  const res = await fetch('/api/gemini-audio', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  })
  
  const data = await res.json()
  // Display text and audio
}
```

### 3. Server-Side Processing
```typescript
// app/api/gemini-audio/route.ts
export async function POST(req) {
  // 1. Parse request
  const { prompt } = await req.json()
  
  // 2. Generate text with Gemini
  const textResponse = await genAI.generateContent(prompt)
  
  // 3. Generate audio with TTS
  const audioData = await ttsClient.synthesizeSpeech(textResponse)
  
  // 4. Return response
  return NextResponse.json({
    text: textResponse,
    audio: base64Audio
  })
}
```

### 4. Response Handling
```
API Response → Decode base64 audio → Create blob → Display
```

## 🔐 Security Flow

```
┌─────────────┐
│  .env.local │ (API Key stored securely)
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Server-Side Only   │ (Next.js API Route)
│  process.env        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  External APIs      │ (Gemini + TTS)
│  (with API key)     │
└─────────────────────┘

❌ API Key NEVER sent to client
✅ All API calls happen server-side
✅ Client only receives generated content
```

## 📊 Data Flow Diagram

```
Input Text (Client)
    │
    ├──> Validation
    │       └──> [Valid?]
    │              ├──> Yes ──> Continue
    │              └──> No ──> Error Response
    │
    ├──> Gemini API
    │       └──> Generate Text
    │              └──> Text Response
    │
    ├──> Google Cloud TTS
    │       └──> Synthesize Speech
    │              └──> Audio Data (binary)
    │
    └──> Combine Results
            └──> Encode Audio (Base64)
                  └──> JSON Response
                        └──> {text, audio, metadata}
                              │
                              └──> Client Receives
                                    ├──> Display Text
                                    └──> Decode & Play Audio
```

## 🎭 Component Hierarchy

```
Page (/app/gemini-audio/page.tsx)
  │
  └── GeminiAudioChat (Client Component)
        │
        ├── Card
        │    ├── CardHeader
        │    │    └── Title + Description
        │    │
        │    └── CardContent
        │         ├── Input Section
        │         │    ├── Label
        │         │    ├── Textarea (prompt input)
        │         │    └── Button (submit)
        │         │
        │         ├── Error Section (conditional)
        │         │    └── Alert (destructive)
        │         │
        │         ├── Response Section (conditional)
        │         │    ├── Text Response
        │         │    │    └── Card (with text)
        │         │    │
        │         │    └── Audio Response
        │         │         └── Card
        │         │              ├── Audio Element
        │         │              ├── Play Button
        │         │              └── Download Link
        │         │
        │         └── Info Section
        │              └── Alert (info)
        │
        └── Hidden Elements
             └── Audio Ref (for playback control)
```

## 🔧 Technology Stack

### Frontend
```
React 19 (Client Component)
  ├── Next.js 15 (App Router)
  ├── TypeScript
  ├── Tailwind CSS
  └── shadcn/ui Components
       ├── Card, Button, Textarea
       ├── Alert, Label
       └── Lucide Icons
```

### Backend
```
Next.js API Routes
  ├── Google Gemini SDK (@google/generative-ai)
  ├── Google Cloud TTS SDK (@google-cloud/text-to-speech)
  └── Node.js Buffer (for audio encoding)
```

### External Services
```
Google Cloud Platform
  ├── Gemini 2.5 Flash API (AI text generation)
  └── Cloud Text-to-Speech API (audio synthesis)
```

## 🔄 State Management

```typescript
// Component State
const [prompt, setPrompt] = useState('') // User input
const [loading, setLoading] = useState(false) // Request status
const [response, setResponse] = useState('') // AI text response
const [audioUrl, setAudioUrl] = useState<string | null>(null) // Audio blob URL
const [error, setError] = useState<string | null>(null) // Error message

// Ref for audio control
const audioRef = useRef<HTMLAudioElement>(null)
```

## 🎯 API Contract

### Request
```typescript
POST /api/gemini-audio

Headers:
  Content-Type: application/json

Body:
{
  "prompt": string,      // Required: User's text prompt
  "voice": string        // Optional: TTS voice name (default: pt-BR-Standard-A)
}
```

### Success Response (200)
```typescript
{
  "text": string,        // AI generated text
  "audio": string,       // Base64 encoded audio (MP3)
  "audioFormat": string, // "audio/mp3"
  "voice": string,       // Voice used for TTS
  "timestamp": string,   // ISO 8601 timestamp
  "aiProvider": string   // "gemini-2.5-flash"
}
```

### Error Response (400/500)
```typescript
{
  "error": string,       // Human-readable error message
  "details": string      // Technical error details
}
```

## 📈 Performance Metrics

| Stage | Time | Notes |
|-------|------|-------|
| Request Validation | <10ms | Input checking |
| Gemini API Call | 2-5s | Text generation |
| TTS API Call | 1-3s | Audio synthesis |
| Base64 Encoding | <100ms | Audio conversion |
| Total Response | 3-8s | End-to-end |
| Audio Playback | Instant | Client-side |

## 🧪 Test Coverage

```
Test Suite: test-gemini-audio.js
│
├── Test 1: Health Check
│    └── Verifies API is accessible
│
├── Test 2: Basic Request
│    └── Tests simple prompt processing
│
├── Test 3: Invalid Request
│    └── Tests error handling
│
└── Test 4: Long Prompt
     └── Tests complex prompts and performance
```

## 🌐 Deployment Considerations

### Environment Variables Required
```env
GEMINI_API_KEY=xxx           # Required
NEXTAUTH_URL=xxx             # If using auth
NODE_ENV=production          # For production
```

### Build Process
```bash
npm run build     # Builds Next.js app
npm start         # Starts production server
```

### Scaling Considerations
- API rate limits: Monitor Gemini and TTS usage
- Caching: Consider caching common prompts
- CDN: Use for static assets
- Load balancing: For high traffic

## 🔗 Integration Points

### With Existing Systems
```typescript
// Use the component anywhere
import GeminiAudioChat from '@/components/GeminiAudioChat'

// Call the API programmatically
await fetch('/api/gemini-audio', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'Hello' })
})
```

### Extending Functionality
- Add to existing chat systems
- Integrate with voice recording
- Connect to conversation history
- Add user authentication checks

---

## 📚 Related Documentation

- [Implementation Guide](./GEMINI_AUDIO_CHAT_IMPLEMENTATION.md) - Full technical details
- [Quick Start](./GEMINI_AUDIO_QUICK_START.md) - Setup instructions
- [Summary](./GEMINI_AUDIO_IMPLEMENTATION_SUMMARY.md) - Overview and checklist

---

**Last Updated:** October 7, 2025  
**Version:** 1.0.0

