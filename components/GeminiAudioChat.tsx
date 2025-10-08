'use client'

import React, { useState, useRef } from 'react'
import { Mic, Send, Loader2, Volume2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function GeminiAudioChat() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setResponse('')
    setAudioUrl(null)
    setError(null)

    try {
      const res = await fetch('/api/gemini-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch')
      }

      const data = await res.json()
      
      setResponse(data.text || 'No text response')
      
      if (data.audio) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
          { type: data.audioFormat || 'audio/mp3' }
        )
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Error processing request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <Mic className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-3xl">
                  Gemini Audio Chat
                </CardTitle>
              </div>
              <p className="text-muted-foreground">
                Enter your prompt and get an AI-generated audio response
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Your Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me a short story about a brave astronaut..."
                  className="resize-none h-32"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Generate Audio Response
                  </>
                )}
              </Button>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Response Section */}
            {(response || audioUrl) && !error && (
              <div className="space-y-4 border-t pt-6">
                {response && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold">Text Response:</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {response}
                    </p>
                  </div>
                )}

                {audioUrl && (
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold">Audio Response:</h3>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <audio
                          ref={audioRef}
                          src={audioUrl}
                          controls
                          className="flex-1"
                        />
                        <Button
                          onClick={playAudio}
                          variant="outline"
                          size="icon"
                          title="Play audio"
                        >
                          <Volume2 className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      <a
                        href={audioUrl}
                        download="gemini-response.wav"
                        className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
                      >
                        Download Audio
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Info Alert */}
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">💡 Tip:</p>
                <p>
                  This uses Google's Gemini 2.5 Flash model with native audio generation.
                  Try asking for stories, explanations, or creative content!
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

