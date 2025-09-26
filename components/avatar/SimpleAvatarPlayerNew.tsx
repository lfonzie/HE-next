'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Volume2 } from 'lucide-react'
import UnifiedTTSPlayer from '@/components/audio/UnifiedTTSPlayer'

interface SimpleAvatarPlayerProps {
  text: string
  className?: string
}

export default function SimpleAvatarPlayer({
  text,
  className = ''
}: SimpleAvatarPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <Card className={`border-purple-200 bg-purple-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <User className="h-5 w-5" />
          Avatar com TTS Unificado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UnifiedTTSPlayer
          text={text}
          voice="Zephyr"
          autoPlay={false}
          enableFallback={true}
          onAudioStart={() => setIsPlaying(true)}
          onAudioEnd={() => setIsPlaying(false)}
          className="border-purple-200 bg-purple-50"
        />
        
        {/* Status */}
        <div className="mt-4 text-xs text-purple-600 space-y-1">
          <p>🎤 Voz: Zephyr (Gemini Native Audio)</p>
          <p>🔄 Fallback: Google TTS → OpenAI TTS</p>
          <p>⚡ Tecnologia: Streaming em tempo real</p>
          {isPlaying && <p>▶️ Reproduzindo...</p>}
        </div>
      </CardContent>
    </Card>
  )
}
