# Gemini Audio Chat - Quick Start Guide 🚀

Get up and running with Gemini Audio Chat in 3 simple steps!

## Step 1: Set Up API Key 🔑

Add your Gemini API key to your environment variables:

```bash
# Create or edit .env.local file
echo 'GEMINI_API_KEY=your-api-key-here' >> .env.local
```

**Get your API key:** https://aistudio.google.com/app/apikey

## Step 2: Start the Server 🖥️

```bash
npm run dev
```

Wait for the server to start (usually takes 5-10 seconds).

## Step 3: Test It Out ✨

### Option A: Use the Web Interface

Open your browser and navigate to:

```
http://localhost:3000/gemini-audio
```

### Option B: Run the Test Suite

```bash
node test-gemini-audio.js
```

This will run 4 automated tests to verify everything is working correctly.

## What You'll See

The interface includes:

1. **Text Input Area** - Enter your prompt
2. **Generate Button** - Click to generate response
3. **Text Response** - AI-generated text
4. **Audio Player** - Listen to the audio version
5. **Download Button** - Save the audio file

## Example Prompts to Try

```
Tell me a short story about a brave astronaut
```

```
Explain quantum physics in simple terms
```

```
Read me a poem about the ocean
```

```
What are the benefits of learning a new language?
```

## Keyboard Shortcuts

- **Enter** - Submit prompt (without Shift)
- **Shift + Enter** - New line in textarea

## Troubleshooting

### "Gemini API key not configured"

- Make sure you added the API key to `.env.local`
- Restart the dev server: Stop it (Ctrl+C) and run `npm run dev` again

### Server Not Starting

- Check if port 3000 is already in use
- Try: `PORT=3001 npm run dev`

### Audio Not Playing

- Check browser console for errors
- Try a different browser (Chrome, Firefox, or Safari)
- Make sure your volume is not muted

## Next Steps

### Customize the Voice

Edit `/app/api/gemini-audio/route.ts` and change:

```typescript
voice: {
  languageCode: 'pt-BR',
  name: 'pt-BR-Wavenet-A', // Change this to your preferred voice
},
```

### Change Language

Edit the same file and change:

```typescript
voice: {
  languageCode: 'en-US', // Change to your language
  name: 'en-US-Standard-A', // Use matching voice
},
```

### Adjust Speaking Speed

In the same file:

```typescript
audioConfig: {
  audioEncoding: 'MP3',
  speakingRate: 1.5, // 1.0 is normal, 0.5 is half speed, 2.0 is double speed
  pitch: 0,
},
```

## Need Help?

- 📖 Read the full documentation: [GEMINI_AUDIO_CHAT_IMPLEMENTATION.md](./GEMINI_AUDIO_CHAT_IMPLEMENTATION.md)
- 🐛 Check server logs in the terminal
- 🔍 Check browser console (F12) for errors

## Features at a Glance

✅ Powered by Gemini 2.5 Flash AI  
✅ High-quality audio synthesis  
✅ Beautiful modern UI  
✅ Dark mode support  
✅ Mobile responsive  
✅ Keyboard shortcuts  
✅ Download audio files  
✅ Real-time error handling  

---

**Have fun exploring AI-powered audio chat! 🎉**

